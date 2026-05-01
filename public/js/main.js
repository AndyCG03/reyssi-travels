/* =============================================
   REYSSI TRAVELS — Script principal
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  const nav       = document.querySelector('nav');
  const hamburger = document.querySelector('.hamburger');
  const drawer    = document.querySelector('.nav-drawer');
  const overlay   = document.querySelector('.nav-overlay');

  // ── NAV SCROLL ────────────────────────────
  // Solo aplica sombra/fondo si el cajón NO está abierto
  function updateNav() {
    if (drawer && drawer.classList.contains('open')) return;
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', updateNav, { passive: true });

  // ── CAJÓN MOBILE ──────────────────────────
  function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('show');
    hamburger.classList.add('active');
    document.body.style.overflow = 'hidden'; // evita scroll detrás
    // Quitar scrolled mientras está abierto
    nav.classList.remove('scrolled');
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('show');
    hamburger.classList.remove('active');
    document.body.style.overflow = '';
    // Restaurar estado real del nav
    updateNav();
  }

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      drawer.classList.contains('open') ? closeDrawer() : openDrawer();
    });
  }

  // Cerrar al hacer click en el overlay oscuro
  if (overlay) {
    overlay.addEventListener('click', closeDrawer);
  }

  // Botón X dentro del cajón
  const drawerClose = document.querySelector('.drawer-close');
  if (drawerClose) {
    drawerClose.addEventListener('click', closeDrawer);
  }

  // Cerrar con tecla Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeDrawer();
  });

  // ── SMOOTH SCROLL + cierre del cajón ──────
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      closeDrawer();
      // Pequeño delay para que el cajón cierre antes de hacer scroll
      setTimeout(() => {
        const offset = nav.offsetHeight;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }, 50);
    });
  });

  // ── REVEAL ON SCROLL ──────────────────────
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  // ── FORMULARIO ────────────────────────────
  const form      = document.getElementById('forma-consulta');
  const mensaje   = document.getElementById('form-mensaje');
  const btnSubmit = form ? form.querySelector('.btn-submit') : null;

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = 'Enviando...';

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
        mensaje.textContent = 'Error de conexión. Intentá nuevamente.';
        mensaje.className   = 'form-mensaje err';
      } finally {
        btnSubmit.disabled   = false;
        btnSubmit.innerHTML  = 'Enviar consulta <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
      }
    });
  }

  // ── CONTADORES animados ───────────────────
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el   = entry.target;
      const end  = parseInt(el.dataset.target, 10);
      const step = end / (1600 / 16);
      let cur = 0;
      const timer = setInterval(() => {
        cur += step;
        if (cur >= end) { cur = end; clearInterval(timer); }
        el.textContent = Math.floor(cur) + (el.dataset.suffix || '');
      }, 16);
      countObs.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.count-up').forEach(el => countObs.observe(el));

});
