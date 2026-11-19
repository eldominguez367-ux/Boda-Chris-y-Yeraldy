/* Invitación de boda: lógica. Todos los datos salen de config.js */
(function () {
  "use strict";
  var C = window.BODA;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (hasGsap) { gsap.registerPlugin(ScrollTrigger); document.documentElement.classList.add("has-gsap"); }

  /* ---------- Fecha: un único valor ---------- */
  var target = new Date(C.fecha.iso);
  var TZ = C.fecha.zona;
  function parts(date, opts) {
    var o = {}; new Intl.DateTimeFormat("es-ES", Object.assign({ timeZone: TZ }, opts)).formatToParts(date).forEach(function (p) { o[p.type] = p.value; });
    return o;
  }
  var pd = parts(target, { day: "2-digit", month: "2-digit", year: "2-digit" });
  var fechaCorta = pd.day + "." + pd.month + "." + pd.year;
  var fechaLarga = new Intl.DateTimeFormat("es-ES", { timeZone: TZ, weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(target) +
    " · " + new Intl.DateTimeFormat("es-ES", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false }).format(target);
  fechaLarga = fechaLarga.charAt(0).toUpperCase() + fechaLarga.slice(1);

  /* ---------- Rellenar datos ---------- */
  var mapa = C.lugar.mapa || ("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(C.lugar.nombre + ", " + C.lugar.direccion));
  var bind = {
    n1: C.novios.n1, n2: C.novios.n2, monograma: C.novios.monograma,
    "fecha-corta": fechaCorta, "fecha-larga": fechaLarga,
    "lugar-nombre": C.lugar.nombre, "lugar-dir": C.lugar.direccion
  };
  $$("[data-bind]").forEach(function (el) { var k = el.getAttribute("data-bind"); if (bind[k] != null) el.textContent = bind[k]; });
  $("#mapBtn").href = mapa;

  var verbo = C.tratamiento === "vosotros" ? "os invitan" : "los invitan";
  $("#invitaTexto").innerHTML = '<span class="nm"></span> ' + verbo + " a celebrar con ellos este día tan especial";
  $("#invitaTexto .nm").textContent = C.novios.n1 + " & " + C.novios.n2;

  var lim = C.confirmacion.limite && new Date(C.confirmacion.limite + "T12:00:00");
  $("#rsvpLimite").textContent = lim
    ? "Por favor, confírmanos antes del " + new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "2-digit" }).format(lim).replace(/\//g, ".") + "."
    : "Por favor, confírmanos tu asistencia.";

  var tlList = $("#tlList");
  C.programa.forEach(function (it) {
    var li = document.createElement("li");
    li.innerHTML = '<time></time><span class="dot" aria-hidden="true"></span><span class="acto"></span>';
    $("time", li).textContent = it.h; $(".acto", li).textContent = it.t;
    tlList.appendChild(li);
  });
  if (C.todos && C.todos.length) $("#draftBadge").hidden = false;

  /* ---------- Cuenta atrás ---------- */
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
      f.textContent = diff > -12 * 3600e3 ? "¡Hoy es el gran día!" : "Fue un día inolvidable. ¡Gracias por acompañarnos!";
      return;
    }
    var s = Math.floor(diff / 1000), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
    var p2 = function (n) { return String(n).padStart(2, "0"); };
    setNum(nums.d, String(d)); setNum(nums.h, p2(h)); setNum(nums.m, p2(m)); setNum(nums.s, p2(sec));
    if (d !== lastSr) { lastSr = d; $("#cdSr").textContent = "Faltan " + d + " días para la celebración."; }
  }
  tick(); setInterval(tick, 250);

  /* ---------- Splash / apertura ---------- */
  var splash = $("#splash"), video = $("#splashVideo"), openImg = $("#splashOpen");
  var done = false, started = false, failTimer = null, music = null, musicBtn = $("#musicBtn");
  var KEY = "boda-abierta";
  function seen() { try { return sessionStorage.getItem(KEY) === "1"; } catch (e) { return false; } }
  function remember(v) { try { v ? sessionStorage.setItem(KEY, "1") : sessionStorage.removeItem(KEY); } catch (e) {} }

  if (C.musica && C.musica.src) {
    music = new Audio(C.musica.src); music.loop = true; music.volume = C.musica.volumen || .5; music.preload = "auto";
    musicBtn.hidden = false; musicBtn.setAttribute("aria-pressed", "false"); musicBtn.setAttribute("aria-label", "Reproducir música");
    var pref = null; try { pref = localStorage.getItem("boda-musica"); } catch (e) {}
    musicBtn.addEventListener("click", function () {
      if (music.paused) { music.play().catch(function () {}); setMusicUI(true); pref = "on"; } else { music.pause(); setMusicUI(false); pref = "off"; }
      try { localStorage.setItem("boda-musica", pref); } catch (e) {}
    });
    var resume = false;
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { resume = !music.paused; music.pause(); }
      else if (resume) { music.play().catch(function () {}); resume = false; }
    });
    musicBtn.hidden = true; // aparece al abrir el sobre
  }
  function setMusicUI(on) { musicBtn.setAttribute("aria-pressed", on ? "true" : "false"); musicBtn.setAttribute("aria-label", on ? "Pausar música" : "Reproducir música"); }

  function finish() {
    if (done) return; done = true; clearTimeout(failTimer);
    remember(true);
    splash.classList.add("fuera");
    setTimeout(function () {
      splash.classList.add("quitado");
      try { video.pause(); video.removeAttribute("src"); video.load(); } catch (e) {}
      document.body.classList.remove("bloqueado");
      if (music) musicBtn.hidden = false;
      if (hasGsap) ScrollTrigger.refresh();
      introCover();
    }, reduce ? 420 : 820);
  }

  function fallback() {
    if (done) return;
    try { video.pause(); } catch (e) {}
    video.style.display = "none";
    if (hasGsap && !reduce) {
      gsap.to(openImg, { opacity: 1, duration: 1.3, ease: "power1.inOut" });
      gsap.delayedCall(2.2, finish);
    } else { openImg.style.opacity = 1; setTimeout(finish, 500); }
  }

  function openEnvelope() {
    if (started) return; started = true;
    splash.classList.add("abriendo");
    if (music) { music.play().then(function () { setMusicUI(true); }).catch(function () { setMusicUI(false); }); }
    if (reduce || video.error || video.networkState === 3 || video.hasAttribute("data-sin-video") || !video.canPlayType || !video.canPlayType("video/mp4")) { fallback(); return; }
    failTimer = setTimeout(fallback, 4000);
    video.addEventListener("playing", function () { clearTimeout(failTimer); splash.classList.add("reproduciendo"); }, { once: true });
    video.addEventListener("error", fallback, { once: true });
    video.addEventListener("timeupdate", function onT() {
      if (video.duration && video.currentTime >= video.duration - 0.8) { video.removeEventListener("timeupdate", onT); finish(); }
    });
    video.addEventListener("ended", finish, { once: true });
    var pr = video.play(); if (pr && pr.catch) pr.catch(fallback);
  }

  $("#seal").addEventListener("click", openEnvelope);
  $("#skip").addEventListener("click", function () { started = true; if (music) music.play().then(function () { setMusicUI(true); }).catch(function () {}); finish(); });
  $("#replay").addEventListener("click", function () { remember(false); window.scrollTo(0, 0); location.reload(); });

  if (!seen()) document.body.classList.add("bloqueado");
  if (seen()) { splash.classList.add("quitado"); document.body.classList.remove("bloqueado"); done = true; if (music) musicBtn.hidden = false; setTimeout(introCover, 50); }

  /* ---------- Animaciones ---------- */
  var introDone = false;
  function introCover() {
    if (introDone) return; introDone = true;
    if (!hasGsap || reduce) return;
    gsap.from([".cv-a", ".cv-b", ".cv-c", ".scroll-cue"], { opacity: 0, y: 24, duration: 1, ease: "power2.out", stagger: .28, clearProps: "transform,opacity" });
  }

  if (hasGsap && !reduce) {
    $$(".rv").forEach(function (el) {
      gsap.from(el, { opacity: 0, y: 20, duration: .9, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
    });
    $$(".px").forEach(function (el) {
      var l = el.classList.contains("pet");
      gsap.fromTo(el, { yPercent: l ? -8 : -3 }, { yPercent: l ? 10 : 3, ease: "none", scrollTrigger: { trigger: el.parentNode, start: "top bottom", end: "bottom top", scrub: true } });
    });
    gsap.to(".pet-l", { rotation: 6, transformOrigin: "50% 0", duration: 3.4, yoyo: true, repeat: -1, ease: "sine.inOut" });
    gsap.to(".pet-r", { rotation: -6, transformOrigin: "50% 0", duration: 3.9, yoyo: true, repeat: -1, ease: "sine.inOut" });
    gsap.from(".lugar-img", { opacity: 0, y: 90, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: ".lugar-img", start: "top 92%", once: true } });
  }

  /* Rosa del programa: del primer al último rombo, ligada al scroll */
  var rose = $("#rose"), tl = $("#tl");
  function dotY(i) {
    var dots = $$(".dot", tl); var d = dots[i < 0 ? dots.length + i : i];
    var r = d.getBoundingClientRect(), t = tl.getBoundingClientRect();
    return r.top - t.top + r.height / 2 - rose.offsetHeight / 2;
  }
  if (hasGsap && !reduce) {
    gsap.fromTo(rose, { y: function () { return dotY(0); }, rotation: -12 }, {
      y: function () { return dotY(-1); }, rotation: 14, ease: "none", immediateRender: true,
      scrollTrigger: { trigger: tl, start: "top 62%", end: "bottom 62%", scrub: .6, invalidateOnRefresh: true }
    });
    var rf; function refresh() { clearTimeout(rf); rf = setTimeout(function () { ScrollTrigger.refresh(); }, 120); }
    window.addEventListener("resize", refresh);
    if (window.visualViewport) window.visualViewport.addEventListener("resize", refresh);
    window.addEventListener("load", refresh);
  } else {
    rose.style.transform = "translateY(" + dotY(0) + "px)";
    window.addEventListener("load", function () { rose.style.transform = "translateY(" + dotY(0) + "px)"; });
  }

  /* ---------- Pétalos (canvas) ---------- */
  (function petals() {
    if (reduce) return;
    var cv = $("#petals"), ctx = cv.getContext("2d"), cover = $("#portada");
    var modest = (navigator.hardwareConcurrency || 4) <= 4 || (navigator.deviceMemory || 4) <= 2;
    var N = modest ? 14 : 22, W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), list = [], raf = 0, visible = true;
    var cols = ["rgba(235,196,150,.85)", "rgba(250,228,200,.9)", "rgba(226,170,150,.8)", "rgba(255,240,220,.9)"];
    function size() { var r = cover.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function mk(top) { return { x: Math.random() * W, y: top ? -20 : Math.random() * H, s: 6 + Math.random() * 7, vy: .18 + Math.random() * .35, vx: (Math.random() - .5) * .25, a: Math.random() * 6.28, va: (Math.random() - .5) * .02, ph: Math.random() * 6.28, c: cols[(Math.random() * cols.length) | 0] }; }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      list.forEach(function (p) {
        p.y += p.vy; p.ph += .015; p.x += p.vx + Math.sin(p.ph) * .3; p.a += p.va;
        if (p.y > H + 20) Object.assign(p, mk(true));
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.scale(1, .65 + Math.abs(Math.sin(p.ph)) * .35);
        ctx.fillStyle = p.c; ctx.beginPath(); ctx.moveTo(0, -p.s); ctx.bezierCurveTo(p.s * .9, -p.s * .5, p.s * .7, p.s * .7, 0, p.s); ctx.bezierCurveTo(-p.s * .7, p.s * .7, -p.s * .9, -p.s * .5, 0, -p.s); ctx.fill(); ctx.restore();
      });
      raf = visible && !document.hidden ? requestAnimationFrame(draw) : 0;
    }
    function start() { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(draw); }
    size(); for (var i = 0; i < N; i++) list.push(mk(false));
    window.addEventListener("resize", function () { size(); });
    document.addEventListener("visibilitychange", start);
    if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; start(); }).observe(cover);
    start();
  })();

  /* ---------- Calendario (.ics) ---------- */
  $("#icsBtn").addEventListener("click", function () {
    var z = function (d) { return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); };
    var end = new Date(target.getTime() + 6 * 3600e3);
    var esc = function (s) { return String(s).replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n"); };
    var ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Invitacion de boda//ES", "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
      "UID:" + z(target) + "@boda", "DTSTAMP:" + z(new Date()), "DTSTART:" + z(target), "DTEND:" + z(end),
      "SUMMARY:" + esc("Boda de " + C.novios.n1 + " y " + C.novios.n2),
      "LOCATION:" + esc(C.lugar.nombre + ", " + C.lugar.direccion),
      "DESCRIPTION:" + esc("Nos casamos. ¡Los esperamos!"), "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    a.download = "boda.ics"; document.body.appendChild(a); a.click(); a.remove();
  });

  /* ---------- Confirmación de asistencia ---------- */
  var form = $("#rsvpForm"), estado = $("#fEstado");
  form.addEventListener("change", function () { $("#siCampos").hidden = form.asiste.value === "no"; });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    var nombre = form.nombre.value.trim();
    $("#eNombre").textContent = ""; $("#eAcomp").textContent = ""; form.nombre.removeAttribute("aria-invalid"); form.acompanantes.removeAttribute("aria-invalid");
    if (nombre.length < 2) { $("#eNombre").textContent = "Escribe tu nombre y apellidos."; form.nombre.setAttribute("aria-invalid", "true"); ok = false; }
    var asiste = form.asiste.value === "si", n = parseInt(form.acompanantes.value, 10);
    if (asiste && !(n >= 1 && n <= 10)) { $("#eAcomp").textContent = "Indica un número entre 1 y 10."; form.acompanantes.setAttribute("aria-invalid", "true"); ok = false; }
    if (!ok) { (form.querySelector("[aria-invalid=true]") || form.nombre).focus(); estado.className = "estado mal"; estado.textContent = "Revisa los campos marcados."; return; }
    var datos = { nombre: nombre, asiste: asiste, asistentes: asiste ? n : 0, alergias: form.alergias.value.trim(), mensaje: form.mensaje.value.trim(), boda: C.novios.n1 + " & " + C.novios.n2 };
    var btn = $("#fEnviar");
    if (!C.confirmacion.destino) {
      estado.className = "estado demo"; estado.textContent = "Modo demostración: esta respuesta no se ha enviado a nadie porque aún no hay destino configurado."; return;
    }
    btn.disabled = true; estado.className = "estado"; estado.textContent = "Enviando…";
    fetch(C.confirmacion.destino, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(datos) })
      .then(function (r) { if (!r.ok) throw new Error(r.status); estado.className = "estado ok"; estado.textContent = "¡Gracias! Hemos recibido tu respuesta."; form.querySelectorAll("input,textarea").forEach(function (x) { x.disabled = true; }); })
      .catch(function () { estado.className = "estado mal"; estado.textContent = "No se pudo enviar. Inténtalo de nuevo en un momento."; btn.disabled = false; });
  });
})();
