"""
AffectNet YOLO Dataset Parser and Preprocessing Pipeline.
Reads YOLO-format annotations, validates bounding boxes, extracts face crops with
safety margins, and provides a PyTorch Dataset for training and evaluation.
"""

import os
import re
import glob
import logging
from typing import List, Dict, Tuple, Optional, Any
from dataclasses import dataclass
from PIL import Image

from torch.utils.data import Dataset

try:
    from .config import (
        AFFECTNET_CLASSES,
        AFFECTNET_CLASS_ID_MAP
    )
except (ImportError, ValueError):
    from app.sensing.config import (  # type: ignore
        AFFECTNET_CLASSES,
        AFFECTNET_CLASS_ID_MAP
    )

logger = logging.getLogger(__name__)


def load_and_validate_dataset_classes(
    dataset_dir: str,
    yaml_path: Optional[str] = None
) -> Tuple[List[str], Dict[int, int]]:
    """
    Locates data.yaml or classes.txt and validates class names and indices
    against canonical AFFECTNET_CLASSES.

    Returns:
      (discovered_classes, raw_to_canonical_id_map)

    If classes are permuted by a YOLO exporter, raw_to_canonical_id_map ensures
    labels are mapped to the canonical 8-class order without silent corruption.
    """
    candidate_files = []
    if yaml_path:
        candidate_files.append(yaml_path)
    candidate_files.extend([
        os.path.join(dataset_dir, "data.yaml"),
        os.path.join(dataset_dir, "dataset.yaml"),
        os.path.join(dataset_dir, "..", "data.yaml"),
        os.path.join(dataset_dir, "classes.txt"),
        os.path.join(dataset_dir, "..", "classes.txt"),
    ])

    discovered_classes: Optional[List[str]] = None
    source_file: Optional[str] = None

    for path in candidate_files:
        if os.path.isfile(path):
            source_file = path
            try:
                if path.endswith((".yaml", ".yml")):
                    try:
                        import yaml
                        with open(path, "r", encoding="utf-8") as f:
                            data = yaml.safe_load(f)
                        if isinstance(data, dict) and "names" in data:
                            raw_names = data["names"]
                            if isinstance(raw_names, list):
                                discovered_classes = [str(x).strip().lower() for x in raw_names]
                            elif isinstance(raw_names, dict):
                                sorted_keys = sorted(raw_names.keys(), key=lambda k: int(k) if str(k).isdigit() else str(k))
                                discovered_classes = [str(raw_names[k]).strip().lower() for k in sorted_keys]
                    except ImportError:
                        logger.warning("PyYAML not available; skipping YAML parse.")
                elif path.endswith(".txt"):
                    with open(path, "r", encoding="utf-8") as f:
                        lines = [line.strip().lower() for line in f if line.strip()]
                    if lines:
                        discovered_classes = lines
            except Exception as e:
                logger.warning(f"Error reading dataset class file {path}: {e}")
            if discovered_classes:
                break

    canonical_lower = [c.lower() for c in AFFECTNET_CLASSES]
    canonical_id_map = {c: i for i, c in enumerate(canonical_lower)}

    # Synonyms and common variant names across YOLO AffectNet exporters
    emotion_synonyms: Dict[str, str] = {
        "anger": "anger", "angry": "anger", "ang": "anger",
        "contempt": "contempt", "contemptuous": "contempt", "disdain": "contempt",
        "disgust": "disgust", "disgusted": "disgust", "dis": "disgust",
        "fear": "fear", "fearful": "fear", "scared": "fear", "afraid": "fear",
        "happy": "happy", "happiness": "happy", "joy": "happy", "joyful": "happy", "smiling": "happy",
        "neutral": "neutral", "natural": "neutral", "normal": "neutral", "none": "neutral",
        "sad": "sad", "sadness": "sad", "unhappy": "sad", "sorrow": "sad",
        "surprise": "surprise", "surprised": "surprise", "surp": "surprise", "shock": "surprise", "shocked": "surprise",
    }

    mapping: Dict[int, int] = {}
    if discovered_classes:
        logger.info(f"[DATASET CHECK] Found class definition in '{source_file}': {discovered_classes}")
        is_exact_match = (discovered_classes == canonical_lower)

        for raw_idx, class_name in enumerate(discovered_classes):
            clean_name = str(class_name).lower().strip()
            # Strip index prefixes if exporter added them (e.g. "0_anger" -> "anger", "1. happy" -> "happy")
            clean_name = re.sub(r"^\d+[\s._-]+", "", clean_name)
            canonical_name = emotion_synonyms.get(clean_name, clean_name)

            if canonical_name in canonical_id_map:
                mapped_id = canonical_id_map[canonical_name]
                mapping[raw_idx] = mapped_id
                if clean_name != canonical_name:
                    logger.info(f"[DATASET CHECK] Resolved class alias: '{class_name}' -> canonical '{canonical_name}' (ID {mapped_id})")
            else:
                logger.warning(f"[DATASET CHECK] Class '{class_name}' (normalized: '{clean_name}') at index {raw_idx} is not recognized. Mapping to -1.")
                mapping[raw_idx] = -1

        if is_exact_match:
            logger.info("[DATASET CHECK] Class ordering matches AFFECTNET_CLASSES exactly (0=anger, 1=contempt, ...).")
        else:
            logger.warning("[DATASET CHECK] Dataset class ordering differs from AFFECTNET_CLASSES!")
            logger.warning(f"  Dataset order : {discovered_classes}")
            logger.warning(f"  Canonical order: {canonical_lower}")
            logger.warning(f"  Automated translation map: {mapping}")
        return discovered_classes, mapping

    logger.info(f"[DATASET CHECK] No data.yaml or classes.txt found in {dataset_dir}. Assuming canonical AFFECTNET_CLASSES.")
    identity_map = {i: i for i in range(len(AFFECTNET_CLASSES))}
    return list(canonical_lower), identity_map


