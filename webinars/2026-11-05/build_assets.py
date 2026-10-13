import sys, math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
SRC, OUT = sys.argv[1], sys.argv[2]   # SRC: dan-hinckley.png, rob-coleman.webp, hennessey-digital-logo.webp
CY = (2, 181, 230)
NAVY = np.array([8, 20, 28], float)

def noise_bg(w, h, seed, base=NAVY, blobs=6):
    rng = np.random.default_rng(seed)
    img = np.ones((h, w, 3)) * base
    yy, xx = np.mgrid[0:h, 0:w]
    for _ in range(blobs):  # soft lighter/darker clouds for texture
        cx, cy, r = rng.uniform(0, w), rng.uniform(0, h), rng.uniform(w*.15, w*.45)
        amp = rng.uniform(-5, 9)
        img += amp * np.exp(-((xx-cx)**2+(yy-cy)**2)/(2*r*r))[..., None] * np.array([.6, .9, 1.2])
    img += rng.normal(0, 2.2, (h, w, 1))
    return Image.fromarray(np.clip(img, 0, 255).astype("uint8"))

def glow_layer(size, draw_fn, blur):
    sharp = Image.new("RGBA", size, (0, 0, 0, 0)); draw_fn(ImageDraw.Draw(sharp))
    glow = sharp.filter(ImageFilter.GaussianBlur(blur))
    return Image.alpha_composite(Image.alpha_composite(Image.new("RGBA", size, (0,0,0,0)), glow), sharp)

def network(img, seed, n=60, region=None, alpha=200):
    rng = random.Random(seed); w, h = img.size
    x0, y0, x1, y1 = region or (0, 0, w, h)
    pts = [(rng.uniform(x0, x1), rng.uniform(y0, y1)) for _ in range(n)]
    def d(dr):
        for i, a in enumerate(pts):
            for b in pts[i+1:]:
                dist = math.dist(a, b)
                if dist < (x1-x0)*0.22:
                    dr.line([a, b], fill=CY + (int(alpha*0.45*(1-dist/((x1-x0)*0.22))),), width=2)
        for p in pts:
            r = rng.uniform(2, 6); dr.ellipse([p[0]-r, p[1]-r, p[0]+r, p[1]+r], fill=(150, 225, 250, alpha))
    return Image.alpha_composite(img.convert("RGBA"), glow_layer(img.size, d, 6))

def panel(kind, seed, w=750, h=1125):
    rng = random.Random(seed)
    img = noise_bg(w, h, seed, base=np.array([6, 16, 24], float), blobs=8).convert("RGBA")
    if kind == "network":
        img = network(img, seed, 70)
    elif kind == "bars":
        def d(dr):
            n = 9; bw = w/(n*1.6)
            for i in range(n):
                bh = h*(0.12 + 0.55*(i/n)**1.3 + rng.uniform(-.04, .04))
                x = w*0.12 + i*bw*1.45
                dr.rounded_rectangle([x, h*0.82-bh, x+bw, h*0.82], 8, fill=CY + (60+int(150*i/n),))
            pts = [(w*0.12 + i*bw*1.45 + bw/2, h*0.82 - h*(0.12+0.55*(i/n)**1.3) - 40) for i in range(n)]
            dr.line(pts, fill=(170, 230, 250, 230), width=4)
            for p in pts: dr.ellipse([p[0]-8, p[1]-8, p[0]+8, p[1]+8], fill=(200, 240, 255, 255))
        img = Image.alpha_composite(network(img, seed, 25, alpha=90), glow_layer(img.size, d, 10))
    elif kind == "rings":
        def d(dr):
            cx, cy = w*0.5, h*0.5
            for i, r in enumerate(range(60, 700, 70)):
                a = max(30, 230 - i*22)
                dr.ellipse([cx-r, cy-r, cx+r, cy+r], outline=CY + (a,), width=3 if i % 2 else 2)
            dr.ellipse([cx-26, cy-26, cx+26, cy+26], fill=(200, 240, 255, 255))
        img = Image.alpha_composite(img, glow_layer(img.size, d, 9))
    elif kind == "wave":
        def d(dr):
            for k in range(26):
                pts = []
                for x in range(0, w+10, 10):
                    y = h*0.5 + math.sin(x/w*2*math.pi*1.3 + k*0.22)*h*0.18*(1-k/40) + (k-13)*14
                    pts.append((x, y))
                dr.line(pts, fill=CY + (40+int(150*(1-abs(k-13)/13)),), width=2)
        img = Image.alpha_composite(img, glow_layer(img.size, d, 7))
    elif kind == "grid":
        def d(dr):
            s = 46
            for gx in range(0, w+s, s):
                for gy in range(0, h+s, s):
                    v = rng.random()
                    if v > 0.86:
                        dr.rounded_rectangle([gx+6, gy+6, gx+s-6, gy+s-6], 6, fill=CY + (int(80+170*rng.random()),))
                    else:
                        dr.ellipse([gx+s/2-2, gy+s/2-2, gx+s/2+2, gy+s/2+2], fill=(120, 170, 190, 90))
        img = Image.alpha_composite(img, glow_layer(img.size, d, 8))
    elif kind == "paths":
        def d(dr):
            nodes = [(w*0.5, h*0.12)]
            for depth in range(1, 5):
                for j in range(2**depth if depth < 4 else 10):
                    pass
            def branch(x, y, depth, spread):
                if depth == 0: return
                for s in (-1, 1):
                    nx, ny = x + s*spread, y + h*0.19
                    dr.line([(x, y), (x, y+h*0.09), (nx, y+h*0.09), (nx, ny)], fill=CY + (200 - (4-depth)*35,), width=3)
                    dr.ellipse([nx-9, ny-9, nx+9, ny+9], fill=(200, 240, 255, 255))
                    branch(nx, ny, depth-1, spread/2)
            dr.ellipse([w*0.5-14, h*0.12-14, w*0.5+14, h*0.12+14], fill=(220, 245, 255, 255))
            branch(w*0.5, h*0.12, 4, w*0.25)
        img = Image.alpha_composite(network(img, seed, 25, alpha=70), glow_layer(img.size, d, 9))
    # vignette toward the edge that meets the slide
    v = Image.new("L", (w, h)); vd = ImageDraw.Draw(v)
    for x in range(w): vd.line([(x, 0), (x, h)], fill=int(110*max(0, (x - w*0.7)/(w*0.3))))
    img = Image.alpha_composite(img, Image.merge("RGBA", (*[Image.new("L", (w, h), 0)]*3, v)))
    return img.convert("RGB")

