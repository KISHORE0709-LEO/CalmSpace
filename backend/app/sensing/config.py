"""
Configuration and taxonomy mapping for CalmSpace Facial Emotion CNN.

AUTISM SPECTRUM DISORDER (ASD) DOMAIN-SHIFT NOTICE:
--------------------------------------------------
AffectNet is annotated primarily from internet media depicting neurotypical individuals
exhibiting canonical, high-intensity facial affect (e.g. posed smiles, open-mouth surprise).
Research in developmental psychology and affective computing demonstrates that autistic
individuals frequently manifest atypical, blunted, subtle, or idiosyncratic facial expressions,
as well as facial stimming or motor artifacts.

Consequently:
1. AffectNet validation accuracy numbers must NOT be treated as representative of performance
   in individuals with ASD.
2. The Facial CNN output MUST be treated as an uncertain modality in the CalmSpace Sensing Layer.
3. Frames exhibiting high Shannon entropy across emotion classes, or low face-detection quality,
   must be flagged as 'is_atypical_or_ambiguous' to instruct the downstream fusion layer to
   gracefully down-weight the facial channel and lean on physiological HRV/PPG sensors.
4. Ambiguous frames are logged separately for clinician/caregiver review rather than silently trusted.
"""

import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

from typing import Dict, List

# AffectNet 8-class taxonomy in YOLO annotation format
AFFECTNET_CLASSES: List[str] = [
    "anger",      # 0
    "contempt",   # 1
    "disgust",    # 2
    "fear",       # 3
    "happy",      # 4
    "neutral",    # 5
    "sad",        # 6
    "surprise"    # 7
]

AFFECTNET_CLASS_ID_MAP: Dict[int, str] = {i: name for i, name in enumerate(AFFECTNET_CLASSES)}
AFFECTNET_CLASS_NAME_TO_ID: Dict[str, int] = {name: i for i, name in enumerate(AFFECTNET_CLASSES)}

# CalmSpace target operational states
CALMSPACE_STATES: List[str] = [
    "Calm",
    "Mildly_Stressed",
    "Anxious",
    "Overloaded"
]

# Explicit, calibrated mapping matrix from AffectNet 8-class probabilities to CalmSpace 4-states.
# This avoids silent argmax remapping by linearly projecting the full probability distribution.
# Each row represents the contribution of an AffectNet emotion to CalmSpace states (sum = 1.0).
CLASS_TO_CALMSPACE_MAP: Dict[str, Dict[str, float]] = {
    "happy": {
        "Calm": 0.95,
        "Mildly_Stressed": 0.05,
        "Anxious": 0.0,
        "Overloaded": 0.0
    },
    "neutral": {
        "Calm": 0.90,
        "Mildly_Stressed": 0.10,
        "Anxious": 0.0,
        "Overloaded": 0.0
    },
    "surprise": {
        "Calm": 0.30,
        "Mildly_Stressed": 0.45,
        "Anxious": 0.25,
        "Overloaded": 0.0
    },
    "sad": {
        "Calm": 0.10,
        "Mildly_Stressed": 0.50,
        "Anxious": 0.35,
        "Overloaded": 0.05
    },
    "fear": {
        "Calm": 0.0,
        "Mildly_Stressed": 0.15,
        "Anxious": 0.70,
        "Overloaded": 0.15
    },
    "anger": {
        "Calm": 0.0,
        "Mildly_Stressed": 0.05,
        "Anxious": 0.20,
        "Overloaded": 0.75
    },
    "disgust": {
        "Calm": 0.0,
        "Mildly_Stressed": 0.10,
        "Anxious": 0.25,
        "Overloaded": 0.65
    },
    "contempt": {
        "Calm": 0.05,
        "Mildly_Stressed": 0.35,
        "Anxious": 0.20,
        "Overloaded": 0.40
    }
}

# Image Quality & Diagnostics Thresholds
QUALITY_CONFIG = {
    "min_face_size_px": 60,               # Minimum bounding box dimension
    "min_face_area_ratio": 0.02,          # Face must cover at least 2% of total frame
    "blur_laplacian_threshold": 65.0,     # Below this variance -> blurry / out of focus
    "brightness_min_lum": 40.0,           # Underexposed / dark frame
    "brightness_max_lum": 225.0,          # Overexposed / washed out
    "edge_margin_ratio": 0.02,            # Margin proximity to detect cropped/occluded face edges
}

# Autism Ambiguity & Entropy Thresholds
AUTISM_AWARENESS_CONFIG = {
    # Maximum Shannon entropy for 8 classes is ln(8) ≈ 2.079.
    # An entropy above 1.70 indicates high dispersion across emotions (atypical/subtle expression).
    "entropy_threshold": 1.70,
    # If the probability delta between rank-1 and rank-2 emotion is less than 0.10, mark ambiguous.
    "top2_delta_threshold": 0.10,
    # Overall detection confidence penalty applied when affect is marked atypical or ambiguous.
    "atypical_confidence_discount": 0.40,
}

ASD_DOMAIN_SHIFT_NOTICE = (
    "Model trained on neurotypical AffectNet dataset. Autistic individuals may exhibit atypical, "
    "blunted, or idiosyncratic facial affect. High entropy or low quality automatically triggers "
    "graceful degradation so the CalmSpace Sensing Layer prioritizes wearable HRV/PPG sensors."
)
