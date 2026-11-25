"""Render the social share image (assets/og.png) and the apple touch icon.
Run: python3 scripts/og.py  (needs Pillow; uses macOS system fonts)."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = lambda *p: os.path.join(ROOT, 'assets', *p)
PAPER, INK, INK3 = (243, 240, 232), (21, 20, 18), (102, 98, 90)
W, H, S = 1200, 630, 2  # draw at 2x then downsample
img = Image.new('RGB', (W * S, H * S), PAPER)
d = ImageDraw.Draw(img)
sans = lambda sz, w=500: (lambda f: (f.set_variation_by_axes([w]) if hasattr(f, 'set_variation_by_axes') else None, f)[1])(ImageFont.truetype('/System/Library/Fonts/SFNS.ttf', sz * S))
serif_i = lambda sz: ImageFont.truetype('/System/Library/Fonts/NewYorkItalic.ttf', sz * S)
mono = lambda sz: ImageFont.truetype('/System/Library/Fonts/SFNSMono.ttf', sz * S)
def sf(size, weight):
    f = ImageFont.truetype('/System/Library/Fonts/SFNS.ttf', size)
    try:
        axes = {a['name'] if isinstance(a['name'], str) else a['name'].decode(): a for a in f.get_variation_axes()}
        vals = [ {'Width': 100, 'Weight': weight}.get(n, a['default']) for n, a in axes.items() ]
        f.set_variation_by_axes(vals)
    except Exception:
        pass
    return f
big = sf(74 * S, 560)
x0 = 72 * S
d.text((x0, 64 * S), 'DIVINE AJAYI  —  MOBILE ENGINEER, FLUTTER & DART', font=mono(17), fill=INK3)
y = 150 * S
for line in ['Mobile products,', 'engineered from', 'architecture']:
    d.text((x0 - 3 * S, y), line, font=big, fill=INK); y += 76 * S
d.text((x0, y + 4 * S), 'to App Store.', font=serif_i(70), fill=INK)
d.text((x0, 560 * S), 'divine-ajayi.vercel.app', font=mono(17), fill=INK3)

def device(path, w):
    s = Image.open(A(*path)).convert('RGB')
    h = int(s.height * w / s.width)
    s = s.resize((w, h), Image.LANCZOS)
    pad = int(w * 0.035)
    frame = Image.new('RGBA', (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    fd = ImageDraw.Draw(frame)
    fd.rounded_rectangle((0, 0, frame.width - 1, frame.height - 1), radius=int(w * 0.14), fill=(12, 12, 13, 255))
    m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, w - 1, h - 1), radius=int(w * 0.11), fill=255)
    frame.paste(s, (pad, pad), m)
    return frame

def drop(base, im, xy, rot=0):
    im = im.rotate(rot, resample=Image.BICUBIC, expand=True)
    sh = Image.new('RGBA', im.size, (0, 0, 0, 0)); sh.putalpha(im.split()[3].point(lambda a: int(a * 0.35)))
    sh = sh.filter(ImageFilter.GaussianBlur(28 * S))
    base.paste(sh, (xy[0], xy[1] + 30 * S), sh); base.paste(im, xy, im)

img = img.convert('RGBA')
drop(img, device(('sanah', '01-health-score.webp'), 200 * S), (968 * S, 96 * S), 5)
drop(img, device(('shmood', '07-now-playing.webp'), 210 * S), (800 * S, 150 * S), 0)
img = img.convert('RGB').resize((W, H), Image.LANCZOS)
img.save(A('og.png'), optimize=True)

icon = Image.new('RGB', (360, 360), INK)
di = ImageDraw.Draw(icon)
f = sf(150, 800)  # matches the squared, heavy 'DA' wordmark
bb = di.textbbox((0, 0), 'DA', font=f)
di.text(((360 - (bb[2] - bb[0])) / 2 - bb[0], (360 - (bb[3] - bb[1])) / 2 - bb[1]), 'DA', font=f, fill=PAPER)
icon.resize((180, 180), Image.LANCZOS).save(A('apple-touch-icon.png'), optimize=True)
print('ok', os.path.getsize(A('og.png')))
