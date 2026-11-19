/* Diseño 2 (fotográfico): lógica. Todos los datos salen de config.js */
(function () {
  "use strict";
  var C = window.BODA;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* Fecha: un único valor */
  var target = new Date(C.fecha.iso), TZ = C.fecha.zona;
  var pd = {}; new Intl.DateTimeFormat("es-ES", { timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric" }).formatToParts(target).forEach(function (p) { pd[p.type] = p.value; });
  var fechaPunto = pd.day + "." + pd.month + "." + pd.year;

  function mapa(l) { return l.mapa || ("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(l.nombre + ", " + l.ciudad)); }
  var bind = {
    n1: C.novios.n1, n2: C.novios.n2, "fecha-punto": fechaPunto,
    "cer-hora": C.ceremonia.hora, "cer-nombre": C.ceremonia.nombre, "cer-ciudad": C.ceremonia.ciudad,
    "rec-hora": C.recepcion.hora, "rec-nombre": C.recepcion.nombre, "rec-ciudad": C.recepcion.ciudad
  };
  $$("[data-bind]").forEach(function (el) { var k = el.getAttribute("data-bind"); if (bind[k] != null) el.textContent = bind[k]; });
  $("#cerMapa").href = mapa(C.ceremonia); $("#recMapa").href = mapa(C.recepcion);

  var lim = C.confirmacion.limite && new Date(C.confirmacion.limite + "T12:00:00");
  $("#rsvpLimite").textContent = lim
    ? "Por favor, confírmanos antes del " + new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "2-digit" }).format(lim).replace(/\//g, ".") + "."
    : "Por favor, confírmanos tu asistencia.";

  var tlList = $("#tlList");
  C.programa.forEach(function (it) {
    var li = document.createElement("li");
    li.innerHTML = '<span class="dot" aria-hidden="true"></span><img alt="" aria-hidden="true" width="70" height="70" loading="lazy"><div><time></time><span class="acto"></span></div>';
    $("img", li).src = "img/icono-" + (it.icono || 0) + ".webp";
    $("time", li).textContent = it.h; $(".acto", li).textContent = it.t;
    tlList.appendChild(li);
  });
  if (C.todos && C.todos.length) $("#draftBadge").hidden = false;

  /* Hashtag y playlist */
  var hb = $("#hashBtn"); hb.textContent = C.hashtag;
  hb.addEventListener("click", function () {
    var done = function (ok) { $("#hashEstado").textContent = ok ? "Copiado. ¡Úsalo en tus fotos!" : "Copia el hashtag manualmente: " + C.hashtag; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(C.hashtag).then(function () { done(true); }, function () { done(false); }); else done(false);
  });
  var pl = $("#plBtn");
  if (C.playlist && C.playlist.enlace) pl.href = C.playlist.enlace;
  else pl.addEventListener("click", function (e) { e.preventDefault(); $("#plEstado").textContent = "Pronto podrás añadir tu canción aquí."; });

  /* Cuenta atrás */
  var nums = {}; $$(".num").forEach(function (n) { nums[n.getAttribute("data-u")] = n; });
  function setNum(el, val) {
    if (el.getAttribute("data-v") === val) return;
    var old = $(".cur", el);
    if (!el.hasAttribute("data-v") || reduce) { old.textContent = val; el.setAttribute("data-v", val); return; }
    var nw = document.createElement("span"); nw.className = "cur in"; nw.textContent = val; el.appendChild(nw);
    old.className = "out"; void nw.offsetWidth; nw.classList.remove("in");
    setTimeout(function () { if (old.parentNode) old.parentNode.removeChild(old); }, 300);
    el.setAttribute("data-v", val);
  }
  var lastSr = -1;
  function tick() {
    var diff = target.getTime() - Date.now();
    if (diff <= 0) {
      $("#cd").hidden = true; var f = $("#cdFin"); f.hidden = false;
      f.textContent = diff > -12 * 3600e3 ? "¡Hoy es el gran día!" : "Fue un día inolvidable. ¡Gracias por acompañarnos!"; return;
    }
    var s = Math.floor(diff / 1000), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
    var p2 = function (n) { return String(n).padStart(2, "0"); };
    setNum(nums.d, String(d)); setNum(nums.h, p2(h)); setNum(nums.m, p2(m)); setNum(nums.s, p2(sec));
    if (d !== lastSr) { lastSr = d; $("#cdSr").textContent = "Faltan " + d + " días para la celebración."; }
  }
  tick(); setInterval(tick, 250);

  /* Animaciones */
  if (hasGsap && !reduce) {
    document.documentElement.classList.add("has-gsap");
    gsap.from([".h-a", ".h-b", ".h-c"], { opacity: 0, y: 26, duration: 1.1, ease: "power2.out", stagger: .25, delay: .2, clearProps: "transform,opacity" });
    gsap.fromTo(".hero-img", { scale: 1.08 }, { scale: 1, duration: 2.4, ease: "power2.out" });
    $$(".rv").forEach(function (el) {
      gsap.from(el, { opacity: 0, y: 20, duration: .9, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
    });
    $$(".foto-full .px").forEach(function (img) {
      gsap.fromTo(img, { scale: 1.12 }, { scale: 1, ease: "none", scrollTrigger: { trigger: img.parentNode, start: "top bottom", end: "bottom 40%", scrub: true } });
    });
    $$(".tl-list li").forEach(function (li) {
      gsap.from(li, { opacity: 0, x: -22, duration: .8, ease: "power2.out", scrollTrigger: { trigger: li, start: "top 90%", once: true } });
    });
    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  }

  /* Calendario (.ics) */
  $("#icsBtn").addEventListener("click", function () {
    var z = function (d) { return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); };
    var end = new Date(target.getTime() + 6 * 3600e3);
    var esc = function (s) { return String(s).replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n"); };
    var ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Invitacion de boda//ES", "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
      "UID:" + z(target) + "@boda", "DTSTAMP:" + z(new Date()), "DTSTART:" + z(target), "DTEND:" + z(end),
      "SUMMARY:" + esc("Boda de " + C.novios.n1 + " y " + C.novios.n2),
      "LOCATION:" + esc(C.ceremonia.nombre + ", " + C.ceremonia.ciudad),
      "DESCRIPTION:" + esc("Nos casamos. ¡Los esperamos!"), "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    a.download = "boda.ics"; document.body.appendChild(a); a.click(); a.remove();
  });

  /* Confirmación */
  var form = $("#rsvpForm"), estado = $("#fEstado");
  form.addEventListener("change", function () { $("#siCampos").hidden = form.asiste.value === "no"; });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true, nombre = form.nombre.value.trim();
    $("#eNombre").textContent = ""; $("#eAcomp").textContent = ""; form.nombre.removeAttribute("aria-invalid"); form.acompanantes.removeAttribute("aria-invalid");
    if (nombre.length < 2) { $("#eNombre").textContent = "Escribe tu nombre y apellidos."; form.nombre.setAttribute("aria-invalid", "true"); ok = false; }
    var asiste = form.asiste.value === "si", n = parseInt(form.acompanantes.value, 10);
    if (asiste && !(n >= 1 && n <= 10)) { $("#eAcomp").textContent = "Indica un número entre 1 y 10."; form.acompanantes.setAttribute("aria-invalid", "true"); ok = false; }
    if (!ok) { (form.querySelector("[aria-invalid=true]") || form.nombre).focus(); estado.className = "estado mal"; estado.textContent = "Revisa los campos marcados."; return; }
    var datos = { nombre: nombre, asiste: asiste, asistentes: asiste ? n : 0, alergias: form.alergias.value.trim(), mensaje: form.mensaje.value.trim(), boda: C.novios.n1 + " & " + C.novios.n2 };
    var btn = $("#fEnviar");
    if (!C.confirmacion.destino) { estado.className = "estado demo"; estado.textContent = "Modo demostración: esta respuesta no se ha enviado a nadie porque aún no hay destino configurado."; return; }
    btn.disabled = true; estado.className = "estado"; estado.textContent = "Enviando…";
    fetch(C.confirmacion.destino, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(datos) })
      .then(function (r) { if (!r.ok) throw new Error(r.status); estado.className = "estado ok"; estado.textContent = "¡Gracias! Hemos recibido tu respuesta."; form.querySelectorAll("input,textarea").forEach(function (x) { x.disabled = true; }); })
      .catch(function () { estado.className = "estado mal"; estado.textContent = "No se pudo enviar. Inténtalo de nuevo en un momento."; btn.disabled = false; });
  });
})();
