# Invitación de boda animada (Valentina y Sebastián)

Web estática en HTML/CSS/JS con GSAP y ScrollTrigger en local. Sin servidor ni dependencias externas.

## Dos versiones del arte
- `higgsfield`: arte, fotos y video del sobre generados con Higgsfield (video Kling v3.0, 8 s).
- `canva`: arte generado con Canva. No tiene video de apertura: usa el fundido de respaldo del sobre cerrado al abierto.

## Construir
```
pip install pillow          # ffmpeg debe estar instalado
python3 prep_canva.py       # solo si cambias las páginas exportadas de Canva
python3 build.py higgsfield # -> dist/higgsfield/boda/ y dist/boda-para-subir-higgsfield.zip
python3 build.py canva
```
Para probar en local: `cd dist/higgsfield/boda && python3 -m http.server 8000`.

## Editar los datos
Todo está en `src/js/config.js` (nombres, fecha con desfase horario, lugar, programa, confirmación, música).
Mientras la lista `todos` tenga elementos, la portada muestra el aviso de borrador. Vacíala cuando termines.

## Sustituir recursos
Cambia los PNG de `assets/<version>/` (mismos nombres) y vuelve a ejecutar `build.py`.

## Publicar
Sube el contenido de la carpeta `boda/` del zip (Netlify Drop, GitHub Pages, cualquier hosting estático).
Antes: pon la URL absoluta en `og:image` de `index.html` (hay un comentario TODO).
