"""
CalmSpace Sensing Layer - Facial Emotion CNN Component
AffectNet YOLO-based real-time facial expression classifier with quality scoring,
calibrated multimodal fusion mapping, and autism-domain shift awareness.
"""

from .config import (
    AFFECTNET_CLASSES,
    CALMSPACE_STATES,
    CLASS_TO_CALMSPACE_MAP,
    AFFECTNET_CLASS_ID_MAP,
    ASD_DOMAIN_SHIFT_NOTICE,
)
from .quality_assessor import FaceQualityAssessor, QualityAssessmentResult
from .inference_engine import FacialEmotionEngine

__all__ = [
    "AFFECTNET_CLASSES",
    "CALMSPACE_STATES",
    "CLASS_TO_CALMSPACE_MAP",
    "AFFECTNET_CLASS_ID_MAP",
    "ASD_DOMAIN_SHIFT_NOTICE",
    "FaceQualityAssessor",
    "QualityAssessmentResult",
    "FacialEmotionEngine",
]
