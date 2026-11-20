/* Configuración de la página madre */
window.PLATAFORMA = {
  marca: "Eterna",
  whatsapp: "18090000000", // TODO: tu número con código de país, sin + ni espacios
  email: "hola@tudominio.com", // TODO

  // Moneda principal: dólares. Las demás son de referencia (el cobro se acuerda en US$).
  // tasa = cuántas unidades de esa moneda equivalen a 1 US$ (ajústalas cuando quieras).
  monedaPrincipal: "USD",
  monedas: {
    USD: { simbolo: "US$", tasa: 1, redondeo: 1, nombre: "Dólar" },
    EUR: { simbolo: "€", tasa: 0.93, redondeo: 1, nombre: "Euro" },
    MXN: { simbolo: "MX$", tasa: 17.5, redondeo: 10, nombre: "Peso mexicano" },
    DOP: { simbolo: "RD$", tasa: 60, redondeo: 50, nombre: "Peso dominicano" },
    COP: { simbolo: "COP$", tasa: 4200, redondeo: 1000, nombre: "Peso colombiano" }
  },
  // Región elegida por defecto y qué moneda y tratamiento lleva cada una
  regiones: {
    LA: { nombre: "Latinoamérica", moneda: "USD", tratamiento: "ustedes" },
    ES: { nombre: "España", moneda: "EUR", tratamiento: "vosotros" }
  },
  precioPlanificadorSolo: 29, // US$, si lo compran sin invitación
  codigos: {}, // códigos de descuento: { "BODA10": 10 } = 10 % de descuento
  boletin: "", // destino del boletín, p. ej. "https://formsubmit.co/ajax/tu@correo.com". Vacío = modo demostración
  opiniones: [] // cuando tengas clientes reales: [{ nombre: "Ana y Luis", texto: "…", fecha: "2027-03" }]
};
