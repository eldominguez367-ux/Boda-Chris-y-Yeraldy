/* Enlaces personalizados: ?g=Nombre&n=3 muestra "Para Nombre" y rellena la confirmación. Se carga en todos los formatos. */
(function () {
  "use strict";
  var q = new URLSearchParams(location.search), g = (q.get("g") || "").trim().slice(0, 60), n = parseInt(q.get("n"), 10) || 0;
  if (!g) return;
  var el = document.createElement("p"); el.className = "para-invitado";
  el.textContent = "Para " + g + (n ? " · " + n + (n === 1 ? " lugar reservado" : " lugares reservados") : "");
  el.style.cssText = "font:italic 500 1.25rem/1.3 'Cormorant Garamond',Georgia,serif;text-align:center;margin:0 0 10px;letter-spacing:.04em;position:relative;z-index:2";
  var tgt = document.querySelector("[data-invita]") || document.getElementById("invitaTexto");
  if (tgt) tgt.parentNode.insertBefore(el, tgt);
  else { var h = document.querySelector(".hero-text, .cover-text, .hero-t, .cuerpo, .sd, .cartel"); if (h) h.appendChild(el); else document.body.insertBefore(el, document.body.firstChild); }
  var f = document.getElementById("rsvpForm");
  if (f) { if (f.nombre) f.nombre.value = g; if (n && f.acompanantes) { f.acompanantes.max = n; f.acompanantes.value = n; } }
  document.title = "Para " + g + " · " + document.title;
})();