for i, k in enumerate(["network", "bars", "rings", "wave", "grid", "paths"]):
    panel(k, 10+i).save(f"{OUT}/panel_{k}.jpg", quality=90)

# content background
noise_bg(1920, 1080, 3, blobs=10).save(f"{OUT}/bg_navy.jpg", quality=90)

# cinematic title background: near-black, light beam top-left, network on right
W, H = 1920, 1080
t = noise_bg(W, H, 7, base=np.array([3, 8, 12], float), blobs=6).convert("RGBA")
beam = Image.new("RGBA", (W, H), (0, 0, 0, 0)); bd = ImageDraw.Draw(beam)
bd.polygon([(0, 0), (380, 0), (1100, 1080), (650, 1080)], fill=(120, 200, 235, 22))
bd.ellipse([-260, -260, 300, 300], fill=(160, 220, 245, 70))
t = Image.alpha_composite(t, beam.filter(ImageFilter.GaussianBlur(90)))
t = network(t, 42, 90, region=(950, 40, 1900, 1040), alpha=110)
# darken behind the text column so the title stays readable
shade = Image.new("L", (W, H)); sd = ImageDraw.Draw(shade)
for x in range(W): sd.line([(x, 0), (x, H)], fill=int(170*max(0, 1 - x/1100)))
t = Image.alpha_composite(t, Image.merge("RGBA", (*[Image.new("L", (W, H), 2)]*3, shade)))
t.convert("RGB").save(f"{OUT}/bg_title.jpg", quality=90)

# glowing ringed speaker photos
def ringed(src, box, dst, S=1000):
    im = Image.open(src).convert("RGB").crop(box).resize((S, S), Image.LANCZOS)
    pad = 90; T = S + 2*pad
    out = Image.new("RGBA", (T, T), (0, 0, 0, 0))
    g = Image.new("RGBA", (T, T), (0, 0, 0, 0)); gd = ImageDraw.Draw(g)
    gd.ellipse([pad-14, pad-14, pad+S+14, pad+S+14], outline=CY + (255,), width=26)
    out = Image.alpha_composite(out, g.filter(ImageFilter.GaussianBlur(28)))
    m = Image.new("L", (S*3, S*3)); ImageDraw.Draw(m).ellipse([0, 0, S*3-1, S*3-1], fill=255); m = m.resize((S, S), Image.LANCZOS)
    out.paste(im, (pad, pad), m)
    r = Image.new("RGBA", (T, T), (0, 0, 0, 0)); ImageDraw.Draw(r).ellipse([pad-6, pad-6, pad+S+6, pad+S+6], outline=CY + (255,), width=7)
    Image.alpha_composite(out, r).save(dst)
ringed(f"{SRC}/dan-hinckley.png", (131, 0, 469, 338), f"{OUT}/dan_ring.png")
ringed(f"{SRC}/rob-coleman.webp", (180, 330, 1230, 1380), f"{OUT}/rob_ring.png")

# logo with transparent background
lg = np.array(Image.open(f"{SRC}/hennessey-digital-logo.webp").convert("RGB")).astype(float)
bg = np.array([35, 30, 31.])
a = np.clip((np.abs(lg - bg).max(axis=2) - 18) / 60, 0, 1)
rgba = np.dstack([lg, a*255]).astype("uint8")
Image.fromarray(rgba).crop((150, 380, 1850, 1800)).save(f"{OUT}/logo_clear.png")
print("ok")
