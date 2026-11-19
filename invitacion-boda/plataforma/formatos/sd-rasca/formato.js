/* Rasca y descubre: lámina dorada sobre la foto. Al rascar ~45 % se revela todo. */
(function () {
  var cv = document.getElementById("lamina"), carta = document.getElementById("raspa"), revela = document.getElementById("revela");
  var ctx = cv.getContext("2d", { willReadFrequently: true }), dpr = Math.min(window.devicePixelRatio || 1, 2), W, H, dibujando = false, hecho = false;
  function lamina() {
    var r = carta.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, "#d9b25f"); g.addColorStop(.35, "#f4dc9a"); g.addColorStop(.6, "#c99a3e"); g.addColorStop(1, "#ecd08a");
    ctx.globalCompositeOperation = "source-over"; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (var i = 0; i < 900; i++) { ctx.fillStyle = "rgba(" + (Math.random() < .5 ? "255,255,255" : "120,80,10") + "," + (Math.random() * .12) + ")"; ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2); }
    ctx.fillStyle = "rgba(110,70,10,.75)"; ctx.textAlign = "center"; ctx.font = "600 22px 'Cormorant Garamond', Georgia, serif";
    ctx.fillText("RASCA AQUÍ", W / 2, H / 2 - 4); ctx.font = "italic 16px 'Cormorant Garamond', Georgia, serif"; ctx.fillText("tu fecha te espera", W / 2, H / 2 + 22);
  }
  function revelar() { if (hecho) return; hecho = true; cv.classList.add("fuera"); revela.hidden = false; document.getElementById("pista").hidden = true; document.getElementById("mostrar").hidden = true; setTimeout(function () { revela.scrollIntoView({ behavior: window.Nucleo && window.Nucleo.reduce ? "auto" : "smooth", block: "nearest" }); }, 300); }
  function progreso() {
    var d = ctx.getImageData(0, 0, cv.width, cv.height).data, claros = 0, total = 0;
    for (var i = 3; i < d.length; i += 4 * 64) { total++; if (d[i] < 20) claros++; }
    if (claros / total > .45) revelar();
  }
  function rascar(e) {
    if (!dibujando || hecho) return; var r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    ctx.globalCompositeOperation = "destination-out"; ctx.beginPath(); ctx.arc(x, y, 24, 0, 6.283); ctx.fill();
  }
  cv.addEventListener("pointerdown", function (e) { dibujando = true; cv.setPointerCapture(e.pointerId); rascar(e); });
  cv.addEventListener("pointermove", rascar);
  ["pointerup", "pointercancel"].forEach(function (ev) { cv.addEventListener(ev, function () { dibujando = false; progreso(); }); });
  document.getElementById("mostrar").addEventListener("click", revelar);
  lamina(); window.addEventListener("resize", function () { if (!hecho) lamina(); });
})();
