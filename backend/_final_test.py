"""Final verification — all 4 emotions, stability check via WebSocket."""
import asyncio, websockets, json, base64, io, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from PIL import Image
from collections import Counter

IMG_DIR  = '/Users/mac/Desktop/CalmSpace/backend/dataset/YOLO_format/test/images'
LBL_DIR  = '/Users/mac/Desktop/CalmSpace/backend/dataset/YOLO_format/test/labels'
CLASS_MAP= {5:0, 4:1, 6:2, 3:2, 7:2, 0:3, 1:3, 2:3}
RAW_CLS  = ['Calm','Happy','Distressed','Overwhelmed']
CS_CLS   = ['Calm','Mildly_Stressed','Anxious','Overloaded']

# CalmSpace state the model SHOULD output for each raw class
EXPECTED = {0:'Calm', 1:'Calm', 2:'Mildly_Stressed', 3:'Overloaded'}

def b64(path):
    img = Image.open(path).convert('RGB').resize((320,240))
    buf = io.BytesIO(); img.save(buf, format='JPEG', quality=80)
    return 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()

async def test_image(path, frames=12):
    """Send same image 12 times, return dominant calmspace state."""
    enc = b64(path)
    states = []
    try:
        async with websockets.connect('ws://localhost:8000/ws/facial-sensing', open_timeout=5) as ws:
            for _ in range(frames):
                await ws.send(json.dumps({'frame': enc}))
                pkt = json.loads(await asyncio.wait_for(ws.recv(), timeout=5))
                states.append(pkt.get('calmspace_state','Unknown'))
    except Exception as e:
        return 'Error', False
    dom = Counter(states).most_common(1)[0][0]
    stable = Counter(states).most_common(1)[0][1] >= frames * 0.7
    return dom, stable

async def main():
    # Pick 3 images per class
    buckets = {i:[] for i in range(4)}
    for img_name in sorted(os.listdir(IMG_DIR)):
        if not img_name.endswith(('.jpg','.png')): continue
        lbl = os.path.join(LBL_DIR, img_name.rsplit('.',1)[0]+'.txt')
        if not os.path.exists(lbl): continue
        gt = CLASS_MAP.get(int(open(lbl).read().strip().split()[0]))
        if gt is None: continue
        if len(buckets[gt]) < 3:
            buckets[gt].append((os.path.join(IMG_DIR, img_name), gt))
        if all(len(v)>=3 for v in buckets.values()): break

    print(f"\n{'='*58}")
    print(f"  FINAL END-TO-END TEST  (12 frames per image)")
    print(f"{'='*58}")
    passed = 0; total = 0
    for cls_id, imgs in buckets.items():
        for path, gt in imgs:
            dom, stable = await test_image(path)
            expected = EXPECTED[cls_id]
            ok = dom == expected or (cls_id==0 and dom in ['Calm','Mildly_Stressed'])
            icon = '✅' if ok else '❌'
            stab = '🔒stable' if stable else '⚠️ flicker'
            print(f"  {icon} GT={RAW_CLS[cls_id]:12s} → Expected={expected:15s} Got={dom:15s} {stab}")
            if ok: passed += 1
            total += 1
    print(f"{'='*58}")
    print(f"  Result: {passed}/{total} correct  ({100*passed//total}%)")
    print(f"{'='*58}\n")

asyncio.run(main())
