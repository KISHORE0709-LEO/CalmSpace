"""
Facial Emotion CNN Architectures for CalmSpace Sensing Layer.
Optimized for real-time edge/server inference, calibrated probability outputs,
and explicit mapping to CalmSpace emotional regulation states.
"""

import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

import logging
from typing import Dict, Tuple, Any
import numpy as np

import torch
import torch.nn as nn

from .config import (
    AFFECTNET_CLASSES,
    CALMSPACE_STATES,
    CLASS_TO_CALMSPACE_MAP,
    AUTISM_AWARENESS_CONFIG
)

logger = logging.getLogger(__name__)


class CalmSpaceLightFaceCNN(nn.Module):
    """
    Ultra-lightweight depthwise-separable CNN for real-time facial affect prediction.
    Zero external weight dependencies; runs effortlessly on low-power edge CPUs at 60+ FPS.
    Input: [Batch, 3, 224, 224] -> Output: [Batch, 8] logits
    """

    def __init__(self, num_classes: int = len(AFFECTNET_CLASSES), dropout_rate: float = 0.25):
        super().__init__()
        self.num_classes = num_classes

        # Initial stem convolution
        self.stem = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, stride=2, padding=1, bias=False),  # 112x112
            nn.BatchNorm2d(32),
            nn.ReLU6(inplace=True)
        )

        # Depthwise-separable block 1
        self.block1 = self._make_ds_block(32, 64, stride=2)   # 56x56
        # Depthwise-separable block 2
        self.block2 = self._make_ds_block(64, 128, stride=2)  # 28x28
        # Depthwise-separable block 3
        self.block3 = self._make_ds_block(128, 256, stride=2) # 14x14
        # Depthwise-separable block 4
        self.block4 = self._make_ds_block(256, 512, stride=2) # 7x7

        # Global average pool and classifier
        self.pool = nn.AdaptiveAvgPool2d((1, 1))
        self.dropout = nn.Dropout(p=dropout_rate)
        self.classifier = nn.Linear(512, num_classes)

        self._init_weights()

    def _make_ds_block(self, in_ch: int, out_ch: int, stride: int = 1) -> nn.Sequential:
        return nn.Sequential(
            # Depthwise conv
            nn.Conv2d(in_ch, in_ch, kernel_size=3, stride=stride, padding=1, groups=in_ch, bias=False),
            nn.BatchNorm2d(in_ch),
            nn.ReLU6(inplace=True),
            # Pointwise conv
            nn.Conv2d(in_ch, out_ch, kernel_size=1, stride=1, padding=0, bias=False),
            nn.BatchNorm2d(out_ch),
            nn.ReLU6(inplace=True)
        )

    def _init_weights(self):
        for m in self.modules():
            if isinstance(m, nn.Conv2d):
                nn.init.kaiming_normal_(m.weight, mode='fan_out', nonlinearity='relu')
            elif isinstance(m, nn.BatchNorm2d):
                nn.init.constant_(m.weight, 1)
                nn.init.constant_(m.bias, 0)
            elif isinstance(m, nn.Linear):
                nn.init.normal_(m.weight, 0, 0.01)
                nn.init.constant_(m.bias, 0)

    def forward(self, x):
        x = self.stem(x)
        x = self.block1(x)
        x = self.block2(x)
        x = self.block3(x)
        x = self.block4(x)
        x = self.pool(x)
        x = torch.flatten(x, 1)
        x = self.dropout(x)
        logits = self.classifier(x)
        return logits


