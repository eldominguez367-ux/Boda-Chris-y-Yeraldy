#!/usr/bin/env python3
"""Convierte las 9 páginas exportadas de Canva (assets/canva-export/pageN.png) en los recursos que espera build.py"""
import os
from PIL import Image, ImageChops
R = os.path.dirname(os.path.abspath(__file__)); E = f"{R}/assets/canva-export"; O = f"{R}/assets/canva"
os.makedirs(O, exist_ok=True)
def pg(n): return Image.open(f"{E}/page{n}.png").convert("RGB")
def bbox_crop(im, pad=24, tol=14):
    bg = Image.new("RGB", im.size, (255, 255, 255)); d = ImageChops.difference(im, bg).convert("L").point(lambda v: 255 if v > tol else 0)
    b = d.getbbox(); x0, y0, x1, y1 = b
    return im.crop((max(0, x0 - pad), max(0, y0 - pad), min(im.width, x1 + pad), min(im.height, y1 + pad)))
pg(1).save(f"{O}/sobre-cerrado.png"); pg(2).save(f"{O}/sobre-abierto.png"); pg(3).save(f"{O}/portada.png")
bbox_crop(pg(4)).save(f"{O}/flores-transicion.png")
pg(5).crop((0, 250, 1080, 950)).save(f"{O}/papel-rasgado.png")
c = bbox_crop(pg(6)); s = max(c.size); sq = Image.new("RGB", (s, s), "white"); sq.paste(c, ((s - c.width) // 2, (s - c.height) // 2)); sq.save(f"{O}/rosa.png")
c = bbox_crop(pg(7)); s = max(c.size); sq = Image.new("RGB", (s, s), "white"); sq.paste(c, ((s - c.width) // 2, (s - c.height) // 2)); sq.save(f"{O}/petalos.png")
bbox_crop(pg(8)).save(f"{O}/lugar.png")
pg(9).crop((0, 80, 1080, 1430)).save(f"{O}/foto-novios-1.png")
for n in os.listdir(O): print(n, Image.open(f"{O}/{n}").size)