@dataclass
class YOLOAnnotation:
    """Parsed and validated single YOLO annotation entry."""
    class_id: int
    emotion_name: str
    x_center: float
    y_center: float
    width: float
    height: float
    is_valid: bool
    validation_error: Optional[str] = None


@dataclass
class FaceSample:
    """Single extracted face sample ready for CNN training/inference."""
    image_path: str
    class_id: int
    emotion_name: str
    bbox_pixel: Tuple[int, int, int, int]  # (x_min, y_min, x_max, y_max)
    orig_size: Tuple[int, int]             # (width, height)


def parse_yolo_line(
    line: str,
    num_classes: int = len(AFFECTNET_CLASSES),
    class_mapping: Optional[Dict[int, int]] = None
) -> YOLOAnnotation:
    """
    Parses a single line of YOLO format: '<class_id> <x_center> <y_center> <width> <height>'.
    Validates normalized coordinates and class bounds, applying class_mapping if provided.
    """
    tokens = line.strip().split()
    if len(tokens) != 5:
        return YOLOAnnotation(
            class_id=-1,
            emotion_name="unknown",
            x_center=0.0,
            y_center=0.0,
            width=0.0,
            height=0.0,
            is_valid=False,
            validation_error=f"Expected 5 tokens, got {len(tokens)}: '{line.strip()}'"
        )

    try:
        class_id = int(tokens[0])
        x_center = float(tokens[1])
        y_center = float(tokens[2])
        width = float(tokens[3])
        height = float(tokens[4])
    except ValueError as e:
        return YOLOAnnotation(
            class_id=-1,
            emotion_name="unknown",
            x_center=0.0,
            y_center=0.0,
            width=0.0,
            height=0.0,
            is_valid=False,
            validation_error=f"Numeric parsing error: {e}"
        )

    # Apply dataset-to-canonical class translation
    if class_mapping is not None:
        if class_id in class_mapping:
            mapped_id = class_mapping[class_id]
            if mapped_id < 0:
                return YOLOAnnotation(
                    class_id=-1,
                    emotion_name="unmapped",
                    x_center=x_center,
                    y_center=y_center,
                    width=width,
                    height=height,
                    is_valid=False,
                    validation_error=f"Class ID {class_id} could not be mapped to AffectNet classes"
                )
            class_id = mapped_id
        else:
            return YOLOAnnotation(
                class_id=class_id,
                emotion_name="unknown",
                x_center=x_center,
                y_center=y_center,
                width=width,
                height=height,
                is_valid=False,
                validation_error=f"Class ID {class_id} not found in dataset class mapping"
            )
    elif class_id < 0 or class_id >= num_classes:
        return YOLOAnnotation(
            class_id=class_id,
            emotion_name="out_of_range",
            x_center=x_center,
            y_center=y_center,
            width=width,
            height=height,
            is_valid=False,
            validation_error=f"Class ID {class_id} outside valid range [0, {num_classes - 1}]"
        )

    # Validate coordinate ranges with minor float tolerance for exporter rounding
    if not (-0.02 <= x_center <= 1.02 and -0.02 <= y_center <= 1.02):
        return YOLOAnnotation(
            class_id=class_id,
            emotion_name=AFFECTNET_CLASS_ID_MAP.get(class_id, "unknown"),
            x_center=x_center,
            y_center=y_center,
            width=width,
            height=height,
            is_valid=False,
            validation_error=f"Center coordinates out of [0, 1] bounds: ({x_center}, {y_center})"
        )

    if width <= 0.0 or height <= 0.0:
        return YOLOAnnotation(
            class_id=class_id,
            emotion_name=AFFECTNET_CLASS_ID_MAP.get(class_id, "unknown"),
            x_center=x_center,
            y_center=y_center,
            width=width,
            height=height,
            is_valid=False,
            validation_error=f"Degenerate dimension: width={width}, height={height}"
        )

    # Clamp safely to [0.0, 1.0]
    clamped_cx = max(0.0, min(1.0, x_center))
    clamped_cy = max(0.0, min(1.0, y_center))
    clamped_w = max(0.001, min(1.0, width))
    clamped_h = max(0.001, min(1.0, height))

    return YOLOAnnotation(
        class_id=class_id,
        emotion_name=AFFECTNET_CLASS_ID_MAP[class_id],
        x_center=clamped_cx,
        y_center=clamped_cy,
        width=clamped_w,
        height=clamped_h,
        is_valid=True,
        validation_error=None
    )


