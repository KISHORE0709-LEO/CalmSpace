"""
Comprehensive Automated Test Suite for CalmSpace Facial CNN Sensing Component.
Validates:
1. YOLO annotation parsing and coordinate boundary validation.
2. Face crop extraction and margin clamping.
3. Face quality assessor (lighting, blur, boundary clipping).
4. CNN model forward pass and output shapes.
5. CalmSpace taxonomy probability projection (sum = 1.0).
6. Autism atypical affect / Shannon entropy detection.
7. Graceful degradation when face is missing or degraded.
8. End-to-end FacialEmotionEngine frame processing latency and schema conformance.
"""

import os
import sys
import unittest
import numpy as np
from PIL import Image

# Ensure backend root is in path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

from app.sensing.config import (
    AFFECTNET_CLASSES,
    CALMSPACE_STATES,
    CLASS_TO_CALMSPACE_MAP,
    AUTISM_AWARENESS_CONFIG
)
from app.sensing.dataset import (
    parse_yolo_line,
    extract_face_crop,
    YOLOAnnotation
)
from app.sensing.quality_assessor import FaceQualityAssessor
from app.sensing.model import (
    CalmSpaceLightFaceCNN,
    map_raw_to_calmspace,
    evaluate_autism_ambiguity
)
from app.sensing.inference_engine import FacialEmotionEngine


class TestYOLOAnnotationParser(unittest.TestCase):
    """Tests parsing and validation of YOLO annotations according to prompt requirements."""

    def test_valid_yolo_line(self):
        # class 4 = happy, cx=0.5, cy=0.45, w=0.3, h=0.35
        line = "4 0.50 0.45 0.30 0.35"
        anno = parse_yolo_line(line)
        self.assertTrue(anno.is_valid)
        self.assertEqual(anno.class_id, 4)
        self.assertEqual(anno.emotion_name, "happy")
        self.assertAlmostEqual(anno.x_center, 0.50)
        self.assertAlmostEqual(anno.y_center, 0.45)
        self.assertAlmostEqual(anno.width, 0.30)
        self.assertAlmostEqual(anno.height, 0.35)

    def test_out_of_range_class_id(self):
        # class 9 is out of range for 8 AffectNet classes
        line = "9 0.5 0.5 0.2 0.2"
        anno = parse_yolo_line(line)
        self.assertFalse(anno.is_valid)
        self.assertIn("outside valid range", anno.validation_error)

    def test_negative_or_zero_dimensions(self):
        line = "0 0.5 0.5 -0.1 0.2"
        anno = parse_yolo_line(line)
        self.assertFalse(anno.is_valid)
        self.assertIn("Degenerate dimension", anno.validation_error)

    def test_out_of_bounds_center(self):
        line = "2 1.25 0.5 0.3 0.3"
        anno = parse_yolo_line(line)
        self.assertFalse(anno.is_valid)
        self.assertIn("out of [0, 1]", anno.validation_error)

    def test_corrupted_tokens(self):
        line = "invalid tokens here"
        anno = parse_yolo_line(line)
        self.assertFalse(anno.is_valid)


class TestFaceCropping(unittest.TestCase):
    """Tests face crop extraction and boundary margin clamping."""

    def test_face_crop_within_bounds(self):
        test_img = Image.new("RGB", (640, 480), color=(100, 150, 200))
        anno = YOLOAnnotation(
            class_id=5,
            emotion_name="neutral",
            x_center=0.5,
            y_center=0.5,
            width=0.2,
            height=0.25,
            is_valid=True
        )
        crop = extract_face_crop(test_img, anno, margin_ratio=0.1)
        self.assertIsNotNone(crop)
        # Expected w = 640 * 0.2 = 128 + padding
        self.assertGreater(crop.size[0], 100)
        self.assertGreater(crop.size[1], 100)

    def test_face_crop_edge_clamping(self):
        test_img = Image.new("RGB", (300, 300), color=(50, 50, 50))
        # Face near top-left corner
        anno = YOLOAnnotation(
            class_id=0,
            emotion_name="anger",
            x_center=0.05,
            y_center=0.05,
            width=0.2,
            height=0.2,
            is_valid=True
        )
        crop = extract_face_crop(test_img, anno, margin_ratio=0.1)
        self.assertIsNotNone(crop)
        self.assertGreater(crop.size[0], 0)
        self.assertGreater(crop.size[1], 0)


