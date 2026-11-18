/* ============================================================
   CONFIGURACIÓN DEL NEGOCIO — edita SOLO este archivo
   para poner tu marca, tu WhatsApp, tu email y tus precios.
   ============================================================ */
window.SITE_CONFIG = {
  // Nombre de la marca (aparece en el logo, títulos y mensajes)
  brand: "Eterna",

  // WhatsApp para recibir pedidos: código de país + número, SIN "+", espacios ni guiones.
  // Ejemplo República Dominicana: "18095551234"
  whatsapp: "18090000000",

  // Email de contacto (se usa si no hay WhatsApp o como alternativa)
  email: "hola@tudominio.com",

  // Redes sociales (deja "" para ocultar)
  instagram: "https://instagram.com/",
  tiktok: "",
  facebook: "",

  // Moneda y precios
  currencySymbol: "US$",
  plans: [
    {
      id: "basic",
      price: 39,
      oldPrice: null,
      popular: false,
      features: ["pf_design", "pf_rsvp", "pf_countdown", "pf_maps", "pf_calendar", "pf_1lang", "pf_rev2", "pf_unlimited"]
    },
    {
      id: "premium",
      price: 69,
      oldPrice: 89,
      popular: true,
      features: ["pf_all_basic", "pf_alllangs", "pf_music", "pf_gallery", "pf_gifts", "pf_guestlinks", "pf_qr", "pf_revU"]
    },
    {
      id: "luxury",
      price: 119,
      oldPrice: 149,
      popular: false,
      features: ["pf_all_premium", "pf_custom", "pf_express", "pf_list", "pf_std", "pf_support"]
    }
  ],

  // Idioma por defecto si no se detecta el del visitante
  defaultLang: "es"
};
