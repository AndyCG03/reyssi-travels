const carrusel = document.getElementById('destinosCarrusel');
const prevBtn = document.getElementById('carruselPrev');
const nextBtn = document.getElementById('carruselNext');

if(carrusel && prevBtn && nextBtn){
  const getStep = () => {
    const card = carrusel.querySelector('.destino-card');
    if(!card) return 320;
    const style = getComputedStyle(card);
    return card.offsetWidth + parseFloat(style.marginRight || 20) + 20;
  };

  prevBtn.addEventListener('click', () => {
    carrusel.scrollBy({ left: -getStep(), behavior: 'smooth' });
  });
  nextBtn.addEventListener('click', () => {
    carrusel.scrollBy({ left: getStep(), behavior: 'smooth' });
  });
}
