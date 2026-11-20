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
  {"id": "sobre", "tipo": "invitacion", "nombre": "Sobre lacrado", "frase": "Un sello de cera que se abre con luz", "estilo": ["Clásico", "Cinematográfico"], "paleta": ["#2C140E", "#EBC4AE", "#C77A3E", "#F0D2C4"],
   "desc": "Un sobre vino oscuro con sello de cera que se abre con luz cálida y da paso a una portada de cuento. Video de apertura, pétalos y programa con rosa animada.",
   "incluye": ["Video de apertura de 8 s", "Pétalos flotando", "Rosa que baja por el programa", "Música opcional"], "nota": "El sello lleva las iniciales de los novios: requiere arte propio por cliente.", "nuevo": True},
  {"id": "fotografico", "tipo": "invitacion", "nombre": "Fotográfico oliva", "frase": "Tu foto, papel rasgado y verde oliva", "estilo": ["Moderno", "Fotográfico"], "paleta": ["#F4EFE7", "#7C8261", "#D6DEE3", "#5E6347"],
   "desc": "Foto a pantalla completa, papel rasgado, iconos de línea en oliva y una banda azul para compartir el hashtag. Cálido y natural.",
   "incluye": ["Portada con foto", "Ceremonia y recepción con iconos", "Programa con iconos", "Hashtag y playlist"]},
  {"id": "editorial", "tipo": "invitacion", "nombre": "Editorial", "frase": "Blanco y negro, como una revista", "estilo": ["Moderno", "Minimalista"], "paleta": ["#F7F4EE", "#1E1E1E", "#8A8A8A", "#E4E0D6"],
   "desc": "Blanco y negro, tipografía grande y mucho aire, como una revista. Fecha en cifras gigantes y programa en tabla.",
   "incluye": ["Portada en blanco y negro", "Fecha en grande", "Programa en tabla", "Ideal si tienen buenas fotos"]},
  {"id": "botanico", "tipo": "invitacion", "nombre": "Botánico", "frase": "Eucalipto en acuarela y luz de jardín", "estilo": ["Romántico", "Jardín"], "paleta": ["#FBFAF4", "#5F7B58", "#A9BFA0", "#E6ECDD"],
   "desc": "Corona de eucalipto en acuarela alrededor de los nombres, guirnaldas verdes y una foto en arco. Suave, fresco y luminoso.",
   "incluye": ["Corona de eucalipto", "Foto en arco", "Línea de tiempo del día", "Hashtag para compartir"]},
  {"id": "azulejo", "tipo": "invitacion", "nombre": "Azulejo sevillano", "frase": "Cobalto, patio andaluz y cerámica pintada a mano", "estilo": ["España", "Tradicional"], "paleta": ["#FBF7EE", "#1F3F8F", "#C99A2E", "#E4EAF6"],
   "desc": "Marco de azulejos sevillanos en azul cobalto y blanco alrededor de los nombres, cenefas de cerámica y una foto en arco. Cálido, luminoso y muy español.",
   "incluye": ["Marco de azulejos", "Cenefas de cerámica", "Foto en arco", "Línea de tiempo del día"], "nuevo": True},
  {"id": "celestial", "tipo": "invitacion", "nombre": "Celestial", "frase": "Luna, constelaciones y estrellas que titilan", "estilo": ["Romántico", "Nocturno"], "paleta": ["#0C1730", "#D8B56A", "#EFE6D2", "#1B2C57"],
   "desc": "Cielo azul noche con luna y constelaciones doradas, estrellas que titilan y una foto al anochecer. Elegante y misterioso.",
   "incluye": ["Cielo con luna dorada", "Estrellas animadas", "Cuenta atrás en círculos", "Foto en arco dorado"]},
  {"id": "tropical", "tipo": "invitacion", "nombre": "Tropical", "frase": "Palmas, olas y atardecer en la playa", "estilo": ["Playa", "Colorido"], "paleta": ["#F8EFE1", "#1F8A8A", "#D9734E", "#E3F1EE"],
   "desc": "Hojas de palma que se mecen, olas en acuarela y una foto de atardecer en la playa. Para bodas de destino y al aire libre.",
   "incluye": ["Hojas que se mecen", "Olas como separador", "Plan del día en tarjetas", "Hashtag para compartir"]},
  {"id": "historia", "tipo": "invitacion", "nombre": "Historia", "frase": "Diapositivas que avanzan como en Instagram", "estilo": ["Moderno", "Redes"], "paleta": ["#14110E", "#FFFFFF", "#D8B56A", "#7C8261"],
   "desc": "Diapositivas a pantalla completa que avanzan solas, como las historias de Instagram. Toca para avanzar; la confirmación se abre en una hoja.",
   "incluye": ["6 diapositivas con fotos", "Avance automático", "Barras de progreso", "Confirmación en hoja inferior"], "nuevo": True},
  {"id": "sd-rasca", "tipo": "savethedate", "nombre": "Rasca y descubre", "frase": "Tu fecha aparece al rascar la foto", "estilo": ["Save the Date", "Juego"], "paleta": ["#F6EFE4", "#D9B25F", "#8A4B3A", "#4A2B2B"],
   "desc": "Una lámina dorada cubre la foto: al rascar con el dedo aparece la fecha, la cuenta atrás y el botón para añadirla al calendario.",
   "incluye": ["Lámina que se rasca con el dedo", "Cuenta atrás", "Añadir al calendario", "Se hace en minutos"], "nuevo": True},
  {"id": "sd-cartel", "tipo": "savethedate", "nombre": "Cartel", "frase": "La fecha en grande, como un cartel", "estilo": ["Save the Date", "Moderno"], "paleta": ["#F2E9DC", "#A4542F", "#3B2A22", "#FFFFFF"],
   "desc": "Un cartel con el día en cifras gigantes, su foto en arco y la cuenta atrás. Sencillo, directo y muy compartible.",
   "incluye": ["Fecha en cifras gigantes", "Foto en arco", "Cuenta atrás", "Añadir al calendario"]},
]

