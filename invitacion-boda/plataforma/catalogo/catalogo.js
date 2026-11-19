(function () {
  var P = window.PLATAFORMA, F = window.FORMATOS;
  var $ = function (s) { return document.querySelector(s); };
  var wa = function (t) { return P.whatsapp ? "https://wa.me/" + P.whatsapp + "?text=" + encodeURIComponent(t) : "mailto:" + P.email + "?body=" + encodeURIComponent(t); };
  document.querySelectorAll("[data-marca]").forEach(function (e) { e.textContent = P.marca; });
  document.title = P.marca + " · Invitaciones de boda digitales";
  $("#cabWa").href = wa("¡Hola! Quiero información sobre las invitaciones de boda digitales.");
  var url = function (id) { return "formatos/" + id + "/index.html"; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

  document.querySelectorAll(".pila iframe").forEach(function (f) { f.src = url(f.getAttribute("data-fmt")); });

  var estilos = ["Todos"]; F.forEach(function (f) { f.estilo.forEach(function (e) { if (estilos.indexOf(e) < 0) estilos.push(e); }); });
  var filtros = $("#filtros"), actual = "Todos";
  function pintarFiltros() { filtros.innerHTML = estilos.map(function (e) { return '<button type="button" class="chip' + (e === actual ? " on" : "") + '" aria-pressed="' + (e === actual) + '" data-e="' + esc(e) + '">' + esc(e) + "</button>"; }).join(""); }
  function pintar() {
    $("#rejilla").innerHTML = F.filter(function (f) { return actual === "Todos" || f.estilo.indexOf(actual) >= 0; }).map(function (f) {
      return '<article class="tarjeta" data-id="' + f.id + '">' +
        '<button class="vista" type="button" data-ver="' + f.id + '" aria-label="Ver la demostración de ' + esc(f.nombre) + '"><span class="tel mini"><iframe tabindex="-1" loading="lazy" title="" src="' + url(f.id) + '"></iframe></span></button>' +
        "<h3>" + esc(f.nombre) + "</h3>" +
        '<p class="tags">' + f.estilo.map(function (e) { return "<span>" + esc(e) + "</span>"; }).join("") + "</p>" +
        '<p class="pal" aria-hidden="true">' + f.paleta.map(function (c) { return '<i style="background:' + c + '"></i>'; }).join("") + "</p>" +
        "<p>" + esc(f.desc) + "</p>" +
        '<div class="acciones"><button class="btn peq" type="button" data-ver="' + f.id + '">Ver demostración</button><a class="btn solid peq" target="_blank" rel="noopener" href="' + wa("¡Hola! Quiero la invitación en el formato «" + f.nombre + "».") + '">Elegir</a></div></article>';
    }).join("");
  }
  filtros.addEventListener("click", function (e) { var b = e.target.closest("[data-e]"); if (!b) return; actual = b.getAttribute("data-e"); pintarFiltros(); pintar(); });
  pintarFiltros(); pintar();

  var modal = $("#modal");
  function abrir(id) {
    var f = F.filter(function (x) { return x.id === id; })[0]; if (!f) return;
    $("#modalT").textContent = f.nombre; $("#modalDesc").textContent = f.desc;
    $("#modalInc").innerHTML = f.incluye.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("");
    $("#modalNota").textContent = f.nota || ""; $("#modalFrame").src = url(id);
    $("#modalElegir").href = wa("¡Hola! Quiero la invitación en el formato «" + f.nombre + "»."); $("#modalAbrir").href = url(id);
    if (modal.showModal) modal.showModal(); else modal.setAttribute("open", "");
  }
  document.addEventListener("click", function (e) { var b = e.target.closest("[data-ver]"); if (b) abrir(b.getAttribute("data-ver")); });
  function cerrar() { $("#modalFrame").src = "about:blank"; if (modal.close) modal.close(); else modal.removeAttribute("open"); }
  $("#cierra").addEventListener("click", cerrar);
  modal.addEventListener("click", function (e) { if (e.target === modal) cerrar(); });
  modal.addEventListener("cancel", function () { $("#modalFrame").src = "about:blank"; });
})();
