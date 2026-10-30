// © 2026 HamsOne, All Rights Reserved.
// Theme + language, remembered per visitor
const root = document.documentElement;
const themeBtn = document.getElementById('themeBtn');
const savedTheme = localStorage.getItem('hamsone-theme');
if (savedTheme) root.setAttribute('data-theme', savedTheme);
themeBtn.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('hamsone-theme', next);
});
let lang = localStorage.getItem('hamsone-lang') || 'en';
const langBtn = document.getElementById('langBtn');
function applyLang() {
  document.documentElement.lang = lang;
  langBtn.textContent = lang === 'en' ? 'ID' : 'EN';
  document.querySelectorAll('[data-en]').forEach(el => {
    el.textContent = lang === 'en' ? el.dataset.en : el.dataset.id;
  });
}
langBtn.addEventListener('click', () => {
  lang = lang === 'en' ? 'id' : 'en';
  localStorage.setItem('hamsone-lang', lang);
  applyLang();
});
applyLang();

// Scroll reveal
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Terminal typing loop — real commands only, no invented counts
const termEl = document.getElementById('typedTerminal');
const termLines = [
  { t: '$ python bot.py', c: true },
  { t: 'Bot online. Ready for commands.', c: false },
  { t: '$ /stock', c: true },
  { t: '> Stock available. Ready to buy.', c: false },
  { t: '$ /buy', c: true },
  { t: '> Stock locked for 10 minutes. Pay via QRIS.', c: false },
];
let li = 0, ci = 0;
function typeTerm() {
  if (!termEl) return;
  const line = termLines[li];
  if (ci <= line.t.length) {
    const done = termLines.slice(0, li).map(l => `<span class="${l.c ? 'cmd' : ''}">${l.t}</span>`).join('\n');
    termEl.innerHTML = done + (li > 0 ? '\n' : '') + `<span class="${line.c ? 'cmd' : ''}">${line.t.slice(0, ci)}</span><span class="caret">▌</span>`;
    ci++;
    setTimeout(typeTerm, line.c ? 45 : 18);
  } else {
    li++; ci = 0;
    if (li >= termLines.length) { setTimeout(() => { li = 0; typeTerm(); }, 5000); }
    else setTimeout(typeTerm, 350);
  }
}
typeTerm();

// Terminal quick commands
const cmdOutput = document.getElementById('cmdOutput');
const cmdReplies = {
  '/stock': { en: '> Stock available. Ready to buy.', id: '> Stok tersedia. Siap dibeli.' },
  '/buy': { en: '> Stock locked for 10 minutes. Pay via QRIS.', id: '> Stok dikunci 10 menit. Bayar lewat QRIS.' },
  '/setup': { en: '> Shop configured. Ready for go-live.', id: '> Toko sudah dikonfigurasi. Siap go-live.' },
};
document.querySelectorAll('.chip-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    cmdOutput.textContent = cmdReplies[btn.dataset.cmd][lang];
  });
});

// Live shop demo — state machine, simulation only
const chatLog = document.getElementById('chatLog');
const lockBadge = document.getElementById('lockBadge');
const lockTimer = document.getElementById('lockTimer');
let demoState = 0, lockSeconds = 600, lockInterval = null;
const demoTexts = {
  stock: { user: '/stock', botEn: 'Stock available. 1 account ready. Type /buy to lock it for 10 minutes.', botId: 'Stok tersedia. 1 akun ready. Ketik /buy untuk menguncinya selama 10 menit.' },
  buy: { user: '/buy', botEn: 'Stock locked for 10 minutes. Please pay via QRIS to complete the order.', botId: 'Stok dikunci 10 menit. Silakan bayar lewat QRIS untuk menyelesaikan order.' },
  qris: { user: 'Pay QRIS', botEn: 'Payment received via webhook. Delivering your account via DM…', botId: 'Pembayaran diterima lewat webhook. Akun kamu sedang dikirim lewat DM…' },
  delivered: { botEn: '✓ Delivered via DM. Thank you for shopping.', botId: '✓ Terkirim lewat DM. Terima kasih sudah berbelanja.' },
};
function addMsg(kind, text) {
  const div = document.createElement('div');
  div.className = 'msg ' + kind;
  div.innerHTML = kind === 'bot' ? `<strong>Shop Bot</strong><span>${text}</span>` : `<span>${text}</span>`;
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
}
function markStep(n) {
  document.querySelectorAll('.demo-step').forEach((s, i) => {
    s.classList.toggle('active', i === n);
    s.classList.toggle('done', i < n);
  });
}
function startLock() {
  lockBadge.classList.remove('hidden');
  lockSeconds = 600;
  clearInterval(lockInterval);
  lockInterval = setInterval(() => {
    lockSeconds--;
    const m = String(Math.floor(lockSeconds / 60)).padStart(2, '0');
    const s = String(lockSeconds % 60).padStart(2, '0');
    lockTimer.textContent = `${m}:${s}`;
    if (lockSeconds <= 0) { clearInterval(lockInterval); lockBadge.classList.add('hidden'); }
  }, 1000);
}
function demoStep(kind) {
  if (kind === 'reset') {
    chatLog.innerHTML = '';
    addMsg('bot', lang === 'en' ? 'Welcome to the shop. Type /stock to check stock.' : 'Selamat datang di toko. Ketik /stock untuk cek stok.');
    demoState = 0; markStep(0); lockBadge.classList.add('hidden'); clearInterval(lockInterval);
    return;
  }
  if (kind === 'stock' && demoState === 0) { addMsg('user', '/stock'); setTimeout(() => addMsg('bot', lang === 'en' ? demoTexts.stock.botEn : demoTexts.stock.botId), 400); demoState = 1; markStep(1); }
  else if (kind === 'buy' && demoState === 1) { addMsg('user', '/buy'); setTimeout(() => addMsg('bot', lang === 'en' ? demoTexts.buy.botEn : demoTexts.buy.botId), 400); demoState = 2; markStep(2); startLock(); }
  else if (kind === 'qris' && demoState === 2) { addMsg('user', 'Pay QRIS'); setTimeout(() => addMsg('bot', lang === 'en' ? demoTexts.qris.botEn : demoTexts.qris.botId), 400); setTimeout(() => addMsg('bot', lang === 'en' ? demoTexts.delivered.botEn : demoTexts.delivered.botId), 1100); demoState = 3; markStep(4); clearInterval(lockInterval); lockBadge.classList.add('hidden'); }
  else if (kind === 'auto') {
    demoStep('reset');
    setTimeout(() => demoStep('stock'), 500);
    setTimeout(() => demoStep('buy'), 1500);
    setTimeout(() => demoStep('qris'), 2600);
  } else {
    addMsg('bot', lang === 'en' ? 'Please follow the steps in order: /stock, then /buy, then Pay QRIS.' : 'Silakan ikuti langkahnya secara berurutan: /stock, lalu /buy, lalu Pay QRIS.');
  }
}
document.querySelectorAll('[data-demo]').forEach(btn => btn.addEventListener('click', () => demoStep(btn.dataset.demo)));

