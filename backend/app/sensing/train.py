"""
AffectNet YOLO Facial Emotion CNN Training and Evaluation Pipeline.

CONSTRAINTS & COMPLIANCE:
1. Evaluates on an actual held-out validation split.
2. Explicitly labels benchmark metrics as AffectNet-domain (neurotypical) performance.
3. Does NOT claim or assume transfer accuracy on ASD populations.
"""

import os
import sys
import argparse
import logging
from typing import Dict, Any, Tuple, Optional
import numpy as np

# Ensure backend root is in sys.path when executed directly as a script
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_root = os.path.abspath(os.path.join(current_dir, "..", ".."))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

import torch  # noqa: E402
import torch.nn as nn  # noqa: E402
from torch.utils.data import DataLoader  # noqa: E402
from torchvision import transforms  # noqa: E402

try:
    from .config import AFFECTNET_CLASSES, ASD_DOMAIN_SHIFT_NOTICE
    from .dataset import AffectNetYOLODataset
    from .model import create_facial_emotion_model
except (ImportError, ValueError):
    from app.sensing.config import AFFECTNET_CLASSES, ASD_DOMAIN_SHIFT_NOTICE  # type: ignore
    from app.sensing.dataset import AffectNetYOLODataset  # type: ignore
    from app.sensing.model import create_facial_emotion_model  # type: ignore

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def set_seed(seed: int = 42):
    """Sets deterministic random seeds across python, numpy, and torch."""
    import random
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False
    logger.info(f"Reproducibility seed set to {seed}")


def build_transforms(img_size: int = 224) -> Tuple[Any, Any]:
    """Builds training and validation transforms for face crops."""
    train_transform = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(degrees=10),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    val_transform = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    return train_transform, val_transform


def compute_class_weights(dataset: AffectNetYOLODataset, num_classes: int) -> torch.Tensor:
    """Computes inverse-frequency class weights for balanced cross-entropy loss."""
    dist = dataset.get_class_distribution()
    counts = np.array([dist.get(c, 0) for c in AFFECTNET_CLASSES], dtype=np.float32)
    total = np.sum(counts)
    
    weights = np.ones(num_classes, dtype=np.float32)
    for i, count in enumerate(counts):
        if count > 0:
            weights[i] = total / (num_classes * count)
        else:
            weights[i] = 1.0

    # Normalize weights
    weights = weights / np.mean(weights)
    return torch.tensor(weights, dtype=torch.float32)


def evaluate_model(
    model: nn.Module,
    val_loader: DataLoader,
    device: torch.device
) -> Dict[str, Any]:
    """
    Evaluates model on the held-out validation dataset.
    Returns accuracy, macro F1, per-class metrics, and confusion matrix.
    """
    model.eval()
    all_preds = []
    all_targets = []

    with torch.no_grad():
        for images, targets in val_loader:
            images = images.to(device)
            outputs = model(images)
            preds = torch.argmax(outputs, dim=1).cpu().numpy()
            all_preds.extend(preds)
            all_targets.extend(targets.numpy())

    all_preds = np.array(all_preds)
    all_targets = np.array(all_targets)

    total_samples = len(all_targets)
    if total_samples == 0:
        return {"accuracy": 0.0, "total_samples": 0}

    # Accuracy
    accuracy = float(np.mean(all_preds == all_targets))

    # Confusion matrix & per-class precision / recall / F1
    num_classes = len(AFFECTNET_CLASSES)
    conf_mat = np.zeros((num_classes, num_classes), dtype=int)
    for t, p in zip(all_targets, all_preds):
        conf_mat[t, p] += 1

    per_class_metrics = {}
    f1_list = []
    for c_id, c_name in enumerate(AFFECTNET_CLASSES):
        tp = conf_mat[c_id, c_id]
        fp = np.sum(conf_mat[:, c_id]) - tp
        fn = np.sum(conf_mat[c_id, :]) - tp

        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

        per_class_metrics[c_name] = {
            "precision": round(float(precision), 4),
            "recall": round(float(recall), 4),
            "f1_score": round(float(f1), 4),
            "support": int(np.sum(conf_mat[c_id, :]))
        }
        f1_list.append(f1)

    macro_f1 = float(np.mean(f1_list))

    return {
        "domain": "AffectNet (Neurotypical Dataset)",
        "domain_shift_notice": ASD_DOMAIN_SHIFT_NOTICE,
        "total_samples": total_samples,
        "accuracy": round(accuracy, 4),
        "macro_f1": round(macro_f1, 4),
        "per_class": per_class_metrics,
        "confusion_matrix": conf_mat.tolist()
    }


