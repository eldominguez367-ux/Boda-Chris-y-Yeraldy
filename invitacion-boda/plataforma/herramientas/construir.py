#!/usr/bin/env python3
"""Construye todos los formatos y la página madre.  python3 construir.py
Salida: dist/index.html (página madre) y dist/formatos/<id>/ (cada formato, autónomo)."""
import os, sys, shutil, json, subprocess
import numpy as np
from PIL import Image, ImageFilter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from compartido import config_js

R = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
IB = os.path.abspath(os.path.join(R, ".."))
A, DIST = f"{R}/assets", f"{R}/dist"
datos = json.load(open(f"{R}/datos/ejemplo.json", encoding="utf-8"))

# ---------- catálogo de formatos (también alimenta la página madre) ----------
FORMATOS = [
  {"id": "sobre", "nombre": "Sobre lacrado", "estilo": ["Clásico", "Cinematográfico"], "paleta": ["#2C140E", "#EBC4AE", "#C77A3E", "#F0D2C4"],
   "desc": "Un sobre vino oscuro con sello de cera que se abre con luz cálida y da paso a una portada de cuento. Video de apertura, pétalos y programa con rosa animada.",
   "incluye": ["Video de apertura de 8 s", "Pétalos flotando", "Rosa que baja por el programa", "Música opcional"], "nota": "El sello lleva las iniciales de los novios: requiere arte propio por cliente."},
  {"id": "fotografico", "nombre": "Fotográfico oliva", "estilo": ["Moderno", "Fotográfico"], "paleta": ["#F4EFE7", "#7C8261", "#D6DEE3", "#5E6347"],
   "desc": "Foto a pantalla completa, papel rasgado, iconos de línea en oliva y una banda azul para compartir el hashtag. Cálido y natural.",
   "incluye": ["Portada con foto", "Ceremonia y recepción con iconos", "Programa con iconos", "Hashtag y playlist"]},
  {"id": "editorial", "nombre": "Editorial minimalista", "estilo": ["Moderno", "Minimalista"], "paleta": ["#F7F4EE", "#1E1E1E", "#8A8A8A", "#E4E0D6"],
   "desc": "Blanco y negro, tipografía grande y mucho aire, como una revista. Fecha en cifras gigantes y programa en tabla.",
   "incluye": ["Portada en blanco y negro", "Fecha en grande", "Programa en tabla", "Ideal si tienen buenas fotos"]},
  {"id": "botanico", "nombre": "Botánico acuarela", "estilo": ["Romántico", "Jardín"], "paleta": ["#FBFAF4", "#5F7B58", "#A9BFA0", "#E6ECDD"],
   "desc": "Corona de eucalipto en acuarela alrededor de los nombres, guirnaldas verdes y una foto en arco. Suave, fresco y luminoso.",
   "incluye": ["Corona de eucalipto", "Foto en arco", "Línea de tiempo del día", "Hashtag para compartir"]},
  {"id": "celestial", "nombre": "Celestial nocturno", "estilo": ["Romántico", "Nocturno"], "paleta": ["#0C1730", "#D8B56A", "#EFE6D2", "#1B2C57"],
   "desc": "Cielo azul noche con luna y constelaciones doradas, estrellas que titilan y una foto al anochecer. Elegante y misterioso.",
   "incluye": ["Cielo con luna dorada", "Estrellas animadas", "Cuenta atrás en círculos", "Foto en arco dorado"]},
  {"id": "tropical", "nombre": "Playa y tropical", "estilo": ["Playa", "Colorido"], "paleta": ["#F8EFE1", "#1F8A8A", "#D9734E", "#E3F1EE"],
   "desc": "Hojas de palma que se mecen, olas en acuarela y una foto de atardecer en la playa. Para bodas de destino y al aire libre.",
   "incluye": ["Hojas que se mecen", "Olas como separador", "Plan del día en tarjetas", "Hashtag para compartir"]},
  {"id": "historia", "nombre": "Formato historia", "estilo": ["Moderno", "Redes"], "paleta": ["#14110E", "#FFFFFF", "#D8B56A", "#7C8261"],
   "desc": "Diapositivas a pantalla completa que avanzan solas, como las historias de Instagram. Toca para avanzar; la confirmación se abre en una hoja.",
   "incluye": ["6 diapositivas con fotos", "Avance automático", "Barras de progreso", "Confirmación en hoja inferior"]},
]

