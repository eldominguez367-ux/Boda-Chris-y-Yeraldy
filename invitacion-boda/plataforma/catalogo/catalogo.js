(function () {
  "use strict";
  var P = window.PLATAFORMA, F = window.FORMATOS, PL = window.PLANES, SD = window.PRECIOS_SD;
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var wa = function (t) { return P.whatsapp ? "https://wa.me/" + P.whatsapp + "?text=" + encodeURIComponent(t) : "mailto:" + P.email + "?body=" + encodeURIComponent(t); };
  var porId = function (id) { return F.filter(function (f) { return f.id === id; })[0]; };
  var pagina = document.body.getAttribute("data-pagina");
  var ls = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

  /* ---------- Preferencias: región y moneda ---------- */
  var pref = (function () { try { return JSON.parse(ls.get("eterna.pref")) || {}; } catch (e) { return {}; } })();
  if (!pref.region || !P.regiones[pref.region]) {
    var lang = (navigator.language || "es").toLowerCase(); pref.region = /^es-es$/.test(lang) ? "ES" : "LA";
  }
  if (!pref.moneda || !P.monedas[pref.moneda]) pref.moneda = P.regiones[pref.region].moneda;
  function guardarPref() { ls.set("eterna.pref", JSON.stringify(pref)); }
  function precio(usd, mon) {
    var m = P.monedas[mon || pref.moneda], v = Math.round(usd * m.tasa / m.redondeo) * m.redondeo;
    return m.simbolo + v.toLocaleString("es-ES", { useGrouping: true }).replace(/ /g, ".");
  }
  function pintarPrecios() { $$("[data-usd]").forEach(function (e) { e.textContent = precio(+e.getAttribute("data-usd")); }); var sel = $("#selReg"); if (sel) sel.textContent = (pref.region === "ES" ? "ES" : "LATAM") + " · " + P.monedas[pref.moneda].simbolo; }
  window.EternaPref = { pref: pref, precio: precio, ls: ls, guardar: guardarPref };

  /* ---------- Común ---------- */
  $$("[data-marca]").forEach(function (e) { e.textContent = P.marca; });
  var saludo = "¡Hola! Quiero información sobre las invitaciones de boda digitales.";
  var a1 = $("#cabWa"), a2 = $("#barraWa"), a3 = $("#ayuda"); if (a1) a1.href = wa(saludo); if (a2) a2.href = wa(saludo); if (a3) a3.href = wa("¡Hola Paloma! Quiero ayuda para elegir mi invitación de boda.");
  var promo = $("#promo"); try { if (sessionStorage.getItem("promoX") === "1") promo.hidden = true; } catch (e) {}
  if (promo) $("#promoX").addEventListener("click", function () { promo.hidden = true; try { sessionStorage.setItem("promoX", "1"); } catch (e) {} });
  var cab = $("#cab"), bg = $("#burger");
  if (bg) bg.addEventListener("click", function () { var o = cab.classList.toggle("abierto"); bg.setAttribute("aria-expanded", o); });
  $$("#cab nav a").forEach(function (a) { a.addEventListener("click", function () { cab.classList.remove("abierto"); }); });

  // Selector de región y moneda (cabecera)
  (function () {
    var cont = $(".cab-der"); if (!cont) return;
    var b = document.createElement("button"); b.id = "selReg"; b.className = "selector"; b.type = "button"; b.setAttribute("aria-haspopup", "dialog"); b.setAttribute("aria-expanded", "false");
    var pop = document.createElement("div"); pop.className = "reg-pop"; pop.id = "regPop"; pop.hidden = true; pop.setAttribute("role", "dialog"); pop.setAttribute("aria-label", "Región y moneda");
    pop.innerHTML = '<p class="paso">Tu región</p><div class="reg-op">' + Object.keys(P.regiones).map(function (k) { return '<label><input type="radio" name="reg" value="' + k + '"' + (pref.region === k ? " checked" : "") + "><span>" + esc(P.regiones[k].nombre) + "</span></label>"; }).join("") + '</div><p class="paso" style="margin-top:14px">Moneda</p><select id="selMon" aria-label="Moneda">' +
      Object.keys(P.monedas).map(function (k) { return '<option value="' + k + '"' + (pref.moneda === k ? " selected" : "") + ">" + k + " · " + esc(P.monedas[k].nombre) + "</option>"; }).join("") + '</select><p class="peq">Los precios están en US$. Las demás monedas son de referencia y el cobro se acuerda en US$.</p>';
    cont.insertBefore(b, cont.firstChild); cont.appendChild(pop);
    b.addEventListener("click", function () { var a = pop.hidden; pop.hidden = !a; b.setAttribute("aria-expanded", a); });
    document.addEventListener("click", function (e) { if (!pop.hidden && !pop.contains(e.target) && e.target !== b) { pop.hidden = true; b.setAttribute("aria-expanded", "false"); } });
    pop.addEventListener("change", function (e) {
      if (e.target.name === "reg") { pref.region = e.target.value; pref.moneda = P.regiones[pref.region].moneda; $("#selMon").value = pref.moneda; }
      if (e.target.id === "selMon") pref.moneda = e.target.value;
      guardarPref(); pintarPrecios();
    });
  })();

  /* ---------- Favoritos ---------- */
  var favs = (function () { try { return JSON.parse(ls.get("eterna.favs")) || []; } catch (e) { return []; } })();
  function esFav(id) { return favs.indexOf(id) >= 0; }
  function toggleFav(id) { var i = favs.indexOf(id); if (i >= 0) favs.splice(i, 1); else favs.push(id); ls.set("eterna.favs", JSON.stringify(favs)); }
  var corazon = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9-9.3C2 8 4 5.5 6.8 5.5c1.9 0 3.2 1 5.2 3 2-2 3.3-3 5.2-3 2.8 0 4.8 2.5 3.8 5.7-1.5 4.7-9 9.3-9 9.3z"/></svg>';

  /* ---------- Tarjetas ---------- */
  function tarjeta(f) {
    var desde = f.tipo === "savethedate" ? SD.con_tus_datos : PL[0].precio, fav = esFav(f.id);
    return '<article class="tarjeta"><button class="fav' + (fav ? " on" : "") + '" type="button" data-fav="' + f.id + '" aria-pressed="' + fav + '" aria-label="' + (fav ? "Quitar de favoritos: " : "Guardar en favoritos: ") + esc(f.nombre) + '">' + corazon + "</button>" +
      '<a class="enlace-t" href="diseno.html?id=' + f.id + '"><span class="fondo">' + (f.nuevo ? '<span class="nuevo">NUEVO</span>' : "") +
      '<span class="tel mini"><span class="pantalla"><img loading="lazy" alt="Vista previa del diseño ' + esc(f.nombre) + '" src="miniaturas/' + f.id + '-card.webp" width="390" height="844"></span></span></span>' +
      "<h3>" + esc(f.nombre) + '</h3><p class="frase">' + esc(f.frase) + '</p><p class="precio">Desde <span data-usd="' + desde + '"></span></p></a></article>';
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-fav]"); if (!b) return; e.preventDefault();
    toggleFav(b.getAttribute("data-fav")); var on = esFav(b.getAttribute("data-fav")); b.classList.toggle("on", on); b.setAttribute("aria-pressed", on);
    if (pagina === "inicio" && actual === "♥ Favoritos") pintarInicio();
  });

  /* ---------- Pedido: lleva a la pantalla de 3 pasos ---------- */
  var fmtActual = null;
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-pedido]"); if (!b) return; e.preventDefault();
    var q = []; var f = b.getAttribute("data-fmt") || (fmtActual && fmtActual.id); if (f) q.push("f=" + f); if (b.getAttribute("data-plan")) q.push("p=" + b.getAttribute("data-plan"));
    location.href = "pedido.html" + (q.length ? "?" + q.join("&") : "");
  });

  /* ---------- Inicio ---------- */
  var actual = "Todos", pintarInicio = function () {};
  if (pagina === "inicio") {
    var inv = F.filter(function (f) { return f.tipo === "invitacion"; }), sd = F.filter(function (f) { return f.tipo === "savethedate"; });
    $$("[data-usd-solo]").forEach(function (e) { e.setAttribute("data-usd", P.precioPlanificadorSolo); });
    $$("[data-desde]").forEach(function (e) { e.setAttribute("data-usd", PL[0].precio); }); $$("[data-desde-sd]").forEach(function (e) { e.setAttribute("data-usd", SD.con_tus_datos); });
    $("#tituloDisenos").textContent = inv.length + " diseños, todos hechos a tu medida";
    $("#heroFrame").src = "formatos/fotografico/index.html?carta=0"; $("#invFrame").src = "formatos/botanico/index.html?carta=0";
    var estilos = ["Todos"]; inv.forEach(function (f) { f.estilo.forEach(function (s) { if (estilos.indexOf(s) < 0) estilos.push(s); }); }); estilos.push("♥ Favoritos");
    var filtros = $("#filtros");
    pintarInicio = function () {
      filtros.innerHTML = estilos.map(function (s) { return '<button type="button" class="chip' + (s === actual ? " on" : "") + '" aria-pressed="' + (s === actual) + '" data-e="' + esc(s) + '">' + esc(s) + "</button>"; }).join("");
      var lista = inv.filter(function (f) { return actual === "Todos" ? true : actual === "♥ Favoritos" ? esFav(f.id) : f.estilo.indexOf(actual) >= 0; });
      $("#rejilla").innerHTML = lista.length ? lista.map(tarjeta).join("") : '<p class="vacio">Aún no tienes favoritos. Toca el corazón de un diseño para guardarlo aquí.</p>';
      pintarPrecios();
    };
    filtros.addEventListener("click", function (e) { var b = e.target.closest("[data-e]"); if (b) { actual = b.getAttribute("data-e"); pintarInicio(); } });
    pintarInicio(); $("#rejillaSd").innerHTML = sd.map(tarjeta).join("");
    var vent = $("#ventana"), pf = $("#planFrame"); if (pf) { pf.src = "planificador.html?demo=1&embed=1"; var esc2 = function () { pf.style.transform = "scale(" + (vent.clientWidth / 1120) + ")"; }; esc2(); window.addEventListener("resize", esc2); }
    $("#planes-lista").innerHTML = PL.map(function (p) {
      return '<article class="plan' + (p.recomendado ? " rec" : "") + '">' + (p.recomendado ? '<span class="cinta">La más elegida</span>' : "") + "<h3>" + esc(p.nombre) + '</h3><p class="lema">' + esc(p.lema) + '</p><p class="pr"><span data-usd="' + p.precio + '"></span><small>pago único</small></p>' +
        '<p class="meta">Lista en ' + esc(p.dias) + " · " + esc(p.cambios) + "</p><ul>" + p.incluye.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + '</ul><button class="btn ' + (p.recomendado ? "solid " : "") + 'ancho" type="button" data-pedido data-plan="' + p.id + '">Elegir ' + esc(p.nombre) + "</button></article>";
    }).join("");
    // Opiniones (solo si hay reales)
    var op = $("#opiniones"); if (op) { if (P.opiniones && P.opiniones.length) { op.hidden = false; $("#opLista").innerHTML = P.opiniones.map(function (o) { return "<blockquote><p>“" + esc(o.texto) + "”</p><footer>" + esc(o.nombre) + (o.fecha ? " · " + esc(o.fecha) : "") + "</footer></blockquote>"; }).join(""); } else op.hidden = true; }
    // Continuar donde lo dejaste
    var ult = ls.get("eterna.ultimo"), cont = ult && porId(ult), cerrado = false; try { cerrado = sessionStorage.getItem("contX") === "1"; } catch (e) {}
    if (cont && !cerrado) {
      var t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status");
      t.innerHTML = '<span>Continúa donde lo dejaste: <b>' + esc(cont.nombre) + '</b></span><a class="btn solid peq" href="diseno.html?id=' + cont.id + '">Reanudar</a><button type="button" aria-label="Cerrar" id="toastX">×</button>';
      document.body.appendChild(t); $("#toastX").addEventListener("click", function () { t.remove(); try { sessionStorage.setItem("contX", "1"); } catch (e) {} });
    }
    // Boletín
    var fb = $("#formBoletin"); if (fb) fb.addEventListener("submit", function (e) {
      e.preventDefault(); var em = $("#bolEmail").value.trim(), st = $("#bolEstado");
      if (!/^\S+@\S+\.\S+$/.test(em)) { st.className = "estado mal"; st.textContent = "Escribe un correo válido."; return; }
      if (!P.boletin) { st.className = "estado demo"; st.textContent = "Modo demostración: aún no hay un destino configurado, así que no se guardó tu correo."; return; }
      st.className = "estado"; st.textContent = "Enviando…";
      fetch(P.boletin, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ email: em, asunto: "Boletín " + P.marca }) })
        .then(function (r) { if (!r.ok) throw 0; st.className = "estado ok"; st.textContent = "¡Listo! Te avisaremos de los diseños nuevos."; fb.reset(); })
        .catch(function () { st.className = "estado mal"; st.textContent = "No se pudo suscribir. Inténtalo de nuevo."; });
    });
  }

  /* ---------- Ficha de diseño ---------- */
  if (pagina === "diseno") {
    var id = new URLSearchParams(location.search).get("id"), f = porId(id) || F[0]; fmtActual = f; ls.set("eterna.ultimo", f.id);
    var esSd = f.tipo === "savethedate", desde = esSd ? SD.con_tus_datos : PL[0].precio;
    document.title = f.nombre + " · " + P.marca; $("#migasNombre").textContent = f.nombre; if (esSd) { $("#migasTipo").textContent = "Save the Date"; $("#migasTipo").href = "index.html#savethedate"; $("#tipoEtiqueta").textContent = "Save the Date"; }
    $("#nombre").textContent = f.nombre; $("#frase").textContent = f.frase; $("#precio").setAttribute("data-usd", desde); $("#desc").textContent = f.desc;
    $("#subprecio").textContent = esSd ? "Pago único · con tus datos o a medida" : "Pago único · tres niveles de personalización";
    $("#barraTxt").innerHTML = esc(f.nombre) + ' · desde <span data-usd="' + desde + '"></span>';
    var fb2 = $("#favFicha"); if (fb2) { fb2.setAttribute("data-fav", f.id); fb2.innerHTML = corazon + "<span>Guardar</span>"; fb2.classList.toggle("on", esFav(f.id)); fb2.setAttribute("aria-pressed", esFav(f.id)); }
    var fr = $("#demoFrame"), url = "formatos/" + f.id + "/index.html"; fr.src = url;
    var minis = f.minis || [], tira = $("#tira"), btnVivo = $("#verEnVivo"), pant = $("#pantalla");
    tira.innerHTML = minis.map(function (m, i) { return '<button type="button" class="' + (i === 0 ? "on" : "") + '" data-i="' + i + '" aria-label="Ir a la sección ' + (i + 1) + '"><img loading="lazy" alt="" src="miniaturas/' + f.id + "-" + i + '.webp" width="46" height="100"></button>'; }).join("");
    function estatica(i) { var img = pant.querySelector("img.estatica"); if (!img) { img = document.createElement("img"); img.className = "estatica"; img.alt = "Sección " + (i + 1) + " de la invitación"; pant.appendChild(img); } img.src = "miniaturas/" + f.id + "-" + i + ".webp"; fr.style.visibility = "hidden"; btnVivo.hidden = false; }
    function vivo() { var img = pant.querySelector("img.estatica"); if (img) img.remove(); fr.style.visibility = ""; btnVivo.hidden = true; }
    tira.addEventListener("click", function (e) {
      var b = e.target.closest("[data-i]"); if (!b) return; var i = +b.getAttribute("data-i"), m = minis[i] || {};
      $$("button", tira).forEach(function (x) { x.classList.toggle("on", x === b); }); vivo();
      try { if (f.id === "historia") { estatica(i); return; } if (m.splash) { fr.src = url + (url.indexOf("?") < 0 ? "?" : "&") + "r=" + Date.now(); return; } fr.contentWindow.scrollTo({ top: m.y || 0, behavior: "smooth" }); } catch (err) { estatica(i); }
    });
    btnVivo.addEventListener("click", function () { vivo(); fr.src = url; });
    var secciones = esSd ? ["Tu foto con la lámina o el cartel", "Cuenta atrás hasta la fecha", "Botón para añadir al calendario"] : ["Apertura de carta con música", "Portada con tus nombres y la fecha", "Cuenta atrás", "Ceremonia y recepción con mapa", "Programa del día", "Confirmación de asistencia", "Añadir al calendario"];
    var paneles = {
      quien: [["Hecha por nuestro equipo", "Personalizamos el diseño con tus datos, tus fotos y tu estilo."], ["Cambios incluidos", "Verás un borrador privado y podrás pedir los cambios antes de compartirla."], ["A tu ritmo", "Nos mandas los datos y las fotos cuando quieras, después de reservar."], ["Pago único", "Sin suscripciones. Un enlace listo para compartir por WhatsApp."]],
      secciones: secciones.map(function (s) { return [s, ""]; }).concat(f.incluye.slice(0, 2).map(function (s) { return [s, "Incluido en este diseño"]; })),
      incluye: f.incluye.map(function (s) { return [s, ""]; }).concat([["Planificador de boda gratis", "Lista de invitados, presupuesto y tareas."], ["Enlace privado para compartir", "No aparece en buscadores."]])
    };
    function panel(k) { $("#panel").innerHTML = paneles[k].map(function (r) { return "<li><strong>" + esc(r[0]) + "</strong>" + (r[1] ? "<span>" + esc(r[1]) + "</span>" : "") + "</li>"; }).join(""); }
    panel("quien");
    $("#pestanas").addEventListener("click", function (e) { var b = e.target.closest("[data-p]"); if (!b) return; $$("button", $("#pestanas")).forEach(function (x) { x.classList.toggle("on", x === b); }); panel(b.getAttribute("data-p")); });
    var rel = F.filter(function (x) { return x.id !== f.id && x.tipo === f.tipo; }); if (rel.length < 4) rel = rel.concat(F.filter(function (x) { return x.id !== f.id && x.tipo !== f.tipo; }));
    $("#relacionados").innerHTML = rel.slice(0, 4).map(tarjeta).join("");
  }
  pintarPrecios();
})();
