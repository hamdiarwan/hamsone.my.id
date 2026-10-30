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

// Tabs: Terminal | Live Demo
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab === 'terminal' ? 'terminal' : 'livedemo').classList.add('active');
  });
});

// Live demo simulation (no real payment, no real stock)
const runBtn = document.getElementById('runDemo');
const demoStatus = document.getElementById('demoStatus');
if (runBtn) {
  runBtn.addEventListener('click', () => {
    const steps = document.querySelectorAll('.demo-steps li');
    steps.forEach(s => s.classList.remove('done'));
    demoStatus.textContent = '';
    steps.forEach((step, i) => {
      setTimeout(() => {
        step.classList.add('done');
        if (i === steps.length - 1) {
          demoStatus.textContent = lang === 'en'
            ? 'Demo complete — account delivered via DM (simulation only).'
            : 'Demo selesai — akun dikirim lewat DM (simulasi saja).';
        }
      }, 700 * (i + 1));
    });
  });
}

// Copy Discord username
const copyBtn = document.getElementById('copyDiscord');
if (copyBtn) {
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('hmd__');
      copyBtn.textContent = lang === 'en' ? 'Copied: hmd__' : 'Tersalin: hmd__';
    } catch (e) {
      copyBtn.textContent = 'hmd__';
    }
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

// Testimonial: moderated only, via email — never auto-published
const testiForm = document.getElementById('testiForm');
const testiStatus = document.getElementById('testiStatus');
if (testiForm) {
  testiForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(testiForm);
    const subject = encodeURIComponent('Testimonial submission for moderation — ' + data.get('name'));
    const body = encodeURIComponent(`Name: ${data.get('name')}\nEmail: ${data.get('email')}\nTestimonial:\n${data.get('message')}\n\nNote: I understand this does not auto-publish and will be verified before anything goes live.`);
    window.location.href = `mailto:hamdiarwanyt@gmail.com?subject=${subject}&body=${body}`;
    testiStatus.textContent = lang === 'en'
      ? 'Thanks — your submission opens in email for moderation. It will not appear on the site until verified and approved.'
      : 'Makasih — kiriman lu dibuka lewat email untuk moderasi. Tidak akan tayang sebelum diverifikasi dan disetujui.';
  });
}