// Service cards prefill the inquiry form
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('click', () => {
    const sel = document.getElementById('platform');
    if (sel) sel.value = card.dataset.platform;
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
  });
});

// Process tabs
const processTexts = [
  { en: 'Tell me your need: platform, purpose, and details. Price is discussed first, adjusted to difficulty — no surprise fees.', id: 'Ceritakan kebutuhan kamu: platform, tujuan, dan detailnya. Harga dibahas dulu, menyesuaikan tingkat kesulitan — tanpa biaya kejutan.' },
  { en: 'I build the bot or website on my own setup, with QRIS, database, and logs wired in from the start.', id: 'Saya membangun bot atau website di setup saya sendiri, dengan QRIS, database, dan log sudah terpasang dari awal.' },
  { en: 'Tested on my own server first — including a real order flow — before anything touches your server.', id: 'Dites di server saya sendiri dulu — termasuk alur order asli — sebelum apa pun menyentuh server kamu.' },
  { en: 'Launched on your server or domain, with DNS and HTTPS checked, like this portfolio at hamsone.my.id.', id: 'Diluncurkan di server atau domain kamu, dengan DNS dan HTTPS dicek, seperti portfolio ini di hamsone.my.id.' },
  { en: 'Maintained after launch. If something breaks, tell me and I fix it — that is part of the service.', id: 'Dirawat setelah live. Kalau ada yang rusak, beri tahu saya dan saya perbaiki — itu bagian dari layanannya.' },
];
document.querySelectorAll('.process-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.process-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const txt = processTexts[Number(tab.dataset.process)];
    document.getElementById('processText').textContent = lang === 'en' ? txt.en : txt.id;
  });
});

// Copy Discord username
const copyBtn = document.getElementById('copyDiscord');
if (copyBtn) {
  copyBtn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText('hmd__'); copyBtn.textContent = lang === 'en' ? 'Copied!' : 'Tersalin!'; }
    catch (e) { copyBtn.textContent = lang === 'en' ? 'Copy Discord username' : 'Salin username Discord'; }
  });
}

// Inquiry: build a prefilled WhatsApp message, do not auto-send
const inquiryForm = document.getElementById('inquiryForm');
if (inquiryForm) {
  inquiryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const platform = document.getElementById('platform').value;
    const purpose = document.getElementById('purpose').value;
    const need = document.getElementById('need').value.trim();
    const text = `Hi HamsOne, I need a bot/website.\nPlatform: ${platform}\nPurpose: ${purpose}\nDetails: ${need}`;
    window.open('https://wa.me/6281289002318?text=' + encodeURIComponent(text), '_blank');
  });
}

