/* Genera las miniaturas (capturas) de cada formato para la página madre.
   Uso: servir plataforma/dist en el puerto 8770 y ejecutar:  node miniaturas.js */
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const out = path.join(__dirname, '..', 'catalogo', 'miniaturas'); fs.mkdirSync(out, { recursive: true });
const ids = ['sobre', 'fotografico', 'editorial', 'botanico', 'celestial', 'tropical', 'historia', 'sd-rasca', 'sd-cartel'];
const base = 'http://localhost:8770/formatos/';
(async () => {
  const b = await chromium.launch(); const meta = {};
  for (const id of ids) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 }); const p = await ctx.newPage();
    await p.goto(base + id + '/index.html'); await p.addStyleTag({ content: '.draft{display:none!important}' }); await p.waitForTimeout(2300);
    const pos = [];
    const salto = async () => { const s = await p.$('#cartaSaltar, #skip'); if (s) { await s.click(); await p.waitForTimeout(3200); } };
    if (id === 'historia') {
      // portada del sobre y luego las seis diapositivas
      await p.screenshot({ path: `${out}/${id}-0.png` }); pos.push({ y: 0, splash: true }); await salto();
      for (let i = 0; i < 5; i++) { await p.screenshot({ path: `${out}/${id}-${i + 1}.png` }); pos.push({ y: 0, slide: i }); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(1100); }
    } else {
      await p.screenshot({ path: `${out}/${id}-0.png` }); pos.push({ y: 0, splash: true }); await salto();
      const H = await p.evaluate(() => document.documentElement.scrollHeight);
      const n = id.startsWith('sd-') ? 3 : (id === 'sobre' ? 5 : 5);
      for (let i = 0; i < n; i++) {
        const y = Math.round((H - 844) * (i / Math.max(1, n - 1)) * (id === 'sobre' ? 0.9 : 1));
        await p.evaluate(v => window.scrollTo(0, v), y); await p.waitForTimeout(900);
        await p.screenshot({ path: `${out}/${id}-${i + 1}.png` }); pos.push({ y });
      }
    }
    meta[id] = pos; await ctx.close(); console.log(id, pos.length);
  }
  fs.writeFileSync(path.join(out, 'miniaturas.json'), JSON.stringify(meta)); await b.close();
})();
