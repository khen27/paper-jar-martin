"""Convert premultiplied linear EXR layers -> straight-alpha sRGB PNGs on a shared square crop.
Additive glints (color > alpha) become semi-opaque white so they survive in PNG."""
import sys, os, json
import numpy as np, OpenEXR
from PIL import Image

src, dst, size = sys.argv[1], sys.argv[2], int(sys.argv[3])
os.makedirs(dst, exist_ok=True)

def load(path):
    with OpenEXR.File(path) as f:
        ch = f.channels()
        if "RGBA" in ch:
            arr = ch["RGBA"].pixels.astype(np.float32)
        else:
            arr = np.stack([ch[c].pixels for c in "RGBA"], -1).astype(np.float32)
    return arr  # H,W,4 premultiplied linear

def srgb(x):
    x = np.clip(x, 0, 1)
    return np.where(x <= 0.0031308, 12.92*x, 1.055*np.power(x, 1/2.4) - 0.055)

def to_rgba8(arr, glint_gain=1.35):
    P, A = arr[..., :3], arr[..., 3]
    lum = P.max(-1)
    A2 = np.clip(np.maximum(A, lum*glint_gain), 0, 1)
    C = np.where(A2[..., None] > 1e-5, P / np.maximum(A2[..., None], 1e-5), 0)
    out = np.dstack([srgb(C), A2])
    return (out*255 + 0.5).astype(np.uint8)

names = sorted(n[:-4] for n in os.listdir(src) if n.endswith(".exr"))
full = load(os.path.join(src, "00-full.exr"))
H, W = full.shape[:2]
ys, xs = np.where(full[..., 3] > 0.03)
l, r, t, b = xs.min(), xs.max(), ys.min(), ys.max()
side = int(max(r-l, b-t) * 1.08)
cx, cy = (l+r)/2, (t+b)/2
x0, y0 = int(round(cx - side/2)), int(round(cy - side/2))

for n in names:
    img = Image.fromarray(to_rgba8(load(os.path.join(src, n+".exr"))), "RGBA")
    canvas = Image.new("RGBA", (side, side), (0,0,0,0))
    canvas.paste(img, (-x0, -y0))
    canvas = canvas.resize((size, size), Image.LANCZOS)
    canvas.save(os.path.join(dst, n + ".png"), optimize=True)
    print("wrote", n)

# pivots -> percent of the final square canvas
piv = json.load(open(os.path.join(src, "pivots_raw.json")))
out = {}
for k, (fx, fy) in piv.items():
    px, py = fx*W - x0, fy*H - y0
    out[k] = {"x": round(px/side*100, 2), "y": round(py/side*100, 2)}
json.dump({"canvas": "square, all layers share it; values are % from top-left", "pivots": out},
          open(os.path.join(dst, "pivots.json"), "w"), indent=2)
print(json.dumps(out))
