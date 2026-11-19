# Plataforma de invitaciones: página madre + 7 formatos

Una web estática (sin servidor) con un **catálogo** donde el cliente ve cada formato en vivo y lo elige, y una **herramienta** que genera el sitio final de cada cliente con sus datos.

## Formatos
| id | Nombre | Estilo |
|---|---|---|
| `sobre` | Sobre lacrado | Clásico, cinematográfico (video de apertura) |
| `fotografico` | Fotográfico oliva | Moderno, foto + papel rasgado |
| `editorial` | Editorial minimalista | Moderno, blanco y negro |
| `botanico` | Botánico acuarela | Romántico, jardín |
| `celestial` | Celestial nocturno | Romántico, nocturno |
| `tropical` | Playa y tropical | Playa, colorido |
| `historia` | Formato historia | Diapositivas tipo Instagram |

> No pude abrir thedigitalyes.com ni su Instagram desde el entorno de trabajo (dominios bloqueados). Los formatos están basados en el estilo habitual de invitaciones digitales animadas y en las dos referencias que me enviaste, no en una copia de sus diseños.

## Construir todo
```
pip install pillow numpy      # y tener ffmpeg instalado (solo para el formato sobre)
cd plataforma/herramientas
python3 construir.py          # -> plataforma/dist/ (página madre + dist/formatos/<id>/)
```
Los formatos `sobre` y `fotografico` se copian de sus propias compilaciones: ejecuta antes `python3 build.py higgsfield` en `invitacion-boda/` y `python3 build.py` en `invitacion-boda/diseno2/`.

Para probar en local: `cd plataforma/dist && python3 -m http.server 8000` y abre http://localhost:8000.

## Configurar la página madre
`catalogo/config.js`: nombre de la marca, **tu WhatsApp** (código de país, sin +) y correo. Los botones "Elegir" abren WhatsApp con el formato ya escrito.

## Entregar un cliente
1. Copia `datos/cliente-ejemplo.json` y rellénalo (nombres, fecha con desfase horario, lugares, programa, hashtag, fecha límite y destino de las confirmaciones).
2. Genera su sitio con el formato que eligió:
```
python3 generar_cliente.py celestial ../datos/mi-cliente.json
```
Sale `salida/<novios>/boda/` y `salida/<novios>-celestial.zip`, listo para subir a cualquier hosting estático (Netlify, GitHub Pages...).

3. Cambiar de formato después es repetir el comando con otro id: los datos son los mismos.

### Confirmaciones de asistencia
`confirmacion.destino` vacío = modo demostración (no envía nada). Para recibirlas por correo: `"https://formsubmit.co/ajax/correo@cliente.com"` (la primera vez llega un correo de activación que hay que confirmar).

### Fotos
Los formatos traen fotos de ejemplo (personas ficticias creadas con IA). Para un cliente real, sustituye los archivos de `boda/img/` por sus fotos (mismos nombres) o genera nuevas. Revisa también los textos `alt` de las imágenes.
El formato `sobre` lleva las iniciales **V&S** dentro de la imagen del sello: requiere regenerar `sobre-cerrado`, `sobre-abierto` y el video con las iniciales del cliente.

## Estructura
```
nucleo/        base.css + nucleo.js: lógica común (cuenta atrás, programa, confirmación, calendario...)
formatos/<id>/ index.html + formato.css (+ formato.js): lo propio de cada formato
assets/        arte original (PNG) generado con Higgsfield
catalogo/      la página madre
datos/         datos de ejemplo y de clientes
herramientas/  construir.py y generar_cliente.py
```
Para crear un formato nuevo: copia una carpeta de `formatos/`, cambia el HTML/CSS, añade su arte en `construir.py` (ARTE y FORMATOS) y vuelve a construir.
