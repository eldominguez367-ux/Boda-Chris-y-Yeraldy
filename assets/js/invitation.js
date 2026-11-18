/* Motor de la invitación: lee los datos (demo, enlace #d= o archivo i/slug.json) y la dibuja */
(function () {
  const app = document.getElementById("app");
  const qs = new URLSearchParams(location.search);
  const EMBED = qs.get("embed") === "1";
  const PREVIEW = qs.get("preview") === "1";
  const AUTO_OPEN = qs.get("open") === "1" || PREVIEW;
  const GUEST = qs.get("g") || "";
  const SEATS = parseInt(qs.get("n") || "", 10) || 0;
  const t = (k, v) => I18n.t(k, v);
  let data = null, watermark = false, opened = AUTO_OPEN, timer = null, audio = null;

  if (EMBED) document.documentElement.classList.add("embed");
  if (window.self !== window.top) document.documentElement.classList.add("framed");

  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  // Texto que empieza por @ = clave de traducción (para los demos)
  const tx = s => String(s || "").replace(/@([a-z0-9_]+)/g, (m, k) => t(k));
  const safeUrl = u => /^https?:\/\//i.test(u || "") ? u : "";

  async function load() {
    const hash = new URLSearchParams(location.hash.slice(1));
    try {
      if (hash.get("d")) { data = InvData.dec(hash.get("d")); watermark = true; }
      else if (qs.get("i")) {
        const slug = qs.get("i").replace(/[^a-z0-9_-]/gi, "");
        const r = await fetch(`i/${slug}.json`, { cache: "no-cache" });
        if (!r.ok) throw new Error("404");
        data = await r.json();
      } else {
        const key = qs.get("demo") && DEMOS[qs.get("demo")] ? qs.get("demo") : "classic";
        data = JSON.parse(JSON.stringify(DEMOS[key]));
        watermark = !EMBED;
      }
    } catch (e) {
      app.innerHTML = `<div class="notfound"><p>${esc(t("inv_notfound"))}</p><a href="index.html">←</a></div>`;
      I18n.set(I18n.detect());
      return;
    }
    if (qs.get("theme") && THEMES[qs.get("theme")]) data.theme = qs.get("theme");
    if (!THEMES[data.theme]) data.theme = "classic";
    document.body.dataset.theme = data.theme;
    const forced = (EMBED || PREVIEW) && (qs.get("lang") || data.lang);
    I18n.set(forced || I18n.detect(data.lang));
  }

  function when() {
    const [y, m, d] = (data.date || "").split("-").map(Number);
    const [hh, mm] = (data.cer && data.cer.time || data.time || "17:00").split(":").map(Number);
    if (!y) return null;
    return new Date(y, m - 1, d, hh || 0, mm || 0);
  }
  function fmtDate(dt, opts) {
    try { return new Intl.DateTimeFormat(I18n.lang, opts).format(dt); } catch (e) { return dt.toDateString(); }
  }
  function parseDay(s) { const [y, m, d] = (s || "").split("-").map(Number); return y ? new Date(y, m - 1, d) : null; }
  const mapUrl = ev => safeUrl(ev.map) || ("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent([ev.place, ev.addr].filter(Boolean).join(", ")));
  const initials = () => ((data.n1 || " ")[0] + (data.n2 || " ")[0]).toUpperCase();
  const names = (sep) => `${esc(data.n1)} <span class="amp">${sep || "&amp;"}</span> ${esc(data.n2)}`;

  function render() {
    if (!data) return;
    const dt = when();
    const orn = `<div class="orn">${ORNAMENTS[THEMES[data.theme].ornament]}</div>`;
    let longDate = dt ? fmtDate(dt, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "";
    longDate = longDate.charAt(0).toUpperCase() + longDate.slice(1);
    const shortDate = dt ? fmtDate(dt, { day: "2-digit", month: "2-digit", year: "numeric" }) : "";
    const cover = safeUrl(data.cover);
    const title = `${data.n1} & ${data.n2}`;
    document.title = `${t("inv_wedding_of")} ${title}`;

    const ev = (key, e) => !e || !(e.place || e.addr) ? "" : `
      <article class="event reveal">
        <div class="event-icon">${key === "cer" ? ICON.rings : ICON.glass}</div>
        <h3>${esc(t(key === "cer" ? "inv_cer" : "inv_rec"))}</h3>
        ${e.time ? `<p class="event-time">${esc(e.time)}</p>` : ""}
        <p class="event-place">${esc(e.place)}</p>
        <p class="event-addr">${esc(e.addr)}</p>
        <a class="btn" href="${esc(mapUrl(e))}" target="_blank" rel="noopener">${ICON.pin}<span>${esc(t("inv_go"))}</span></a>
      </article>`;

    const sched = String(data.sched || "").split("\n").map(l => l.trim()).filter(Boolean).map(l => {
      const m = l.match(/^(\d{1,2}[:.h]\d{2})\s*[-–|]?\s*(.*)$/);
      return m ? { time: m[1], what: tx(m[2]) } : { time: "", what: tx(l) };
    });
    const photos = String(data.photos || "").split(/\s*\n\s*/).map(safeUrl).filter(Boolean);
    const rsvpBy = parseDay(data.rsvpBy);

    app.innerHTML = `
    ${EMBED ? "" : `<div class="topbar"><select id="lang" aria-label="${esc(t("lang_label"))}"></select>${data.music ? `<button id="music" class="icon-btn" aria-label="music">${ICON.note}</button>` : ""}</div>`}

    <section id="cover" class="cover ${opened ? "is-open" : ""} ${cover ? "has-photo" : ""}" ${cover ? `style="--cover:url('${esc(cover)}')"` : ""}>
      <div class="cover-inner">
        <p class="kicker">${esc(t("inv_save"))}</p>
        ${orn}
        <h1 class="names">${names()}</h1>
        <p class="cover-date">${esc(shortDate)}</p>
        ${GUEST ? `<p class="dear">${esc(t("inv_dear", { name: GUEST }))}</p>` : ""}
        <button class="seal" id="openBtn" aria-label="${esc(t("inv_open"))}"><span>${esc(initials())}</span></button>
        <p class="open-label">${esc(t("inv_open"))}</p>
      </div>
    </section>

    <main id="main" class="${opened ? "" : "hidden"}">
      <section class="hero ${cover ? "has-photo" : ""}" ${cover ? `style="--cover:url('${esc(cover)}')"` : ""}>
        <div class="hero-inner reveal">
          <p class="kicker">${esc(t("inv_invite"))}</p>
          <h1 class="names big">${names()}</h1>
          ${orn}
          <p class="long-date">${esc(longDate)}</p>
          ${GUEST ? `<p class="dear">${esc(t("inv_dear", { name: GUEST }))}</p>` : ""}
          ${SEATS ? `<p class="seats">${esc(t("inv_seats", { n: SEATS }))}</p>` : ""}
        </div>
      </section>

      ${data.msg ? `<section class="sec msg reveal"><p class="quote">${esc(tx(data.msg))}</p></section>` : ""}

      ${dt ? `<section class="sec countdown-sec reveal">
        <h2>${esc(t("inv_left"))}</h2>
        <div class="countdown" id="countdown">
          ${["days", "hours", "min", "sec"].map(u => `<div class="cd"><b data-u="${u}">0</b><span>${esc(t("inv_" + u))}</span></div>`).join("")}
        </div>
        <p class="married hidden" id="married">${esc(t("inv_married"))}</p>
        <div class="cal-btns">
          <a class="btn ghost" id="gcal" target="_blank" rel="noopener">${ICON.cal}<span>Google Calendar</span></a>
          <button class="btn ghost" id="ics">${ICON.cal}<span>Apple / Outlook</span></button>
        </div>
      </section>` : ""}

      <section class="sec events">${ev("cer", data.cer)}${ev("rec", data.rec)}</section>

      ${sched.length ? `<section class="sec reveal"><h2>${esc(t("inv_program"))}</h2>${orn}
        <ol class="timeline">${sched.map(s => `<li><time>${esc(s.time)}</time><span>${esc(s.what)}</span></li>`).join("")}</ol></section>` : ""}

      ${data.dress ? `<section class="sec reveal"><div class="event-icon">${ICON.dress}</div><h2>${esc(t("inv_dress"))}</h2><p class="big-text">${esc(tx(data.dress))}</p></section>` : ""}

      ${photos.length ? `<section class="sec reveal"><h2>${esc(t("inv_gallery"))}</h2>${orn}
        <div class="gallery">${photos.map((p, i) => `<button class="ph" data-i="${i}"><img src="${esc(p)}" alt="" loading="lazy"></button>`).join("")}</div></section>` : ""}

      ${data.gifts ? `<section class="sec reveal"><div class="event-icon">${ICON.gift}</div><h2>${esc(t("inv_gifts"))}</h2>
        <p>${esc(t("inv_gifts_intro"))}</p><p class="gift-box" id="giftText">${esc(tx(data.gifts))}</p>
        <button class="btn ghost" id="copyGift">${esc(t("inv_copy"))}</button></section>` : ""}

      <section class="sec rsvp reveal" id="rsvp">
        <h2>${esc(t("inv_rsvp"))}</h2>${orn}
        ${rsvpBy ? `<p>${esc(t("inv_rsvp_by", { date: fmtDate(rsvpBy, { day: "numeric", month: "long" }) }))}</p>` : ""}
        <form id="rsvpForm" novalidate>
          <label><span>${esc(t("inv_r_name"))}</span><input name="name" required value="${esc(GUEST)}" autocomplete="name"></label>
          <fieldset><legend>${esc(t("inv_r_attend"))}</legend>
            <label class="choice"><input type="radio" name="attend" value="yes" checked><span>${esc(t("inv_yes"))}</span></label>
            <label class="choice"><input type="radio" name="attend" value="no"><span>${esc(t("inv_no"))}</span></label>
          </fieldset>
          <div class="if-yes">
            <label><span>${esc(t("inv_r_count"))}</span><input name="count" type="number" min="1" max="${SEATS || 20}" value="${SEATS || 1}"></label>
            <label><span>${esc(t("inv_r_diet"))}</span><input name="diet"></label>
          </div>
          <label><span>${esc(t("inv_r_msg"))}</span><textarea name="msg" rows="3"></textarea></label>
          <button class="btn solid" type="submit">${ICON.heart}<span>${esc(t("inv_r_send"))}</span></button>
          <p class="form-status" id="rsvpStatus" role="status"></p>
        </form>
      </section>

      <footer class="inv-footer">
        ${orn}
        <p class="script">${esc(t("inv_love"))},</p>
        <p class="names small">${names()}</p>
        ${data.hashtag ? `<p class="hashtag">${esc(data.hashtag)}</p>` : ""}
      </footer>
    </main>
    ${watermark ? `<a class="wm" href="index.html" target="_top">${esc(t("inv_wm"))} <b>${esc(SITE_CONFIG.brand)}</b></a><div class="wm-overlay" aria-hidden="true"></div>` : ""}
    <div class="lightbox hidden" id="lightbox"><img alt=""><button aria-label="close">×</button></div>`;

    bind(dt, photos);
  }

  function bind(dt, photos) {
    const langSel = document.getElementById("lang");
    if (langSel) I18n.select(langSel);
    const openBtn = document.getElementById("openBtn");
    openBtn.addEventListener("click", openInvite);
    if (EMBED) openBtn.tabIndex = -1;

    if (data.music && !audio) { audio = new Audio(safeUrl(data.music)); audio.loop = true; }
    const mb = document.getElementById("music");
    if (mb) {
      mb.classList.toggle("playing", audio && !audio.paused);
      mb.addEventListener("click", () => { if (audio.paused) audio.play().catch(() => {}); else audio.pause(); mb.classList.toggle("playing", !audio.paused); });
    }

    if (dt) {
      tick(dt); clearInterval(timer); timer = setInterval(() => tick(dt), 1000);
      const p = n => String(n).padStart(2, "0");
      const f = d => `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}00`;
      const end = new Date(dt.getTime() + 7 * 3600e3);
      const title = `${t("inv_wedding_of")} ${data.n1} & ${data.n2}`;
      const loc = data.cer ? [data.cer.place, data.cer.addr].filter(Boolean).join(", ") : "";
      document.getElementById("gcal").href = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + encodeURIComponent(title) +
        "&dates=" + f(dt) + "/" + f(end) + "&location=" + encodeURIComponent(loc) + "&details=" + encodeURIComponent(location.href);
      document.getElementById("ics").addEventListener("click", () => {
        const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//" + SITE_CONFIG.brand + "//ES", "BEGIN:VEVENT",
          "UID:" + Date.now() + "@invite", "DTSTAMP:" + f(new Date()), "DTSTART:" + f(dt), "DTEND:" + f(end),
          "SUMMARY:" + title, "LOCATION:" + loc.replace(/,/g, "\\,"), "DESCRIPTION:" + location.href, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
        a.download = "boda.ics"; a.click();
      });
    }

    const cg = document.getElementById("copyGift");
    if (cg) cg.addEventListener("click", () => {
      navigator.clipboard && navigator.clipboard.writeText(document.getElementById("giftText").textContent);
      cg.textContent = t("inv_copied"); setTimeout(() => cg.textContent = t("inv_copy"), 1800);
    });

    const lb = document.getElementById("lightbox");
    document.querySelectorAll(".ph").forEach(b => b.addEventListener("click", () => { lb.querySelector("img").src = photos[+b.dataset.i]; lb.classList.remove("hidden"); }));
    lb.addEventListener("click", () => lb.classList.add("hidden"));

    const form = document.getElementById("rsvpForm");
    const ifYes = form.querySelector(".if-yes");
    form.addEventListener("change", () => { ifYes.style.display = form.attend.value === "yes" ? "" : "none"; });
    form.addEventListener("submit", submitRsvp);

    const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12 }) : null;
    document.querySelectorAll(".reveal").forEach(el => io ? io.observe(el) : el.classList.add("in"));
  }

  function openInvite() {
    if (EMBED) return;
    opened = true;
    document.getElementById("cover").classList.add("is-open");
    document.getElementById("main").classList.remove("hidden");
    if (audio) { audio.play().catch(() => {}); const mb = document.getElementById("music"); if (mb) mb.classList.add("playing"); }
    setTimeout(() => window.scrollTo({ top: 0 }), 50);
  }

  function tick(dt) {
    const el = document.getElementById("countdown");
    if (!el) return;
    let diff = Math.max(0, dt - new Date());
    if (diff === 0) { el.classList.add("hidden"); document.getElementById("married").classList.remove("hidden"); return; }
    const v = { days: Math.floor(diff / 864e5), hours: Math.floor(diff / 36e5) % 24, min: Math.floor(diff / 6e4) % 60, sec: Math.floor(diff / 1e3) % 60 };
    el.querySelectorAll("b").forEach(b => b.textContent = v[b.dataset.u]);
  }

  async function submitRsvp(e) {
    e.preventDefault();
    const f = e.target, st = document.getElementById("rsvpStatus");
    if (!f.name.value.trim()) { f.name.focus(); f.name.classList.add("err"); return; }
    const yes = f.attend.value === "yes";
    const lines = [
      `💌 RSVP · ${data.n1} & ${data.n2}`,
      `${t("inv_r_name")}: ${f.name.value.trim()}`,
      `${t("inv_r_attend")} ${yes ? "✅ " + t("inv_yes") : "❌ " + t("inv_no")}`
    ];
    if (yes) lines.push(`${t("inv_r_count")}: ${f.count.value}`);
    if (yes && f.diet.value.trim()) lines.push(`${t("inv_r_diet")}: ${f.diet.value.trim()}`);
    if (f.msg.value.trim()) lines.push(`${t("inv_r_msg")}: ${f.msg.value.trim()}`);
    const text = lines.join("\n");
    const btn = f.querySelector("button[type=submit]"); btn.disabled = true;
    try {
      if (data.rsvpEmail) {
        const r = await fetch("https://formsubmit.co/ajax/" + encodeURIComponent(data.rsvpEmail), {
          method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ _subject: `RSVP ${data.n1} & ${data.n2}: ${f.name.value.trim()}`, _template: "box", name: f.name.value.trim(),
            attending: yes ? "YES" : "NO", guests: yes ? f.count.value : 0, diet: f.diet.value, message: f.msg.value })
        });
        if (!r.ok) throw new Error("send");
      }
      if (data.rsvpWa) {
        window.open("https://wa.me/" + String(data.rsvpWa).replace(/\D/g, "") + "?text=" + encodeURIComponent(text), "_blank");
      }
      st.textContent = t("inv_r_thanks"); st.className = "form-status ok";
      f.querySelectorAll("input,textarea,button").forEach(x => x.disabled = true);
    } catch (err) {
      st.textContent = t("inv_r_err"); st.className = "form-status bad"; btn.disabled = false;
    }
  }

  const ICON = {
    rings: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="18" cy="28" r="11"/><circle cx="30" cy="28" r="11"/><path d="M21 9l3-4 3 4-3 4z"/></svg>',
    glass: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 6h12l-1 12a5 5 0 01-10 0zM16 23v15M11 40h10M26 6h12l-1 12a5 5 0 01-10 0zM32 23v15M27 40h10"/></svg>',
    dress: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 4l2 8-6 8 4 6-8 18h28l-8-18 4-6-6-8 2-8M20 12h8"/></svg>',
    gift: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="7" y="18" width="34" height="24" rx="1"/><path d="M5 12h38v6H5zM24 12v30M24 12c-4-8-12-6-10-1 1 2 6 1 10 1zm0 0c4-8 12-6 10-1-1 2-6 1-10 1z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 22s7-7.5 7-13a7 7 0 10-14 0c0 5.5 7 13 7 13z"/><circle cx="12" cy="9" r="2.5"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 5.8-8 11-8 11z"/></svg>',
    note: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 18a3 3 0 11-2-2.8V5l12-2v11a3 3 0 11-2-2.8V6.3L9 7.6z"/></svg>'
  };

  document.addEventListener("langchange", () => { const y = window.scrollY; render(); window.scrollTo(0, y); });
  window.addEventListener("hashchange", async () => { await load(); });
  load();
})();
