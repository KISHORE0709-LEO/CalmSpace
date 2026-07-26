from PIL import Image
import os

img_path = '/Users/mac/.gemini/antigravity/brain/f0b77ba8-d5b8-45fb-add4-10fc5c929bdf/media__1785051454396.png'
if not os.path.exists(img_path):
    print("Image not found")
    exit(1)

img = Image.open(img_path)
w, h = img.size

# The image has 3 cards side by side. 
# We'll divide the width by 3.
card_w = w // 3

os.makedirs('public/cards', exist_ok=True)

for i in range(3):
    left = i * card_w
    right = (i + 1) * card_w
    # The cards are roughly square, let's just crop equally
    card = img.crop((left, 0, right, h))
    card.save(f'public/cards/card_{i+1}.png')
    print(f"Saved card_{i+1}.png")

