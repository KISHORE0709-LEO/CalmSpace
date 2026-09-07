"""
Real-time Face Quality and Environmental Noise Assessor.
Feeds graceful degradation logic in CalmSpace's multimodal fusion layer.
"""

from dataclasses import dataclass
from typing import Dict, Any, Optional, Tuple
import numpy as np
from PIL import Image

import cv2  # pylint: disable=import-error

try:
    from .config import QUALITY_CONFIG
except (ImportError, ValueError):
    from app.sensing.config import QUALITY_CONFIG  # type: ignore


@dataclass
class QualityAssessmentResult:
    """Diagnostic breakdown of facial image quality and environmental factors."""
    quality_score: float              # Overall quality in [0.0, 1.0]
    face_detected: bool
    face_visible: bool
    lighting_adequate: bool
    blur_adequate: bool
    occlusion_detected: bool
    face_area_ratio: float
    mean_luminance: float
    blur_metric: float
    diagnostics: Dict[str, Any]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "quality_score": round(self.quality_score, 3),
            "face_detected": self.face_detected,
            "face_visible": self.face_visible,
            "lighting_adequate": self.lighting_adequate,
            "blur_adequate": self.blur_adequate,
            "occlusion_detected": self.occlusion_detected,
            "face_area_ratio": round(self.face_area_ratio, 4),
            "mean_luminance": round(self.mean_luminance, 2),
            "blur_metric": round(self.blur_metric, 2),
            "diagnostics": self.diagnostics
        }


