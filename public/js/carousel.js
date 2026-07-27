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
