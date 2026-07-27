// Header con efecto glass al hacer scroll
const header = document.getElementById('siteHeader');
const headerIsStatic = header && header.classList.contains('header-static');
function updateHeader(){
  if(!header) return;
  if(headerIsStatic || window.scrollY > 40){
    header.classList.add('is-solid');
  } else {
    header.classList.remove('is-solid');
  }
}
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

// Expone la altura real del header como variable CSS (para barras sticky que van justo debajo)
function updateHeaderHeightVar(){
  if(!header) return;
  document.documentElement.style.setProperty('--header-height', header.offsetHeight + 'px');
}
updateHeaderHeightVar();
window.addEventListener('resize', updateHeaderHeightVar);

// Parallax sutil del hero
const heroBg = document.getElementById('heroBg');
if(heroBg){
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    heroBg.style.transform = `scale(1.04) translateY(${y * 0.1}px)`;
  }, { passive: true });
}

// Reveal on scroll (fade + slide up), estilo Apple
const revealItems = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if(entry.isIntersecting){
      setTimeout(() => entry.target.classList.add('is-visible'), i * 60);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

revealItems.forEach(item => revealObserver.observe(item));

// Menú móvil (hamburguesa)
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
if(menuToggle && mobileMenu){
  const closeMenu = () => {
    mobileMenu.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  };
  const openMenu = () => {
    mobileMenu.classList.add('is-open');
    menuToggle.setAttribute('aria-expanded', 'true');
  };
  menuToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('is-open');
    isOpen ? closeMenu() : openMenu();
  });
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
  window.addEventListener('resize', () => {
    if(window.innerWidth > 780) closeMenu();
  });
}