class FaceQualityAssessor:
    """
    Assesses image stream quality for the Facial CNN Sensing component.
    Determines whether the frame is high quality or if the sensor fusion
    mechanism should down-weight facial affect and lean on HRV/PPG signals.
    """

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or QUALITY_CONFIG

    def _to_gray_numpy(self, image: Any) -> np.ndarray:
        """Converts input frame (PIL or np.ndarray) to single-channel grayscale float/uint8."""
        if isinstance(image, Image.Image):
            gray = np.array(image.convert("L"))
        elif isinstance(image, np.ndarray):
            if image.ndim == 2:
                gray = image
            elif image.ndim == 3 and image.shape[2] == 3:
                # RGB or BGR to Grayscale using standard luminance weights
                gray = np.dot(image[..., :3], [0.2989, 0.5870, 0.1140]).astype(np.uint8)
            elif image.ndim == 3 and image.shape[2] == 4:
                gray = np.dot(image[..., :3], [0.2989, 0.5870, 0.1140]).astype(np.uint8)
            else:
                gray = image[:, :, 0]
        else:
            raise ValueError(f"Unsupported image type: {type(image)}")
        return gray

    def _calculate_blur(self, gray: np.ndarray) -> float:
        """Computes blur metric via discrete Laplacian operator variance."""
        if gray.shape[0] < 3 or gray.shape[1] < 3:
            return 0.0

        try:
            lap = cv2.Laplacian(gray, cv2.CV_64F)  # type: ignore[attr-defined] # pylint: disable=no-member
            return float(lap.var())
        except Exception:
            pass

        # Discrete 3x3 Laplacian kernel fallback: [[0, 1, 0], [1, -4, 1], [0, 1, 0]]
        padded = np.pad(gray.astype(np.float32), 1, mode="edge")
        laplacian = (
            padded[1:-1, :-2] +
            padded[1:-1, 2:] +
            padded[:-2, 1:-1] +
            padded[2:, 1:-1] -
            4.0 * gray
        )
        return float(np.var(laplacian))

    def evaluate(
        self,
        frame: Any,
        bbox: Optional[Tuple[int, int, int, int]] = None
    ) -> QualityAssessmentResult:
        """
        Evaluates a frame and optional face bounding box (x, y, w, h).

        Returns:
            QualityAssessmentResult with quality score and diagnostic flags.
        """
        gray = self._to_gray_numpy(frame)
        h_frame, w_frame = gray.shape[:2]
        frame_area = max(h_frame * w_frame, 1)

        # 1. Check Face Detection presence
        if bbox is None:
            return QualityAssessmentResult(
                quality_score=0.0,
                face_detected=False,
                face_visible=False,
                lighting_adequate=False,
                blur_adequate=False,
                occlusion_detected=True,
                face_area_ratio=0.0,
                mean_luminance=0.0,
                blur_metric=0.0,
                diagnostics={"reason": "No face detected in video frame"}
            )

        x, y, w, h = bbox
        # Clamp bbox coordinates
        x1 = max(0, min(x, w_frame - 1))
        y1 = max(0, min(y, h_frame - 1))
        x2 = max(x1 + 1, min(x + w, w_frame))
        y2 = max(y1 + 1, min(y + h, h_frame))
        
        face_roi = gray[y1:y2, x1:x2]
        face_area = (x2 - x1) * (y2 - y1)
        face_area_ratio = face_area / frame_area

        # 2. Lighting & Luminance Assessment
        mean_lum = float(np.mean(face_roi)) if face_roi.size > 0 else 0.0
        min_lum = self.config["brightness_min_lum"]
        max_lum = self.config["brightness_max_lum"]
        lighting_adequate = (min_lum <= mean_lum <= max_lum)

        # Lighting penalty (smooth falloff outside adequate range)
        if mean_lum < min_lum:
            lighting_score = max(0.0, mean_lum / min_lum)
        elif mean_lum > max_lum:
            lighting_score = max(0.0, (255.0 - mean_lum) / (255.0 - max_lum))
        else:
            lighting_score = 1.0

        # 3. Blur & Sharpness Assessment
        blur_metric = self._calculate_blur(face_roi) if face_roi.size > 0 else 0.0
        blur_thresh = self.config["blur_laplacian_threshold"]
        blur_adequate = blur_metric >= blur_thresh
        blur_score = min(1.0, blur_metric / blur_thresh)

        # 4. Size & Edge Occlusion Assessment
        min_size = self.config["min_face_size_px"]
        size_adequate = (w >= min_size and h >= min_size)
        size_score = min(1.0, max(w, h) / (min_size * 2.0))

        # Check if face touches frame boundary (possible partial face / occlusion)
        margin_x = int(w_frame * self.config["edge_margin_ratio"])
        margin_y = int(h_frame * self.config["edge_margin_ratio"])
        touches_boundary = (
            x1 <= margin_x or
            y1 <= margin_y or
            x2 >= (w_frame - margin_x) or
            y2 >= (h_frame - margin_y)
        )
        occlusion_detected = touches_boundary or not size_adequate
        occlusion_penalty = 0.75 if touches_boundary else 1.0

        # 5. Composite Quality Score
        # If the ROI is pitch black (mean luminance < 10) or completely uniform (blur variance == 0), no face is visible
        if mean_lum < 10.0 or blur_metric == 0.0:
            quality_score = 0.0
            face_visible = False
        else:
            # Weighted combination: lighting (35%), blur (40%), size/position (25%) * boundary factor
            raw_quality = (0.35 * lighting_score + 0.40 * blur_score + 0.25 * size_score) * occlusion_penalty
            quality_score = float(np.clip(raw_quality, 0.0, 1.0))
            face_visible = quality_score >= 0.40

        diagnostics = {
            "bbox": {"x": int(x1), "y": int(y1), "w": int(x2 - x1), "h": int(y2 - y1)},
            "lighting_score": round(lighting_score, 3),
            "blur_score": round(blur_score, 3),
            "size_score": round(size_score, 3),
            "touches_boundary": touches_boundary,
            "face_area_ratio": round(face_area_ratio, 4)
        }

        return QualityAssessmentResult(
            quality_score=quality_score,
            face_detected=True,
            face_visible=face_visible,
            lighting_adequate=lighting_adequate,
            blur_adequate=blur_adequate,
            occlusion_detected=occlusion_detected,
            face_area_ratio=face_area_ratio,
            mean_luminance=mean_lum,
            blur_metric=blur_metric,
            diagnostics=diagnostics
        )
