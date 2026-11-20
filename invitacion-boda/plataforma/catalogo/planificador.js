/* Planificador de boda: invitados, presupuesto y tareas. Todo se guarda en este navegador (sin cuenta). */
(function () {
  "use strict";
  var P = window.PLATAFORMA || { marca: "Eterna", monedas: { USD: { simbolo: "US$" } } };
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var q = new URLSearchParams(location.search), DEMO = q.get("demo") === "1", EMBED = q.get("embed") === "1";
  var KEY = DEMO ? "eterna.plan.demo" : "eterna.plan.v1", vista = "resumen", filtro = "todos", busca = "";
  $$("[data-marca]").forEach(function (e) { e.textContent = P.marca; });
  if (EMBED) { var v = $("#volver"); if (v) v.hidden = true; }

  var ls = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  var S = null; try { S = JSON.parse(ls.get(KEY)); } catch (e) {}
  var uid = function () { return Math.random().toString(36).slice(2, 9); };
  function guardar() { ls.set(KEY, JSON.stringify(S)); }
  function sim() { var m = (P.monedas || {})[S && S.moneda]; return m ? m.simbolo : "US$"; }
  function money(n) { return sim() + (Math.round(+n || 0)).toLocaleString("es-ES").replace(/ /g, "."); }

  /* ---------- datos de partida ---------- */
  var TAREAS = [[12, "Fijar la fecha y el presupuesto total"], [12, "Elegir el lugar de la ceremonia y de la recepción"], [11, "Hacer la primera lista de invitados"], [10, "Contratar fotógrafo y video"], [10, "Elegir el catering o el menú"], [9, "Reservar la música (DJ o banda)"], [9, "Pedir tu invitación digital y el Save the Date"], [8, "Elegir el vestido y el traje"], [8, "Reservar el alojamiento para los invitados de fuera"], [6, "Enviar el Save the Date"], [6, "Elegir flores y decoración"], [5, "Contratar el transporte"], [4, "Probar maquillaje y peinado"], [4, "Encargar los anillos"], [3, "Enviar la invitación digital"], [3, "Preparar la lista de canciones"], [2, "Cerrar el menú y las alergias de los invitados"], [2, "Confirmar con todos los proveedores"], [1, "Cerrar la lista final de confirmados"], [1, "Organizar las mesas"], [0.25, "Última prueba de vestido y traje"], [0.1, "Preparar el kit del día de la boda"]];
  var CATS = ["Lugar", "Comida y bebida", "Fotografía y video", "Música", "Vestuario", "Flores y decoración", "Invitaciones", "Transporte", "Otros"];
  function tareasBase() { return TAREAS.map(function (t) { return { id: uid(), meses: t[0], texto: t[1], hecho: false }; }); }
  function ejemplo() {
    var f = new Date(); f.setMonth(f.getMonth() + 8); var iso = f.toISOString().slice(0, 10);
    var inv = [["Familia Pérez", 4, "confirmado"], ["María López", 2, "confirmado"], ["Carlos y Ana", 2, "pendiente"], ["Tía Rosa", 1, "confirmado"], ["Javier Ruiz", 1, "no"], ["Laura y Pablo", 2, "confirmado"], ["Familia Gómez", 5, "pendiente"], ["Sofía Díaz", 1, "pendiente"], ["Andrés Torres", 2, "confirmado"], ["Elena Marín", 2, "pendiente"]];
    var pr = [["Lugar y salón", "Lugar", 4500, 4500, 2000], ["Catering", "Comida y bebida", 6000, 0, 0], ["Fotografía y video", "Fotografía y video", 1800, 1800, 900], ["DJ", "Música", 700, 0, 0], ["Vestido y traje", "Vestuario", 1500, 1350, 1350], ["Flores", "Flores y decoración", 800, 0, 0], ["Invitación digital", "Invitaciones", 399, 399, 399]];
    var t = tareasBase(); [0, 1, 2, 3].forEach(function (i) { t[i].hecho = true; });
    return { nombres: "Valentina y Sebastián", fecha: iso, moneda: "USD", urlBase: "", presupuestoTotal: 16000,
      invitados: inv.map(function (x) { return { id: uid(), nombre: x[0], personas: x[1], estado: x[2], notas: "" }; }),
      gastos: pr.map(function (x) { return { id: uid(), concepto: x[0], cat: x[1], est: x[2], real: x[3], pagado: x[4] }; }), tareas: t };
  }
  function nuevo(nombres, fecha) { return { nombres: nombres, fecha: fecha, moneda: "USD", urlBase: "", presupuestoTotal: 0, invitados: [], gastos: [], tareas: tareasBase() }; }
  if (DEMO && !S) { S = ejemplo(); guardar(); }

  /* ---------- cálculos ---------- */
  function dias() { if (!S.fecha) return null; var a = new Date(S.fecha + "T12:00:00"), n = new Date(); n.setHours(12, 0, 0, 0); return Math.round((a - n) / 864e5); }
  function personas(est) { return S.invitados.filter(function (i) { return !est || i.estado === est; }).reduce(function (a, i) { return a + (+i.personas || 0); }, 0); }
  function sum(k) { return S.gastos.reduce(function (a, g) { return a + (+g[k] || 0); }, 0); }
  function vence(t) { if (!S.fecha) return null; var d = new Date(S.fecha + "T12:00:00"); d.setDate(d.getDate() - Math.round(t.meses * 30.4)); return d; }
  var fmtF = function (d) { return d ? new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" }).format(d) : ""; };
  function enlace(inv) { var b = (S.urlBase || "").trim(); if (!b) return ""; return b + (b.indexOf("?") < 0 ? "?" : "&") + "g=" + encodeURIComponent(inv.nombre) + "&n=" + (+inv.personas || 1); }

  /* ---------- vistas ---------- */
  function bienvenida() {
    $("#nav").hidden = true;
    $("#vista").innerHTML = '<div class="inicio-p"><h1>Planifica tu boda</h1><p class="p-sub">Invitados, presupuesto y tareas en un solo sitio. Se guarda en tu navegador, sin cuenta.</p><form id="fInicio" novalidate><div class="p-campo"><label for="iNom">Vuestros nombres</label><input id="iNom" placeholder="Ej.: Valentina y Sebastián"></div><div class="p-campo"><label for="iFec">Fecha de la boda</label><input id="iFec" type="date"></div><p class="peq-p" id="iErr" role="alert"></p><button class="btn solid grande ancho" type="submit">Empezar</button><button class="btn ancho" type="button" id="iEj">Ver con datos de ejemplo</button></form></div>';
    $("#fInicio").addEventListener("submit", function (e) { e.preventDefault(); var n = $("#iNom").value.trim(), f = $("#iFec").value; if (n.length < 3) { $("#iErr").textContent = "Escribe vuestros nombres."; return; } S = nuevo(n, f); guardar(); pintar(); });
    $("#iEj").addEventListener("click", function () { S = ejemplo(); guardar(); pintar(); });
  }
  function vResumen() {
    var d = dias(), conf = personas("confirmado"), tot = personas(), pend = S.invitados.filter(function (i) { return i.estado === "pendiente"; }).length;
    var est = sum("est"), pag = sum("pagado"), meta = +S.presupuestoTotal || est, hechas = S.tareas.filter(function (t) { return t.hecho; }).length, pt = S.tareas.length ? Math.round(hechas / S.tareas.length * 100) : 0;
    var prox = S.tareas.filter(function (t) { return !t.hecho; }).sort(function (a, b) { return b.meses - a.meses; }).slice(0, 4);
    return (DEMO ? '<p class="aviso-demo">Estás viendo datos de ejemplo. Lo que cambies aquí solo se guarda en este navegador.</p>' : "") +
      "<h1>" + esc(S.nombres) + '</h1><p class="p-sub">' + (d == null ? "Añade la fecha de la boda en Ajustes." : d > 0 ? "Faltan " + d + " días para la boda." : d === 0 ? "¡Hoy es el gran día!" : "La boda fue hace " + (-d) + " días.") + "</p>" +
      '<div class="tarjetas"><div class="kpi"><small>Invitados confirmados</small><b>' + conf + '</b><span>de ' + tot + " personas en total · " + pend + ' sin responder</span></div>' +
      '<div class="kpi"><small>Presupuesto pagado</small><b>' + money(pag) + '</b><span>de ' + money(meta) + ' previstos</span><div class="barra-p"><i style="width:' + Math.min(100, meta ? pag / meta * 100 : 0) + '%"></i></div></div>' +
      '<div class="kpi"><small>Tareas hechas</small><b>' + pt + ' %</b><span>' + hechas + " de " + S.tareas.length + '</span><div class="barra-p"><i style="width:' + pt + '%"></i></div></div></div>' +
      '<div class="panel"><h2>Lo que toca ahora</h2>' + (prox.length ? prox.map(function (t) { var v = vence(t); return '<div class="tarea"><div class="tx">' + esc(t.texto) + '<span class="cu' + (v && v < new Date() ? " venc" : "") + '">' + (v ? "Para el " + fmtF(v) : "") + "</span></div></div>"; }).join("") : '<p class="vacio-p">¡No te queda ninguna tarea pendiente!</p>') + "</div>";
  }
  function vInvitados() {
    var lista = S.invitados.filter(function (i) { return (filtro === "todos" || i.estado === filtro) && (!busca || i.nombre.toLowerCase().indexOf(busca.toLowerCase()) >= 0); });
    var chip = function (k, t) { return '<button type="button" class="chip' + (filtro === k ? " on" : "") + '" data-f="' + k + '">' + t + "</button>"; };
    return "<h1>Invitados</h1><p class=\"p-sub\">" + personas() + " personas · " + personas("confirmado") + " confirmadas · " + personas("pendiente") + " sin responder · " + personas("no") + " no vienen.</p>" +
      '<div class="panel"><h2>Añadir invitados</h2><form class="fila-add" id="fInv" novalidate><div class="p-campo"><label for="aNom">Nombre o familia</label><input id="aNom" autocomplete="off"></div><div class="p-campo"><label for="aPer">Personas</label><input id="aPer" type="number" min="1" max="20" value="1"></div><div class="p-campo"><label for="aNot">Notas (menú, alergias…)</label><input id="aNot"></div><button class="btn solid" type="submit">Añadir</button></form>' +
      '<details style="margin-top:12px"><summary style="cursor:pointer;font-size:14px">Añadir varios a la vez</summary><div class="p-campo" style="margin-top:8px"><label for="aVarios">Uno por línea. Opcional: nombre | personas</label><textarea id="aVarios" rows="4" placeholder="Familia Pérez | 4&#10;María López | 2"></textarea></div><button class="btn peq" type="button" id="bVarios" style="margin-top:8px">Añadir la lista</button></details></div>' +
      '<div class="panel"><h2>Enlaces con el nombre de cada invitado</h2><div class="p-campo"><label for="uBase">Enlace de tu invitación (cuando esté lista)</label><input id="uBase" value="' + esc(S.urlBase) + '" placeholder="https://tudominio.com/boda/"></div><p class="peq-p">Con ese enlace, cada invitado verá su nombre y los lugares reservados, y su confirmación saldrá ya rellenada.</p></div>' +
      '<div class="herr"><div class="chips">' + chip("todos", "Todos") + chip("pendiente", "Sin responder") + chip("confirmado", "Confirmados") + chip("no", "No vienen") + '</div><input id="busca" placeholder="Buscar…" value="' + esc(busca) + '" aria-label="Buscar invitado" style="margin-left:auto;padding:9px 14px;border:1.5px solid var(--linea);border-radius:999px;font:15px var(--f-texto)"><button class="ico-b" type="button" id="csv">Descargar CSV</button></div>' +
      (lista.length ? '<table class="tabla-p resp"><thead><tr><th>Invitado</th><th>Pers.</th><th>Estado</th><th></th></tr></thead><tbody>' + lista.map(function (i) {
        var link = enlace(i);
        return '<tr data-id="' + i.id + '"><td data-t="Invitado"><span class="nombre">' + esc(i.nombre) + "</span>" + (i.notas ? '<br><span class="peq-p">' + esc(i.notas) + "</span>" : "") + '</td><td data-t="Personas">' + (+i.personas || 1) + '</td><td data-t="Estado"><select class="est ' + i.estado + '" data-est aria-label="Estado de ' + esc(i.nombre) + '"><option value="pendiente"' + (i.estado === "pendiente" ? " selected" : "") + '>Sin responder</option><option value="confirmado"' + (i.estado === "confirmado" ? " selected" : "") + '>Confirmado</option><option value="no"' + (i.estado === "no" ? " selected" : "") + '>No viene</option></select></td><td><div class="acc-r">' +
          (link ? '<button class="ico-b" type="button" data-copiar="' + esc(link) + '">Copiar enlace</button><a class="ico-b" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent("¡Hola " + i.nombre + "! Te esperamos en nuestra boda 💍\n" + link) + '">WhatsApp</a>' : "") + '<button class="ico-b" type="button" data-borrar="' + i.id + '" aria-label="Quitar ' + esc(i.nombre) + '">✕</button></div></td></tr>';
      }).join("") + "</tbody></table>" : '<p class="vacio-p">' + (S.invitados.length ? "Ningún invitado coincide." : "Aún no hay invitados. Añade el primero arriba.") + "</p>");
  }
  function vPresupuesto() {
    var est = sum("est"), real = sum("real"), pag = sum("pagado"), meta = +S.presupuestoTotal || 0;
    var porCat = CATS.map(function (c) { return [c, S.gastos.filter(function (g) { return g.cat === c; }).reduce(function (a, g) { return a + (+g.real || +g.est || 0); }, 0)]; }).filter(function (x) { return x[1] > 0; });
    var mx = Math.max.apply(null, porCat.map(function (x) { return x[1]; }).concat([1]));
    return "<h1>Presupuesto</h1><p class=\"p-sub\">Estimado " + money(est) + " · Real " + money(real) + " · Pagado " + money(pag) + (meta ? " · Te quedan " + money(meta - (real || est)) + " de " + money(meta) : "") + ".</p>" +
      '<div class="panel"><h2>Añadir un gasto</h2><form class="fila-add pres" id="fGas" novalidate><div class="p-campo"><label for="gCon">Concepto</label><input id="gCon" autocomplete="off"></div><div class="p-campo"><label for="gCat">Categoría</label><select id="gCat">' + CATS.map(function (c) { return "<option>" + c + "</option>"; }).join("") + '</select></div><div class="p-campo"><label for="gEst">Estimado</label><input id="gEst" type="number" min="0" step="any"></div><div class="p-campo"><label for="gRea">Real</label><input id="gRea" type="number" min="0" step="any"></div><div class="p-campo"><label for="gPag">Pagado</label><input id="gPag" type="number" min="0" step="any"></div><button class="btn solid" type="submit">Añadir</button></form></div>' +
      '<div class="panel"><div class="p-campo" style="max-width:280px"><label for="pMeta">Presupuesto total previsto (' + esc(sim()) + ')</label><input id="pMeta" type="number" min="0" step="any" value="' + (meta || "") + '"></div></div>' +
      (S.gastos.length ? '<table class="tabla-p resp"><thead><tr><th>Concepto</th><th>Estimado</th><th>Real</th><th>Pagado</th><th></th></tr></thead><tbody>' + S.gastos.map(function (g) {
        return '<tr data-id="' + g.id + '"><td data-t="Concepto"><span class="nombre">' + esc(g.concepto) + '</span><br><span class="peq-p">' + esc(g.cat) + '</span></td><td data-t="Estimado"><input type="number" min="0" step="any" data-g="est" value="' + (g.est || "") + '" aria-label="Estimado de ' + esc(g.concepto) + '"></td><td data-t="Real"><input type="number" min="0" step="any" data-g="real" value="' + (g.real || "") + '" aria-label="Real de ' + esc(g.concepto) + '"></td><td data-t="Pagado"><input type="number" min="0" step="any" data-g="pagado" value="' + (g.pagado || "") + '" aria-label="Pagado de ' + esc(g.concepto) + '"></td><td><div class="acc-r"><button class="ico-b" type="button" data-borrar="' + g.id + '" aria-label="Quitar ' + esc(g.concepto) + '">✕</button></div></td></tr>';
      }).join("") + "</tbody></table>" : '<p class="vacio-p">Aún no hay gastos. Añade el primero arriba.</p>') +
      (porCat.length ? '<div class="panel" style="margin-top:20px"><h2>Por categoría</h2>' + porCat.map(function (x) { return '<div class="cat-barra"><span>' + esc(x[0]) + '</span><div class="barra-p"><i style="width:' + (x[1] / mx * 100) + '%"></i></div><span>' + money(x[1]) + "</span></div>"; }).join("") + "</div>" : "");
  }
  function vTareas() {
    var lista = S.tareas.slice().sort(function (a, b) { return b.meses - a.meses; }), h = S.tareas.filter(function (t) { return t.hecho; }).length;
    return "<h1>Tareas</h1><p class=\"p-sub\">" + h + " de " + S.tareas.length + ' hechas. Las fechas se calculan a partir del día de tu boda.</p><div class="barra-p" style="margin-bottom:20px"><i style="width:' + (S.tareas.length ? h / S.tareas.length * 100 : 0) + '%"></i></div>' +
      '<form class="panel fila-add" id="fTar" style="grid-template-columns:1fr auto" novalidate><div class="p-campo"><label for="tTxt">Añadir una tarea</label><input id="tTxt" autocomplete="off"></div><button class="btn solid" type="submit">Añadir</button></form>' +
      '<div class="panel">' + lista.map(function (t) { var v = vence(t); return '<label class="tarea' + (t.hecho ? " hecha" : "") + '"><input type="checkbox" data-tarea="' + t.id + '"' + (t.hecho ? " checked" : "") + '><span class="tx">' + esc(t.texto) + '<span class="cu' + (!t.hecho && v && v < new Date() ? " venc" : "") + '">' + (v ? "Para el " + fmtF(v) : "") + "</span></span></label>"; }).join("") + "</div>";
  }
  function vAjustes() {
    var mon = Object.keys(P.monedas || { USD: 1 });
    return "<h1>Ajustes</h1>" + (DEMO ? '<p class="aviso-demo">Datos de ejemplo. Para usar tu propio planificador abre <a href="planificador.html">planificador.html</a> sin “demo”.</p>' : "") +
      '<div class="panel"><h2>Tu boda</h2><div class="p-campo" style="margin-bottom:10px"><label for="sNom">Nombres</label><input id="sNom" value="' + esc(S.nombres) + '"></div><div class="p-campo" style="margin-bottom:10px"><label for="sFec">Fecha</label><input id="sFec" type="date" value="' + esc(S.fecha) + '"></div><div class="p-campo"><label for="sMon">Moneda del presupuesto</label><select id="sMon">' + mon.map(function (m) { return '<option value="' + m + '"' + (S.moneda === m ? " selected" : "") + ">" + m + " (" + esc(((P.monedas || {})[m] || {}).simbolo || m) + ")</option>"; }).join("") + "</select></div></div>" +
      '<div class="panel"><h2>Tus datos</h2><p class="peq-p">Todo se guarda solo en este navegador. Haz una copia para no perderlo o para pasarlo a otro dispositivo.</p><div class="herr"><button class="btn" type="button" id="exp">Descargar copia (JSON)</button><label class="btn" style="cursor:pointer">Importar copia<input type="file" id="imp" accept="application/json,.json" hidden></label><button class="btn" type="button" id="reset">Borrar todo</button></div><p class="peq-p" id="msgAj" role="status"></p></div>';
  }
  var VISTAS = { resumen: vResumen, invitados: vInvitados, presupuesto: vPresupuesto, tareas: vTareas, ajustes: vAjustes };
  function pintar(foco) {
    if (!S) return bienvenida();
    $("#nav").hidden = false; $$("#nav button").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-v") === vista); });
    var y = window.scrollY; $("#vista").innerHTML = VISTAS[vista](); if (foco) { var e = $(foco); if (e) e.focus(); } window.scrollTo(0, y);
  }

  /* ---------- eventos ---------- */
  $("#nav").addEventListener("click", function (e) { var b = e.target.closest("[data-v]"); if (b) { vista = b.getAttribute("data-v"); pintar(); window.scrollTo(0, 0); } });
  var main = $("#vista");
  main.addEventListener("submit", function (e) {
    e.preventDefault(); var f = e.target.id;
    if (f === "fInv") { var n = $("#aNom").value.trim(); if (!n) { $("#aNom").focus(); return; } S.invitados.push({ id: uid(), nombre: n, personas: Math.max(1, +$("#aPer").value || 1), estado: "pendiente", notas: $("#aNot").value.trim() }); guardar(); pintar("#aNom"); }
    if (f === "fGas") { var c = $("#gCon").value.trim(); if (!c) { $("#gCon").focus(); return; } S.gastos.push({ id: uid(), concepto: c, cat: $("#gCat").value, est: +$("#gEst").value || 0, real: +$("#gRea").value || 0, pagado: +$("#gPag").value || 0 }); guardar(); pintar("#gCon"); }
    if (f === "fTar") { var t = $("#tTxt").value.trim(); if (!t) { $("#tTxt").focus(); return; } S.tareas.push({ id: uid(), meses: 1, texto: t, hecho: false }); guardar(); pintar("#tTxt"); }
  });
  main.addEventListener("click", function (e) {
    var t = e.target;
    var fb = t.closest("[data-f]"); if (fb) { filtro = fb.getAttribute("data-f"); pintar(); return; }
    var bo = t.closest("[data-borrar]"); if (bo) { var id = bo.getAttribute("data-borrar"); S.invitados = S.invitados.filter(function (x) { return x.id !== id; }); S.gastos = S.gastos.filter(function (x) { return x.id !== id; }); guardar(); pintar(); return; }
    var co = t.closest("[data-copiar]"); if (co) { var u = co.getAttribute("data-copiar"); if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(u).then(function () { co.textContent = "¡Copiado!"; setTimeout(function () { co.textContent = "Copiar enlace"; }, 1500); }, function () { co.textContent = "No se pudo"; }); return; }
    if (t.id === "bVarios") { var lines = $("#aVarios").value.split("\n").map(function (l) { return l.trim(); }).filter(Boolean); lines.forEach(function (l) { var p = l.split("|"); S.invitados.push({ id: uid(), nombre: p[0].trim(), personas: Math.max(1, parseInt(p[1], 10) || 1), estado: "pendiente", notas: "" }); }); if (lines.length) { guardar(); pintar(); } return; }
    if (t.id === "csv") { var fila = function (a) { return a.map(function (x) { return '"' + String(x).replace(/"/g, '""') + '"'; }).join(","); }; var csv = [fila(["Invitado", "Personas", "Estado", "Notas", "Enlace"])].concat(S.invitados.map(function (i) { return fila([i.nombre, i.personas, i.estado, i.notas, enlace(i)]); })).join("\n"); descargar("invitados.csv", "text/csv;charset=utf-8", "﻿" + csv); return; }
    if (t.id === "exp") { descargar("planificador-boda.json", "application/json", JSON.stringify(S, null, 2)); return; }
    if (t.id === "reset") { if (t.getAttribute("data-seguro")) { S = null; try { localStorage.removeItem(KEY); } catch (er) {} vista = "resumen"; pintar(); } else { t.setAttribute("data-seguro", "1"); t.textContent = "Pulsa otra vez para borrar todo"; setTimeout(function () { t.removeAttribute("data-seguro"); t.textContent = "Borrar todo"; }, 4000); } }
  });
  main.addEventListener("change", function (e) {
    var t = e.target, tr = t.closest("tr"), id = tr && tr.getAttribute("data-id");
    if (t.hasAttribute("data-est")) { S.invitados.forEach(function (i) { if (i.id === id) i.estado = t.value; }); guardar(); pintar(); return; }
    if (t.hasAttribute("data-g")) { S.gastos.forEach(function (g) { if (g.id === id) g[t.getAttribute("data-g")] = +t.value || 0; }); guardar(); pintar(); return; }
    if (t.hasAttribute("data-tarea")) { S.tareas.forEach(function (x) { if (x.id === t.getAttribute("data-tarea")) x.hecho = t.checked; }); guardar(); pintar(); return; }
    if (t.id === "pMeta") { S.presupuestoTotal = +t.value || 0; guardar(); pintar(); }
    if (t.id === "uBase") { S.urlBase = t.value.trim(); guardar(); pintar("#uBase"); }
    if (t.id === "sNom") { S.nombres = t.value.trim() || S.nombres; guardar(); }
    if (t.id === "sFec") { S.fecha = t.value; guardar(); }
    if (t.id === "sMon") { S.moneda = t.value; guardar(); }
    if (t.id === "imp") { var fl = t.files[0]; if (!fl) return; var r = new FileReader(); r.onload = function () { try { var d = JSON.parse(r.result); if (!d || !d.invitados || !d.gastos || !d.tareas) throw 0; S = d; guardar(); vista = "resumen"; pintar(); } catch (er) { $("#msgAj").textContent = "Ese archivo no es una copia válida."; } }; r.readAsText(fl); }
  });
  main.addEventListener("input", function (e) { if (e.target.id === "busca") { busca = e.target.value; var pos = e.target.selectionStart; pintar("#busca"); var b = $("#busca"); if (b) b.setSelectionRange(pos, pos); } });
  function descargar(nombre, tipo, texto) { var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([texto], { type: tipo })); a.download = nombre; document.body.appendChild(a); a.click(); a.remove(); }
  pintar();
})();