// Testimonial: star rating + visible on this page + Gmail copy for verification
let selectedRating = 5;
const starBtns = document.querySelectorAll('#starRating .star');
const starLabel = document.getElementById('starLabel');
function paintStars() {
  starBtns.forEach(b => b.classList.toggle('selected', Number(b.dataset.star) <= selectedRating));
  if (starLabel) starLabel.textContent = `${selectedRating} / 5`;
}
starBtns.forEach(b => b.addEventListener('click', () => { selectedRating = Number(b.dataset.star); paintStars(); }));
paintStars();
// Public real-time testimonials: set this to your Google Apps Script web app URL
// (see testimonial-backend.gs). While empty, submissions only show on the sender's own browser.
const TESTI_API_URL = 'https://script.google.com/macros/s/AKfycbzDbDVR10WpZ41FwOS2rSDHSme8zFoWQ1GPS22TgXAdYicgyJwp87lnC2ftyhHoxh5PTg/exec';
const testiList = document.getElementById('testiList');
let testiAuto = null;
function setupTestiCarousel(items) {
  if (!testiList) return;
  const controls = document.getElementById('testiControls');
  clearInterval(testiAuto);
  // 1 testimonial: static, no animation. 2+: horizontal auto-running carousel.
  const isCarousel = items.length >= 2;
  testiList.classList.toggle('carousel', isCarousel);
  if (controls) controls.classList.toggle('hidden', !isCarousel);
  if (!isCarousel) return;
  const step = () => {
    const card = testiList.querySelector('.testi-card');
    const w = card ? card.offsetWidth + 12 : 332;
    if (testiList.scrollLeft + testiList.clientWidth >= testiList.scrollWidth - 10) testiList.scrollTo({ left: 0, behavior: 'smooth' });
    else testiList.scrollBy({ left: w, behavior: 'smooth' });
  };
  const start = () => { clearInterval(testiAuto); testiAuto = setInterval(step, 4000); };
  const stop = () => clearInterval(testiAuto);
  start();
  testiList.onmouseenter = stop; testiList.onmouseleave = start;
  testiList.onfocusin = stop; testiList.onfocusout = start;
  const prev = document.getElementById('testiPrev'), next = document.getElementById('testiNext');
  if (prev) prev.onclick = () => { stop(); const card = testiList.querySelector('.testi-card'); testiList.scrollBy({ left: -(card ? card.offsetWidth + 12 : 332), behavior: 'smooth' }); start(); };
  if (next) next.onclick = () => { stop(); step(); start(); };
}
async function renderTestis() {
  if (!testiList) return;
  let items = [];
  if (TESTI_API_URL) {
    try {
      const res = await fetch(TESTI_API_URL);
      const data = await res.json();
      if (Array.isArray(data)) items = data;
    } catch (e) { /* fall back to local below */ }
  }
  if (!items.length) {
    try { items = JSON.parse(localStorage.getItem('hamsone-testimonials') || '[]'); } catch (e) { items = []; }
  }
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  setupTestiCarousel(items);
  const maskEmail = e => {
    const s = String(e || '');
    const at = s.indexOf('@');
    if (at < 0) return s.length <= 3 ? s + '*****' : s.slice(0, 3) + '*****';
    const local = s.slice(0, at), rest = s.slice(at + 1);
    const dot = rest.lastIndexOf('.');
    const domain = dot < 0 ? rest : rest.slice(0, dot), tld = dot < 0 ? '' : rest.slice(dot);
    const mLocal = local.slice(0, 3) + '*'.repeat(Math.max(1, local.length - 3));
    const mDomain = domain.slice(0, 2) + '*'.repeat(Math.max(1, domain.length - 2));
    return `${mLocal}@${mDomain}${tld}`;
  };
  testiList.innerHTML = items.map(t => `<article class="testi-card"><span class="testi-stars">${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</span><strong>${esc(t.name)}</strong><span class="small">${esc(maskEmail(t.email))}</span><p>${esc(t.message)}</p></article>`).join('');
}
renderTestis();
const testiForm = document.getElementById('testiForm');
const testiStatus = document.getElementById('testiStatus');
if (testiForm) {
  testiForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(testiForm);
    const entry = { name: data.get('name'), email: data.get('email'), message: data.get('message'), rating: selectedRating };
    let items = [];
    try { items = JSON.parse(localStorage.getItem('hamsone-testimonials') || '[]'); } catch (err) { items = []; }
    items.unshift(entry);
    localStorage.setItem('hamsone-testimonials', JSON.stringify(items));
    if (TESTI_API_URL) {
      try {
        await fetch(TESTI_API_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(entry) });
      } catch (err) { /* local display above still works */ }
    }
    renderTestis();
    const subject = encodeURIComponent('Testimonial submission — ' + entry.name + ' (' + entry.rating + '/5)');
    const body = encodeURIComponent(`Name: ${entry.name}\nEmail: ${entry.email}\nRating: ${entry.rating}/5\nTestimonial:\n${entry.message}\n\nPlease add this permanently to the site after verification.`);
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=hamdiarwanyt@gmail.com&su=${subject}&body=${body}`, '_blank');
    testiStatus.textContent = lang === 'en'
      ? 'Thanks — your testimonial is now shown above, and a copy was sent via Gmail for verification and permanent publishing.'
      : 'Terima kasih — testimoni kamu sekarang tampil di atas, dan salinannya dikirim lewat Gmail untuk verifikasi dan publikasi permanen.';
    testiForm.reset();
    selectedRating = 5; paintStars();
  });
}