def print_evaluation_report(metrics: Dict[str, Any]):
    """Formats and prints the official evaluation report."""
    print("\n" + "=" * 76)
    print(" CALMSPACE FACIAL CNN - AFFECTNET VALIDATION EVALUATION REPORT")
    print("=" * 76)
    print(f"Domain Tested    : {metrics.get('domain')}")
    print(f"Total Evaluated  : {metrics.get('total_samples')} held-out face crops")
    print(f"Top-1 Accuracy   : {metrics.get('accuracy', 0.0) * 100:.2f}%")
    print(f"Macro F1-Score   : {metrics.get('macro_f1', 0.0):.4f}")
    print("-" * 76)
    print(f"{'Emotion Class':<15} {'Precision':<12} {'Recall':<12} {'F1-Score':<12} {'Support':<10}")
    print("-" * 76)
    for c_name, m in metrics.get("per_class", {}).items():
        print(f"{c_name:<15} {m['precision']:<12.4f} {m['recall']:<12.4f} {m['f1_score']:<12.4f} {m['support']:<10}")
    print("-" * 76)
    print("CRITICAL ASD DOMAIN-SHIFT NOTICE:")
    print(metrics.get("domain_shift_notice"))
    print("=" * 76 + "\n")


def train(
    dataset_dir: str,
    epochs: int = 15,
    batch_size: int = 32,
    lr: float = 5e-4,
    backbone: str = "light",
    output_dir: str = "checkpoints",
    seed: int = 42,
    data_yaml: Optional[str] = None
):
    """Executes training on the AffectNet YOLO dataset."""
    set_seed(seed)
    os.makedirs(output_dir, exist_ok=True)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info(f"Using compute device: {device}")

    train_transform, val_transform = build_transforms()

    logger.info(f"Loading training set from {dataset_dir}...")
    train_dataset = AffectNetYOLODataset(dataset_dir, split="train", transform=train_transform, data_yaml_path=data_yaml)
    val_dataset = AffectNetYOLODataset(dataset_dir, split="val", transform=val_transform, data_yaml_path=data_yaml)

    # Critical Pre-training class ID verification banner
    print("\n" + "=" * 76)
    print("CRITICAL PRE-TRAINING CHECK: DATASET CLASS ID ALIGNMENT")
    print(f"Dataset root: {dataset_dir}")
    print(f"Discovered classes ({len(train_dataset.discovered_classes)}): {train_dataset.discovered_classes}")
    for raw_id, can_id in train_dataset.class_mapping.items():
        raw_name = train_dataset.discovered_classes[raw_id] if raw_id < len(train_dataset.discovered_classes) else "unknown"
        can_name = AFFECTNET_CLASSES[can_id] if 0 <= can_id < len(AFFECTNET_CLASSES) else "UNMAPPED"
        print(f"  [YOLO ID {raw_id}] '{raw_name:<10}' -> Canonical AffectNet ID {can_id} ('{can_name}')")
    print("=" * 76 + "\n")
    # Strict validation check: refuse to proceed if any class is unmapped or count mismatch
    unmapped = [
        train_dataset.discovered_classes[k]
        for k, v in train_dataset.class_mapping.items()
        if v < 0 and k < len(train_dataset.discovered_classes)
    ]
    if unmapped:
        raise ValueError(
            f"\n[CRITICAL ERROR] Dataset contains unrecognized emotion classes: {unmapped}!\n"
            f"Expected canonical AffectNet classes: {AFFECTNET_CLASSES}.\n"
            f"Discovered in dataset: {train_dataset.discovered_classes}.\n"
            f"Training aborted immediately to prevent silent corruption or data truncation.\n"
            f"Please verify or alias your classes in data.yaml / classes.txt."
        )

    if len(train_dataset.discovered_classes) != len(AFFECTNET_CLASSES):
        raise ValueError(
            f"\n[CRITICAL ERROR] Dataset contains {len(train_dataset.discovered_classes)} classes "
            f"({train_dataset.discovered_classes}), but CalmSpace expects exactly {len(AFFECTNET_CLASSES)}: "
            f"{AFFECTNET_CLASSES}!\n"
            f"Training aborted to prevent label misinterpretation."
        )

    if len(train_dataset) == 0:
        logger.error("No training samples found. Please check dataset path.")
        return

    num_workers = 0 if os.name == "nt" else 2
    pin_memory = torch.cuda.is_available()

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=num_workers, pin_memory=pin_memory)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=num_workers, pin_memory=pin_memory)

    # Model & Loss with class weights
    model = create_facial_emotion_model(backbone=backbone, pretrained=True).to(device)
    class_weights = compute_class_weights(train_dataset, len(AFFECTNET_CLASSES)).to(device)
    criterion = nn.CrossEntropyLoss(weight=class_weights, label_smoothing=0.05)
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-3)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    best_val_f1 = 0.0
    best_weights_path = os.path.join(output_dir, "best_facial_cnn.pt")

    for epoch in range(1, epochs + 1):
        model.train()
        running_loss = 0.0

        for batch_idx, (images, targets) in enumerate(train_loader):
            images = images.to(device)
            targets = targets.to(device)

            optimizer.zero_grad()
            logits = model(images)
            loss = criterion(logits, targets)
            loss.backward()
            optimizer.step()

            running_loss += loss.item()

        scheduler.step()
        epoch_loss = running_loss / max(1, len(train_loader))

        # Validation
        val_metrics = evaluate_model(model, val_loader, device)
        val_acc = val_metrics["accuracy"]
        val_f1 = val_metrics["macro_f1"]

        logger.info(f"Epoch [{epoch}/{epochs}] Loss: {epoch_loss:.4f} | Val Acc: {val_acc*100:.2f}% | Val Macro F1: {val_f1:.4f}")

        if val_f1 > best_val_f1:
            best_val_f1 = val_f1
            torch.save(model.state_dict(), best_weights_path)
            logger.info(f"[*] New best validation Macro F1: {val_f1:.4f}. Saved checkpoint to {best_weights_path}")

    # Final held-out evaluation with best model
    if os.path.exists(best_weights_path):
        try:
            model.load_state_dict(torch.load(best_weights_path, map_location=device, weights_only=True))
        except TypeError:
            model.load_state_dict(torch.load(best_weights_path, map_location=device))
    final_metrics = evaluate_model(model, val_loader, device)
    print_evaluation_report(final_metrics)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="CalmSpace AffectNet Facial CNN Training Pipeline")
    parser.add_argument("--dataset-dir", type=str, required=True, help="Path to AffectNet YOLO dataset root")
    parser.add_argument("--data-yaml", type=str, default=None, help="Path to dataset data.yaml or classes.txt (optional, auto-detected)")
    parser.add_argument("--epochs", type=int, default=15)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--lr", type=float, default=5e-4)
    parser.add_argument("--backbone", type=str, default="light", choices=["light", "mobilenet_v3"])
    parser.add_argument("--output-dir", type=str, default="checkpoints")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility")
    parser.add_argument("--evaluate-only", action="store_true")
    parser.add_argument("--weights", type=str, default=None)

    args = parser.parse_args()

    if args.evaluate_only:
        set_seed(args.seed)
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        _, val_transform = build_transforms()
        val_dataset = AffectNetYOLODataset(args.dataset_dir, split="val", transform=val_transform, data_yaml_path=args.data_yaml)
        num_workers = 0 if os.name == "nt" else 2
        pin_memory = torch.cuda.is_available()
        val_loader = DataLoader(val_dataset, batch_size=args.batch_size, shuffle=False, num_workers=num_workers, pin_memory=pin_memory)
        model = create_facial_emotion_model(backbone=args.backbone, pretrained=False).to(device)
        if args.weights and os.path.exists(args.weights):
            try:
                model.load_state_dict(torch.load(args.weights, map_location=device, weights_only=True))
            except TypeError:
                model.load_state_dict(torch.load(args.weights, map_location=device))
        report = evaluate_model(model, val_loader, device)
        print_evaluation_report(report)
    else:
        train(
            dataset_dir=args.dataset_dir,
            epochs=args.epochs,
            batch_size=args.batch_size,
            lr=args.lr,
            backbone=args.backbone,
            output_dir=args.output_dir,
            seed=args.seed,
            data_yaml=args.data_yaml
        )
