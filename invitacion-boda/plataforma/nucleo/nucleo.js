/* Núcleo común de los formatos nuevos. Lee window.BODA (config.js) y rellena la página
   a partir de atributos data-*. Los formatos solo aportan HTML y CSS (y, si quieren, su propio JS). */
(function () {
  "use strict";
  var C = window.BODA;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  var target = new Date(C.fecha.iso), TZ = C.fecha.zona;
  function fmt(o) { return new Intl.DateTimeFormat("es-ES", Object.assign({ timeZone: TZ }, o)); }
  var pd = {}; fmt({ day: "2-digit", month: "2-digit", year: "numeric" }).formatToParts(target).forEach(function (p) { pd[p.type] = p.value; });
  var cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
  var hora = fmt({ hour: "2-digit", minute: "2-digit", hour12: false }).format(target);
  var larga = cap(fmt({ weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(target));
  var iniciales = (C.novios.n1[0] + C.novios.n2[0]).toUpperCase();
  var L = function (l) { return l || {}; };
  var bind = {
    n1: C.novios.n1, n2: C.novios.n2, nombres: C.novios.n1 + " & " + C.novios.n2, monograma: iniciales + "",
    "n1-mayus": C.novios.n1.toUpperCase(), "n2-mayus": C.novios.n2.toUpperCase(),
    dia: pd.day, mes: pd.month, anio: pd.year, "anio-corto": pd.year.slice(2),
    "mes-nombre": cap(fmt({ month: "long" }).format(target)), "dia-semana": cap(fmt({ weekday: "long" }).format(target)),
    "fecha-corta": pd.day + "." + pd.month + "." + pd.year.slice(2), "fecha-punto": pd.day + "." + pd.month + "." + pd.year,
    "fecha-larga": larga, hora: hora, hashtag: C.hashtag || "",
    "cer-nombre": L(C.ceremonia).nombre, "cer-ciudad": L(C.ceremonia).ciudad, "cer-hora": L(C.ceremonia).hora, "cer-dir": L(C.ceremonia).direccion || "",
    "rec-nombre": L(C.recepcion).nombre, "rec-ciudad": L(C.recepcion).ciudad, "rec-hora": L(C.recepcion).hora, "rec-dir": L(C.recepcion).direccion || ""
  };
  var lim = C.confirmacion && C.confirmacion.limite && new Date(C.confirmacion.limite + "T12:00:00");
  bind.limite = lim ? new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "2-digit" }).format(lim).replace(/\//g, ".") : "";
  $$("[data-bind]").forEach(function (el) { var k = el.getAttribute("data-bind"); if (bind[k] != null) el.textContent = bind[k]; });
  var verbo = C.tratamiento === "vosotros" ? "os invitan" : "los invitan";
  $$("[data-invita]").forEach(function (el) { el.textContent = C.novios.n1 + " & " + C.novios.n2 + " " + verbo + " a celebrar con ellos este día tan especial"; });
  $$("[data-limite]").forEach(function (el) { el.textContent = lim ? "Por favor, confírmanos antes del " + bind.limite + "." : "Por favor, confírmanos tu asistencia."; });

  function mapa(l) { l = l || {}; return l.mapa || ("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent((l.nombre || "") + ", " + (l.direccion ? l.direccion + ", " : "") + (l.ciudad || ""))); }
  $$("[data-mapa]").forEach(function (a) { a.href = mapa(a.getAttribute("data-mapa") === "cer" ? C.ceremonia : C.recepcion); a.target = "_blank"; a.rel = "noopener"; });
  $$("[data-borrador]").forEach(function (el) { el.hidden = !(C.todos && C.todos.length); });

  /* Programa */
  $$("[data-programa]").forEach(function (ul) {
    var iconos = ul.getAttribute("data-iconos");
    (C.programa || []).forEach(function (it) {
      var li = document.createElement("li");
      li.innerHTML = '<span class="dot" aria-hidden="true"></span>' + (iconos ? '<img class="p-ico" alt="" aria-hidden="true" loading="lazy">' : "") + '<div class="p-txt"><time class="p-h"></time><span class="p-t"></span></div>';
      if (iconos) $(".p-ico", li).src = iconos.replace("%i", it.icono || 0);
      $(".p-h", li).textContent = it.h; $(".p-t", li).textContent = it.t;
      ul.appendChild(li);
    });
  });

  /* Hashtag y playlist */
  $$("[data-hashtag-btn]").forEach(function (b) {
    b.textContent = C.hashtag || "";
    b.addEventListener("click", function () {
      var st = $("[data-hashtag-estado]");
      var done = function (ok) { if (st) st.textContent = ok ? "Copiado. ¡Úsalo en tus fotos!" : "Copia el hashtag manualmente: " + C.hashtag; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(C.hashtag).then(function () { done(true); }, function () { done(false); }); else done(false);
    });
  });
  $$("[data-playlist]").forEach(function (a) {
    if (C.playlist && C.playlist.enlace) { a.href = C.playlist.enlace; a.target = "_blank"; a.rel = "noopener"; }
    else a.addEventListener("click", function (e) { e.preventDefault(); var st = $("[data-playlist-estado]"); if (st) st.textContent = "Pronto podrás añadir tu canción aquí."; });
  });

  /* Cuenta atrás */
  var nums = {}; $$(".num").forEach(function (n) { nums[n.getAttribute("data-u")] = n; });
  function setNum(el, val) {
    if (!el) return;
    if (el.getAttribute("data-v") === val) return;
    var old = $(".cur", el);
    if (!el.hasAttribute("data-v") || reduce) { old.textContent = val; el.setAttribute("data-v", val); return; }
    var nw = document.createElement("span"); nw.className = "cur in"; nw.textContent = val; el.appendChild(nw);
    old.className = "out"; void nw.offsetWidth; nw.classList.remove("in");
    setTimeout(function () { if (old.parentNode) old.parentNode.removeChild(old); }, 300);
    el.setAttribute("data-v", val);
  }
  var lastSr = -1, cd = $("[data-cuenta]");
  function tick() {
    var diff = target.getTime() - Date.now();
    if (diff <= 0) {
      if (cd) cd.hidden = true; var f = $("[data-cuenta-fin]"); if (f) { f.hidden = false; f.textContent = diff > -12 * 3600e3 ? "¡Hoy es el gran día!" : "Fue un día inolvidable. ¡Gracias por acompañarnos!"; } return;
    }
    var s = Math.floor(diff / 1000), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
    var p2 = function (n) { return String(n).padStart(2, "0"); };
    setNum(nums.d, String(d)); setNum(nums.h, p2(h)); setNum(nums.m, p2(m)); setNum(nums.s, p2(sec));
    var sr = $("[data-cuenta-sr]"); if (sr && d !== lastSr) { lastSr = d; sr.textContent = "Faltan " + d + " días para la celebración."; }
  }
  if (cd) { tick(); setInterval(tick, 250); }

  /* Calendario */
  $$("[data-ics]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var z = function (d) { return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); };
      var end = new Date(target.getTime() + 6 * 3600e3), esc = function (s) { return String(s).replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n"); };
      var c = L(C.ceremonia);
      var ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Invitacion de boda//ES", "CALSCALE:GREGORIAN", "BEGIN:VEVENT", "UID:" + z(target) + "@boda", "DTSTAMP:" + z(new Date()),
        "DTSTART:" + z(target), "DTEND:" + z(end), "SUMMARY:" + esc("Boda de " + C.novios.n1 + " y " + C.novios.n2), "LOCATION:" + esc((c.nombre || "") + ", " + (c.ciudad || "")),
        "DESCRIPTION:" + esc("Nos casamos. ¡Los esperamos!"), "END:VEVENT", "END:VCALENDAR"].join("\r\n");
      var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" })); a.download = "boda.ics"; document.body.appendChild(a); a.click(); a.remove();
    });
  });

  /* Confirmación de asistencia */
  var form = $("#rsvpForm");
  if (form) {
    var estado = $("#fEstado");
    form.addEventListener("change", function () { var si = $("#siCampos"); if (si) si.hidden = form.asiste.value === "no"; });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true, nombre = form.nombre.value.trim();
      $("#eNombre").textContent = ""; $("#eAcomp").textContent = ""; form.nombre.removeAttribute("aria-invalid"); form.acompanantes.removeAttribute("aria-invalid");
      if (nombre.length < 2) { $("#eNombre").textContent = "Escribe tu nombre y apellidos."; form.nombre.setAttribute("aria-invalid", "true"); ok = false; }
      var asiste = form.asiste.value === "si", n = parseInt(form.acompanantes.value, 10);
      if (asiste && !(n >= 1 && n <= 10)) { $("#eAcomp").textContent = "Indica un número entre 1 y 10."; form.acompanantes.setAttribute("aria-invalid", "true"); ok = false; }
      if (!ok) { (form.querySelector("[aria-invalid=true]") || form.nombre).focus(); estado.className = "estado mal"; estado.textContent = "Revisa los campos marcados."; return; }
      var datos = { nombre: nombre, asiste: asiste, asistentes: asiste ? n : 0, alergias: form.alergias.value.trim(), mensaje: form.mensaje.value.trim(), boda: C.novios.n1 + " & " + C.novios.n2 };
      var btn = $("#fEnviar"), destino = C.confirmacion && C.confirmacion.destino;
      if (!destino) { estado.className = "estado demo"; estado.textContent = "Modo demostración: esta respuesta no se ha enviado a nadie porque aún no hay destino configurado."; return; }
      btn.disabled = true; estado.className = "estado"; estado.textContent = "Enviando…";
      fetch(destino, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(datos) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); estado.className = "estado ok"; estado.textContent = "¡Gracias! Hemos recibido tu respuesta."; form.querySelectorAll("input,textarea").forEach(function (x) { x.disabled = true; }); })
        .catch(function () { estado.className = "estado mal"; estado.textContent = "No se pudo enviar. Inténtalo de nuevo en un momento."; btn.disabled = false; });
    });
  }

  /* Revelado al hacer scroll: solo con GSAP y sin movimiento reducido */
  if (hasGsap && !reduce) {
    $$(".rv").filter(function (el) { return !el.closest(".story"); }).forEach(function (el) { gsap.from(el, { opacity: 0, y: 22, duration: .9, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } }); });
    $$(".px").forEach(function (img) { gsap.fromTo(img, { scale: 1.1 }, { scale: 1, ease: "none", scrollTrigger: { trigger: img.parentNode, start: "top bottom", end: "bottom 40%", scrub: true } }); });
    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  }

  window.Nucleo = { reduce: reduce, hasGsap: hasGsap, bind: bind, target: target };
})();
