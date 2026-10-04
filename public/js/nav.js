// Mejoras de navegación del rediseño: salto al contenido, barra de progreso,
// sección activa en el menú y botón para volver arriba.
(function(){
  const header = document.getElementById('siteHeader');
  const main = document.querySelector('main') || document.querySelector('section');

  if(main){
    if(!main.id) main.id = 'contenido';
    const skip = document.createElement('a');
    skip.className = 'skip-link';
    skip.href = '#' + main.id;
    skip.textContent = 'Saltar al contenido';
    document.body.prepend(skip);
  }

  const bar = document.createElement('span');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  if(header) header.appendChild(bar);

  const toTop = document.createElement('button');
  toTop.className = 'to-top';
  toTop.type = 'button';
  toTop.setAttribute('aria-label', 'Volver arriba');
  toTop.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.body.appendChild(toTop);

  let ticking = false;
  function onScroll(){
    if(ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.setProperty('--progress', max > 0 ? Math.min(window.scrollY / max, 1) : 0);
      toTop.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.8);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Resalta en el menú la sección visible.
  const links = [...document.querySelectorAll('.nav-links a[href^="#"], .mobile-menu a[href^="#"]')];
  const sections = [...new Set(links.map(a => a.getAttribute('href')))]
    .map(id => document.querySelector(id)).filter(Boolean);
  if(!sections.length || !('IntersectionObserver' in window)) return;
  const setActive = id => links.forEach(a => {
    if(a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  });
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if(entry.isIntersecting) setActive(entry.target.id); });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => observer.observe(s));
})();

// Certificado del Registro Nacional de Turismo en el pie de página.
(function(){
  const dialog = document.getElementById('rntDialog');
  if(!dialog) return;
  document.querySelectorAll('[data-rnt-open]').forEach(b => b.addEventListener('click', () => dialog.showModal()));
  dialog.querySelector('[data-rnt-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if(e.target === dialog) dialog.close(); });
})();
