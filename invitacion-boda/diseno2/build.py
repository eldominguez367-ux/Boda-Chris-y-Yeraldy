#!/usr/bin/env python3
"""Diseño 2 (fotográfico). python3 build.py -> dist/boda/ y dist/boda-para-subir-diseno2.zip"""
import os, shutil, zipfile, random
from PIL import Image, ImageDraw, ImageFilter, ImageChops

R = os.path.dirname(os.path.abspath(__file__)); A = f"{R}/assets"; OUT = f"{R}/dist/boda"
shutil.rmtree(f"{R}/dist", ignore_errors=True); shutil.copytree(f"{R}/src", OUT); os.makedirs(f"{OUT}/img")

def load(n): return Image.open(f"{A}/{n}.png").convert("RGB")
def save(im, name, w, q=80):
    if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im.save(f"{OUT}/img/{name}.webp", "WEBP", quality=q, method=6)

h = load("hero"); save(h, "hero-600", 600, 78); save(h, "hero-900", 900, 78)
for n, k in (("foto-1", "foto-1"), ("foto-2", "foto-2")):
    f = load(n); save(f, f"{k}-600", 600, 74); save(f, f"{k}-1000", 1000, 76)

OLIVA = (124, 130, 97)
def line_art(im, thr=8, gain=3.4):
    """Dibujo oliva sobre fondo blanco -> RGBA con alpha según la oscuridad."""
    im = im.convert("RGB"); a = Image.new("L", im.size, 0); px, ap = im.load(), a.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b = px[x, y]; v = max(255 - r, 255 - g, 255 - b)
            ap[x, y] = max(0, min(255, int((v - thr) * gain)))
    out = Image.new("RGBA", im.size, OLIVA + (0,)); out.putalpha(a.filter(ImageFilter.GaussianBlur(.6))); return out
def trim(rgba, pad=10):
    b = rgba.getchannel("A").point(lambda v: 255 if v > 20 else 0).getbbox(); x0, y0, x1, y1 = b
    return rgba.crop((max(0, x0 - pad), max(0, y0 - pad), min(rgba.width, x1 + pad), min(rgba.height, y1 + pad)))

# Iconos: hoja 3x2
sheet = load("iconos"); cw, ch = sheet.width // 3, sheet.height // 2
for i in range(6):
    cell = sheet.crop(((i % 3) * cw, (i // 3) * ch, (i % 3 + 1) * cw, (i // 3 + 1) * ch))
    ic = trim(line_art(cell)); s = max(ic.size); sq = Image.new("RGBA", (s, s), (0, 0, 0, 0)); sq.paste(ic, ((s - ic.width) // 2, (s - ic.height) // 2))
    sq.resize((200, 200), Image.LANCZOS).save(f"{OUT}/img/icono-{i}.webp", "WEBP", quality=88, method=6)

# Ramitas
rm = trim(line_art(load("ramitas"), thr=8, gain=3.0)); rm = rm.resize((560, round(rm.height * 560 / rm.width)), Image.LANCZOS)
rm.save(f"{OUT}/img/ramitas.webp", "WEBP", quality=88, method=6)

# Borde de papel rasgado crema: primera tira (filas 100-470 de la hoja), recortada por color (crema cálido vs fondo gris frío)
bd = load("bordes").crop((0, 100, 3168, 470)); arr = bd.load(); al = Image.new("L", bd.size, 0); ap = al.load()
for y in range(bd.height):
    for x in range(bd.width):
        r_, g_, b_ = arr[x, y]; k = (r_ - b_)
        ap[x, y] = 0 if k < 7 else (255 if k > 17 else int((k - 7) * 25.5))
al = al.filter(ImageFilter.GaussianBlur(1.0)); strip = bd.convert("RGBA"); strip.putalpha(al)
bb = al.point(lambda v: 255 if v > 128 else 0).getbbox()
strip = strip.crop((bb[0] + int((bb[2] - bb[0]) * .05), bb[1], bb[2] - int((bb[2] - bb[0]) * .05), bb[3]))
strip = strip.resize((1000, round(strip.height * 1000 / strip.width)), Image.LANCZOS); print("borde", strip.size)
strip.save(f"{OUT}/img/borde-crema.webp", "WEBP", quality=85, method=6)

# Textura crema (grano fino, sin imagen generada)
random.seed(11); t = Image.new("RGB", (256, 256), (244, 239, 231)); tp = t.load()
for y in range(256):
    for x in range(256):
        n = random.randint(-6, 6); r_, g_, b_ = tp[x, y]; tp[x, y] = (r_ + n, g_ + n, b_ + n)
t.filter(ImageFilter.GaussianBlur(.6)).save(f"{OUT}/img/textura-crema.webp", "WEBP", quality=70)

# Imagen social 1200x630
w, hh = h.size; chh = round(w * 630 / 1200); y0 = int(hh * .18)
h.crop((0, y0, w, y0 + chh)).resize((1200, 630), Image.LANCZOS).save(f"{OUT}/img/social.jpg", "JPEG", quality=82, optimize=True)

zp = f"{R}/dist/boda-para-subir-diseno2.zip"
with zipfile.ZipFile(zp, "w", zipfile.ZIP_DEFLATED) as z:
    for d, _, fs in os.walk(OUT):
        for f in fs:
            full = os.path.join(d, f); z.write(full, os.path.join("boda", os.path.relpath(full, OUT)))
tot = sum(os.path.getsize(os.path.join(d, f)) for d, _, fs in os.walk(OUT) for f in fs)
print("diseno2 carpeta", round(tot / 1e6, 2), "MB · zip", round(os.path.getsize(zp) / 1e6, 2), "MB")
