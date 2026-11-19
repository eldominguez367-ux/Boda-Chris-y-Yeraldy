/* Apertura tipo carta + música. Se carga en todos los formatos (menos "sobre", que ya tiene la suya). */
(function () {
  "use strict";
  var ov = document.getElementById("carta"); if (!ov) return;
  var C = window.BODA || {}, reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (window.self !== window.top) document.documentElement.classList.add("framed");
  var video = document.getElementById("cartaVideo"), abierto = ov.querySelector(".carta-abierto"), btnMus = document.getElementById("cartaMusica");
  var n1 = (C.novios && C.novios.n1 || "").charAt(0), n2 = (C.novios && C.novios.n2 || "").charAt(0);
  ov.querySelector("[data-carta-mono]").textContent = (n1 + "&" + n2).toUpperCase();
  var KEY = "carta-" + location.pathname, done = false, started = false, failT = null, music = null;
  function seen() { try { return sessionStorage.getItem(KEY) === "1"; } catch (e) { return false; } }
  var embed = /[?&]carta=0/.test(location.search), replay = /[?&]r=/.test(location.search);
  function setMus(on) { btnMus.setAttribute("aria-pressed", on ? "true" : "false"); btnMus.setAttribute("aria-label", on ? "Pausar música" : "Reproducir música"); }
  if (C.musica && C.musica.src) {
    music = new Audio(C.musica.src); music.loop = true; music.volume = C.musica.volumen || .5; music.preload = "auto";
    var resume = false;
    btnMus.addEventListener("click", function () { if (music.paused) { music.play().catch(function () {}); setMus(true); } else { music.pause(); setMus(false); } });
    document.addEventListener("visibilitychange", function () { if (document.hidden) { resume = !music.paused; music.pause(); } else if (resume) { music.play().catch(function () {}); resume = false; } });
  }
  function finish() {
    if (done) return; done = true; clearTimeout(failT);
    try { sessionStorage.setItem(KEY, "1"); } catch (e) {}
    ov.classList.add("fuera");
    setTimeout(function () {
      ov.classList.add("quitado"); document.body.classList.remove("carta-bloqueado");
      try { video.pause(); video.removeAttribute("src"); video.load(); } catch (e) {}
      if (music) btnMus.hidden = false;
      window.dispatchEvent(new Event("resize"));
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      document.dispatchEvent(new CustomEvent("carta:abierta"));
    }, reduce ? 420 : 820);
  }
  function fallback() {
    if (done) return; try { video.pause(); } catch (e) {} video.style.display = "none";
    if (window.gsap && !reduce) { gsap.to(abierto, { opacity: 1, duration: 1.3, ease: "power1.inOut" }); gsap.delayedCall(2.2, finish); }
    else { abierto.style.opacity = 1; setTimeout(finish, 500); }
  }
  function abrir() {
    if (started) return; started = true; ov.classList.add("abriendo");
    if (music) music.play().then(function () { setMus(true); }).catch(function () { setMus(false); });
    if (reduce || video.hasAttribute("data-sin-video") || video.error || video.networkState === 3 || !video.canPlayType) { fallback(); return; }
    failT = setTimeout(fallback, 4000);
    video.addEventListener("playing", function () { clearTimeout(failT); ov.classList.add("reproduciendo"); }, { once: true });
    video.addEventListener("error", fallback, { once: true });
    video.addEventListener("timeupdate", function t() { if (video.duration && video.currentTime >= video.duration - 0.8) { video.removeEventListener("timeupdate", t); finish(); } });
    video.addEventListener("ended", finish, { once: true });
    var p = video.play(); if (p && p.catch) p.catch(fallback);
  }
  document.getElementById("cartaSello").addEventListener("click", abrir);
  document.getElementById("cartaSaltar").addEventListener("click", function () { started = true; if (music) music.play().then(function () { setMus(true); }).catch(function () {}); finish(); });
  if (embed || (seen() && !replay)) { ov.classList.add("quitado"); done = true; if (music) btnMus.hidden = false; }
  else document.body.classList.add("carta-bloqueado");
})();