class TestFaceQualityAssessor(unittest.TestCase):
    """Tests lighting, blur, and occlusion quality assessment."""

    def setUp(self):
        self.assessor = FaceQualityAssessor()

    def test_no_face_degradation(self):
        img = np.zeros((480, 640, 3), dtype=np.uint8)
        res = self.assessor.evaluate(img, bbox=None)
        self.assertFalse(res.face_detected)
        self.assertEqual(res.quality_score, 0.0)

    def test_sharp_well_lit_face(self):
        # Create a sharp, well-lit artificial face region
        img = np.ones((480, 640, 3), dtype=np.uint8) * 120
        # Add high-frequency textures in the face region
        x, y, w, h = 200, 150, 180, 200
        noise = np.random.randint(-40, 40, (h, w, 3), dtype=np.int16)
        img[y:y+h, x:x+w] = np.clip(img[y:y+h, x:x+w].astype(np.int16) + noise, 0, 255).astype(np.uint8)

        res = self.assessor.evaluate(img, bbox=(x, y, w, h))
        self.assertTrue(res.face_detected)
        self.assertTrue(res.face_visible)
        self.assertTrue(res.lighting_adequate)
        self.assertTrue(res.blur_adequate)
        self.assertGreater(res.quality_score, 0.60)

    def test_dark_underexposed_face(self):
        img = np.ones((480, 640, 3), dtype=np.uint8) * 15  # very dark
        res = self.assessor.evaluate(img, bbox=(200, 150, 180, 200))
        self.assertFalse(res.lighting_adequate)
        self.assertLess(res.quality_score, 0.50)


class TestTaxonomyMappingAndAutismAwareness(unittest.TestCase):
    """Tests probability projection matrix and autism-aware ambiguity heuristics."""

    def test_calmspace_mapping_sums_to_one(self):
        # Simulated raw AffectNet probabilities
        raw_probs = {
            "anger": 0.05,
            "contempt": 0.02,
            "disgust": 0.03,
            "fear": 0.10,
            "happy": 0.60,
            "neutral": 0.15,
            "sad": 0.03,
            "surprise": 0.02
        }
        mapped = map_raw_to_calmspace(raw_probs)
        self.assertIn("Calm", mapped)
        self.assertIn("Overloaded", mapped)
        total_prob = sum(mapped.values())
        self.assertAlmostEqual(total_prob, 1.0, places=3)
        # Happy dominant -> Calm should be dominant mapped state
        self.assertEqual(max(mapped, key=mapped.get), "Calm")

    def test_atypical_flat_affect_entropy_detection(self):
        # Flat affect: near-uniform distribution across all 8 classes
        flat_probs = {c: 1.0 / len(AFFECTNET_CLASSES) for c in AFFECTNET_CLASSES}
        entropy, is_ambiguous, reason = evaluate_autism_ambiguity(flat_probs)
        self.assertTrue(is_ambiguous)
        self.assertGreater(entropy, AUTISM_AWARENESS_CONFIG["entropy_threshold"])
        self.assertIn("High emotion entropy", reason)

    def test_clear_expression_not_ambiguous(self):
        # Distinct, clear expression: 85% happy
        clear_probs = {
            "anger": 0.01,
            "contempt": 0.01,
            "disgust": 0.01,
            "fear": 0.02,
            "happy": 0.85,
            "neutral": 0.07,
            "sad": 0.01,
            "surprise": 0.02
        }
        entropy, is_ambiguous, _ = evaluate_autism_ambiguity(clear_probs)
        self.assertFalse(is_ambiguous)
        self.assertLess(entropy, AUTISM_AWARENESS_CONFIG["entropy_threshold"])


