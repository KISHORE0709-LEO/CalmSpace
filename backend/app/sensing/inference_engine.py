"""
Decoupled Real-time Facial Emotion Inference Engine.
Consumes video frames, runs face quality assessment and CNN emotion classification,
applies calibrated CalmSpace mapping, detects autism-specific atypical affect,
and emits low-latency telemetry packets for sensor fusion.
"""

import time
from datetime import datetime
import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

import logging
from typing import Dict, Any, Optional, Tuple, Callable, List
from collections import deque
from PIL import Image
import numpy as np

import cv2
import torch
import torch.nn.functional as F

from .config import (
    AFFECTNET_CLASSES,
    CALMSPACE_STATES,
    AUTISM_AWARENESS_CONFIG,
    ASD_DOMAIN_SHIFT_NOTICE
)
from .quality_assessor import FaceQualityAssessor, QualityAssessmentResult
from .model import (
    create_facial_emotion_model,
    map_raw_to_calmspace,
    evaluate_autism_ambiguity
)

logger = logging.getLogger(__name__)


class FacialEmotionEngine:
    """
    Real-time Facial Emotion sensing engine for CalmSpace.
    Designed to operate as an independent, decoupled sensing branch.
    """

    def __init__(
        self,
        weights_path: Optional[str] = None,
        backbone: str = "light",
        device: Optional[str] = None,
        face_cascade_path: Optional[str] = None,
        max_review_log_size: int = 100
    ):
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.quality_assessor = FaceQualityAssessor()
        self.callbacks: List[Callable[[Dict[str, Any]], None]] = []
        self.frame_counter = 0

        # Buffer for low-confidence or atypical affect frames needing clinician/caregiver review
        self.review_log: deque = deque(maxlen=max_review_log_size)

        # Multi-face detection event log with timestamps
        self.multiple_faces_log: deque = deque(maxlen=300)
        self.last_multi_face_record_time: float = 0.0

        # Temporal probability smoothing and adaptive personal resting baseline
        self._smoothed_raw_probs: Optional[np.ndarray] = None
        self._baseline_smile: float = 0.05
        self._baseline_furrow: float = 0.10
        self._baseline_mouth_open: float = 0.05
        self._baseline_alpha: float = 0.05  # Slow EMA adaptation for user's unique resting face

        # Initialize face detector
        self.face_cascade = None
        self.skimage_cascade = None

        # 1. Preferred: skimage LBP frontalface detector (fast, reliable, bundled with skimage)
        try:
            import skimage.data
            from skimage.feature import Cascade
            skimage_dir = os.path.dirname(skimage.data.__file__)
            lbp_xml = os.path.join(skimage_dir, "lbpcascade_frontalface_opencv.xml")
            if os.path.exists(lbp_xml):
                self.skimage_cascade = Cascade(lbp_xml)
                logger.info(f"Initialized skimage LBP face detector from {lbp_xml}")
        except Exception as e:
            logger.debug(f"skimage Cascade init note: {e}")

        # 2. Fallback: OpenCV CascadeClassifier (if available in OpenCV build)
        if self.skimage_cascade is None:
            cascade_file = face_cascade_path
            if not cascade_file or not os.path.exists(cascade_file):
                haarcascades_dir = getattr(getattr(cv2, "data", None), "haarcascades", "")
                default_cascade = os.path.join(haarcascades_dir, "haarcascade_frontalface_default.xml")
                if os.path.exists(default_cascade):
                    cascade_file = default_cascade

            if cascade_file and os.path.exists(cascade_file) and hasattr(cv2, "CascadeClassifier"):
                try:
                    cascade = cv2.CascadeClassifier(cascade_file)  # type: ignore[attr-defined]
                    if not cascade.empty():  # type: ignore[attr-defined]
                        self.face_cascade = cascade
                        logger.info(f"Initialized cv2.CascadeClassifier from '{cascade_file}'")
                except Exception as e:
                    logger.error(f"Exception initializing CascadeClassifier from '{cascade_file}': {e}")
            else:
                logger.warning(f"Face detector cascade not found (checked: {cascade_file}).")

        # Initialize PyTorch model (MobileNetV2 with 4 classes)
        self.model = None
        try:
            import torchvision.models as torch_models
            from torch import nn
            model = torch_models.mobilenet_v2(weights=None)
            model.classifier[1] = nn.Linear(model.classifier[1].in_features, 4)
            self.model = model
            if weights_path is None:
                # Resolve relative to the backend/ root regardless of working directory
                _backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
                weights_path = os.path.join(_backend_dir, "best_model.pth")
            if os.path.exists(weights_path):
                state_dict = torch.load(weights_path, map_location=self.device, weights_only=True)
                self.model.load_state_dict(state_dict)
                logger.info(f"Loaded trained facial CNN weights from {weights_path}")
            self.model.to(self.device)
            self.model.eval()
        except Exception as e:
            logger.error(f"Failed to load MobileNetV2 model: {e}")

    def register_callback(self, callback: Callable[[Dict[str, Any]], None]):
        """Registers a listener function to receive real-time emotion telemetry packets."""
        self.callbacks.append(callback)

    def detect_all_faces(self, frame_bgr: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """
        Detects all face bounding boxes (x, y, w, h) in the frame.
        Returns a list sorted by face area (descending) with the primary user's face first.
        """
        if float(np.std(frame_bgr)) < 8.0:
            return []

        h_frame, w_frame = frame_bgr.shape[:2]
        all_faces: List[Tuple[int, int, int, int]] = []

        # 1. Primary: skimage LBP cascade detector
        if self.skimage_cascade is not None:
            try:
                if frame_bgr.ndim == 3 and frame_bgr.shape[2] == 3:
                    gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)  # type: ignore[attr-defined]
                else:
                    gray = frame_bgr
                min_dim = min(h_frame, w_frame)
                min_sz = max(35, int(min_dim * 0.10))
                max_sz = min(int(min_dim * 0.95), max(min_sz + 10, min_dim))
                matches = self.skimage_cascade.detect_multi_scale(
                    gray,
                    scale_factor=1.2,
                    step_ratio=1,
                    min_size=(min_sz, min_sz),
                    max_size=(max_sz, max_sz)
                )
                if matches and len(matches) > 0:
                    for m in matches:
                        all_faces.append((int(m["c"]), int(m["r"]), int(m["width"]), int(m["height"])))
            except Exception as e:
                logger.debug(f"skimage detect_all_faces error: {e}")

        # 2. Fallback: OpenCV CascadeClassifier if skimage didn't find any or isn't available
        if len(all_faces) == 0 and self.face_cascade is not None and not self.face_cascade.empty():  # type: ignore[attr-defined]
            try:
                if frame_bgr.ndim == 3 and frame_bgr.shape[2] == 3:
                    gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)  # type: ignore[attr-defined]
                else:
                    gray = frame_bgr
                faces = self.face_cascade.detectMultiScale(
                    gray,
                    scaleFactor=1.1,
                    minNeighbors=3,
                    minSize=(45, 45)
                )
                for b in faces:
                    all_faces.append((int(b[0]), int(b[1]), int(b[2]), int(b[3])))
            except Exception as e:
                logger.debug(f"cv2 detect_all_faces error: {e}")

        # Sort all detected faces by bounding box area (largest / most prominent first)
        if len(all_faces) > 1:
            all_faces = sorted(all_faces, key=lambda b: b[2] * b[3], reverse=True)

        # Filter out background/small faces — only keep faces whose area is at least
        # 25% the size of the largest face. This removes background posters/people.
        if len(all_faces) > 1:
            largest_area = all_faces[0][2] * all_faces[0][3]
            all_faces = [f for f in all_faces if (f[2] * f[3]) >= largest_area * 0.25]

        return all_faces

    def detect_face(self, frame_bgr: np.ndarray) -> Optional[Tuple[int, int, int, int]]:
        """Detects the most prominent face bounding box (x, y, w, h) in the frame."""
        faces = self.detect_all_faces(frame_bgr)
        return faces[0] if len(faces) > 0 else None

    def _extract_expression_signals(self, face_rgb: Image.Image) -> Dict[str, float]:
        """
        Extracts real-time Action Unit (AU) affective signals from the detected face crop:
        - AU12 (Smile / Zygomaticus Major): signals happy / calm
        - AU4 (Brow furrowing / Corrugator supercilii): signals tension / anger / stress
        - AU26/27 (Mouth openness / Masseter relaxation): signals surprise / overload
        """
        try:
            arr = np.array(face_rgb.convert("L"))
            h, w = arr.shape
            if h < 25 or w < 25:
                return {"smile": 0.0, "brow_furrow": 0.0, "mouth_open": 0.0}

            # 1. Mouth Region (lower 30% of face, center 60% width)
            y_m1, y_m2 = int(h * 0.65), int(h * 0.95)
            x_m1, x_m2 = int(w * 0.20), int(w * 0.80)
            mouth_roi = arr[y_m1:y_m2, x_m1:x_m2]
            
            face_mean = float(np.mean(arr))
            # Darkness ratio inside oral cavity indicates open mouth (surprise/shock)
            mouth_dark_pixels = float(np.sum(mouth_roi < (face_mean * 0.65))) / max(mouth_roi.size, 1)
            mouth_open = min(1.0, mouth_dark_pixels * 4.0)

            # Smile curvature detection (AU12)
            w_m = mouth_roi.shape[1]
            w_third = max(1, w_m // 3)
            corners = (float(np.mean(mouth_roi[:, :w_third])) + float(np.mean(mouth_roi[:, 2*w_third:]))) / 2.0
            center = float(np.mean(mouth_roi[:, w_third:2*w_third]))
            
            row_indices = np.arange(mouth_roi.shape[0]).reshape(-1, 1)
            mask_corner = mouth_roi[:, :w_third] < face_mean
            mask_center = mouth_roi[:, w_third:2*w_third] < face_mean
            if np.sum(mask_corner) > 0 and np.sum(mask_center) > 0:
                corner_y = float(np.sum(row_indices * mask_corner) / np.sum(mask_corner))
                center_y = float(np.sum(row_indices * mask_center) / np.sum(mask_center))
                curve_smile = max(0.0, min(1.0, (center_y - corner_y) / 4.0))
            else:
                curve_smile = 0.0
            
            contrast_smile = max(0.0, min(1.0, (corners - center) / 25.0))
            smile = max(curve_smile, contrast_smile)

            # 2. Eyebrow / Glabella Region (upper 12%-35%, center 50% width)
            y_b1, y_b2 = int(h * 0.12), int(h * 0.35)
            x_b1, x_b2 = int(w * 0.25), int(w * 0.75)
            brow_roi = arr[y_b1:y_b2, x_b1:x_b2]

            diff = np.abs(brow_roi[:, 1:] - brow_roi[:, :-1])
            furrow_metric = float(np.mean(diff))
            furrow = max(0.0, min(1.0, (furrow_metric - 12.0) / 25.0))

            return {
                "smile": smile,
                "brow_furrow": furrow,
                "mouth_open": mouth_open
            }
        except Exception as e:
            logger.debug(f"Error in _extract_expression_signals: {e}")
            return {"smile": 0.0, "brow_furrow": 0.0, "mouth_open": 0.0}

    def _preprocess_face_crop(self, face_rgb: Image.Image) -> Any:
        """Resizes and normalizes face crop for the CNN model."""
        if face_rgb.mode != "RGB":
            face_rgb = face_rgb.convert("RGB")
        resample_filter = getattr(getattr(Image, "Resampling", Image), "BILINEAR", 2)
        face_resized = face_rgb.resize((224, 224), resample_filter)
        img_arr = np.array(face_resized, dtype=np.float32) / 255.0

        # Standard ImageNet normalization: mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]
        mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
        std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
        img_arr = (img_arr - mean) / std

        # Shape: [1, 3, 224, 224]
        tensor = torch.from_numpy(img_arr.transpose(2, 0, 1)).unsqueeze(0).to(self.device)
        return tensor

    def process_frame(
        self,
        frame: Any,
        provided_bbox: Optional[Tuple[int, int, int, int]] = None
    ) -> Dict[str, Any]:
        """
        Processes a single video frame (NumPy BGR/RGB array or PIL Image).

        Outputs a comprehensive, decoupled emotion packet:
          - Timestamp & frame ID
          - Quality score & diagnostic flags (for graceful degradation)
          - Raw 8-class probability vector
          - Mapped CalmSpace state probabilities
          - Autism atypical affect flag & Shannon entropy
          - Overall detection confidence
        """
        start_time = time.perf_counter()
        self.frame_counter += 1
        timestamp = time.time()

        # Normalize frame to NumPy BGR and PIL RGB
        if isinstance(frame, Image.Image):
            pil_rgb = frame.convert("RGB")
            np_rgb = np.array(pil_rgb)
            frame_bgr = np_rgb[..., ::-1].copy()
        elif isinstance(frame, np.ndarray):
            if frame.ndim == 3 and frame.shape[2] == 3:
                frame_bgr = frame
                pil_rgb = Image.fromarray(frame[..., ::-1])
            elif frame.ndim == 2:
                frame_bgr = cv2.cvtColor(frame, cv2.COLOR_GRAY2BGR)  # type: ignore[attr-defined]
                pil_rgb = Image.fromarray(frame).convert("RGB")
            else:
                raise ValueError(f"Unexpected image array shape: {frame.shape}")
        else:
            raise ValueError(f"Unsupported frame input type: {type(frame)}")

        # 1. Multi-face detection
        all_faces: List[Tuple[int, int, int, int]] = []
        if provided_bbox is not None:
            all_faces = [provided_bbox]
        else:
            all_faces = self.detect_all_faces(frame_bgr)

        face_count = len(all_faces)
        primary_bbox = all_faces[0] if face_count > 0 else None

        # 2. Record multiple faces event when > 1 face is present in camera view
        multiple_faces_detected = face_count > 1
        now_mono = time.monotonic()
        if multiple_faces_detected and (now_mono - self.last_multi_face_record_time >= 1.0):
            self.last_multi_face_record_time = now_mono
            iso_timestamp = datetime.now().isoformat()
            self.multiple_faces_log.append({
                "timestamp": timestamp,
                "iso_time": iso_timestamp,
                "frame_id": self.frame_counter,
                "face_count": face_count,
                "bboxes": [
                    {"x": int(f[0]), "y": int(f[1]), "w": int(f[2]), "h": int(f[3])}
                    for f in all_faces
                ],
                "description": f"{face_count} individuals detected simultaneously (Primary user + companion/caregiver)."
            })

        # 3. Quality assessment on primary face
        quality: QualityAssessmentResult = self.quality_assessor.evaluate(frame_bgr, primary_bbox)

        # 4. Handle Graceful Degradation (no face, or face occluded/poor quality)
        if primary_bbox is None or not quality.face_detected or not quality.face_visible or quality.quality_score < 0.20:
            # Reset smoothed probabilities on face loss
            self._smoothed_raw_probs = None
            result = {
                "timestamp": timestamp,
                "frame_id": self.frame_counter,
                "face_detected": quality.face_detected,
                "face_count": face_count,
                "multiple_faces_detected": multiple_faces_detected,
                "face_bbox": None,
                "all_face_bboxes": [],
                "multiple_faces_events_count": len(self.multiple_faces_log),
                "quality_score": quality.quality_score,
                "quality_diagnostics": quality.to_dict(),
                "raw_emotion_probabilities": {e: round(1.0 / len(AFFECTNET_CLASSES), 4) for e in AFFECTNET_CLASSES},
                "calmspace_mapped_probabilities": {s: round(1.0 / len(CALMSPACE_STATES), 4) for s in CALMSPACE_STATES},
                "dominant_emotion": "unknown",
                "calmspace_state": "Unknown",
                "detection_confidence": 0.0,
                "graceful_degradation": {
                    "active": True,
                    "reason": "Face occluded, undetected, or severely degraded lighting/blur.",
                    "recommendation": "Fusion layer must lean 100% on physiological HRV/PPG sensor signals."
                },
                "autism_considerations": {
                    "is_atypical_or_ambiguous": False,
                    "entropy": 0.0,
                    "review_recommended": False,
                    "domain_shift_notice": ASD_DOMAIN_SHIFT_NOTICE
                },
                "latency_ms": round((time.perf_counter() - start_time) * 1000, 2)
            }
            self._dispatch(result)
            return result

        # 5. Crop face with safety margin
        w_img, h_img = pil_rgb.size
        bx, by, bw, bh = primary_bbox
        margin = 0.08
        pad_x = int(bw * margin)
        pad_y = int(bh * margin)
        crop_x1 = max(0, bx - pad_x)
        crop_y1 = max(0, by - pad_y)
        crop_x2 = min(w_img, bx + bw + pad_x)
        crop_y2 = min(h_img, by + bh + pad_y)

        if crop_x2 > crop_x1 and crop_y2 > crop_y1:
            face_crop = pil_rgb.crop((crop_x1, crop_y1, crop_x2, crop_y2))
        else:
            face_crop = pil_rgb

        # 6. Extract real-time facial expression dynamics from face crop
        expr_signals = self._extract_expression_signals(face_crop)
        raw_smile = expr_signals.get("smile", 0.0)
        raw_furrow = expr_signals.get("brow_furrow", 0.0)
        raw_mouth_open = expr_signals.get("mouth_open", 0.0)

        # Adapt personal resting baseline via slow EMA (learns user's neutral face)
        self._baseline_smile = (1.0 - self._baseline_alpha) * self._baseline_smile + self._baseline_alpha * min(raw_smile, 0.25)
        self._baseline_furrow = (1.0 - self._baseline_alpha) * self._baseline_furrow + self._baseline_alpha * min(raw_furrow, 0.25)
        self._baseline_mouth_open = (1.0 - self._baseline_alpha) * self._baseline_mouth_open + self._baseline_alpha * min(raw_mouth_open, 0.20)

        # Baseline-subtracted dynamic activation (prevents resting scowls/smiles from biasing state)
        delta_smile = max(0.0, raw_smile - self._baseline_smile * 0.8)
        delta_furrow = max(0.0, raw_furrow - self._baseline_furrow * 0.8)
        delta_mouth_open = max(0.0, raw_mouth_open - self._baseline_mouth_open * 0.8)

        # 7. Model forward pass + dynamic expression dynamics fusion
        raw_probs: Dict[str, float] = {}
        if self.model is not None:
            input_tensor = self._preprocess_face_crop(face_crop)
            with torch.no_grad():
                logits = self.model(input_tensor).squeeze(0)
                
                # 4 Classes: 0: Calm, 1: Happy, 2: Distressed, 3: Overwhelmed
                cur_probs = F.softmax(logits, dim=0).cpu().numpy()
                
                # Temporal smoothing
                if self._smoothed_raw_probs is None:
                    self._smoothed_raw_probs = cur_probs
                else:
                    self._smoothed_raw_probs = 0.65 * cur_probs + 0.35 * self._smoothed_raw_probs
                    
            classes_4 = ["Calm", "Happy", "Distressed", "Overwhelmed"]
            for idx, emotion in enumerate(classes_4):
                raw_probs[emotion] = round(float(self._smoothed_raw_probs[idx]), 4)
        else:
            classes_4 = ["Calm", "Happy", "Distressed", "Overwhelmed"]
            raw_probs = {e: 0.25 for e in classes_4}

        # 8. Fuse CNN output with expression signals for final CalmSpace state
        # The CNN is the primary signal. Expression signals only correct it when
        # there is STRONG visual evidence that contradicts the CNN output.
        # Key case: CNN says Overwhelmed but a clear smile is visible → shift to Happy.

        cnn_calm        = raw_probs.get("Calm", 0.0)
        cnn_happy       = raw_probs.get("Happy", 0.0)
        cnn_distressed  = raw_probs.get("Distressed", 0.0)
        cnn_overwhelmed = raw_probs.get("Overwhelmed", 0.0)

        # Only apply expression correction when signal is strong enough to be meaningful
        # delta_smile > 0.12 → a real smile is happening → boost Happy, suppress Overwhelmed
        # delta_furrow > 0.18 → real brow furrow → gentle boost to Distressed
        smile_strength   = max(0.0, delta_smile - 0.12)   # dead-zone below 0.12
        furrow_strength  = max(0.0, delta_furrow - 0.18)  # dead-zone below 0.18

        smile_correction  = min(smile_strength * 2.0, 0.35)   # max 35% correction
        furrow_correction = min(furrow_strength * 1.5, 0.20)   # max 20% correction

        # Apply: smile pulls probability FROM Overwhelmed INTO Happy
        transfer = min(smile_correction, cnn_overwhelmed * 0.8)
        fused_happy       = cnn_happy + transfer
        fused_overwhelmed = max(0.0, cnn_overwhelmed - transfer)

        # Furrow gently shifts some Calm → Distressed
        furrow_transfer = min(furrow_correction, cnn_calm * 0.5)
        fused_calm       = max(0.0, cnn_calm - furrow_transfer)
        fused_distressed = cnn_distressed + furrow_transfer

        fused = {
            "Calm":        fused_calm,
            "Happy":       fused_happy,
            "Distressed":  fused_distressed,
            "Overwhelmed": fused_overwhelmed,
        }
        total_f = sum(fused.values())
        if total_f > 0:
            fused = {k: round(v / total_f, 4) for k, v in fused.items()}

        # Map fused 4-class → CalmSpace states
        mapped_probs = {
            "Calm":           fused["Calm"] + fused["Happy"],
            "Mildly_Stressed": fused["Distressed"] * 0.5,
            "Anxious":        fused["Distressed"] * 0.5,
            "Overloaded":     fused["Overwhelmed"],
        }
        total = sum(mapped_probs.values())
        if total > 0:
            for k in mapped_probs:
                mapped_probs[k] = round(mapped_probs[k] / total, 4)

        # Update raw_probs to fused values (used for entropy/confidence below)
        raw_probs = fused

        # 9. Autism atypical affect and entropy evaluation
        entropy, is_ambiguous, ambiguity_reason = evaluate_autism_ambiguity(raw_probs)

        # 10. Compute detection confidence for multimodal fusion weighting
        dominant_affectnet = max(raw_probs, key=lambda k: raw_probs[k])
        dominant_calmspace = max(mapped_probs, key=lambda k: mapped_probs[k])
        top_prob = raw_probs[dominant_affectnet]

        # Detection confidence = quality_score * top_class_probability
        confidence = quality.quality_score * top_prob

        # If affect is atypical/ambiguous, apply confidence discount to protect autistic users
        if is_ambiguous:
            discount = AUTISM_AWARENESS_CONFIG["atypical_confidence_discount"]
            confidence *= (1.0 - discount)

        detection_confidence = round(float(np.clip(confidence, 0.0, 1.0)), 4)

        # 11. Review Logging for clinician inspection
        needs_review = is_ambiguous or (detection_confidence < 0.45)
        if needs_review:
            self.review_log.append({
                "timestamp": timestamp,
                "frame_id": self.frame_counter,
                "entropy": round(entropy, 3),
                "dominant_emotion": dominant_affectnet,
                "confidence": detection_confidence,
                "ambiguity_reason": ambiguity_reason
            })

        formatted_all_bboxes = [
            {"x": int(f[0]), "y": int(f[1]), "w": int(f[2]), "h": int(f[3])}
            for f in all_faces
        ]

        result = {
            "timestamp": timestamp,
            "frame_id": self.frame_counter,
            "face_detected": True,
            "face_count": face_count,
            "multiple_faces_detected": multiple_faces_detected,
            "face_bbox": {"x": int(bx), "y": int(by), "w": int(bw), "h": int(bh)},
            "all_face_bboxes": formatted_all_bboxes,
            "multiple_faces_events_count": len(self.multiple_faces_log),
            "quality_score": quality.quality_score,
            "quality_diagnostics": quality.to_dict(),
            "raw_emotion_probabilities": raw_probs,
            "calmspace_mapped_probabilities": mapped_probs,
            "dominant_emotion": dominant_affectnet,
            "calmspace_state": dominant_calmspace,
            "detection_confidence": detection_confidence,
            "graceful_degradation": {
                "active": False,
                "reason": "Signal valid for multimodal fusion weighting."
            },
            "autism_considerations": {
                "is_atypical_or_ambiguous": is_ambiguous,
                "entropy": round(entropy, 3),
                "review_recommended": needs_review,
                "ambiguity_reason": ambiguity_reason,
                "domain_shift_notice": ASD_DOMAIN_SHIFT_NOTICE
            },
            "latency_ms": round((time.perf_counter() - start_time) * 1000, 2)
        }

        self._dispatch(result)
        return result

    def _dispatch(self, result: Dict[str, Any]):
        """Dispatches result to all registered callback handlers."""
        for cb in self.callbacks:
            try:
                cb(result)
            except Exception as e:
                logger.error(f"Callback dispatch error: {e}")

    def get_review_log(self) -> List[Dict[str, Any]]:
        """Retrieves list of flagged atypical/ambiguous frames for clinical review."""
        return list(self.review_log)

    def get_multiple_faces_log(self) -> List[Dict[str, Any]]:
        """Retrieves history of timestamps and details when multiple faces were detected."""
        return list(self.multiple_faces_log)

