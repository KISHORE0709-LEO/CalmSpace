import os
import random
import numpy as np
from PIL import Image
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import transforms, models
from torch.utils.data import Dataset, DataLoader, WeightedRandomSampler
from collections import defaultdict
from sklearn.metrics import classification_report, confusion_matrix

# Setup Device
if torch.backends.mps.is_available():
    device = torch.device("mps")
elif torch.cuda.is_available():
    device = torch.device("cuda")
else:
    device = torch.device("cpu")
print(f"Using device: {device}")

# 1. Dataset Configuration
DATA_DIR = "/Users/mac/Desktop/CalmSpace/backend/dataset/YOLO_format"
# Map 8 AffectNet classes to 4 ASD states (0: Calm, 1: Happy, 2: Distressed, 3: Overwhelmed)
CLASS_MAP = {
    5: 0, 7: 0,  # Neutral, Surprise -> Calm (0)
    4: 1,        # Happy -> Happy (1)
    3: 2, 6: 2,  # Fear, Sad -> Distressed (2)
    0: 3, 1: 3, 2: 3 # Anger, Contempt, Disgust -> Overwhelmed (3)
}
CLASS_NAMES = ["Calm", "Happy", "Distressed", "Overwhelmed"]

class AffectNetYOLODataset(Dataset):
    def __init__(self, split="train", transform=None, max_samples_per_class=None):
        self.split = split
        self.transform = transform
        self.images_dir = os.path.join(DATA_DIR, split, "images")
        self.labels_dir = os.path.join(DATA_DIR, split, "labels")
        self.data = []
        
        class_counts = defaultdict(list)
        if not os.path.exists(self.images_dir):
            print(f"Warning: Directory not found {self.images_dir}")
            return
            
        for img_name in os.listdir(self.images_dir):
            if not img_name.endswith(('.jpg', '.png', '.jpeg')):
                continue
                
            label_name = img_name.rsplit('.', 1)[0] + '.txt'
            label_path = os.path.join(self.labels_dir, label_name)
            
            if os.path.exists(label_path):
                with open(label_path, 'r') as f:
                    content = f.read().strip().split()
                    if content:
                        original_class = int(content[0])
                        mapped_class = CLASS_MAP.get(original_class)
                        if mapped_class is not None:
                            img_path = os.path.join(self.images_dir, img_name)
                            class_counts[mapped_class].append((img_path, mapped_class))
                            
        # Subsample if max_samples_per_class is provided
        for cls, items in class_counts.items():
            if max_samples_per_class and len(items) > max_samples_per_class:
                items = random.sample(items, max_samples_per_class)
            self.data.extend(items)
            
        random.shuffle(self.data)
        
        # Calculate class weights for sampler
        counts = [0] * 4
        for _, label in self.data:
            counts[label] += 1
            
        print(f"Loaded {split} set: {len(self.data)} images total. Distribution: {counts}")
        self.class_counts = counts
        self.weights = [1.0 / c if c > 0 else 0 for c in counts]
        
    def __len__(self):
        return len(self.data)
        
    def __getitem__(self, idx):
        img_path, label = self.data[idx]
        image = Image.open(img_path).convert("RGB")
        if self.transform:
            image = self.transform(image)
        return image, label
        
    def get_sampler(self):
        sample_weights = [self.weights[label] for _, label in self.data]
        return WeightedRandomSampler(weights=sample_weights, num_samples=len(sample_weights), replacement=True)

# 2. Enhanced Transforms with Data Augmentation
data_transforms = {
    'train': transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.2, hue=0.1),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ]),
    'val': transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ]),
}

def main():
    print("Preparing datasets...")
    train_dataset = AffectNetYOLODataset(split="train", transform=data_transforms['train'])
    val_dataset = AffectNetYOLODataset(split="valid", transform=data_transforms['val'], max_samples_per_class=1000)
    
    if len(train_dataset) == 0:
        print("Error: No training data found.")
        return
        
    # Use WeightedRandomSampler to balance classes during training batches
    train_loader = DataLoader(train_dataset, batch_size=32, sampler=train_dataset.get_sampler())
    val_loader = DataLoader(val_dataset, batch_size=32, shuffle=False)
    
    print("Loading MobileNetV2...")
    model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)
    
    # Freeze feature extractor
    for param in model.features.parameters():
        param.requires_grad = False
        
    num_features = model.classifier[1].in_features
    model.classifier[1] = nn.Sequential(
        nn.Dropout(0.3),
        nn.Linear(num_features, 4)
    )
    model = model.to(device)
    
    # Use Label Smoothing to reduce overconfidence
    criterion = nn.CrossEntropyLoss(label_smoothing=0.1)
    optimizer = optim.AdamW(model.classifier.parameters(), lr=0.001, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='max', factor=0.5, patience=1, verbose=True)
    
    epochs = 5
    best_acc = 0.0
    
    print("Starting training...")
    for epoch in range(epochs):
        model.train()
        running_loss = 0.0
        
        for i, (inputs, labels) in enumerate(train_loader):
            inputs, labels = inputs.to(device), labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item()
            if i % 50 == 49:
                print(f"[{epoch + 1}, {i + 1}] loss: {running_loss / 50:.3f}")
                running_loss = 0.0
                
        # Validation
        model.eval()
        correct = 0
        total = 0
        all_preds = []
        all_labels = []
        
        with torch.no_grad():
            for inputs, labels in val_loader:
                inputs, labels = inputs.to(device), labels.to(device)
                outputs = model(inputs)
                _, predicted = torch.max(outputs.data, 1)
                
                total += labels.size(0)
                correct += (predicted == labels).sum().item()
                
                all_preds.extend(predicted.cpu().numpy())
                all_labels.extend(labels.cpu().numpy())
                
        val_acc = 100 * correct / total
        print(f"Epoch {epoch + 1} Validation Accuracy: {val_acc:.2f}%")
        
        scheduler.step(val_acc)
        
        if val_acc > best_acc:
            best_acc = val_acc
            torch.save(model.state_dict(), '/Users/mac/Desktop/CalmSpace/backend/best_mobilenet_v2.pth')
            print(f"Saved new best model with accuracy: {best_acc:.2f}%")
            
    # Final Evaluation Report
    print("\n--- Final Model Evaluation ---")
    print(classification_report(all_labels, all_preds, target_names=CLASS_NAMES, zero_division=0))
    print("Training finished! Model saved to backend/best_mobilenet_v2.pth")

if __name__ == '__main__':
    main()
