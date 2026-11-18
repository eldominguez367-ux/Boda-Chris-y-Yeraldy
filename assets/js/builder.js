/* Editor de invitaciones con vista previa en vivo */
(function () {
  const C = window.SITE_CONFIG;
  const t = (k, v) => I18n.t(k, v);
  const $ = s => document.querySelector(s);
  const form = $("#bForm");
  const qs = new URLSearchParams(location.search);
  const ADMIN = qs.get("admin") === "1";
  const DRAFT_KEY = "invite_draft_v1";
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const baseUrl = new URL("invitacion.html", location.href).href;
  let theme = "classic", currentLink = "";

  document.querySelectorAll("[data-brand]").forEach(el => el.textContent = C.brand);
  if (ADMIN) document.querySelectorAll(".admin-only").forEach(el => el.classList.remove("hidden"));

  // Resuelve las claves @ del demo al idioma actual para que el usuario edite texto real
  const resolve = v => typeof v === "string" ? v.replace(/@([a-z0-9_]+)/g, (m, k) => t(k)) : v;

  function fill(d) {
    theme = THEMES[d.theme] ? d.theme : "classic";
    form.querySelectorAll("input[name],textarea[name],select[name]").forEach(el => {
      const [a, b] = el.name.split(".");
      const v = b ? (d[a] || {})[b] : d[a];
      el.value = resolve(v == null ? "" : v);
    });
    $("#bLang").value = d.lang || I18n.lang;
    renderThemes();
  }

  function collect() {
    const d = { v: 1, theme, lang: $("#bLang").value };
    form.querySelectorAll("input[name],textarea[name]").forEach(el => {
      const [a, b] = el.name.split(".");
      const v = el.value.trim();
      if (b) { d[a] = d[a] || {}; d[a][b] = v; } else d[a] = v;
    });
    d.time = (d.cer && d.cer.time) || "";
    return InvData.clean(d);
  }

  function renderThemes() {
    $("#themePick").innerHTML = Object.keys(THEMES).map(k => `
      <label class="tp ${k === theme ? "on" : ""}">
        <input type="radio" name="themeRadio" value="${k}" ${k === theme ? "checked" : ""}>
        <span class="tp-sw">${THEMES[k].swatch.map(c => `<i style="background:${c}"></i>`).join("")}</span>
        <span>${esc(t("theme_" + k))}</span>
      </label>`).join("");
    document.querySelectorAll("input[name=themeRadio]").forEach(r => r.addEventListener("change", () => { theme = r.value; renderThemes(); update(); }));
  }

  let deb;
  function update() {
    clearTimeout(deb);
    deb = setTimeout(() => {
      const d = collect();
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch (e) {}
      const hash = "#d=" + InvData.enc(d);
      currentLink = baseUrl + hash;
      const frame = $("#preview");
      const src = "invitacion.html?preview=1" + hash;
      if (!frame.getAttribute("src")) frame.setAttribute("src", src);
      else try { frame.contentWindow.location.hash = hash.slice(1); } catch (e) { frame.setAttribute("src", src); }
      if (!$("#linkBox").classList.contains("hidden")) showLink();
    }, 250);
  }

  function showLink() {
    $("#linkBox").classList.remove("hidden");
    $("#linkOut").value = currentLink;
    $("#openLink").href = currentLink;
    const d = collect();
    $("#shareWa").href = "https://wa.me/?text=" + encodeURIComponent(`💍 ${d.n1 || ""} & ${d.n2 || ""}\n${t("inv_invite")}\n${currentLink}`);
    $("#qrBox").classList.add("hidden");
  }

  function copy(text, btn) {
    const done = () => { const o = btn.textContent; btn.textContent = t("b_copied"); setTimeout(() => btn.textContent = o, 1500); };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done);
    else { const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); done(); }
  }

  function makeQr() {
    const box = $("#qrBox");
    box.classList.remove("hidden");
    box.innerHTML = "";
    const draw = () => {
      if (window.QRCode) { new QRCode(box, { text: currentLink, width: 220, height: 220, correctLevel: QRCode.CorrectLevel.L }); }
      else box.innerHTML = `<img alt="QR" width="220" height="220" src="https://api.qrserver.com/v1/create-qr-code/?size=440x440&data=${encodeURIComponent(currentLink)}">`;
    };
    if (window.QRCode) return draw();
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
    s.onload = draw; s.onerror = draw;
    document.head.appendChild(s);
  }

  function guestLinks() {
    const hash = currentLink.slice(currentLink.indexOf("#"));
    const lines = $("#guestList").value.split("\n").map(l => l.trim()).filter(Boolean);
    $("#guestLinks").innerHTML = lines.map((l, i) => {
      const [name, seats] = l.split("|").map(s => s.trim());
      const n = parseInt(seats, 10);
      const url = baseUrl + "?g=" + encodeURIComponent(name) + (n ? "&n=" + n : "") + hash;
      const wa = "https://wa.me/?text=" + encodeURIComponent(`${t("inv_dear", { name })} 💍\n${t("inv_invite")}\n${url}`);
      return `<li><span>${esc(name)}${n ? ` · ${n}` : ""}</span><button class="btn btn-line btn-sm" data-copy="${i}">${esc(t("b_copy"))}</button><a class="btn btn-wa btn-sm" target="_blank" rel="noopener" href="${esc(wa)}">WhatsApp</a><input type="hidden" value="${esc(url)}"></li>`;
    }).join("");
    $("#guestLinks").querySelectorAll("[data-copy]").forEach(b => b.addEventListener("click", () => copy(b.parentElement.querySelector("input").value, b)));
  }

  function loadFrom(str) {
    const m = String(str).match(/[#&]d=([A-Za-z0-9_-]+)/);
    if (!m) return false;
    try { fill(InvData.dec(m[1])); update(); return true; } catch (e) { return false; }
  }

  // Eventos
  form.addEventListener("input", update);
  form.addEventListener("change", update);
  form.addEventListener("submit", e => e.preventDefault());
  $("#genBtn").addEventListener("click", () => { update(); setTimeout(() => { showLink(); $("#linkBox").scrollIntoView({ behavior: "smooth", block: "center" }); }, 300); });
  $("#copyBtn").addEventListener("click", e => copy(currentLink, e.target));
  $("#qrBtn").addEventListener("click", makeQr);
  $("#makeGuests").addEventListener("click", guestLinks);
  $("#orderBtn").addEventListener("click", () => {
    update();
    setTimeout(() => {
      const msg = `${t("b_wa_order")}\n${currentLink}`;
      window.open(C.whatsapp ? `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(msg)}` : `mailto:${C.email}?body=${encodeURIComponent(msg)}`, "_blank");
    }, 300);
  });
  $("#loadBtn").addEventListener("click", () => { if (!loadFrom($("#loadIn").value)) $("#loadIn").classList.add("err"); });
  $("#resetBtn").addEventListener("click", () => { try { localStorage.removeItem(DRAFT_KEY); } catch (e) {} fill(DEMOS[theme] || DEMOS.classic); update(); });
  $("#jsonBtn").addEventListener("click", () => {
    const d = collect();
    const slug = ((d.n1 || "") + "-" + (d.n2 || "")).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9-]+/g, "") || "boda";
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(d, null, 2)], { type: "application/json" }));
    a.download = slug + ".json"; a.click();
  });

  // Idioma
  const bLang = $("#bLang");
  bLang.innerHTML = LANGS.map(l => `<option value="${l.code}">${l.flag} ${l.name}</option>`).join("");
  I18n.select($("#lang"));
  document.addEventListener("langchange", () => { renderThemes(); document.title = `${t("b_title")} · ${C.brand}`; });
  I18n.set(I18n.detect());

  // Estado inicial: ?theme= / borrador guardado / demo
  let draft = null;
  try { draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null"); } catch (e) {}
  if (location.hash.includes("d=") && loadFrom(location.hash)) { /* cargado */ }
  else {
    const start = draft || JSON.parse(JSON.stringify(DEMOS[qs.get("theme")] || DEMOS.classic));
    if (qs.get("theme") && THEMES[qs.get("theme")]) start.theme = qs.get("theme");
    fill(start);
    update();
  }
})();