FORM = '''<form id="rsvpForm" class="form rv" novalidate>
      <label for="fNombre">Nombre y apellidos</label>
      <input id="fNombre" name="nombre" type="text" autocomplete="name" required aria-describedby="eNombre">
      <p class="err" id="eNombre" role="alert"></p>
      <fieldset>
        <legend>¿Podrás acompañarnos?</legend>
        <label class="op"><input type="radio" name="asiste" value="si" checked> <span>Sí, allí estaré</span></label>
        <label class="op"><input type="radio" name="asiste" value="no"> <span>No podré asistir</span></label>
      </fieldset>
      <div id="siCampos">
        <label for="fAcomp">Número de asistentes (contándote a ti)</label>
        <input id="fAcomp" name="acompanantes" type="number" inputmode="numeric" min="1" max="10" value="1" aria-describedby="eAcomp">
        <p class="err" id="eAcomp" role="alert"></p>
        <label for="fAlergias">Alergias o menú especial</label>
        <input id="fAlergias" name="alergias" type="text">
      </div>
      <label for="fMensaje">Mensaje para los novios</label>
      <textarea id="fMensaje" name="mensaje" rows="3"></textarea>
      <button class="btn solid" type="submit" id="fEnviar">Enviar confirmación</button>
      <p class="estado" id="fEstado" role="status" aria-live="polite"></p>
    </form>'''
CUENTA = '''<div class="cd rv" data-cuenta role="timer" aria-live="off">
      <div class="cd-b"><span class="num" data-u="d"><span class="cur">0</span></span><small>Días</small></div>
      <div class="cd-b"><span class="num" data-u="h"><span class="cur">00</span></span><small>Horas</small></div>
      <div class="cd-b"><span class="num" data-u="m"><span class="cur">00</span></span><small>Minutos</small></div>
      <div class="cd-b"><span class="num" data-u="s"><span class="cur">00</span></span><small>Segundos</small></div>
    </div>
    <p class="cd-fin" data-cuenta-fin hidden></p>
    <p class="sr-only" data-cuenta-sr aria-live="polite"></p>'''

# ---------- recursos: (nombre de salida, fuente, modo, anchos) ----------
# modos: foto | alpha_blanco | alpha_negro
ARTE = {
  "editorial": [("portada", "foto-bn", "foto", [600, 900]), ("foto", "foto-1", "foto", [600, 1000])],
  "botanico": [("marco", "marco-botanico", "alpha_blanco", [900]), ("rama", "rama-botanica", "alpha_blanco", [1000]), ("foto", "foto-2", "foto", [600, 1000])],
  "celestial": [("cielo", "cielo", "foto", [600, 900]), ("luna", "luna", "alpha_negro", [400]), ("foto", "noche", "foto", [600, 1000])],
  "tropical": [("portada", "playa", "foto", [600, 900]), ("hojas", "hojas", "alpha_blanco", [520]), ("olas", "olas", "alpha_blanco", [1000]), ("foto", "foto-2", "foto", [600, 1000])],
  "historia": [("s1", "hero", "foto", [600, 900]), ("s2", "foto-1", "foto", [600, 1000]), ("s3", "playa", "foto", [600, 1000]), ("s4", "noche", "foto", [600, 1000]), ("s5", "foto-bn", "foto", [600, 1000]), ("s6", "foto-2", "foto", [600, 1000])],
}
OG = {"editorial": "#F7F4EE", "botanico": "#5F7B58", "celestial": "#0C1730", "tropical": "#1F8A8A", "historia": "#14110E"}

def alpha_from(im, modo):
    a = np.asarray(im.convert("RGB")).astype(np.float32)
    if modo == "alpha_blanco":
        v = (255 - a).max(axis=2); al = np.clip((v - 6) * 3.6, 0, 255) / 255.0
        col = np.where(al[..., None] > .02, (a - 255 * (1 - al[..., None])) / np.maximum(al[..., None], .02), a)
    else:  # sobre negro
        v = a.max(axis=2); al = np.clip((v - 10) * 3.0, 0, 255) / 255.0
        col = np.where(al[..., None] > .02, a / np.maximum(al[..., None], .02), a)
    out = np.dstack([np.clip(col, 0, 255), al * 255]).astype(np.uint8)
    return Image.fromarray(out, "RGBA")

def procesar(fmt, dest):
    os.makedirs(f"{dest}/img", exist_ok=True)
    for nombre, fuente, modo, anchos in ARTE[fmt]:
        im = Image.open(f"{A}/{fuente}.png").convert("RGB")
        if modo == "foto":
            for w in anchos:
                r = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS) if im.width > w else im
                r.save(f"{dest}/img/{nombre}-{w}.webp", "WEBP", quality=78, method=6)
        else:
            rgba = alpha_from(im, modo); bb = rgba.getchannel("A").point(lambda v: 255 if v > 24 else 0).getbbox()
            rgba = rgba.crop(bb); w = anchos[0]; rgba = rgba.resize((w, round(rgba.height * w / rgba.width)), Image.LANCZOS)
            rgba.save(f"{dest}/img/{nombre}.webp", "WEBP", quality=86, method=6)

