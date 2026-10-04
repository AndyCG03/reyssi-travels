// Dinamismo del rediseño: hero con fotos que rotan, cinta de destinos y carruseles.
(function(){
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Hero con fotos de Pixabay ----------
     La foto local (Hero.webp) siempre está debajo, así que el hero se ve
     aunque alguna foto externa no cargue. Solo se añaden las que cargan. */
  const slidesBox = document.getElementById('heroSlides');
  const destLabel = document.getElementById('heroDest');
  const dotsBox = document.getElementById('heroDots');
  const PIXABAY = [
    { src: 'https://cdn.pixabay.com/photo/2016/11/29/04/19/ocean-1867285_1280.jpg', place: 'Playas del Caribe' },
    { src: 'https://cdn.pixabay.com/photo/2017/01/20/00/30/maldives-1993704_1280.jpg', place: 'Maldivas' },
    { src: 'https://cdn.pixabay.com/photo/2017/12/15/13/51/polynesia-3021072_1280.jpg', place: 'Polinesia, Pacífico' },
    { src: 'https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832_1280.jpg', place: 'Montañas de Canadá' },
    { src: 'https://cdn.pixabay.com/photo/2016/11/14/03/38/achterwasser-1822668_1280.jpg', place: 'Atardeceres de Europa' }
  ];

  if(slidesBox){
    const slides = [{ el: null, place: destLabel ? destLabel.textContent : '' }];
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

    PIXABAY.forEach(item => {
      const img = new Image();
      img.alt = '';
      img.decoding = 'async';
      img.onload = () => {
        slidesBox.appendChild(img);
        slides.push({ el: img, place: item.place });
        renderDots();
        restart();
      };
      img.src = item.src;
    });
  }

  /* ---------- Cinta de destinos: se duplica para un bucle continuo ---------- */
  document.querySelectorAll('.dest-marquee__track').forEach(track => {
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
