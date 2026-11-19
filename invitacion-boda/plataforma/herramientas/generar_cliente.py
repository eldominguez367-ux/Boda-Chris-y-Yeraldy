#!/usr/bin/env python3
"""Genera el sitio de un cliente: el formato elegido + sus datos.
Uso:  python3 generar_cliente.py <formato> <datos.json> [carpeta_salida]
Formatos: sobre, fotografico, editorial, botanico, celestial, tropical, historia
Resultado: <salida>/<slug>/boda/ y <salida>/<slug>-<formato>.zip (listo para subir)."""
import os, sys, json, shutil, zipfile, re, unicodedata
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from compartido import config_js, reemplazar_nombres

R = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
FORMATOS = ["sobre", "fotografico", "editorial", "botanico", "celestial", "tropical", "historia"]

def slug(t):
    t = unicodedata.normalize("NFD", t).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", t).strip("-")

def main():
    if len(sys.argv) < 3 or sys.argv[1] not in FORMATOS:
        sys.exit(__doc__)
    fmt, ruta = sys.argv[1], sys.argv[2]
    salida = sys.argv[3] if len(sys.argv) > 3 else f"{R}/salida"
    d = json.load(open(ruta, encoding="utf-8"))
    origen = f"{R}/dist/formatos/{fmt}"
    if not os.path.isdir(origen): sys.exit("Falta dist/: ejecuta primero herramientas/construir.py")
    nombre = slug(d["novios"]["n1"] + "-y-" + d["novios"]["n2"])
    base = f"{salida}/{nombre}"
    destino = f"{base}/boda"
    if os.path.isdir(base): shutil.rmtree(base)
    shutil.copytree(origen, destino)
    with open(f"{destino}/js/config.js", "w", encoding="utf-8") as f: f.write(config_js(fmt, d))
    p = f"{destino}/index.html"
    html = open(p, encoding="utf-8").read()
    open(p, "w", encoding="utf-8").write(reemplazar_nombres(html, d))
    zp = f"{base}-{fmt}.zip"
    with zipfile.ZipFile(zp, "w", zipfile.ZIP_DEFLATED) as z:
        for a, _, fs in os.walk(destino):
            for fn in fs:
                full = os.path.join(a, fn); z.write(full, os.path.join("boda", os.path.relpath(full, destino)))
    print(f"OK  {destino}\nZIP {zp} ({os.path.getsize(zp)//1024} KB)")
    avisos = []
    if fmt == "sobre": avisos.append("El sello del sobre lleva las iniciales V&S dentro de la imagen: hay que regenerar sobre-cerrado, sobre-abierto y el video con las iniciales del cliente.")
    avisos.append("Las fotos y los textos alternativos son de ejemplo: sustituye las fotos por las del cliente (mismos nombres de archivo en img/) y revisa los alt.")
    if d.get("todos"): avisos.append("Mientras 'todos' no esté vacío en los datos, la portada muestra el aviso de borrador.")
    for a in avisos: print(" -", a)

if __name__ == "__main__":
    main()