def head(fmt, nombre):
    t = f'{datos["novios"]["n1"]} &amp; {datos["novios"]["n2"]} · Nos casamos'
    return f'''<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{t}</title>
<meta name="description" content="{datos["novios"]["n1"]} y {datos["novios"]["n2"]} los invitan a celebrar con ellos este día tan especial.">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="{OG[fmt]}">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_ES">
<meta property="og:title" content="{t}">
<meta property="og:description" content="Los invitamos a celebrar con nosotros este día tan especial.">
<!-- TODO: URL absoluta de la imagen social cuando conozcas el dominio -->
<meta property="og:image" content="img/social.jpg">
<link rel="preload" href="fonts/cormorant-garamond-latin-500-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/formato.css">
</head>'''

def foot(fmt):
    extra = '\n<script src="js/formato.js"></script>' if os.path.exists(f"{R}/formatos/{fmt}/formato.js") else ""
    return ('<script src="js/config.js"></script>\n<script src="vendor/gsap.min.js"></script>\n<script src="vendor/ScrollTrigger.min.js"></script>\n'
            '<script src="js/nucleo.js"></script>' + extra + "\n</body>\n</html>\n")

def construir_nuevo(fmt):
    dest = f"{DIST}/formatos/{fmt}"; shutil.rmtree(dest, ignore_errors=True)
    for d in ("css", "js", "vendor", "fonts"): os.makedirs(f"{dest}/{d}")
    shutil.copy(f"{R}/nucleo/base.css", f"{dest}/css/base.css"); shutil.copy(f"{R}/formatos/{fmt}/formato.css", f"{dest}/css/formato.css")
    shutil.copy(f"{R}/nucleo/nucleo.js", f"{dest}/js/nucleo.js")
    if os.path.exists(f"{R}/formatos/{fmt}/formato.js"): shutil.copy(f"{R}/formatos/{fmt}/formato.js", f"{dest}/js/formato.js")
    for f in ("gsap.min.js", "ScrollTrigger.min.js"): shutil.copy(f"{R}/nucleo/{f}", f"{dest}/vendor/{f}")
    for f in os.listdir(f"{R}/nucleo/fonts"): shutil.copy(f"{R}/nucleo/fonts/{f}", f"{dest}/fonts/{f}")
    html = open(f"{R}/formatos/{fmt}/index.html", encoding="utf-8").read()
    html = html.replace("{{HEAD}}", head(fmt, fmt)).replace("{{CUENTA}}", CUENTA).replace("{{FORM}}", FORM).replace("{{FOOT}}", foot(fmt))
    open(f"{dest}/index.html", "w", encoding="utf-8").write(html)
    open(f"{dest}/js/config.js", "w", encoding="utf-8").write(config_js(fmt, datos))
    procesar(fmt, dest)
    # imagen social: primera foto grande del formato
    src = next(Image.open(f"{A}/{f}.png").convert("RGB") for _, f, m, _ in ARTE[fmt] if m == "foto")
    w, h = src.size; ch = round(w * 630 / 1200); y0 = int(h * .2)
    src.crop((0, y0, w, y0 + ch)).resize((1200, 630), Image.LANCZOS).save(f"{dest}/img/social.jpg", "JPEG", quality=80, optimize=True)

def copiar_existente(fmt, origen):
    dest = f"{DIST}/formatos/{fmt}"; shutil.rmtree(dest, ignore_errors=True)
    if not os.path.isdir(origen): sys.exit(f"Falta {origen}: construye antes ese formato (build.py).")
    shutil.copytree(origen, dest)
    open(f"{dest}/js/config.js", "w", encoding="utf-8").write(config_js(fmt, datos))

if __name__ == "__main__":
    os.makedirs(f"{DIST}/formatos", exist_ok=True)
    copiar_existente("sobre", f"{IB}/dist/higgsfield/boda")
    copiar_existente("fotografico", f"{IB}/diseno2/dist/boda")
    for f in ARTE: construir_nuevo(f); print("formato", f, "ok")
    # página madre
    cat = f"{R}/catalogo"
    for f in ("index.html", "catalogo.css", "catalogo.js", "config.js"): shutil.copy(f"{cat}/{f}", f"{DIST}/{f}")
    for f in FORMATOS:
        d = f"{DIST}/formatos/{f['id']}"; f["peso_kb"] = round(sum(os.path.getsize(os.path.join(a, b)) for a, _, bs in os.walk(d) for b in bs) / 1024)
    open(f"{DIST}/datos-catalogo.js", "w", encoding="utf-8").write("window.FORMATOS = " + json.dumps(FORMATOS, ensure_ascii=False, indent=1) + ";\n")
    print("catálogo ok ·", sum(f["peso_kb"] for f in FORMATOS) // 1024, "MB en total")
