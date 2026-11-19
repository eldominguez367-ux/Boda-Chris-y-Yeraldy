/* ============================================================
   DATOS DE LA BODA (Diseño 2 · fotográfico). Edita solo este archivo.
   Todo lo marcado como TODO es un ejemplo.
   ============================================================ */
window.BODA = {
  novios: { n1: "Valentina", n2: "Sebastián" },
  tratamiento: "ustedes",

  // Fecha y hora de inicio con desfase horario: de aquí salen la fecha mostrada y la cuenta atrás.
  fecha: { iso: "2027-05-22T17:00:00-04:00", zona: "America/Santo_Domingo" }, // TODO

  ceremonia: { nombre: "Capilla San Rafael", ciudad: "Santo Domingo", hora: "17:00", mapa: "" }, // TODO
  recepcion: { nombre: "Jardín Casa Hermosa", ciudad: "Santo Domingo", hora: "19:00", mapa: "" }, // TODO

  // icono: 0 iglesia · 1 capilla · 2 brindis · 3 cena · 4 baile · 5 anillos
  programa: [ // TODO
    { h: "16:30", t: "Llegada de invitados", icono: 0 },
    { h: "17:00", t: "Ceremonia", icono: 1 },
    { h: "18:00", t: "Brindis", icono: 2 },
    { h: "19:00", t: "Cena", icono: 3 },
    { h: "21:00", t: "Baile", icono: 4 }
  ],

  hashtag: "#ValentinaySebastian", // TODO
  playlist: { enlace: "" }, // TODO enlace para añadir canciones (Spotify, formulario...)

  confirmacion: {
    limite: "2027-04-22", // TODO
    destino: "" // TODO vacío = modo demostración. Ej.: "https://formsubmit.co/ajax/tu@correo.com"
  },

  todos: [
    "Fecha y hora inventadas", "Lugares y ciudad ficticios", "Programa inventado", "Hashtag",
    "Enlace de la playlist", "Fecha límite y destino de las confirmaciones", "Tratamiento (ustedes/vosotros)",
    "URL absoluta de og:image"
  ]
};
