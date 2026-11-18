/* Lógica de la página de ventas */
(function () {
  const C = window.SITE_CONFIG;
  const t = (k, v) => I18n.t(k, v);
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const waLink = text => C.whatsapp ? `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(text)}` : `mailto:${C.email}?body=${encodeURIComponent(text)}`;

  const FEAT_ICONS = [
    '<path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/>',
    '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/>',
    '<path d="M12 22s7-7.5 7-13a7 7 0 10-14 0c0 5.5 7 13 7 13z"/><circle cx="12" cy="9" r="2.5"/>',
    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
    '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    '<rect x="3" y="9" width="18" height="12" rx="1"/><path d="M2 6h20v3H2zM12 6v15M12 6C10 2 6 3 7 5.5 7.7 7 12 6 12 6zm0 0c2-4 6-3 5-.5C16.3 7 12 6 12 6z"/>',
    '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M12 13v5M9.5 15.5h5"/>',
    '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>'
  ];
  const THEME_KEYS = Object.keys(THEMES);

  function renderFeatures() {
    $("#features").innerHTML = FEAT_ICONS.map((ic, i) => `
      <div class="feature">
        <div class="f-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${ic}</svg></div>
        <h3>${esc(t("f" + (i + 1) + "_t"))}</h3><p>${esc(t("f" + (i + 1) + "_d"))}</p>
      </div>`).join("");
  }

  let tplRendered = false;
  function renderTemplates() {
    const lang = I18n.lang;
    if (!tplRendered) {
      $("#templates").innerHTML = THEME_KEYS.map(k => `
        <article class="tpl">
          <div class="phone phone-sm"><iframe data-theme-key="${k}" title="${k}" loading="lazy" tabindex="-1"></iframe></div>
          <h3 data-i18n="theme_${k}"></h3>
          <div class="swatches">${THEMES[k].swatch.map(c => `<i style="background:${c}"></i>`).join("")}</div>
          <div class="tpl-actions">
            <a class="btn btn-line btn-sm" href="invitacion.html?demo=${k}" target="_blank" rel="noopener" data-i18n="tpl_demo"></a>
            <a class="btn btn-dark btn-sm" href="crear.html?theme=${k}" data-i18n="tpl_use"></a>
          </div>
        </article>`).join("");
      tplRendered = true;
    }
    document.querySelectorAll("#templates iframe").forEach(f => {
      const src = `invitacion.html?demo=${f.dataset.themeKey}&embed=1&lang=${lang}`;
      if (!f.src.endsWith(src)) f.src = src;
    });
    I18n.apply($("#templates"));
  }

  function renderPlans() {
    $("#plans").innerHTML = C.plans.map(p => `
      <div class="plan ${p.popular ? "popular" : ""}">
        ${p.popular ? `<span class="ribbon">${esc(t("plan_popular"))}</span>` : ""}
        <h3>${esc(t("plan_" + p.id))}</h3>
        <p class="plan-d">${esc(t("plan_" + p.id + "_d"))}</p>
        <div class="price">${p.oldPrice ? `<s>${esc(C.currencySymbol)}${p.oldPrice}</s>` : ""}<b>${esc(C.currencySymbol)}${p.price}</b><small>${esc(t("plan_once"))}</small></div>
        <ul>${p.features.map(f => `<li>${esc(t(f))}</li>`).join("")}</ul>
        <a class="btn ${p.popular ? "btn-gold" : "btn-dark"} btn-block" href="#pedido" data-plan="${p.id}">${esc(t("plan_cta"))}</a>
      </div>`).join("");
    document.querySelectorAll("[data-plan]").forEach(a => a.addEventListener("click", () => { $("#oPlan").value = a.dataset.plan; }));
  }

  function renderFaq() {
    $("#faqList").innerHTML = [1, 2, 3, 4, 5, 6].map(i => `
      <details><summary>${esc(t("q" + i))}</summary><p>${esc(t("a" + i))}</p></details>`).join("");
  }

  function renderOrderSelects() {
    const tplSel = $("#oTpl"), planSel = $("#oPlan");
    const tv = tplSel.value, pv = planSel.value;
    tplSel.innerHTML = THEME_KEYS.map(k => `<option value="${k}">${esc(t("theme_" + k))}</option>`).join("");
    planSel.innerHTML = C.plans.map(p => `<option value="${p.id}">${esc(t("plan_" + p.id))} — ${esc(C.currencySymbol)}${p.price}</option>`).join("");
    if (tv) tplSel.value = tv;
    planSel.value = pv || (C.plans.find(p => p.popular) || C.plans[0]).id;
  }

  function renderAll() {
    renderFeatures(); renderTemplates(); renderPlans(); renderFaq(); renderOrderSelects();
    document.title = `${C.brand} · ${t("hero_badge")}`;
    $("#waFloat").href = waLink(t("wa_order_intro"));
    const hero = $(".phone-hero iframe");
    const hsrc = hero.getAttribute("src").replace(/&lang=[a-z]+/, "") + "&lang=" + I18n.lang;
    if (hero.getAttribute("src") !== hsrc) hero.setAttribute("src", hsrc);
  }

  // Marca, email, redes, año
  document.querySelectorAll("[data-brand]").forEach(el => el.textContent = C.brand);
  document.querySelectorAll("[data-email]").forEach(el => { el.textContent = C.email; el.href = "mailto:" + C.email; });
  $("#year").textContent = new Date().getFullYear();
  const soc = { instagram: "Instagram", tiktok: "TikTok", facebook: "Facebook" };
  $("#socials").innerHTML = Object.keys(soc).filter(k => C[k]).map(k => `<a href="${esc(C[k])}" target="_blank" rel="noopener">${soc[k]}</a>`).join("");
  const days = Math.round((new Date(DEMOS.classic.date) - new Date()) / 864e5);
  $("#heroDays").textContent = days;

  // Pedido por WhatsApp
  $("#orderForm").addEventListener("submit", e => {
    e.preventDefault();
    const f = e.target;
    if (!f.names.value.trim() || !f.contact.value.trim()) { (f.names.value.trim() ? f.contact : f.names).focus(); return; }
    const plan = C.plans.find(p => p.id === f.plan.value);
    const msg = [
      t("wa_order_intro"), "",
      `• ${t("o_name")}: ${f.names.value.trim()}`,
      `• ${t("o_contact")}: ${f.contact.value.trim()}`,
      f.date.value ? `• ${t("o_date")}: ${f.date.value}` : "",
      `• ${t("o_tpl")}: ${t("theme_" + f.tpl.value)}`,
      `• ${t("o_plan")}: ${t("plan_" + plan.id)} (${C.currencySymbol}${plan.price})`,
      f.langs.value.trim() ? `• ${t("o_lang")}: ${f.langs.value.trim()}` : "",
      f.msg.value.trim() ? `• ${f.msg.value.trim()}` : ""
    ].filter(Boolean).join("\n");
    window.open(waLink(msg), "_blank");
  });

  // Cabecera y menú móvil
  const header = $("#header");
  addEventListener("scroll", () => header.classList.toggle("scrolled", scrollY > 10), { passive: true });
  $("#burger").addEventListener("click", () => document.body.classList.toggle("menu-open"));
  document.querySelectorAll("#nav a").forEach(a => a.addEventListener("click", () => document.body.classList.remove("menu-open")));

  I18n.select($("#lang"));
  document.addEventListener("langchange", renderAll);
  I18n.set(I18n.detect());
})();
