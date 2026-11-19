(function () {
  "use strict";
  var P = window.PLATAFORMA, F = window.FORMATOS, PL = window.PLANES, SD = window.PRECIOS_SD;
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var money = function (n) { return P.moneda + n; };
  var wa = function (t) { return P.whatsapp ? "https://wa.me/" + P.whatsapp + "?text=" + encodeURIComponent(t) : "mailto:" + P.email + "?body=" + encodeURIComponent(t); };
  var porId = function (id) { return F.filter(function (f) { return f.id === id; })[0]; };
  var desdeInv = PL[0].precio, desdeSd = SD.con_tus_datos;
  var pagina = document.body.getAttribute("data-pagina");

  /* ---- común ---- */
  $$("[data-marca]").forEach(function (e) { e.textContent = P.marca; });
  var saludo = "¡Hola! Quiero información sobre las invitaciones de boda digitales.";
  var a1 = $("#cabWa"), a2 = $("#barraWa"), a3 = $("#ayuda"); if (a3) a3.href = wa("¡Hola Paloma! Quiero ayuda para elegir mi invitación de boda."); if (a1) a1.href = wa(saludo); if (a2) a2.href = wa(saludo);
  var promo = $("#promo"); try { if (sessionStorage.getItem("promoX") === "1") promo.hidden = true; } catch (e) {}
  $("#promoX").addEventListener("click", function () { promo.hidden = true; try { sessionStorage.setItem("promoX", "1"); } catch (e) {} });
  var cab = $("#cab"), bg = $("#burger");
  bg.addEventListener("click", function () { var o = cab.classList.toggle("abierto"); bg.setAttribute("aria-expanded", o); });
  $$("#cab nav a").forEach(function (a) { a.addEventListener("click", function () { cab.classList.remove("abierto"); }); });

  /* ---- tarjetas ---- */
  function tarjeta(f) {
    var desde = f.tipo === "savethedate" ? desdeSd : desdeInv;
    return '<a class="tarjeta" href="diseno.html?id=' + f.id + '"><span class="fondo">' + (f.nuevo ? '<span class="nuevo">NUEVO</span>' : "") +
      '<span class="tel mini"><span class="pantalla"><img loading="lazy" alt="Vista previa del diseño ' + esc(f.nombre) + '" src="miniaturas/' + f.id + '-card.webp" width="390" height="844"></span></span></span>' +
      "<h3>" + esc(f.nombre) + '</h3><p class="frase">' + esc(f.frase) + '</p><p class="precio">Desde ' + money(desde) + "</p></a>";
  }

  /* ---- pedido (modal de 3 pasos) ---- */
  var dlg, est = { fmt: null, plan: null, paso: 1 };
  function planesDe(fmt) {
    if (fmt && fmt.tipo === "savethedate") return [
      { id: "sd-datos", nombre: "Con tus datos", precio: SD.con_tus_datos, lema: "Este diseño con tus nombres, fecha y lugar", dias: "24 horas", cambios: "1 ronda de cambios" },
      { id: "sd-medida", nombre: "A medida", precio: SD.a_medida, lema: "Lo adaptamos a tus colores y a tu estilo", dias: "3 días", cambios: "3 rondas de cambios" }];
    return PL;
  }
  function crearModal() {
    dlg = document.createElement("dialog"); dlg.setAttribute("aria-labelledby", "pedT");
    dlg.innerHTML = '<div class="ped"><button class="cierra" type="button" aria-label="Cerrar" id="pCierra">×</button><div class="izq" id="pIzq"></div><aside class="der resumen" id="pDer" aria-live="polite"></aside></div>';
    document.body.appendChild(dlg);
    $("#pCierra").addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
  }
  function resumen() {
    var f = est.fmt, pl = est.plan;
    var filas = '<div><dt>Diseño</dt><dd>' + (f ? esc(f.nombre) : "—") + "</dd></div><div><dt>Plan</dt><dd>" + (pl ? esc(pl.nombre) : "—") + "</dd></div>" +
      (pl ? "<div><dt>Entrega</dt><dd>" + esc(pl.dias) + "</dd></div><div><dt>Cambios</dt><dd>" + esc(pl.cambios) + "</dd></div>" : "");
    $("#pDer").innerHTML = '<p class="paso">Resumen del pedido</p><h3>Tu invitación digital</h3><dl>' + filas + '</dl><div class="total"><span>Total</span><b>' + (pl ? money(pl.precio) : "—") + '</b></div><p class="peq">Un solo pago por boda. Sin suscripciones ni costes añadidos.</p>';
  }
  function paso1() {
    var f = est.fmt, lista = planesDe(f);
    if (!est.plan || !lista.some(function (p) { return p.id === est.plan.id; })) est.plan = lista.filter(function (p) { return p.recomendado; })[0] || lista[0];
    $("#pIzq").innerHTML = '<p class="paso">Paso 1 de 2 · Elige</p><h2 id="pedT">¿Qué diseño y qué plan?</h2>' +
      '<div class="campo"><label for="pFmt">Diseño</label><select id="pFmt">' + F.map(function (x) { return '<option value="' + x.id + '"' + (f && f.id === x.id ? " selected" : "") + ">" + esc(x.nombre) + (x.tipo === "savethedate" ? " (Save the Date)" : "") + "</option>"; }).join("") + "</select></div>" +
      '<fieldset style="border:0;padding:0;margin:0"><legend class="sr-only">Plan</legend>' + lista.map(function (p) {
        return '<label class="op-plan"><input type="radio" name="plan" value="' + p.id + '"' + (est.plan.id === p.id ? " checked" : "") + '><span class="t"><span>' + esc(p.nombre) + (p.recomendado ? " · recomendado" : "") + "</span><b>" + money(p.precio) + "</b></span><small>" + esc(p.lema) + " · " + esc(p.dias) + "</small></label>";
      }).join("") + '</fieldset><button class="btn solid grande ancho" type="button" id="pSig" style="margin-top:10px">Continuar</button>';
    $("#pFmt").addEventListener("change", function (e) { est.fmt = porId(e.target.value); paso1(); });
    $$("input[name=plan]", dlg).forEach(function (r) { r.addEventListener("change", function () { est.plan = planesDe(est.fmt).filter(function (p) { return p.id === r.value; })[0]; resumen(); }); });
    $("#pSig").addEventListener("click", paso2); resumen();
  }
  function paso2() {
    $("#pIzq").innerHTML = '<p class="paso">Paso 2 de 2 · Tus datos</p><h2 id="pedT">¿A quién preparamos la invitación?</h2>' +
      '<form id="pForm" novalidate><div class="campo"><label for="pNov">Nombres de los novios</label><input id="pNov" autocomplete="off" placeholder="Ej.: Valentina y Sebastián" aria-describedby="eNov"><p class="err" id="eNov" role="alert"></p></div>' +
      '<div class="campo"><label for="pCon">Tu WhatsApp o correo</label><input id="pCon" autocomplete="tel" aria-describedby="eCon"><p class="err" id="eCon" role="alert"></p></div>' +
      '<div class="campo"><label for="pFec">Fecha de la boda (aproximada)</label><input id="pFec" type="date"></div>' +
      '<div class="campo"><label for="pMsg">¿Algo más que debamos saber? (opcional)</label><textarea id="pMsg" rows="3"></textarea></div>' +
      '<button class="btn solid grande ancho" type="submit">Enviar pedido por WhatsApp</button><p class="peq" style="margin-top:12px">No se cobra nada ahora. Te respondemos hoy mismo para acordar el pago (transferencia, tarjeta o PayPal) y empezar.</p>' +
      '<button class="btn enlace" type="button" id="pAtras">← Volver</button></form>';
    $("#pAtras").addEventListener("click", paso1);
    $("#pForm").addEventListener("submit", function (e) {
      e.preventDefault(); var ok = true, nov = $("#pNov").value.trim(), con = $("#pCon").value.trim();
      $("#eNov").textContent = ""; $("#eCon").textContent = ""; $("#pNov").removeAttribute("aria-invalid"); $("#pCon").removeAttribute("aria-invalid");
      if (nov.length < 3) { $("#eNov").textContent = "Escribe los nombres de los novios."; $("#pNov").setAttribute("aria-invalid", "true"); ok = false; }
      if (con.length < 5) { $("#eCon").textContent = "Indica un WhatsApp o un correo para responderte."; $("#pCon").setAttribute("aria-invalid", "true"); ok = false; }
      if (!ok) { ($("[aria-invalid=true]", dlg) || $("#pNov")).focus(); return; }
      var t = ["¡Hola! Quiero pedir una invitación de boda digital.", "", "• Diseño: " + est.fmt.nombre, "• Plan: " + est.plan.nombre + " (" + money(est.plan.precio) + ")", "• Novios: " + nov, "• Contacto: " + con,
        $("#pFec").value ? "• Fecha de la boda: " + $("#pFec").value : "", $("#pMsg").value.trim() ? "• Notas: " + $("#pMsg").value.trim() : ""].filter(Boolean).join("\n");
      var url = wa(t); window.open(url, "_blank", "noopener");
      $("#pIzq").innerHTML = '<div class="gracias"><h2>¡Gracias!</h2><p>Se abrió WhatsApp con tu pedido listo para enviar. Si no se abrió, pulsa el botón.</p><a class="btn solid grande" href="' + esc(url) + '" target="_blank" rel="noopener">Abrir WhatsApp</a><p class="peq" style="margin-top:16px">Te respondemos hoy mismo.</p></div>';
    });
    resumen();
  }
  function abrirPedido(fmtId, planId) {
    if (!dlg) crearModal();
    est.fmt = fmtId ? porId(fmtId) : F[0]; est.plan = planId ? planesDe(est.fmt).filter(function (p) { return p.id === planId; })[0] : null;
    paso1(); if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
  }
  var fmtActual = null;
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-pedido]"); if (!b) return; e.preventDefault();
    abrirPedido(b.getAttribute("data-fmt") || (fmtActual && fmtActual.id) || null, b.getAttribute("data-plan"));
  });

  /* ---- Inicio ---- */
  if (pagina === "inicio") {
    $$("[data-desde]").forEach(function (e) { e.textContent = money(desdeInv); }); $$("[data-desde-sd]").forEach(function (e) { e.textContent = money(desdeSd); });
    var inv = F.filter(function (f) { return f.tipo === "invitacion"; }), sd = F.filter(function (f) { return f.tipo === "savethedate"; });
    $("#tituloDisenos").textContent = inv.length + " diseños, todos hechos a tu medida";
    $("#heroFrame").src = "formatos/fotografico/index.html"; $("#invFrame").src = "formatos/botanico/index.html";
    var estilos = ["Todos"]; inv.forEach(function (f) { f.estilo.forEach(function (s) { if (estilos.indexOf(s) < 0) estilos.push(s); }); });
    var actual = "Todos", filtros = $("#filtros");
    function pintar() {
      filtros.innerHTML = estilos.map(function (s) { return '<button type="button" class="chip' + (s === actual ? " on" : "") + '" aria-pressed="' + (s === actual) + '" data-e="' + esc(s) + '">' + esc(s) + "</button>"; }).join("");
      $("#rejilla").innerHTML = inv.filter(function (f) { return actual === "Todos" || f.estilo.indexOf(actual) >= 0; }).map(tarjeta).join("");
    }
    filtros.addEventListener("click", function (e) { var b = e.target.closest("[data-e]"); if (b) { actual = b.getAttribute("data-e"); pintar(); } });
    pintar(); $("#rejillaSd").innerHTML = sd.map(tarjeta).join("");
    $("#planes-lista").innerHTML = PL.map(function (p) {
      return '<article class="plan' + (p.recomendado ? " rec" : "") + '">' + (p.recomendado ? '<span class="cinta">La más elegida</span>' : "") + "<h3>" + esc(p.nombre) + '</h3><p class="lema">' + esc(p.lema) + '</p><p class="pr">' + money(p.precio) + "<small>pago único</small></p>" +
        '<p class="meta">Lista en ' + esc(p.dias) + " · " + esc(p.cambios) + "</p><ul>" + p.incluye.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + '</ul><button class="btn ' + (p.recomendado ? "solid " : "") + 'ancho" type="button" data-pedido data-plan="' + p.id + '">Elegir ' + esc(p.nombre) + "</button></article>";
    }).join("");
  }

  /* ---- Ficha de diseño ---- */
  if (pagina === "diseno") {
    var id = new URLSearchParams(location.search).get("id"), f = porId(id) || F[0]; fmtActual = f;
    var esSd = f.tipo === "savethedate", desde = esSd ? desdeSd : desdeInv;
    document.title = f.nombre + " · " + P.marca; $("#migasNombre").textContent = f.nombre; if (esSd) { $("#migasTipo").textContent = "Save the Date"; $("#migasTipo").href = "index.html#savethedate"; $("#tipoEtiqueta").textContent = "Save the Date"; }
    $("#nombre").textContent = f.nombre; $("#frase").textContent = f.frase; $("#precio").textContent = money(desde); $("#desc").textContent = f.desc;
    $("#subprecio").textContent = esSd ? "Pago único · con tus datos o a medida" : "Pago único · tres niveles de personalización";
    $("#barraTxt").textContent = f.nombre + " · desde " + money(desde);
    var fr = $("#demoFrame"), url = "formatos/" + f.id + "/index.html"; fr.src = url;
    var minis = f.minis || [], tira = $("#tira"), btnVivo = $("#verEnVivo"), pant = $("#pantalla");
    tira.innerHTML = minis.map(function (m, i) { return '<button type="button" class="' + (i === 0 ? "on" : "") + '" data-i="' + i + '" aria-label="Ir a la sección ' + (i + 1) + '"><img loading="lazy" alt="" src="miniaturas/' + f.id + "-" + i + '.webp" width="46" height="100"></button>'; }).join("");
    function estatica(i) {
      var img = pant.querySelector("img.estatica"); if (!img) { img = document.createElement("img"); img.className = "estatica"; img.alt = "Sección " + (i + 1) + " de la invitación"; pant.appendChild(img); }
      img.src = "miniaturas/" + f.id + "-" + i + ".webp"; fr.style.visibility = "hidden"; btnVivo.hidden = false;
    }
    function vivo() { var img = pant.querySelector("img.estatica"); if (img) img.remove(); fr.style.visibility = ""; btnVivo.hidden = true; }
    tira.addEventListener("click", function (e) {
      var b = e.target.closest("[data-i]"); if (!b) return; var i = +b.getAttribute("data-i"), m = minis[i] || {};
      $$("button", tira).forEach(function (x) { x.classList.toggle("on", x === b); });
      vivo();
      try {
        if (f.id === "historia") { estatica(i); return; }
        if (m.splash) { fr.src = url + "?r=" + Date.now(); return; }
        fr.contentWindow.scrollTo({ top: m.y || 0, behavior: "smooth" });
      } catch (err) { estatica(i); }
    });
    btnVivo.addEventListener("click", function () { vivo(); fr.src = url; });
    var secciones = esSd ? ["Tu foto con la lámina o el cartel", "Cuenta atrás hasta la fecha", "Botón para añadir al calendario"] : ["Portada con tus nombres y la fecha", "Cuenta atrás", "Ceremonia y recepción con mapa", "Programa del día", "Confirmación de asistencia", "Añadir al calendario"];
    var paneles = {
      quien: [["Hecha por nuestro equipo", "Personalizamos el diseño con tus datos, tus fotos y tu estilo."], ["Cambios incluidos", "Verás un borrador privado y podrás pedir los cambios antes de compartirla."], ["A tu ritmo", "Nos mandas los datos y las fotos cuando quieras, después de reservar."], ["Pago único", "Sin suscripciones. Un enlace listo para compartir por WhatsApp."]],
      secciones: secciones.map(function (s) { return [s, ""]; }).concat(f.incluye.slice(0, 2).map(function (s) { return [s, "Incluido en este diseño"]; })),
      incluye: f.incluye.map(function (s) { return [s, ""]; }).concat([["Enlace privado para compartir", "No aparece en buscadores."]])
    };
    function panel(k) { $("#panel").innerHTML = paneles[k].map(function (r) { return "<li><strong>" + esc(r[0]) + "</strong>" + (r[1] ? "<span>" + esc(r[1]) + "</span>" : "") + "</li>"; }).join(""); }
    panel("quien");
    $("#pestanas").addEventListener("click", function (e) { var b = e.target.closest("[data-p]"); if (!b) return; $$("button", $("#pestanas")).forEach(function (x) { x.classList.toggle("on", x === b); }); panel(b.getAttribute("data-p")); });
    var rel = F.filter(function (x) { return x.id !== f.id && x.tipo === f.tipo; }); if (rel.length < 4) rel = rel.concat(F.filter(function (x) { return x.id !== f.id && x.tipo !== f.tipo; }));
    $("#relacionados").innerHTML = rel.slice(0, 4).map(tarjeta).join("");
  }
})();