def extract_face_crop(
    image: Image.Image,
    annotation: YOLOAnnotation,
    margin_ratio: float = 0.08
) -> Optional[Image.Image]:
    """
    Extracts the face region corresponding to the YOLO annotation,
    adding a small margin around the face for facial contour context,
    clamping securely to image dimensions.
    """
    if not annotation.is_valid:
        return None

    img_w, img_h = image.size

    # Convert normalized center-width-height to pixels
    box_w = annotation.width * img_w
    box_h = annotation.height * img_h
    cx = annotation.x_center * img_w
    cy = annotation.y_center * img_h

    # Add margin padding
    pad_w = box_w * margin_ratio
    pad_h = box_h * margin_ratio

    x_min = max(0, int(cx - (box_w / 2.0) - pad_w))
    y_min = max(0, int(cy - (box_h / 2.0) - pad_h))
    x_max = min(img_w, int(cx + (box_w / 2.0) + pad_w))
    y_max = min(img_h, int(cy + (box_h / 2.0) + pad_h))

    if x_max <= x_min or y_max <= y_min:
        logger.warning(f"Invalid pixel bounds after clamping: [{x_min}, {y_min}, {x_max}, {y_max}]")
        return None

    return image.crop((x_min, y_min, x_max, y_max))


class AffectNetYOLODataset(Dataset):
    """
    Parses a directory of images and YOLO .txt label files for AffectNet emotion classification.
    Supports standard directory structures:
      dataset_dir/
         images/ (or train/images/, valid/images/)
         labels/ (or train/labels/, valid/labels/)
    """

    def __init__(
        self,
        dataset_dir: str,
        split: str = "train",
        transform: Optional[Any] = None,
        margin_ratio: float = 0.08,
        max_samples: Optional[int] = None,
        data_yaml_path: Optional[str] = None
    ):
        self.dataset_dir = dataset_dir
        self.split = split
        self.transform = transform
        self.margin_ratio = margin_ratio
        self.data_yaml_path = data_yaml_path
        self.samples: List[Tuple[str, YOLOAnnotation]] = []

        self.discovered_classes, self.class_mapping = load_and_validate_dataset_classes(
            dataset_dir, yaml_path=data_yaml_path
        )

        self._discover_and_parse(max_samples)

    def _discover_and_parse(self, max_samples: Optional[int]):
        """Discovers matching image and annotation pairs and parses labels."""
        split_aliases = [self.split]
        if self.split in ("val", "valid", "validation"):
            split_aliases = ["val", "valid", "validation"]
        elif self.split in ("train", "training"):
            split_aliases = ["train", "training"]
        elif self.split in ("test", "testing"):
            split_aliases = ["test", "testing"]

        candidate_image_dirs = []
        for s in split_aliases:
            candidate_image_dirs.extend([
                os.path.join(self.dataset_dir, s, "images"),
                os.path.join(self.dataset_dir, "images", s),
                os.path.join(self.dataset_dir, s),
            ])
        candidate_image_dirs.extend([
            os.path.join(self.dataset_dir, "images"),
            self.dataset_dir
        ])

        img_dir = None
        for path in candidate_image_dirs:
            if os.path.isdir(path):
                img_dir = path
                break

        if img_dir is None:
            logger.warning(f"No image directory found for split '{self.split}' in {self.dataset_dir}")
            return

        # Find all images
        image_extensions = ("*.jpg", "*.jpeg", "*.png", "*.bmp")
        image_paths = []
        for ext in image_extensions:
            image_paths.extend(glob.glob(os.path.join(img_dir, ext)))
            image_paths.extend(glob.glob(os.path.join(img_dir, "**", ext), recursive=True))

        image_paths = sorted(list(set(image_paths)))
        logger.info(f"Discovered {len(image_paths)} images in {img_dir}")

        for img_path in image_paths:
            base_name = os.path.splitext(os.path.basename(img_path))[0]
            
            # Label file can be located in sibling 'labels' directory or alongside image
            parent_dir = os.path.dirname(img_path)
            candidate_label_paths = [
                os.path.join(parent_dir.replace("images", "labels"), f"{base_name}.txt"),
                os.path.join(parent_dir, f"{base_name}.txt"),
            ]
            for s in split_aliases:
                candidate_label_paths.extend([
                    os.path.join(self.dataset_dir, "labels", s, f"{base_name}.txt"),
                    os.path.join(self.dataset_dir, s, "labels", f"{base_name}.txt")
                ])

            label_file = None
            for p in candidate_label_paths:
                if os.path.isfile(p):
                    label_file = p
                    break

            if not label_file:
                # Annotation missing - safely skip
                continue

            try:
                with open(label_file, "r", encoding="utf-8") as f:
                    lines = f.readlines()
            except Exception as e:
                logger.warning(f"Could not read label file {label_file}: {e}")
                continue

            for line in lines:
                if not line.strip():
                    continue
                anno = parse_yolo_line(
                    line,
                    num_classes=len(self.discovered_classes),
                    class_mapping=self.class_mapping
                )
                if anno.is_valid:
                    self.samples.append((img_path, anno))
                    if max_samples and len(self.samples) >= max_samples:
                        break

            if max_samples and len(self.samples) >= max_samples:
                break

        logger.info(f"Loaded {len(self.samples)} valid face samples for split '{self.split}'")

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int):
        img_path, anno = self.samples[idx]

        try:
            with Image.open(img_path) as img:
                img_rgb = img.convert("RGB")
                face_crop = extract_face_crop(img_rgb, anno, self.margin_ratio)
                if face_crop is None:
                    # Fallback to whole image if crop fails
                    face_crop = img_rgb
        except Exception as e:
            logger.error(f"Error reading image {img_path}: {e}")
            # Safe blank fallback to avoid crashing batch loader
            face_crop = Image.new("RGB", (224, 224), color=(128, 128, 128))

        if self.transform is not None:
            tensor = self.transform(face_crop)
            return tensor, anno.class_id

        # Default transformation for DataLoader batch collation
        from torchvision import transforms
        default_tf = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        return default_tf(face_crop), anno.class_id

    def get_class_distribution(self) -> Dict[str, int]:
        """Returns the count of samples per AffectNet emotion class."""
        dist = {c: 0 for c in AFFECTNET_CLASSES}
        for _, anno in self.samples:
            dist[anno.emotion_name] += 1
        return dist
