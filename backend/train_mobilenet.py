import os
import random
from PIL import Image
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import transforms, models
from torch.utils.data import Dataset, DataLoader
from collections import defaultdict

# Setup Device (Use Mac GPU if available)
if torch.backends.mps.is_available():
    device = torch.device("mps")
elif torch.cuda.is_available():
    device = torch.device("cuda")
else:
    device = torch.device("cpu")
print(f"Using device: {device}")

# 1. Dataset Configuration
DATA_DIR = "/Users/mac/Desktop/CalmSpace/backend/dataset/YOLO_format"
# Original Classes: [0: Anger, 1: Contempt, 2: Disgust, 3: Fear, 4: Happy, 5: Neutral, 6: Sad, 7: Surprise]
# Map 8 classes to 4 ASD states (0: Calm, 1: Happy, 2: Distressed, 3: Overwhelmed)
CLASS_MAP = {
    5: 0, 7: 0,  # Neutral, Surprise -> Calm (0)
    4: 1,        # Happy -> Happy (1)
    3: 2, 6: 2,  # Fear, Sad -> Distressed (2)
    0: 3, 1: 3, 2: 3 # Anger, Contempt, Disgust -> Overwhelmed (3)
}
CLASS_NAMES = ["Calm", "Happy", "Distressed", "Overwhelmed"]

class AffectNetYOLODataset(Dataset):
    def __init__(self, split="train", transform=None, max_samples_per_class=1000):
        self.split = split
        self.transform = transform
        self.images_dir = os.path.join(DATA_DIR, split, "images")
        self.labels_dir = os.path.join(DATA_DIR, split, "labels")
        self.data = []
        
        # Collect data by mapped class
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
                            
        # Balance dataset by subsampling
        for cls, items in class_counts.items():
            if len(items) > max_samples_per_class:
                items = random.sample(items, max_samples_per_class)
            self.data.extend(items)
            
        random.shuffle(self.data)
        print(f"Loaded {split} set: {len(self.data)} images total.")
        
    def __len__(self):
        return len(self.data)
        
    def __getitem__(self, idx):
        img_path, label = self.data[idx]
        image = Image.open(img_path).convert("RGB")
        if self.transform:
            image = self.transform(image)
        return image, label

# 2. Transforms
data_transforms = {
    'train': transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
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
    # Load limited datasets so it trains quickly on a Mac
    print("Preparing datasets...")
    # Using 2000 per class for training, 500 for validation to be safe and fast on local machine
    train_dataset = AffectNetYOLODataset(split="train", transform=data_transforms['train'], max_samples_per_class=2000)
    val_dataset = AffectNetYOLODataset(split="valid", transform=data_transforms['val'], max_samples_per_class=500)
    
    if len(train_dataset) == 0:
        print("Error: No training data found.")
        return
        
    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=32, shuffle=False)
    
    # 3. Model setup (MobileNetV2)
    print("Loading MobileNetV2...")
    model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)
    
    # Freeze the feature extractor
    for param in model.features.parameters():
        param.requires_grad = False
        
    # Replace classifier head for 4 classes
    num_features = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(num_features, 4)
    model = model.to(device)
    
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.classifier.parameters(), lr=0.001)
    
    # 4. Training Loop (Just 3 epochs to get a working model quickly)
    epochs = 3
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
            if i % 20 == 19:    # print every 20 mini-batches
                print(f"[{epoch + 1}, {i + 1}] loss: {running_loss / 20:.3f}")
                running_loss = 0.0
                
        # Validation
        model.eval()
        correct = 0
        total = 0
        with torch.no_grad():
            for inputs, labels in val_loader:
                inputs, labels = inputs.to(device), labels.to(device)
                outputs = model(inputs)
                _, predicted = torch.max(outputs.data, 1)
                total += labels.size(0)
                correct += (predicted == labels).sum().item()
                
        val_acc = 100 * correct / total
        print(f"Epoch {epoch + 1} Validation Accuracy: {val_acc:.2f}%")
        
        if val_acc > best_acc:
            best_acc = val_acc
            torch.save(model.state_dict(), '/Users/mac/Desktop/CalmSpace/backend/best_mobilenet_v2.pth')
            print(f"Saved new best model with accuracy: {best_acc:.2f}%")
            
    print("Training finished! Model saved to backend/best_mobilenet_v2.pth")

if __name__ == '__main__':
    main()
