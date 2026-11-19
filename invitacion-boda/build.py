#!/usr/bin/env python3
"""Construye una versión de la web: python3 build.py <higgsfield|canva>
Lee assets/<version>/ (PNG/MP4 originales) y deja dist/<version>/boda/ + boda-para-subir-<version>.zip"""
import sys, os, shutil, subprocess, zipfile
from PIL import Image, ImageDraw, ImageFilter

ver = sys.argv[1]
ROOT = os.path.dirname(os.path.abspath(__file__))
SRC, A = f"{ROOT}/src", f"{ROOT}/assets/{ver}"
OUT = f"{ROOT}/dist/{ver}/boda"
shutil.rmtree(f"{ROOT}/dist/{ver}", ignore_errors=True)
shutil.copytree(SRC, OUT)
os.makedirs(f"{OUT}/img", exist_ok=True); os.makedirs(f"{OUT}/video", exist_ok=True)

def load(n): return Image.open(f"{A}/{n}.png").convert("RGB")
def has(n): return os.path.exists(f"{A}/{n}.png")
def save(im, name, w, q=80):
    if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im.save(f"{OUT}/img/{name}.webp", "WEBP", quality=q, method=6)
    return im

save(load("sobre-cerrado"), "sobre-cerrado", 720, 78)
save(load("sobre-abierto"), "sobre-abierto", 720, 78)
p = load("portada"); save(p, "portada-600", 600, 78); save(p, "portada-900", 900, 78)
save(load("flores-transicion"), "flores-transicion", 1000, 80)
save(load("papel-rasgado"), "papel-rasgado", 1200, 78)
if has("textura-papel"): save(load("textura-papel"), "textura-papel", 512, 70)
else:  # textura procedural (grano fino) cuando no hay imagen
    import random; random.seed(7)
    t = Image.new("RGB", (256, 256), (240, 210, 196)); tp = t.load()
    for y in range(256):
        for x in range(256):
            n = random.randint(-7, 7); r_, g_, b_ = tp[x, y]; tp[x, y] = (r_ + n, g_ + n, b_ + n)
    t.filter(ImageFilter.GaussianBlur(.6)).save(f"{OUT}/img/textura-papel.webp", "WEBP", quality=70)
pt = load("petalos").resize((500, 500), Image.LANCZOS)
pa = pt.convert("RGBA"); a = Image.new("L", pt.size, 0); pxs, aps, o = pt.load(), a.load(), pa.load()
for y in range(pt.height):
    for x in range(pt.width):
        r_, g_, b_ = pxs[x, y]; v = max(255 - r_, 255 - g_, 255 - b_)
        aps[x, y] = max(0, min(255, int((v - 26) * 4.6)))
pa.putalpha(a.filter(ImageFilter.GaussianBlur(.8))); pa.save(f"{OUT}/img/petalos.webp", "WEBP", quality=85, method=6)
save(load("lugar"), "lugar", 900, 78)
html_p = f"{OUT}/index.html"; H_ = open(html_p, encoding="utf-8").read()
for n in ("foto-novios-1", "foto-novios-2"):
    if has(n):
        f = load(n); save(f, f"{n}-600", 600, 74); save(f, f"{n}-1000", 1000, 76)
    else:
        import re; H_ = re.sub(r'\n    <figure class="foto rv">\n      <img src="img/' + n + r'-600.*?</figure>', "", H_, flags=re.S)
if ver == "canva":
    H_ = H_.replace("</head>", "<style>:root{--seal-y:46.5%}</style>\n</head>")
if ver == "canva":  # el sello de Canva no trae monograma: se superpone como texto
    H_ = H_.replace('<span class="seal-ring"></span>', '<span class="seal-ring"></span><span class="seal-mono" aria-hidden="true">V&amp;S</span>')
open(html_p, "w", encoding="utf-8").write(H_)

# Rosa con fondo recortado (pasa por encima de la línea del programa)
r = load("rosa").resize((320, 320), Image.LANCZOS)
mk = r.copy(); ImageDraw.floodfill(mk, (0, 0), (255, 0, 255), thresh=45)
for pt in ((319, 0), (0, 319), (319, 319)): ImageDraw.floodfill(mk, pt, (255, 0, 255), thresh=45)
alpha = Image.new("L", r.size, 255)
px, ap = mk.load(), alpha.load()
for y in range(r.height):
    for x in range(r.width):
        if px[x, y] == (255, 0, 255): ap[x, y] = 0
alpha = alpha.filter(ImageFilter.GaussianBlur(1.1))
ra = r.convert("RGBA"); ra.putalpha(alpha)
ra.save(f"{OUT}/img/rosa.webp", "WEBP", quality=85, method=6)

# Imagen social 1200x630 (recorte de la portada, sin texto)
w, h = p.size; ch = round(w * 630 / 1200); y0 = int(h * .12)
p.crop((0, y0, w, y0 + ch)).resize((1200, 630), Image.LANCZOS).save(f"{OUT}/img/social.jpg", "JPEG", quality=82, optimize=True)

# Video del sobre
vid = f"{A}/video-sobre.mp4"
if os.path.exists(vid):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", vid, "-an", "-vf", "scale=720:-2,fps=24", "-c:v", "libx264", "-preset", "slow",
                    "-crf", "27", "-pix_fmt", "yuv420p", "-movflags", "+faststart", f"{OUT}/video/sobre.mp4"], check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", vid, "-an", "-vf", "scale=720:-2,fps=24", "-c:v", "libvpx-vp9", "-crf", "36", "-b:v", "0",
                    "-row-mt", "1", f"{OUT}/video/sobre.webm"], check=True)
else:
    h = open(f"{OUT}/index.html", encoding="utf-8").read()
    h = h.replace('<video id="splashVideo"', '<video id="splashVideo" data-sin-video').replace('\n      <source src="video/sobre.mp4" type="video/mp4">', '').replace('\n      <source src="video/sobre.webm" type="video/webm">', '')
    open(f"{OUT}/index.html", "w", encoding="utf-8").write(h)
    shutil.rmtree(f"{OUT}/video")

# Zip: una única carpeta boda/
zp = f"{ROOT}/dist/boda-para-subir-{ver}.zip"
with zipfile.ZipFile(zp, "w", zipfile.ZIP_DEFLATED) as z:
    for d, _, fs in os.walk(OUT):
        for f in fs:
            full = os.path.join(d, f); z.write(full, os.path.join("boda", os.path.relpath(full, OUT)))
tot = sum(os.path.getsize(os.path.join(d, f)) for d, _, fs in os.walk(OUT) for f in fs)
print(ver, "carpeta", round(tot / 1e6, 2), "MB · zip", round(os.path.getsize(zp) / 1e6, 2), "MB")
