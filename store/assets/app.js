// Interaksi ringan untuk mockup (tanpa backend)
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rp = n => 'Rp' + n.toLocaleString('id-ID');

$$('[data-toggle]').forEach(b => b.addEventListener('click', () => $(b.dataset.toggle).classList.toggle('open')));

$$('.qty').forEach(q => {
  const i = $('input', q), min = +i.min || 1, max = +i.max || 99;
  const upd = () => {
    i.value = Math.max(min, Math.min(max, +i.value || min));
    $$('[data-total]').forEach(t => t.textContent = rp(i.value * +t.dataset.total));
    $$('[data-qty]').forEach(t => t.textContent = i.value);
  };
  $$('button', q).forEach(b => b.addEventListener('click', () => { i.value = +i.value + +b.dataset.d; upd(); }));
  i.addEventListener('input', upd);
});

$$('.tabs').forEach(t => $$('button', t).forEach(b => b.addEventListener('click', () => {
  $$('button', t).forEach(x => x.classList.toggle('on', x === b));
  $$('[data-pane]').forEach(p => p.classList.toggle('on', p.dataset.pane === b.dataset.tab));
})));

$$('[data-copy]').forEach(b => b.addEventListener('click', () => {
  navigator.clipboard?.writeText(b.dataset.copy);
  const o = b.textContent; b.textContent = 'Tersalin'; setTimeout(() => b.textContent = o, 1200);
}));

const tm = $('[data-timer]');
if (tm) { let s = +tm.dataset.timer; setInterval(() => { if (s > 0) s--; tm.textContent = [s / 3600 | 0, s / 60 % 60 | 0, s % 60].map(v => String(v).padStart(2, '0')).join(':'); }, 1000); }

// QR placeholder (pola acak, bukan QR asli)
$$('.qr').forEach(el => {
  const n = 29, c = 100 / n; let seed = 7, r = '';
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const eye = (x, y) => x < 7 && y < 7 || x >= n - 7 && y < 7 || x < 7 && y >= n - 7;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!eye(x, y) && rnd() > .52) r += `<rect x="${x * c}" y="${y * c}" width="${c}" height="${c}"/>`;
  [[0, 0], [n - 7, 0], [0, n - 7]].forEach(([x, y]) => r += `<rect x="${x * c}" y="${y * c}" width="${7 * c}" height="${7 * c}"/><rect x="${(x + 1) * c}" y="${(y + 1) * c}" width="${5 * c}" height="${5 * c}" fill="#fff"/><rect x="${(x + 2) * c}" y="${(y + 2) * c}" width="${3 * c}" height="${3 * c}"/>`);
  el.innerHTML = `<svg viewBox="0 0 100 100" fill="#09090B">${r}</svg>`;
});