# Precios en US$ (pago único). Referencia de mercado menos ~25-30 %.
PLANES = [
  {"id": "esencial", "nombre": "Esencial", "precio": 129, "lema": "Este diseño, con todos tus datos", "dias": "48 horas", "cambios": "2 rondas de cambios",
   "incluye": ["El diseño elegido tal cual", "Tus nombres, fecha, lugares y programa", "Tus fotos", "Cuenta atrás, mapas y calendario", "Confirmación de asistencia", "Un enlace para compartir"]},
  {"id": "premium", "nombre": "Premium", "precio": 399, "lema": "Rediseñada alrededor de tu boda", "dias": "7 días", "cambios": "4 rondas de cambios", "recomendado": True,
   "incluye": ["Todo lo del plan Esencial", "Tus colores y tipografías", "Ilustraciones y fotos nuevas con tu estilo", "Sobre o portada con tus iniciales", "Varios idiomas a elegir", "Enlaces con el nombre de cada invitado"]},
  {"id": "excelencia", "nombre": "Excelencia", "precio": 699, "lema": "A medida, desde cero", "dias": "14 días", "cambios": "7 rondas de cambios",
   "incluye": ["Todo lo del plan Premium", "Diseño 100 % exclusivo, sin plantilla", "Video de apertura propio", "Cualquier idioma, los que necesites", "Save the Date de regalo", "Atención prioritaria por WhatsApp"]},
]
PRECIOS_SD = {"con_tus_datos": 49, "a_medida": 89}

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
  "azulejo": [("marco", "marco-azulejo-a", "rgba", [900]), ("cenefa", "cenefa-azulejo", "foto", [900, 1376]), ("foto", "foto-azulejo", "foto", [600, 1000])],
  "celestial": [("cielo", "cielo", "foto", [600, 900]), ("luna", "luna", "alpha_negro", [400]), ("foto", "noche", "foto", [600, 1000])],
  "tropical": [("portada", "playa", "foto", [600, 900]), ("hojas", "hojas", "alpha_blanco", [520]), ("olas", "olas", "alpha_blanco", [1000]), ("foto", "foto-2", "foto", [600, 1000])],
  "sd-rasca": [("foto", "noche", "foto", [600, 1000])],
  "sd-cartel": [("foto", "foto-1", "foto", [600, 1000])],
  "historia": [("s1", "hero", "foto", [600, 900]), ("s2", "foto-1", "foto", [600, 1000]), ("s3", "playa", "foto", [600, 1000]), ("s4", "noche", "foto", [600, 1000]), ("s5", "foto-bn", "foto", [600, 1000]), ("s6", "foto-2", "foto", [600, 1000])],
}
ESTILO_CARTA = {"fotografico": "oliva", "editorial": "marfil", "botanico": "salvia", "celestial": "noche", "azulejo": "noche", "tropical": "arena", "historia": "vino", "sd-rasca": "marfil", "sd-cartel": "arena"}
MONO = {"oliva": "#9a8f6f", "marfil": "#c9c9c9", "salvia": "#4f6b56", "noche": "#7d5a1a", "arena": "#f6d3bf", "vino": "#a4655a"}
MUSICA = {"sobre": "cuerdas", "fotografico": "guitarra", "editorial": "cuerdas", "botanico": "piano", "azulejo": "guitarra", "celestial": "piano", "tropical": "guitarra", "historia": "cuerdas", "sd-rasca": "piano", "sd-cartel": "guitarra"}
CARTA_HTML = '''
<div id="carta" class="carta-ov" role="dialog" aria-label="Invitación cerrada" style="--carta-mono:{mono}">
  <div class="carta-col">
    <img class="carta-img" src="carta/sobre-cerrado.webp" alt="Sobre cerrado con un sello de cera" width="720" height="1280">
    <img class="carta-img carta-abierto" src="carta/sobre-abierto.webp" alt="" aria-hidden="true" width="720" height="1280">
    <video id="cartaVideo" class="carta-img carta-video" playsinline muted preload="auto" poster="carta/sobre-cerrado.webp" aria-hidden="true"{sinvideo}>{fuentes}</video>
    <button id="cartaSello" class="carta-sello" type="button" aria-label="Abrir la invitación"><span class="anillo"></span><span class="mono" data-carta-mono></span></button>
    <p class="carta-hint">Toca el sello para abrir tu invitación</p>
    <button id="cartaSaltar" class="carta-saltar" type="button">Saltar</button>
  </div>
</div>
<button id="cartaMusica" class="carta-musica" type="button" aria-label="Pausar música" aria-pressed="true" hidden>
  <svg class="i-pause" viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>
  <svg class="i-play" viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
</button>
<script src="js/carta.js"></script>
'''