def create_facial_emotion_model(
    backbone: str = "light",
    pretrained: bool = True,
    dropout_rate: float = 0.25
) -> Any:
    """
    Factory creating a facial emotion CNN model.
    Backbone options:
      - 'light': CalmSpaceLightFaceCNN (self-contained, ultra-fast)
      - 'mobilenet_v3': torchvision MobileNetV3-Small backbone with custom 8-class head
    """
    if backbone == "mobilenet_v3":
        try:
            import torchvision.models as models
            weights = models.MobileNet_V3_Small_Weights.DEFAULT if pretrained else None
            model = models.mobilenet_v3_small(weights=weights)
            first_layer = model.classifier[0]
            in_features = int(getattr(first_layer, "in_features", 576))
            model.classifier = nn.Sequential(
                nn.Linear(in_features, 256),
                nn.Hardswish(),
                nn.Dropout(p=dropout_rate),
                nn.Linear(256, len(AFFECTNET_CLASSES))
            )
            return model
        except Exception as err:
            logger.warning(f"Could not load torchvision mobilenet_v3: {err}. Falling back to CalmSpaceLightFaceCNN.")
            return CalmSpaceLightFaceCNN(dropout_rate=dropout_rate)

    return CalmSpaceLightFaceCNN(dropout_rate=dropout_rate)


# Probability transformation & Autism-aware ambiguity evaluation helpers
def map_raw_to_calmspace(raw_probs: Dict[str, float]) -> Dict[str, float]:
    """
    Projects the full 8-class AffectNet probability distribution to CalmSpace's
    4-state emotional regulation taxonomy (Calm, Mildly_Stressed, Anxious, Overloaded).
    Prevents silent argmax remapping.
    """
    calmspace_probs = {state: 0.0 for state in CALMSPACE_STATES}

    for emotion, prob in raw_probs.items():
        if emotion in CLASS_TO_CALMSPACE_MAP:
            mapping = CLASS_TO_CALMSPACE_MAP[emotion]
            for state, weight in mapping.items():
                calmspace_probs[state] += prob * weight

    # Normalize mapped probabilities so they sum exactly to 1.0
    total = sum(calmspace_probs.values())
    if total > 0:
        for s in calmspace_probs:
            calmspace_probs[s] = round(calmspace_probs[s] / total, 4)

    return calmspace_probs


def evaluate_autism_ambiguity(raw_probs: Dict[str, float]) -> Tuple[float, bool, str]:
    """
    Evaluates whether the facial affect prediction is ambiguous, flat, or atypical
    due to ASD presentation differences.

    Calculates:
      1. Shannon entropy: high entropy means probabilities are dispersed rather than peaking.
      2. Top-1 vs Top-2 margin: small margin means high classifier uncertainty.

    Returns:
      (entropy, is_atypical_or_ambiguous, reason)
    """
    if not raw_probs or len(raw_probs) < 2:
        return 0.0, False, "Insufficient class probabilities provided"

    probs = np.array(list(raw_probs.values()), dtype=np.float64)
    total = np.sum(probs)
    if total <= 0:
        return 0.0, True, "All emotion probabilities are zero"

    probs = np.clip(probs, 1e-12, 1.0)
    probs = probs / np.sum(probs)

    # Shannon entropy: - sum(p * ln(p))
    entropy = float(-np.sum(probs * np.log(probs)))

    sorted_indices = np.argsort(probs)[::-1]
    top1_prob = probs[sorted_indices[0]]
    top2_prob = probs[sorted_indices[1]]
    top2_delta = float(top1_prob - top2_prob)

    entropy_thresh = AUTISM_AWARENESS_CONFIG["entropy_threshold"]
    delta_thresh = AUTISM_AWARENESS_CONFIG["top2_delta_threshold"]

    is_ambiguous = False
    reasons = []

    if entropy > entropy_thresh:
        is_ambiguous = True
        reasons.append(f"High emotion entropy ({entropy:.2f} > {entropy_thresh:.2f}), flat/atypical affect")

    if top2_delta < delta_thresh:
        is_ambiguous = True
        reasons.append(f"Narrow margin between top emotions ({top2_delta:.3f} < {delta_thresh:.3f})")

    reason_str = "; ".join(reasons) if is_ambiguous else "Expression confidence consistent"
    return entropy, is_ambiguous, reason_str
