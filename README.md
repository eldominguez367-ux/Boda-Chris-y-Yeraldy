# Eterna · Invitaciones de boda digitales

Web lista para vender invitaciones de boda digitales en **10 idiomas** (español, inglés, portugués, francés, italiano, alemán, ruso, chino, japonés y árabe con escritura de derecha a izquierda).

Es una web 100 % estática: sin servidor, sin base de datos y sin costes de hosting. Se publica gratis en GitHub Pages, Netlify o Vercel.

## Qué incluye

| Página | Para qué sirve |
|---|---|
| `index.html` | Página de ventas: portada con demo en vivo, funciones, 6 diseños, cómo funciona, precios, preguntas frecuentes y formulario de pedido por WhatsApp. |
| `crear.html` | Editor gratuito: el cliente rellena sus datos y ve su invitación en tiempo real, obtiene un enlace (con marca de agua) y te la encarga por WhatsApp. |
| `invitacion.html` | La invitación: sobre con sello que se abre, nombres, cuenta regresiva, ceremonia y recepción con Google Maps, añadir al calendario, programa, código de vestimenta, galería, mesa de regalos, confirmación de asistencia (RSVP), música y selector de idioma. |

**Diseños:** Clásica, Botánica, Minimal, Romántica, Noche estrellada y Tropical.

## 1. Antes de lanzar (5 minutos)

Abre **`config.js`** y cambia:

- `brand`: el nombre de tu marca (ahora es "Eterna").
- `whatsapp`: **tu número**, con código de país y sin `+` ni espacios (ej.: `18095551234`). Hoy pone `18090000000`, que es un número de relleno.
- `email`, `instagram`, `tiktok`, `facebook`.
- `currencySymbol` y los precios de `plans` (`price` y `oldPrice`; pon `oldPrice: null` para quitar el precio tachado).

Si cambias la marca, cambia también "Eterna" en los `<title>` de `index.html` y `crear.html` (es lo que muestra Google antes de que cargue la página).

## 2. Publicarla gratis

**Opción A: GitHub Pages (ya configurado)**
1. Fusiona esta rama en `main`.
2. En GitHub, ve a **Settings → Pages → Source: GitHub Actions**.
3. El workflow `.github/workflows/pages.yml` la publica en cada cambio. La URL aparece en la pestaña **Actions**.

**Opción B: Netlify**: arrastra la carpeta del proyecto a <https://app.netlify.com/drop>.

**Dominio propio:** cómpralo (por ejemplo en Namecheap o Cloudflare) y conéctalo en Settings → Pages → Custom domain.

## 3. Cómo entregas una invitación a un cliente

**Rápido (enlace):** abre `crear.html?admin=1`, rellena los datos del cliente o pega el enlace que te mandó y pulsa **"Descargar JSON (admin)"**.

**Recomendado (enlace bonito y sin marca de agua):**
1. Guarda el JSON descargado en la carpeta `i/` con un nombre corto, por ejemplo `i/ana-pedro.json` (hay un ejemplo en `i/chris-yeraldy.json`).
2. Súbelo a GitHub (botón *Add file → Upload files*, en la carpeta `i`).
3. El enlace del cliente será `https://TU-DOMINIO/invitacion.html?i=ana-pedro`.
4. Para cambiar algo después, edita ese JSON: el mismo enlace se actualiza.

**Enlaces personalizados por invitado:** añade `&g=Nombre&n=4` al enlace, por ejemplo
`invitacion.html?i=ana-pedro&g=Familia%20Pérez&n=4`. El editor los genera solos en "Enlaces personalizados por invitado".

**Idioma:** el invitado ve el idioma de la invitación (`"lang"` en el JSON) y lo puede cambiar con el selector. Para forzar uno, añade `&lang=en` al enlace.

## 4. Cómo llegan las confirmaciones (RSVP)

En el JSON de cada cliente:
- `"rsvpWa": "18095551234"`: al confirmar, se abre WhatsApp con la respuesta ya escrita para enviarla a los novios.
- `"rsvpEmail": "novios@email.com"`: la respuesta llega por email a través de [FormSubmit](https://formsubmit.co) (gratis). **La primera vez llega un email de activación que hay que confirmar.** Haz tú una confirmación de prueba antes de entregar.

## Campos del JSON de una invitación

```json
{
  "theme": "classic | botanical | minimal | romantic | night | tropical",
  "lang": "es", "n1": "Ana", "n2": "Pedro",
  "date": "2027-05-15", "time": "17:00",
  "msg": "Mensaje de bienvenida", "hashtag": "#AnaYPedro",
  "cer": { "place": "", "addr": "", "time": "17:00", "map": "https://maps.app.goo.gl/..." },
  "rec": { "place": "", "addr": "", "time": "19:00", "map": "" },
  "dress": "Formal", "sched": "17:00 Ceremonia\n20:00 Cena",
  "gifts": "Banco · Cuenta ...",
  "rsvpWa": "", "rsvpEmail": "", "rsvpBy": "2027-04-15",
  "cover": "https://.../foto.jpg", "photos": "https://...1.jpg\nhttps://...2.jpg",
  "music": "https://.../cancion.mp3"
}
```

Las fotos y la música van como enlaces públicos (por ejemplo, súbelas a la carpeta `assets/img/` del proyecto o a un servicio como Cloudinary). Los campos vacíos se ocultan solos.

## Lista para el lanzamiento

- [ ] Poner tu WhatsApp, email, redes y precios en `config.js`
- [ ] Publicar en GitHub Pages o Netlify y probar desde el móvil
- [ ] Hacer un pedido de prueba desde el formulario
- [ ] Hacer una confirmación de prueba con `rsvpEmail` para activar FormSubmit
- [ ] (Opcional) Comprar un dominio
- [ ] (Opcional) Añadir páginas de términos y privacidad si vendes en la UE
- [ ] Revisar con un hablante nativo los textos en los idiomas que más vayas a vender (están en `assets/js/i18n.js`)

## Estructura

```
config.js              ← tu configuración (marca, WhatsApp, precios)
index.html             ← página de ventas
crear.html             ← editor
invitacion.html        ← invitación
i/                     ← invitaciones de clientes (JSON)
assets/js/i18n.js      ← todos los textos en 10 idiomas
assets/js/themes.js    ← diseños y datos de ejemplo
assets/js/invitation.js, site.js, builder.js
assets/css/            ← estilos
```