OG = {"sd-rasca": "#F6EFE4", "sd-cartel": "#F2E9DC", "editorial": "#F7F4EE", "botanico": "#5F7B58", "azulejo": "#1F3F8F", "celestial": "#0C1730", "tropical": "#1F8A8A", "historia": "#14110E"}

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
        im = Image.open(f"{A}/{fuente}.png").convert("RGBA" if modo == "rgba" else "RGB")
        if modo == "foto":
            for w in anchos:
                r = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS) if im.width > w else im
                r.save(f"{dest}/img/{nombre}-{w}.webp", "WEBP", quality=78, method=6)
        else:
            rgba = im if modo == "rgba" else alpha_from(im, modo); bb = rgba.getchannel("A").point(lambda v: 255 if v > 24 else 0).getbbox()
            rgba = rgba.crop(bb); w = anchos[0]; rgba = rgba.resize((w, round(rgba.height * w / rgba.width)), Image.LANCZOS)
            rgba.save(f"{dest}/img/{nombre}.webp", "WEBP", quality=86, method=6)

def head(fmt, nombre):
    t = f'{datos["novios"]["n1"]} &amp; {datos["novios"]["n2"]} · ' + ("Reserva la fecha" if fmt.startswith("sd-") else "Nos casamos")
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

def postprocesar(fmt, dest):
    """Música en todos los formatos; apertura tipo carta en todos menos 'sobre' (que ya tiene la suya)."""
    os.makedirs(f"{dest}/audio", exist_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{A}/audio/{MUSICA[fmt]}.mp3", "-b:a", "96k", "-ac", "2", f"{dest}/audio/musica.mp3"], check=True)
    # enlaces personalizados (?g=Nombre&n=3) en todos los formatos
    os.makedirs(f"{dest}/js", exist_ok=True); shutil.copy(f"{R}/nucleo/invitado.js", f"{dest}/js/invitado.js")
    ph = f"{dest}/index.html"; hh = open(ph, encoding="utf-8").read()
    hh = hh.replace("</body>", '<script src="js/invitado.js"></script>\n</body>', 1); open(ph, "w", encoding="utf-8").write(hh)
    if fmt not in ESTILO_CARTA: return
    e = ESTILO_CARTA[fmt]; os.makedirs(f"{dest}/carta", exist_ok=True)
    for k, n in (("c", "sobre-cerrado"), ("a", "sobre-abierto")):
        im = Image.open(f"{A}/sobres/{e}-{k}.png").convert("RGB"); im = im.resize((720, round(im.height * 720 / im.width)), Image.LANCZOS)
        im.save(f"{dest}/carta/{n}.webp", "WEBP", quality=76, method=6)
    vid = f"{A}/sobres/{e}.mp4"; fuentes = ""; sin = " data-sin-video"
    if os.path.exists(vid):
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", vid, "-an", "-vf", "scale=640:-2,fps=24", "-c:v", "libx264", "-preset", "slow", "-crf", "29", "-pix_fmt", "yuv420p", "-movflags", "+faststart", f"{dest}/carta/apertura.mp4"], check=True)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", vid, "-an", "-vf", "scale=640:-2,fps=24", "-c:v", "libvpx-vp9", "-crf", "38", "-b:v", "0", "-row-mt", "1", f"{dest}/carta/apertura.webm"], check=True)
        fuentes = '<source src="carta/apertura.mp4" type="video/mp4"><source src="carta/apertura.webm" type="video/webm">'; sin = ""
    shutil.copy(f"{R}/nucleo/carta.css", f"{dest}/css/carta.css"); shutil.copy(f"{R}/nucleo/carta.js", f"{dest}/js/carta.js")
    p = f"{dest}/index.html"; h = open(p, encoding="utf-8").read()
    h = h.replace("</head>", '<link rel="stylesheet" href="css/carta.css">\n</head>', 1)
    h = h.replace("</body>", CARTA_HTML.format(mono=MONO[e], sinvideo=sin, fuentes=fuentes) + "</body>", 1)
    open(p, "w", encoding="utf-8").write(h)

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
    postprocesar(fmt, dest)
    # imagen social: primera foto grande del formato
    src = next(Image.open(f"{A}/{f}.png").convert("RGB") for _, f, m, _ in ARTE[fmt] if m == "foto")
    w, h = src.size; ch = round(w * 630 / 1200); y0 = int(h * .2)
    src.crop((0, y0, w, y0 + ch)).resize((1200, 630), Image.LANCZOS).save(f"{dest}/img/social.jpg", "JPEG", quality=80, optimize=True)

