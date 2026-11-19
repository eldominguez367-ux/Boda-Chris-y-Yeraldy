/* ============================================================
   DATOS DE LA BODA: única fuente de verdad.
   Edita solo este archivo. Todo lo marcado como TODO es un ejemplo.
   ============================================================ */
window.BODA = {
  novios: { n1: "Valentina", n2: "Sebastián", monograma: "V&S" },

  // "ustedes" -> "los invitan"; "vosotros" -> "os invitan"
  tratamiento: "ustedes",

  // Fecha y hora de inicio con desfase horario. La fecha mostrada en todas
  // las secciones y la cuenta atrás salen de este único valor.
  fecha: { iso: "2027-05-22T17:00:00-04:00", zona: "America/Santo_Domingo" }, // TODO

  lugar: {
    nombre: "Jardín Casa Hermosa", // TODO
    direccion: "Calle Las Palmas 12, Santo Domingo", // TODO
    mapa: "" // TODO enlace de Google Maps; si está vacío se usa una búsqueda por dirección
  },

  programa: [ // TODO
    { h: "16:30", t: "Llegada de invitados" },
    { h: "17:00", t: "Ceremonia" },
    { h: "18:00", t: "Brindis" },
    { h: "19:00", t: "Cena" },
    { h: "21:00", t: "Baile" }
  ],

  confirmacion: {
    limite: "2027-04-22", // TODO fecha límite (AAAA-MM-DD)
    // Destino de las respuestas. Vacío = modo demostración (no se envía nada).
    // Ejemplo con un formulario por correo: "https://formsubmit.co/ajax/tu@correo.com"
    destino: "" // TODO
  },

  musica: { src: "", volumen: 0.55 }, // TODO archivo con licencia, ej. "audio/musica.mp3"

  // Lista de lo que sigue siendo un ejemplo. Mientras tenga elementos,
  // la portada muestra el aviso de borrador.
  todos: [
    "Fecha y hora inventadas",
    "Lugar y dirección ficticios",
    "Programa inventado",
    "Fecha límite y destino de las confirmaciones",
    "Música",
    "Tratamiento (ustedes/vosotros) por confirmar",
    "URL absoluta de og:image"
  ]
};
