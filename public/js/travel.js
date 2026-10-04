// Dinamismo del rediseño: hero con fotos que rotan, cinta de destinos y carruseles.
(function(){
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Hero con fotos de Pixabay (descargadas en /img/hero, WebP) ----------
     Solo destinos que están en las promociones vigentes de Mega Travel
     (paquetes que sí vendemos). Si cambian las promociones, actualiza esta lista.
     La foto local (Hero.webp) queda debajo solo como respaldo mientras carga
     la primera foto o si ninguna carga; no entra en la rotación.
     Las fotos se cargan una tras otra para no saturar la conexión en móvil. */
  const slidesBox = document.getElementById('heroSlides');
  const destLabel = document.getElementById('heroDest');
  const dotsBox = document.getElementById('heroDots');
  const PIXABAY = [
    { src: '/img/hero/paris.webp', place: 'París, Francia' },
    { src: '/img/hero/kioto.webp', place: 'Kioto, Japón' },
    { src: '/img/hero/roma.webp', place: 'Roma, Italia' },
    { src: '/img/hero/phuket.webp', place: 'Phuket, Tailandia' },
    { src: '/img/hero/venecia.webp', place: 'Venecia, Italia' },
    { src: '/img/hero/dubai.webp', place: 'Dubái, Emiratos Árabes' },
    { src: '/img/hero/sahara.webp', place: 'Sahara, Marruecos' },
    { src: '/img/hero/noruega.webp', place: 'Fiordos de Noruega' },
    { src: '/img/hero/dubrovnik.webp', place: 'Dubrovnik, Croacia' },
    { src: '/img/hero/gran-muralla.webp', place: 'Gran Muralla, China' }
  ];

  if(slidesBox){
    const slides = [];
    let index = 0;
    let timer = null;

    const renderDots = () => {
      if(!dotsBox) return;
      dotsBox.innerHTML = '';
      if(slides.length < 2) return;
      slides.forEach((_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.tabIndex = -1;
        if(i === index) b.className = 'is-active';
        b.addEventListener('click', () => { go(i); restart(); });
        dotsBox.appendChild(b);
      });
    };

    const go = i => {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, n) => s.el && s.el.classList.toggle('is-active', n === index));
      if(destLabel){
        destLabel.classList.add('is-changing');
        setTimeout(() => { destLabel.textContent = slides[index].place; destLabel.classList.remove('is-changing'); }, 350);
      }
      if(dotsBox) [...dotsBox.children].forEach((d, n) => d.classList.toggle('is-active', n === index));
    };

    const restart = () => {
      clearInterval(timer);
      if(!reduceMotion && slides.length > 1) timer = setInterval(() => go(index + 1), 6500);
    };

    const loadNext = n => {
      if(n >= PIXABAY.length) return;
      const item = PIXABAY[n];
      const img = new Image();
      img.alt = '';
      img.decoding = 'async';
      if(n === 0) img.fetchPriority = 'high';
      img.onload = () => {
        slidesBox.appendChild(img);
        slides.push({ el: img, place: item.place });
        if(slides.length === 1){
          // Primera foto: se muestra de inmediato y reemplaza al respaldo local
          if(destLabel) destLabel.textContent = item.place;
          requestAnimationFrame(() => img.classList.add('is-active'));
        }
        renderDots();
        if(!timer) restart();
        continueAfter(n + 1);
      };
      img.onerror = () => continueAfter(n + 1);
      img.src = item.src;
    };
    // Las fotos 2..N esperan al evento load: si no, retrasan ese evento
    // (y con él la pantalla de carga) hasta bajar todas las fotos del hero.
    const continueAfter = n => {
      if(document.readyState === 'complete') loadNext(n);
      else window.addEventListener('load', () => setTimeout(() => loadNext(n), 0), { once: true });
    };
    loadNext(0);
  }

  /* ---------- Cinta de destinos: se duplica para un bucle continuo ---------- */
  document.querySelectorAll('.dest-marquee__track, .socios-track').forEach(track => {
    track.innerHTML += track.innerHTML;
  });

  /* ---------- Carruseles con flechas, puntos y avance automático ---------- */
  function makeCarousel(track, { auto = false, onlyBelow = 0 } = {}){
    if(!track) return;
    if(onlyBelow && window.innerWidth > onlyBelow){ return; }
    track.classList.add('snap-track');
    const items = [...track.children];
    if(items.length < 2) return;

    const nav = document.createElement('div');
    nav.className = 'carousel-nav';
    nav.innerHTML = '<div class="carousel-dots"></div><div class="carousel-arrows">' +
      '<button type="button" aria-label="Anterior"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m15 18-6-6 6-6"/></svg></button>' +
      '<button type="button" aria-label="Siguiente"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m9 18 6-6-6-6"/></svg></button></div>';
    track.after(nav);
    const dots = nav.querySelector('.carousel-dots');
    const [prev, next] = nav.querySelectorAll('.carousel-arrows button');

    items.forEach((item, i) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.setAttribute('aria-label', 'Ir a ' + (i + 1));
      d.addEventListener('click', () => scrollToItem(i));
      dots.appendChild(d);
    });

    const current = () => {
      const left = track.scrollLeft;
      let best = 0;
      items.forEach((it, i) => { if(Math.abs(it.offsetLeft - track.offsetLeft - left) < Math.abs(items[best].offsetLeft - track.offsetLeft - left)) best = i; });
      return best;
    };
    const atEnd = () => track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    const scrollToItem = i => track.scrollTo({ left: items[(i + items.length) % items.length].offsetLeft - track.offsetLeft });
    const update = () => {
      nav.hidden = track.scrollWidth <= track.clientWidth + 4;
      const c = atEnd() ? items.length - 1 : current();
      [...dots.children].forEach((d, i) => d.classList.toggle('is-active', i === c));
    };
    track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    prev.addEventListener('click', () => scrollToItem(current() - 1));
    next.addEventListener('click', () => atEnd() ? scrollToItem(0) : scrollToItem(current() + 1));
    update();

    if(auto && !reduceMotion){
      let timer = setInterval(() => next.click(), 5000);
      const stop = () => clearInterval(timer);
      const start = () => { stop(); timer = setInterval(() => next.click(), 5000); };
      track.addEventListener('pointerenter', stop);
      track.addEventListener('pointerleave', start);
      track.addEventListener('touchstart', stop, { passive: true });
      track.addEventListener('focusin', stop);
    }
  }

  makeCarousel(document.querySelector('.testimonios-grid'), { auto: true });

})();
