#!/usr/bin/env python3
"""Crea o actualiza el seguimiento de un pedido (lo que ve el cliente en seguimiento.html).
Uso: python3 nuevo_pedido.py CODIGO "Novios" "Formato" "Plan" [estado 0-5] ["mensaje"] ["enlace al borrador"]
Estados: 0 recibido · 1 datos confirmados · 2 diseñando · 3 borrador listo · 4 cambios y aprobación · 5 entregada
El archivo queda en catalogo/pedidos/CODIGO.json: vuelve a construir (construir.py) y sube la carpeta."""
import sys, os, json, re, datetime
if len(sys.argv) < 5: sys.exit(__doc__)
cod = sys.argv[1].upper()
if not re.fullmatch(r"[A-Z0-9-]{3,20}", cod): sys.exit("Código no válido (letras, números y guiones, 3-20 caracteres).")
est = int(sys.argv[5]) if len(sys.argv) > 5 else 0
d = {"codigo": cod, "novios": sys.argv[2], "formato": sys.argv[3], "plan": sys.argv[4], "estado": max(0, min(5, est)),
     "actualizado": datetime.date.today().isoformat(), "mensaje": sys.argv[6] if len(sys.argv) > 6 else "", "borrador": sys.argv[7] if len(sys.argv) > 7 else ""}
R = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
os.makedirs(f"{R}/catalogo/pedidos", exist_ok=True)
with open(f"{R}/catalogo/pedidos/{cod}.json", "w", encoding="utf-8") as f: json.dump(d, f, ensure_ascii=False, indent=2)
print("OK", f"catalogo/pedidos/{cod}.json")
