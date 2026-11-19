/* Estrellas titilantes (canvas) en la portada: pocas partículas y paradas fuera de pantalla */
(function () {
  if (window.Nucleo && window.Nucleo.reduce) return;
  var cv = document.getElementById("estrellas"); if (!cv) return;
  var ctx = cv.getContext("2d"), hero = cv.parentNode, W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), st = [], raf = 0, vis = true;
  var N = ((navigator.hardwareConcurrency || 4) <= 4) ? 28 : 44;
  function size() { var r = hero.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    st.forEach(function (s) { var a = .25 + .75 * Math.abs(Math.sin(t / 1000 * s.v + s.p)); ctx.globalAlpha = a; ctx.fillStyle = "#FFE9B8"; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill(); });
    raf = vis && !document.hidden ? requestAnimationFrame(draw) : 0;
  }
  function go() { if (!raf && vis && !document.hidden) raf = requestAnimationFrame(draw); }
  size(); for (var i = 0; i < N; i++) st.push({ x: Math.random() * W, y: Math.random() * H * .8, r: .5 + Math.random() * 1.4, v: .6 + Math.random() * 1.6, p: Math.random() * 6.28 });
  window.addEventListener("resize", size); document.addEventListener("visibilitychange", go);
  if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { vis = e[0].isIntersecting; go(); }).observe(hero);
  go();
})();
