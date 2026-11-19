"""Utilidades comunes: adaptar los datos de un cliente a la config.js de cada formato."""
import json, re

def iniciales(d):
    return (d["novios"]["n1"][:1] + "&" + d["novios"]["n2"][:1]).upper()

def config_js(formato, d):
    """Devuelve el contenido de js/config.js para el formato dado a partir del JSON del cliente."""
    cfg = dict(d)
    if formato == "sobre":  # el formato del sobre usa un único lugar y no tiene hashtag
        r = d["recepcion"]
        cfg = {
            "novios": {"n1": d["novios"]["n1"], "n2": d["novios"]["n2"], "monograma": iniciales(d)},
            "tratamiento": d.get("tratamiento", "ustedes"),
            "fecha": d["fecha"],
            "lugar": {"nombre": r["nombre"], "direccion": ", ".join(x for x in (r.get("direccion"), r.get("ciudad")) if x), "mapa": r.get("mapa", "")},
            "programa": [{"h": p["h"], "t": p["t"]} for p in d.get("programa", [])],
            "confirmacion": d.get("confirmacion", {}),
            "musica": d.get("musica", {"src": "", "volumen": 0.55}),
            "todos": d.get("todos", []),
        }
    return "/* Generado por la plataforma. Edita los datos y vuelve a generar, o edita este archivo. */\nwindow.BODA = " + json.dumps(cfg, ensure_ascii=False, indent=2) + ";\n"

def reemplazar_nombres(html, d, base=("Valentina", "Sebastián")):
    """Sustituye los nombres de ejemplo por los del cliente en el HTML (título, alt, metadatos)."""
    return html.replace(base[0], d["novios"]["n1"]).replace(base[1], d["novios"]["n2"])
