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

// Las promociones de la home abren directamente el catalogo completo.
document.querySelectorAll('#promociones .mega-slider-item').forEach(item => {
  item.setAttribute('role', 'link');
  item.setAttribute('tabindex', '0');
  item.setAttribute('aria-label', 'Ver paquetes de viaje');

  const openCatalog = () => {
    window.location.href = '/viajes#catalogo';
  };

  item.addEventListener('click', openCatalog);
  item.addEventListener('keydown', event => {
    if(event.key === 'Enter' || event.key === ' '){
      event.preventDefault();
      openCatalog();
    }
  });
});

// Datos de contacto centralizados para todas las páginas del sitio.
(function configureContactLinks(){
  const whatsapp = 'https://wa.me/525514846761';
  const email = 'reyssitravels@gmail.com';
  const social = {
    Instagram: 'https://www.instagram.com/reyssi.travels',
    Facebook: 'https://facebook.com/profile.php?id=100076144146928',
    TikTok: 'https://www.tiktok.com/@reyssi.travels'
  };
  const replaceLegacyEmail = node => {
    if(node.nodeType === Node.TEXT_NODE && node.nodeValue.includes('hola@viajesreyssi.com')){
      node.nodeValue = node.nodeValue.replaceAll('hola@viajesreyssi.com', email);
    }
    node.childNodes && node.childNodes.forEach(replaceLegacyEmail);
  };
  replaceLegacyEmail(document.body);
  document.querySelectorAll('a[href*="wa.me/"]').forEach(link => {
    link.href = link.href.replace(/https:\/\/wa\.me\/[^?]+/, whatsapp);
    if(link.textContent.includes('+52')) link.textContent = '+52 55 1484 6761';
  });
  document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
    link.href = `mailto:${email}`;
    if(link.textContent.includes('@')) link.textContent = email;
  });
  document.querySelectorAll('.social-row a[aria-label]').forEach(link => {
    const url = social[link.getAttribute('aria-label')];
    if(url){ link.href = url; link.target = '_blank'; link.rel = 'noopener'; }
  });
  document.querySelectorAll('.footer-contact li').forEach(item => {
    if(item.textContent.includes('+52 55')) item.childNodes[item.childNodes.length - 1].textContent = '+52 55 1484 6761';
  });
})();
