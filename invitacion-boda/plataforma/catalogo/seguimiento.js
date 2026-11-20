(function () {
  "use strict";
  var P = window.PLATAFORMA, $ = function (s) { return document.querySelector(s); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var PASOS = ["Pedido recibido", "Datos y fotos confirmados", "Diseñando tu invitación", "Borrador listo para revisar", "Cambios y aprobación", "Entregada"];
  var wa = function (t) { return P.whatsapp ? "https://wa.me/" + P.whatsapp + "?text=" + encodeURIComponent(t) : "mailto:" + P.email + "?body=" + encodeURIComponent(t); };
  function mostrar(cod) {
    cod = String(cod || "").trim().toUpperCase(); var m = $("#sMsg"), res = $("#sRes"); res.innerHTML = "";
    if (!/^[A-Z0-9-]{3,20}$/.test(cod)) { m.textContent = "Escribe un código válido, por ejemplo ET-7K2M9."; return; }
    m.textContent = "Buscando…";
    fetch("pedidos/" + cod + ".json", { cache: "no-cache" }).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (p) {
      m.textContent = "";
      var e = Math.max(0, Math.min(PASOS.length - 1, +p.estado || 0));
      res.innerHTML = '<div class="seg-card"><p class="paso">Pedido ' + esc(p.codigo || cod) + '</p><h2>' + esc(p.novios || "") + '</h2><p class="peq">' + esc(p.formato || "") + (p.plan ? " · Plan " + esc(p.plan) : "") + (p.actualizado ? " · Actualizado el " + esc(p.actualizado) : "") + "</p>" +
        '<ol class="linea-seg">' + PASOS.map(function (t, i) { return '<li class="' + (i < e ? "hecho" : i === e ? "ahora" : "") + '"><span class="pto"></span><span>' + esc(t) + (i === e ? " · ahora" : "") + "</span></li>"; }).join("") + "</ol>" +
        (p.mensaje ? '<p class="seg-msg">' + esc(p.mensaje) + "</p>" : "") +
        '<div class="acciones">' + (p.borrador ? '<a class="btn solid grande" href="' + esc(p.borrador) + '" target="_blank" rel="noopener">Ver mi borrador</a>' : "") + '<a class="btn grande" target="_blank" rel="noopener" href="' + esc(wa("¡Hola! Pregunto por mi pedido " + (p.codigo || cod) + ".")) + '">Escribir al equipo</a></div></div>';
    }).catch(function () { m.textContent = "Todavía no encontramos ese pedido. Si acabas de enviarlo, lo activamos en breve; escríbenos si pasa más de un día."; });
  }
  $("#fSeg").addEventListener("submit", function (e) { e.preventDefault(); mostrar($("#sCod").value); });
  $("#verDemo").addEventListener("click", function () { $("#sCod").value = "DEMO"; mostrar("DEMO"); });
  var c = new URLSearchParams(location.search).get("c"); if (c) { $("#sCod").value = c; mostrar(c); }
})();