def copiar_existente(fmt, origen):
    dest = f"{DIST}/formatos/{fmt}"; shutil.rmtree(dest, ignore_errors=True)
    if not os.path.isdir(origen): sys.exit(f"Falta {origen}: construye antes ese formato (build.py).")
    shutil.copytree(origen, dest)
    open(f"{dest}/js/config.js", "w", encoding="utf-8").write(config_js(fmt, datos))
    postprocesar(fmt, dest)

if __name__ == "__main__":
    os.makedirs(f"{DIST}/formatos", exist_ok=True)
    copiar_existente("sobre", f"{IB}/dist/higgsfield/boda")
    copiar_existente("fotografico", f"{IB}/diseno2/dist/boda")
    for f in ARTE: construir_nuevo(f); print("formato", f, "ok")
    # objetos decorativos de la portada (hoja 3x2 recortada)
    os.makedirs(f"{DIST}/img", exist_ok=True)
    hoja = Image.open(f"{A}/objetos.png").convert("RGB"); cw, ch = hoja.width // 3, hoja.height // 2
    for i in range(6):
        celda = hoja.crop(((i % 3) * cw + 40, (i // 3) * ch + 40, (i % 3 + 1) * cw - 40, (i // 3 + 1) * ch - 40))
        rgba = alpha_from(celda, "alpha_blanco"); bb = rgba.getchannel("A").point(lambda v: 255 if v > 40 else 0).getbbox()
        rgba = rgba.crop(bb); rgba = rgba.resize((420, round(rgba.height * 420 / rgba.width)), Image.LANCZOS)
        rgba.save(f"{DIST}/img/obj-{i}.webp", "WEBP", quality=88, method=6)
    # personajes ilustrados (fondo blanco -> transparente)
    for nombre in ("novios", "paloma", "invitados"):
        rgba = alpha_from(Image.open(f"{A}/personaje-{nombre}.png").convert("RGB"), "alpha_blanco")
        bb = rgba.getchannel("A").point(lambda v: 255 if v > 40 else 0).getbbox(); rgba = rgba.crop(bb)
        rgba = rgba.resize((560, round(rgba.height * 560 / rgba.width)), Image.LANCZOS)
        rgba.save(f"{DIST}/img/personaje-{nombre}.webp", "WEBP", quality=88, method=6)
    shutil.rmtree(f"{DIST}/fonts", ignore_errors=True); shutil.copytree(f"{R}/catalogo/fonts", f"{DIST}/fonts")
    shutil.rmtree(f"{DIST}/pedidos", ignore_errors=True)
    if os.path.isdir(f"{R}/catalogo/pedidos"): shutil.copytree(f"{R}/catalogo/pedidos", f"{DIST}/pedidos")
    shutil.rmtree(f"{DIST}/miniaturas", ignore_errors=True)
    if os.path.isdir(f"{R}/catalogo/miniaturas"): shutil.copytree(f"{R}/catalogo/miniaturas", f"{DIST}/miniaturas")
    # página madre
    cat = f"{R}/catalogo"
    for f in ("index.html", "diseno.html", "pedido.html", "pedido.js", "seguimiento.html", "seguimiento.js", "planificador.html", "planificador.css", "planificador.js", "catalogo.css", "catalogo.js", "config.js"): shutil.copy(f"{cat}/{f}", f"{DIST}/{f}")
    mp = f"{R}/catalogo/miniaturas/miniaturas.json"
    minis = json.load(open(mp)) if os.path.exists(mp) else {}
    for f in FORMATOS:
        f["minis"] = minis.get(f["id"], [])
        d = f"{DIST}/formatos/{f['id']}"; f["peso_kb"] = round(sum(os.path.getsize(os.path.join(a, b)) for a, _, bs in os.walk(d) for b in bs) / 1024)
    open(f"{DIST}/datos-catalogo.js", "w", encoding="utf-8").write("window.FORMATOS = " + json.dumps(FORMATOS, ensure_ascii=False, indent=1) + ";\nwindow.PLANES = " + json.dumps(PLANES, ensure_ascii=False, indent=1) + ";\nwindow.PRECIOS_SD = " + json.dumps(PRECIOS_SD) + ";\n")
    print("catálogo ok ·", sum(f["peso_kb"] for f in FORMATOS) // 1024, "MB en total")