class TestFacialEmotionEngine(unittest.TestCase):
    """Tests end-to-end real-time inference engine and output schema."""

    def setUp(self):
        self.engine = FacialEmotionEngine(backbone="light", device="cpu")

    def test_process_frame_with_face(self):
        # Create test frame with face texture
        frame = np.ones((480, 640, 3), dtype=np.uint8) * 140
        face_bbox = (220, 140, 160, 180)
        # Warmup frame to initialize PyTorch threadpool
        self.engine.process_frame(frame, provided_bbox=face_bbox)
        result = self.engine.process_frame(frame, provided_bbox=face_bbox)
        
        # Verify required keys in output schema
        required_keys = [
            "timestamp", "frame_id", "face_detected", "quality_score",
            "quality_diagnostics", "raw_emotion_probabilities",
            "calmspace_mapped_probabilities", "dominant_emotion",
            "calmspace_state", "detection_confidence", "autism_considerations",
            "latency_ms"
        ]
        for key in required_keys:
            self.assertIn(key, result)

        self.assertTrue(result["face_detected"])
        self.assertEqual(len(result["raw_emotion_probabilities"]), 8)
        self.assertEqual(len(result["calmspace_mapped_probabilities"]), 4)
        self.assertLess(result["latency_ms"], 100.0)  # sub-100ms real-time target

    def test_process_frame_graceful_degradation(self):
        # Frame with no face
        frame = np.zeros((480, 640, 3), dtype=np.uint8)
        result = self.engine.process_frame(frame, provided_bbox=None)

        self.assertIn("graceful_degradation", result)
        self.assertEqual(result["detection_confidence"], 0.0)
        self.assertTrue(result["graceful_degradation"]["active"])
        # Must report Unknown instead of false Calm to protect users
        self.assertEqual(result["calmspace_state"], "Unknown")

    def test_face_cascade_failure_returns_none_not_fake_box(self):
        # Ensure engine never fabricates a central box when cascade is unavailable
        engine_no_cascade = FacialEmotionEngine(face_cascade_path="non_existent.xml")
        test_frame = np.ones((480, 640, 3), dtype=np.uint8) * 128
        detected = engine_no_cascade.detect_face(test_frame)
        self.assertIsNone(detected)

    def test_callback_dispatch(self):
        received = []
        self.engine.register_callback(lambda packet: received.append(packet["frame_id"]))
        frame = np.ones((200, 200, 3), dtype=np.uint8) * 100
        self.engine.process_frame(frame, provided_bbox=(40, 40, 100, 100))
        self.assertEqual(len(received), 1)

    def test_dataset_class_mapping_permutation(self):
        import tempfile
        import yaml
        from app.sensing.dataset import load_and_validate_dataset_classes, parse_yolo_line

        # Create mock data.yaml with permuted order: happy at 0, anger at 1
        with tempfile.TemporaryDirectory() as tmp_dir:
            yaml_path = os.path.join(tmp_dir, "data.yaml")
            custom_classes = ["happy", "anger", "disgust", "fear", "neutral", "sad", "surprise", "contempt"]
            with open(yaml_path, "w", encoding="utf-8") as f:
                yaml.dump({"names": custom_classes}, f)

            classes, mapping = load_and_validate_dataset_classes(tmp_dir)
            self.assertEqual(classes, custom_classes)
            # 'happy' (raw index 0) must map to canonical AffectNet index 4
            self.assertEqual(mapping[0], 4)
            # 'anger' (raw index 1) must map to canonical AffectNet index 0
            self.assertEqual(mapping[1], 0)

            # Test parsing yolo line with mapping
            anno = parse_yolo_line("0 0.5 0.5 0.2 0.2", class_mapping=mapping)
            self.assertEqual(anno.class_id, 4)
            self.assertEqual(anno.emotion_name, "happy")

    def test_dataset_synonym_mapping(self):
        import tempfile
        import yaml
        from app.sensing.dataset import load_and_validate_dataset_classes

        # Test synonyms like 'angry', 'happiness', 'scared', 'shock'
        with tempfile.TemporaryDirectory() as tmp_dir:
            yaml_path = os.path.join(tmp_dir, "data.yaml")
            custom_classes = ["angry", "contempt", "disgusted", "scared", "happiness", "normal", "sadness", "shock"]
            with open(yaml_path, "w", encoding="utf-8") as f:
                yaml.dump({"names": custom_classes}, f)

            classes, mapping = load_and_validate_dataset_classes(tmp_dir)
            self.assertEqual(mapping[0], 0)  # angry -> anger
            self.assertEqual(mapping[2], 2)  # disgusted -> disgust
            self.assertEqual(mapping[3], 3)  # scared -> fear
            self.assertEqual(mapping[4], 4)  # happiness -> happy
            self.assertEqual(mapping[5], 5)  # normal -> neutral
            self.assertEqual(mapping[6], 6)  # sadness -> sad
            self.assertEqual(mapping[7], 7)  # shock -> surprise

    def test_set_seed_reproducibility(self):
        import torch
        from app.sensing.train import set_seed
        set_seed(123)
        t1 = torch.rand(5)
        set_seed(123)
        t2 = torch.rand(5)
        self.assertTrue(torch.allclose(t1, t2))


if __name__ == "__main__":
    unittest.main()
