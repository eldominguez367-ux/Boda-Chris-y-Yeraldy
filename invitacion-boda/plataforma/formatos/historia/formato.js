/* Formato historia: diapositivas a pantalla completa. Toca a la derecha/izquierda, flechas del teclado o espera. */
(function () {
  var story = document.getElementById("story"), slides = [].slice.call(story.querySelectorAll(".slide"));
  var barras = document.getElementById("barras"), reduce = window.Nucleo && window.Nucleo.reduce;
  var idx = 0, t0 = 0, pausado = false, raf = 0, acumulado = 0, hoja = document.getElementById("hoja");
  slides.forEach(function () { var i = document.createElement("i"); i.innerHTML = "<b></b>"; barras.appendChild(i); });
  var fills = [].slice.call(barras.querySelectorAll("b"));
  function ir(n) {
    if (n < 0 || n >= slides.length) return;
    idx = n; acumulado = 0; t0 = performance.now();
    slides.forEach(function (s, i) { s.classList.toggle("on", i === idx); });
    fills.forEach(function (f, i) { f.style.width = i < idx ? "100%" : "0"; });
    cancelAnimationFrame(raf); if (!reduce) raf = requestAnimationFrame(paso);
  }
  function paso(t) {
    var dur = +slides[idx].getAttribute("data-dur");
    if (!dur) { fills[idx].style.width = "100%"; return; }
    if (!pausado && !document.hidden) acumulado += t - t0; t0 = t;
    fills[idx].style.width = Math.min(100, acumulado / dur * 100) + "%";
    if (acumulado >= dur) { ir(idx + 1); return; }
    raf = requestAnimationFrame(paso);
  }
  document.getElementById("sig").addEventListener("click", function () { ir(idx + 1); });
  document.getElementById("ant").addEventListener("click", function () { ir(idx - 1); });
  document.addEventListener("keydown", function (e) { if (hoja && !hoja.hidden) { if (e.key === "Escape") cerrar(); return; } if (e.key === "ArrowRight") ir(idx + 1); if (e.key === "ArrowLeft") ir(idx - 1); });
  story.addEventListener("pointerdown", function (e) { if (!e.target.closest("a,button,form")) pausado = true; });
  ["pointerup", "pointercancel", "pointerleave"].forEach(function (ev) { story.addEventListener(ev, function () { pausado = false; }); });
  function abrir() { hoja.hidden = false; pausado = true; var i = hoja.querySelector("input"); if (i) i.focus(); }
  function cerrar() { hoja.hidden = true; pausado = false; document.getElementById("abrirForm").focus(); }
  document.getElementById("abrirForm").addEventListener("click", abrir);
  document.getElementById("cerrarForm").addEventListener("click", cerrar);
  ir(0);
})();
