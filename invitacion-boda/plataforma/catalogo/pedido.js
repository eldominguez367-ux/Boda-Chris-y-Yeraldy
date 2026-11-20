/* Pedido en 3 pasos: 1 diseño y plan · 2 resumen y contacto · 3 datos de la boda */
(function () {
  "use strict";
  var P = window.PLATAFORMA, F = window.FORMATOS, PL = window.PLANES, SD = window.PRECIOS_SD, E = window.EternaPref;
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var wa = function (t) { return P.whatsapp ? "https://wa.me/" + P.whatsapp + "?text=" + encodeURIComponent(t) : "mailto:" + P.email + "?body=" + encodeURIComponent(t); };
  var porId = function (id) { return F.filter(function (f) { return f.id === id; })[0]; };
  var q = new URLSearchParams(location.search);
  var est = { paso: 1, fmt: porId(q.get("f")) || F[0], planId: q.get("p") || null, contacto: "", codigo: "", dto: 0, datos: null };
  var ZONAS = [["America/Santo_Domingo", "República Dominicana (UTC-4)"], ["America/Mexico_City", "México (centro)"], ["America/Bogota", "Colombia"], ["America/Lima", "Perú"], ["America/Santiago", "Chile"], ["America/Argentina/Buenos_Aires", "Argentina"], ["America/Caracas", "Venezuela"], ["America/Panama", "Panamá"], ["America/Guatemala", "Guatemala"], ["America/Costa_Rica", "Costa Rica"], ["America/Puerto_Rico", "Puerto Rico"], ["America/New_York", "Estados Unidos (este)"], ["Europe/Madrid", "España (península)"], ["Atlantic/Canary", "España (Canarias)"]];

  function planes() {
    if (est.fmt.tipo === "savethedate") return [
      { id: "sd-datos", nombre: "Con tus datos", precio: SD.con_tus_datos, lema: "Este diseño con tus nombres, fecha y lugar", dias: "24 horas", cambios: "1 ronda de cambios", incluye: ["El diseño elegido tal cual", "Tus nombres, fecha y ciudad", "Tu foto", "Cuenta atrás y calendario"] },
      { id: "sd-medida", nombre: "A medida", precio: SD.a_medida, lema: "Lo adaptamos a tus colores y a tu estilo", dias: "3 días", cambios: "3 rondas de cambios", incluye: ["Todo lo del plan anterior", "Tus colores y tipografías", "Foto retocada o ilustración nueva"] }];
    return PL;
  }
  function plan() { var l = planes(); return l.filter(function (p) { return p.id === est.planId; })[0] || l.filter(function (p) { return p.recomendado; })[0] || l[0]; }
  function total() { var p = plan(); return Math.max(0, Math.round(p.precio * (1 - est.dto / 100))); }
  function money(n) { return E.precio(n); }

  function indicador() {
    var t = ["Diseño y plan", "Resumen", "Tus datos"];
    $("#indicador").innerHTML = t.map(function (x, i) { return '<span class="' + (i + 1 === est.paso ? "on" : i + 1 < est.paso ? "hecho" : "") + '"><b>' + (i + 1) + "</b> " + x + "</span>"; }).join("");
  }
  function resumen() {
    var p = plan(), f = est.fmt;
    $("#pedResumen").innerHTML = '<p class="paso">Resumen del pedido</p><h2>Tu invitación digital</h2>' +
      '<img class="mini-foto" alt="" src="miniaturas/' + f.id + '-card.webp" width="96" height="208">' +
      '<dl><div><dt>Diseño</dt><dd>' + esc(f.nombre) + "</dd></div><div><dt>Plan</dt><dd>" + esc(p.nombre) + "</dd></div><div><dt>Entrega</dt><dd>" + esc(p.dias) + "</dd></div><div><dt>Cambios</dt><dd>" + esc(p.cambios) + "</dd></div>" +
      (est.dto ? "<div><dt>Descuento</dt><dd>−" + est.dto + " %</dd></div>" : "") + '</dl><div class="total"><span>Total</span><b>' + money(total()) + '</b></div>' +
      '<p class="peq">Precio en US$ ' + total() + '. Un solo pago por boda, sin suscripciones. Se acuerda por WhatsApp (transferencia, tarjeta o PayPal).</p>' +
      '<p class="peq">✓ Incluye el planificador de boda gratis · ✓ Verás un borrador privado antes de compartirla</p>';
  }
  function paso1() {
    est.paso = 1; indicador();
    var lista = planes(); if (!lista.some(function (p) { return p.id === est.planId; })) est.planId = plan().id;
    $("#pedMain").innerHTML = '<p class="paso">Paso 1 de 3</p><h1>¿Qué diseño y qué plan?</h1>' +
      '<div class="campo"><label for="pFmt">Diseño</label><select id="pFmt">' + F.map(function (x) { return '<option value="' + x.id + '"' + (est.fmt.id === x.id ? " selected" : "") + ">" + esc(x.nombre) + (x.tipo === "savethedate" ? " (Save the Date)" : "") + "</option>"; }).join("") + "</select></div>" +
      '<fieldset class="planes-op"><legend class="sr-only">Plan</legend>' + lista.map(function (p) {
        return '<label class="op-plan"><input type="radio" name="plan" value="' + p.id + '"' + (est.planId === p.id ? " checked" : "") + '><span class="t"><span>' + esc(p.nombre) + (p.recomendado ? " · la más elegida" : "") + "</span><b>" + money(p.precio) + "</b></span><small>" + esc(p.lema) + " · Lista en " + esc(p.dias) + " · " + esc(p.cambios) + "</small>" +
          '<ul class="mini-lista">' + p.incluye.slice(0, 4).map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul></label>";
      }).join("") + '</fieldset><button class="btn solid grande ancho" type="button" id="sig1">Continuar</button>';
    $("#pFmt").addEventListener("change", function (e) { est.fmt = porId(e.target.value); paso1(); resumen(); });
    $$("input[name=plan]").forEach(function (r) { r.addEventListener("change", function () { est.planId = r.value; resumen(); }); });
    $("#sig1").addEventListener("click", paso2); resumen();
  }
  function paso2() {
    est.paso = 2; indicador(); var p = plan();
    $("#pedMain").innerHTML = '<p class="paso">Paso 2 de 3</p><h1>Revisa tu pedido</h1>' +
      '<div class="chips-info">' + p.incluye.slice(0, 5).map(function (i) { return "<span>✓ " + esc(i) + "</span>"; }).join("") + "</div>" +
      '<div class="caja-h"><p class="eyebrow">Diseño elegido</p><h2 style="margin:0">' + esc(est.fmt.nombre) + ' · ' + esc(p.nombre) + '</h2><p class="peq" style="margin:6px 0 0">' + esc(p.lema) + "</p></div>" +
      '<div class="campo" style="margin-top:18px"><label for="pCon">Tu WhatsApp o correo (para responderte)</label><input id="pCon" autocomplete="tel" value="' + esc(est.contacto) + '" aria-describedby="eCon"><p class="err" id="eCon" role="alert"></p></div>' +
      '<details class="codigo"' + (est.codigo ? " open" : "") + '><summary>¿Tienes un código de descuento?</summary><div class="bol-fila" style="margin:10px 0"><input id="pCod" value="' + esc(est.codigo) + '" placeholder="Código" style="flex:1;padding:11px 14px;border:1.5px solid var(--linea);border-radius:12px;font:16px var(--f-texto)"><button class="btn peq" type="button" id="aplicar">Aplicar</button></div><p class="peq" id="msgCod" role="status"></p></details>' +
      '<div class="acc2"><button class="btn enlace" type="button" id="atras2">← Volver</button><button class="btn solid grande" type="button" id="sig2">Continuar</button></div>';
    $("#aplicar").addEventListener("click", function () {
      var c = $("#pCod").value.trim().toUpperCase(), m = $("#msgCod"), t = P.codigos || {};
      if (!c) { est.codigo = ""; est.dto = 0; m.textContent = ""; resumen(); return; }
      if (t[c]) { est.codigo = c; est.dto = t[c]; m.textContent = "Código aplicado: −" + t[c] + " %."; } else { est.codigo = ""; est.dto = 0; m.textContent = "Ese código no es válido."; }
      resumen();
    });
    $("#atras2").addEventListener("click", paso1);
    $("#sig2").addEventListener("click", function () {
      var v = $("#pCon").value.trim(); $("#eCon").textContent = ""; $("#pCon").removeAttribute("aria-invalid");
      if (v.length < 5) { $("#eCon").textContent = "Indica un WhatsApp o un correo para responderte."; $("#pCon").setAttribute("aria-invalid", "true"); $("#pCon").focus(); return; }
      est.contacto = v; paso3();
    });
    resumen();
  }
  function paso3() {
    est.paso = 3; indicador();
    var opZ = ZONAS.map(function (z) { return '<option value="' + z[0] + '"' + (z[0] === "America/Santo_Domingo" ? " selected" : "") + ">" + esc(z[1]) + "</option>"; }).join("");
    $("#pedMain").innerHTML = '<p class="paso">Paso 3 de 3</p><h1>Cuéntanos de tu boda</h1><p class="peq" style="margin-top:-6px">Si algo aún no lo sabes, déjalo en blanco: lo marcaremos como pendiente.</p>' +
      '<form id="fDatos" novalidate>' +
      '<div class="dos"><div class="campo"><label for="dN1">Nombre 1</label><input id="dN1" aria-describedby="eN"></div><div class="campo"><label for="dN2">Nombre 2</label><input id="dN2" aria-describedby="eN"></div></div><p class="err" id="eN" role="alert"></p>' +
      '<div class="dos"><div class="campo"><label for="dTrat">Tratamiento en los textos</label><select id="dTrat"><option value="ustedes">Ustedes (Latinoamérica)</option><option value="vosotros">Vosotros (España)</option></select></div><div class="campo"><label for="dZona">Zona horaria de la boda</label><select id="dZona">' + opZ + "</select></div></div>" +
      '<div class="dos"><div class="campo"><label for="dFecha">Fecha</label><input id="dFecha" type="date"></div><div class="campo"><label for="dHora">Hora de inicio</label><input id="dHora" type="time" value="17:00"></div></div>' +
      '<div class="dos"><div class="campo"><label for="dCerN">Ceremonia: lugar</label><input id="dCerN"></div><div class="campo"><label for="dCerC">Ceremonia: ciudad</label><input id="dCerC"></div></div>' +
      '<div class="dos"><div class="campo"><label for="dRecN">Recepción: lugar</label><input id="dRecN"></div><div class="campo"><label for="dRecC">Recepción: ciudad</label><input id="dRecC"></div></div>' +
      '<div class="campo"><label for="dMapa">Enlace de Google Maps (opcional)</label><input id="dMapa" type="url" placeholder="https://maps.app.goo.gl/…"></div>' +
      '<div class="campo"><label for="dProg">Programa del día (una línea por acto: 17:00 Ceremonia)</label><textarea id="dProg" rows="5">16:30 Llegada de invitados\n17:00 Ceremonia\n18:00 Brindis\n19:00 Cena\n21:00 Baile</textarea></div>' +
      '<div class="dos"><div class="campo"><label for="dHash">Hashtag (opcional)</label><input id="dHash" placeholder="#NuestraBoda"></div><div class="campo"><label for="dLim">Fecha límite para confirmar</label><input id="dLim" type="date"></div></div>' +
      '<div class="campo"><label for="dIdi">Idioma(s) de la invitación</label><input id="dIdi" value="Español"></div>' +
      '<div class="campo"><label for="dFotos">Tus fotos</label><input id="dFotos" placeholder="Enlace de Drive o Dropbox, o escribe «las envío por WhatsApp»"></div>' +
      '<div class="campo"><label for="dNotas">¿Algo más? Colores, música, estilo… (opcional)</label><textarea id="dNotas" rows="3"></textarea></div>' +
      '<div class="acc2"><button class="btn enlace" type="button" id="atras3">← Volver</button><button class="btn solid grande" type="submit">Enviar pedido por WhatsApp</button></div></form>';
    $("#atras3").addEventListener("click", paso2);
    $("#fDatos").addEventListener("submit", enviar); resumen();
  }

  function offsetMin(zona, d) {
    var o = {}; new Intl.DateTimeFormat("en-US", { timeZone: zona, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }).formatToParts(d).forEach(function (p) { o[p.type] = p.value; });
    return Math.round((Date.UTC(+o.year, +o.month - 1, +o.day, +o.hour, +o.minute, +o.second) - d.getTime()) / 60000);
  }
  function isoConOffset(fecha, hora, zona) {
    var a = fecha.split("-").map(Number), h = (hora || "17:00").split(":").map(Number);
    var guess = Date.UTC(a[0], a[1] - 1, a[2], h[0], h[1]), off = offsetMin(zona, new Date(guess)); off = offsetMin(zona, new Date(guess - off * 60000));
    var sg = off < 0 ? "-" : "+", ab = Math.abs(off), p2 = function (n) { return String(n).padStart(2, "0"); };
    return fecha + "T" + p2(h[0]) + ":" + p2(h[1]) + ":00" + sg + p2(Math.floor(ab / 60)) + ":" + p2(ab % 60);
  }
  function iconoDe(t) { t = t.toLowerCase(); return /llegad|recepci|bienven/.test(t) ? 0 : /ceremon|boda civil|misa/.test(t) ? 1 : /brind|c[oó]ctel|aperitiv/.test(t) ? 2 : /cena|comida|banquet/.test(t) ? 3 : /baile|fiesta|m[uú]sica|dj/.test(t) ? 4 : 5; }
  function codigoPedido() { var a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", s = "ET-"; for (var i = 0; i < 5; i++) s += a[Math.floor(Math.random() * a.length)]; return s; }

  function enviar(e) {
    e.preventDefault();
    var n1 = $("#dN1").value.trim(), n2 = $("#dN2").value.trim(), eN = $("#eN"); eN.textContent = ""; $("#dN1").removeAttribute("aria-invalid"); $("#dN2").removeAttribute("aria-invalid");
    if (n1.length < 2 || n2.length < 2) { eN.textContent = "Escribe los dos nombres de los novios."; ($("#dN1").value.trim().length < 2 ? $("#dN1") : $("#dN2")).setAttribute("aria-invalid", "true"); ($("#dN1").value.trim().length < 2 ? $("#dN1") : $("#dN2")).focus(); return; }
    var zona = $("#dZona").value, fecha = $("#dFecha").value, hora = $("#dHora").value || "17:00";
    var prog = $("#dProg").value.split("\n").map(function (l) { return l.trim(); }).filter(Boolean).map(function (l) { var m = l.match(/^(\d{1,2}[:.h]\d{2})\s*[-–|]?\s*(.*)$/); var h = m ? m[1].replace(/[.h]/, ":") : "", t = m ? m[2] : l; return { h: h, t: t, icono: iconoDe(t) }; });
    var datos = {
      novios: { n1: n1, n2: n2 }, tratamiento: $("#dTrat").value,
      fecha: { iso: fecha ? isoConOffset(fecha, hora, zona) : "PENDIENTE", zona: zona },
      ceremonia: { nombre: $("#dCerN").value.trim(), ciudad: $("#dCerC").value.trim(), direccion: "", hora: hora, mapa: $("#dMapa").value.trim() },
      recepcion: { nombre: $("#dRecN").value.trim(), ciudad: $("#dRecC").value.trim(), direccion: "", hora: "", mapa: "" },
      programa: prog, hashtag: $("#dHash").value.trim(), playlist: { enlace: "" }, musica: { src: "", volumen: 0.55 },
      confirmacion: { limite: $("#dLim").value, destino: "" }, todos: ["Revisar los datos con la pareja"]
    };
    var cod = codigoPedido(), p = plan();
    var texto = ["¡Hola! Quiero pedir una invitación de boda digital.", "", "Código de pedido: " + cod, "• Diseño: " + est.fmt.nombre + " (" + est.fmt.id + ")", "• Plan: " + p.nombre + " (US$" + total() + (est.codigo ? ", código " + est.codigo : "") + ")",
      "• Novios: " + n1 + " y " + n2, "• Contacto: " + est.contacto, "• Fecha: " + (fecha ? fecha + " " + hora + " (" + zona + ")" : "pendiente"), "• Ceremonia: " + ($("#dCerN").value.trim() || "pendiente") + " · " + ($("#dCerC").value.trim() || ""),
      "• Recepción: " + ($("#dRecN").value.trim() || "pendiente") + " · " + ($("#dRecC").value.trim() || ""), "• Idioma(s): " + $("#dIdi").value.trim(), "• Fotos: " + ($("#dFotos").value.trim() || "pendiente"), $("#dNotas").value.trim() ? "• Notas: " + $("#dNotas").value.trim() : "",
      "", "Datos para el equipo (JSON):", JSON.stringify(datos)].filter(function (x, i, a) { return x !== "" || (a[i - 1] !== ""); }).join("\n");
    var url = wa(texto); window.open(url, "_blank", "noopener");
    $("#indicador").innerHTML = ""; $("#pedResumen").hidden = true;
    $("#pedMain").innerHTML = '<div class="gracias"><p class="paso">¡Pedido listo!</p><h1>Gracias, ' + esc(n1) + ' y ' + esc(n2) + "</h1><p>Se abrió WhatsApp con tu pedido listo para enviar. <b>Envíalo para que lo recibamos.</b> Si no se abrió, usa el botón.</p>" +
      '<p class="codigo-p">Tu código de pedido: <b>' + cod + '</b></p><div class="acciones" style="justify-content:center"><a class="btn solid grande" href="' + esc(url) + '" target="_blank" rel="noopener">Abrir WhatsApp</a><button class="btn grande" type="button" id="copiar">Copiar mi pedido</button></div>' +
      '<p class="peq" id="msgCopia" role="status"></p><p class="peq">Cuando lo activemos, podrás seguirlo con tu código en <a href="seguimiento.html?c=' + cod + '">Seguir mi pedido</a>. Te respondemos hoy mismo.</p></div>';
    $("#copiar").addEventListener("click", function () { var m = $("#msgCopia"); if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(texto).then(function () { m.textContent = "Copiado."; }, function () { m.textContent = "No se pudo copiar; usa WhatsApp."; }); else m.textContent = "Tu navegador no permite copiar; usa WhatsApp."; });
  }
  paso1();
})();
