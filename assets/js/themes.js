/* Diseños disponibles, adornos SVG, datos de ejemplo y codificación de enlaces */
(function () {
  const leaves = (() => {
    let s = '<svg viewBox="0 0 220 40" aria-hidden="true"><path d="M10 30 Q110 2 210 30" fill="none" stroke="currentColor" stroke-width="1.2"/>';
    for (let i = 0; i < 9; i++) {
      const x = 30 + i * 20, y = 30 - Math.sin((i + 1) / 10 * Math.PI) * 13;
      const r = i % 2 ? -35 : 35;
      s += `<ellipse cx="${x}" cy="${y - 6 * (i % 2 ? -1 : 1) * 0.6}" rx="7" ry="3" transform="rotate(${r} ${x} ${y})" fill="currentColor" opacity=".75"/>`;
    }
    return s + "</svg>";
  })();

  const ORN = {
    flourish: '<svg viewBox="0 0 220 30" aria-hidden="true"><path d="M8 15h70M142 15h70" stroke="currentColor" stroke-width="1"/><path d="M78 15c8-10 18-10 22 0-4 10-14 10-22 0zM142 15c-8-10-18-10-22 0 4 10 14 10 22 0z" fill="none" stroke="currentColor" stroke-width="1"/><path d="M110 4l5 11-5 11-5-11z" fill="currentColor"/><circle cx="8" cy="15" r="2" fill="currentColor"/><circle cx="212" cy="15" r="2" fill="currentColor"/></svg>',
    leaves: leaves,
    line: '<svg viewBox="0 0 220 12" aria-hidden="true"><path d="M20 6h80M120 6h80" stroke="currentColor" stroke-width="1"/><circle cx="110" cy="6" r="2.5" fill="currentColor"/></svg>',
    floral: '<svg viewBox="0 0 220 40" aria-hidden="true"><path d="M10 20h65M145 20h65" stroke="currentColor" stroke-width="1"/><g transform="translate(110 20)" fill="currentColor"><circle r="4"/><ellipse cy="-10" rx="5" ry="8" opacity=".6"/><ellipse cy="10" rx="5" ry="8" opacity=".6"/><ellipse cx="-10" rx="8" ry="5" opacity=".6"/><ellipse cx="10" rx="8" ry="5" opacity=".6"/></g><path d="M80 20c5-8 12-8 15 0M140 20c-5-8-12-8-15 0" fill="none" stroke="currentColor"/></svg>',
    stars: '<svg viewBox="0 0 220 40" aria-hidden="true" fill="currentColor"><path d="M110 4l3 13 13 3-13 3-3 13-3-13-13-3 13-3z"/><path d="M70 14l1.5 5 5 1.5-5 1.5-1.5 5-1.5-5-5-1.5 5-1.5z" opacity=".7"/><path d="M150 14l1.5 5 5 1.5-5 1.5-1.5 5-1.5-5-5-1.5 5-1.5z" opacity=".7"/><circle cx="40" cy="20" r="1.5" opacity=".6"/><circle cx="180" cy="20" r="1.5" opacity=".6"/><circle cx="20" cy="12" r="1" opacity=".5"/><circle cx="200" cy="28" r="1" opacity=".5"/></svg>',
    waves: '<svg viewBox="0 0 220 30" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M10 15c10-8 20-8 30 0s20 8 30 0 20-8 30 0"/><path d="M120 15c10-8 20-8 30 0s20 8 30 0 20-8 30 0"/><circle cx="110" cy="15" r="3" fill="currentColor" stroke="none"/></svg>'
  };

  window.THEMES = {
    classic:   { ornament: "flourish", swatch: ["#f7f2ea", "#b08d57", "#3b3229"] },
    botanical: { ornament: "leaves",   swatch: ["#eef1ea", "#6f8a68", "#2f3b2f"] },
    minimal:   { ornament: "line",     swatch: ["#ffffff", "#111111", "#bbbbbb"] },
    romantic:  { ornament: "floral",   swatch: ["#fbeff0", "#c98b95", "#5a3a40"] },
    night:     { ornament: "stars",    swatch: ["#0f1b33", "#d8b56a", "#f3ead8"] },
    tropical:  { ornament: "waves",    swatch: ["#f4ede1", "#2a9d8f", "#e76f51"] }
  };
  window.ORNAMENTS = ORN;

  // Fecha de ejemplo: siempre ~5 meses en el futuro para que la cuenta regresiva funcione
  function futureDate(days) {
    const d = new Date(); d.setDate(d.getDate() + days);
    const p = n => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }
  const base = (n1, n2, extra) => Object.assign({
    n1, n2, date: futureDate(150), time: "17:00",
    msg: "@inv_demo_msg", hashtag: "",
    cer: { place: "Capilla San Rafael", addr: "Av. Principal 123, Santo Domingo", time: "17:00", map: "" },
    rec: { place: "Hacienda Los Jardines", addr: "Carretera del Valle km 5, Santo Domingo", time: "19:00", map: "" },
    dress: "@inv_demo_dress",
    sched: "17:00 @inv_s1\n18:30 @inv_s2\n20:00 @inv_s3\n22:00 @inv_s4",
    gifts: "@inv_demo_gifts",
    rsvpWa: "", rsvpEmail: "", rsvpBy: futureDate(120),
    music: "", cover: "", photos: ""
  }, extra);

  window.DEMOS = {
    classic:   base("Chris", "Yeraldy", { theme: "classic", hashtag: "#ChrisYYeraldy" }),
    botanical: base("Sofía", "Mateo", { theme: "botanical", hashtag: "#SofiaYMateo" }),
    minimal:   base("Emma", "Liam", { theme: "minimal" }),
    romantic:  base("Valentina", "Diego", { theme: "romantic", hashtag: "#ValeYDiego" }),
    night:     base("Camila", "Andrés", { theme: "night" }),
    tropical:  base("Isabella", "Lucas", { theme: "tropical", hashtag: "#IsaYLucas",
      cer: { place: "Playa Dorada", addr: "Punta Cana, República Dominicana", time: "17:30", map: "" },
      rec: { place: "Beach Club Coral", addr: "Bávaro, Punta Cana", time: "19:30", map: "" } })
  };

  // Codificación compacta del enlace (#d=...) — base64url de JSON UTF-8
  function enc(obj) {
    const bytes = new TextEncoder().encode(JSON.stringify(obj));
    let bin = ""; bytes.forEach(b => bin += String.fromCharCode(b));
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function dec(str) {
    str = str.replace(/-/g, "+").replace(/_/g, "/");
    while (str.length % 4) str += "=";
    const bin = atob(str);
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  }
  // Quita campos vacíos para que el enlace sea más corto
  function clean(o) {
    const out = Array.isArray(o) ? [] : {};
    for (const k in o) {
      const v = o[k];
      if (v === "" || v == null) continue;
      if (typeof v === "object") { const c = clean(v); if (Object.keys(c).length) out[k] = c; }
      else out[k] = v;
    }
    return out;
  }
  window.InvData = { enc, dec, clean };
})();
