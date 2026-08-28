function initCarrusel(id, cardClass){
  const carrusel = document.getElementById(id);
  const prevBtn = document.getElementById(id.replace('Carrusel', 'CarruselPrev'));
  const nextBtn = document.getElementById(id.replace('Carrusel', 'CarruselNext'));

  if(carrusel && prevBtn && nextBtn){
    const getStep = () => {
      const card = carrusel.querySelector(cardClass);
      if(!card) return 320;
      return card.offsetWidth + 20;
    };
    prevBtn.addEventListener('click', () => {
      carrusel.scrollBy({ left: -getStep(), behavior: 'smooth' });
    });
    nextBtn.addEventListener('click', () => {
      carrusel.scrollBy({ left: getStep(), behavior: 'smooth' });
    });
  }
}

initCarrusel('destinosCarrusel', '.destino-card');
initCarrusel('viajesCarrusel', '.viaje-card');

(function initHomePromotionsCarousel(){
  const container = document.querySelector('[data-home-promotions]');
  if(!container) return;
  container.querySelectorAll('.mega-slider-item').forEach(item => {
    const overlay = item.querySelector('.mega-slider-overlay') || item.appendChild(document.createElement('div'));
    overlay.className = 'mega-slider-overlay';
    if(!overlay.querySelector('.mega-slider-link')){
      const link = document.createElement('a');
      link.className = 'mega-slider-link';
      link.href = '/viajes#catalogo';
      link.textContent = 'Ver paquetes';
      link.setAttribute('aria-label', 'Ver paquetes de viaje');
      overlay.appendChild(link);
    }
  });
  const mobileQuery = window.matchMedia('(max-width: 767px)');
  container.querySelectorAll('[data-promotion-carousel]').forEach(slider => {
    let timer;
    let paused = false;
    const stop = () => { if(timer) { clearInterval(timer); timer = null; } };
    const start = () => {
      stop();
      if(!mobileQuery.matches || paused) return;
      timer = setInterval(() => {
        const card = slider.querySelector('.mega-slider-item');
      if(!card) return;
      const step = card.getBoundingClientRect().width + 12;
      const atEnd = slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 4;
      slider.scrollTo({ left: atEnd ? 0 : slider.scrollLeft + step, behavior: 'smooth' });
      }, 3000);
    };
    slider.addEventListener('touchstart', () => { paused = true; stop(); }, { passive: true });
    slider.addEventListener('touchend', () => { paused = false; start(); }, { passive: true });
    slider.addEventListener('pointerenter', () => { paused = true; stop(); });
    slider.addEventListener('pointerleave', () => { paused = false; start(); });
    start();
  });
  mobileQuery.addEventListener('change', () => container.querySelectorAll('[data-promotion-carousel]').forEach(slider => slider.dispatchEvent(new Event('pointerleave'))));
})();
