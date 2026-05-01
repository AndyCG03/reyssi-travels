/* =============================================
   REYSSI TRAVELS — Script principal
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ── NAV SCROLL ────────────────────────────
  const nav = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });

  // ── HAMBURGER (mobile) ────────────────────
  const hamburger = document.querySelector('.hamburger');
  const navLinks  = document.querySelector('.nav-links');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
    });
  }

  // ── SMOOTH SCROLL en links de nav ─────────
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        navLinks.classList.remove('mobile-open');
      }
    });
  });

  // ── REVEAL ON SCROLL ──────────────────────
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // ── FORMULARIO ────────────────────────────
  const form     = document.getElementById('forma-consulta');
  const mensaje  = document.getElementById('form-mensaje');
  const btnSubmit= form ? form.querySelector('.btn-submit') : null;

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      btnSubmit.disabled = true;
      btnSubmit.textContent = 'Enviando...';

      try {
        const res  = await fetch('/api/consulta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const json = await res.json();

        mensaje.textContent = json.mensaje;
        mensaje.className   = 'form-mensaje ' + (json.ok ? 'ok' : 'err');

        if (json.ok) {
          form.reset();
          setTimeout(() => { mensaje.className = 'form-mensaje'; }, 5000);
        }
      } catch {
        mensaje.textContent = 'Error de conexión. Intente nuevamente.';
        mensaje.className   = 'form-mensaje err';
      } finally {
        btnSubmit.disabled     = false;
        btnSubmit.textContent  = 'Enviar consulta →';
      }
    });
  }

  // ── CONTADORES animados ───────────────────
  const counters = document.querySelectorAll('.count-up');
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const end = parseInt(el.dataset.target, 10);
      const dur = 1600;
      const step = end / (dur / 16);
      let cur = 0;
      const timer = setInterval(() => {
        cur += step;
        if (cur >= end) { cur = end; clearInterval(timer); }
        el.textContent = Math.floor(cur) + (el.dataset.suffix || '');
      }, 16);
      countObs.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(el => countObs.observe(el));

});

/* ── MOBILE NAV STYLES dinámicos ───────────── */
const style = document.createElement('style');
style.textContent = `
  @media (max-width: 768px) {
    .nav-links.mobile-open {
      display: flex !important;
      flex-direction: column;
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: var(--pizarra);
      align-items: center;
      justify-content: center;
      gap: 2.5rem;
      z-index: 99;
    }
    .nav-links.mobile-open a {
      font-size: 1.5rem !important;
      color: var(--blanco) !important;
      letter-spacing: 0.08em;
    }
  }
  .reveal {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.7s ease, transform 0.7s ease;
  }
  .reveal.visible {
    opacity: 1;
    transform: translateY(0);
  }
  .reveal:nth-child(2) { transition-delay: 0.1s; }
  .reveal:nth-child(3) { transition-delay: 0.2s; }
  .reveal:nth-child(4) { transition-delay: 0.3s; }
`;
document.head.appendChild(style);
