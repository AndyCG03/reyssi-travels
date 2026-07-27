const wireframeIcon = (size = 32) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="${size}" height="${size}"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>`;

function formatoMXN(n){
  return n.toLocaleString('es-MX');
}

function iconoIncluye(){
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m5 12 4 4L19 7"/></svg>`;
}

function mensajeWhatsapp(nombre){
  const texto = encodeURIComponent(`Hola, me interesa cotizar el viaje "${nombre}" con Reyssi Travels.`);
  return `https://wa.me/525512345678?text=${texto}`;
}

function renderNoEncontrado(){
  document.getElementById('detalleContent').innerHTML = `
    <section class="detalle-notfound">
      <div class="container">
        <h1>No encontramos este viaje</h1>
        <p>Puede que el enlace esté incompleto o el viaje ya no esté disponible.</p>
        <a href="/viajes" class="btn btn-primary" style="color:#fff;">Ver todos los viajes</a>
      </div>
    </section>
  `;
}

function renderViaje(viaje, todos){
  document.title = `${viaje.nombre} — Reyssi Travels`;

  const destinosHTML = viaje.destinos.map(d => `
    <div class="destino-incluido-item">
      <div class="img-placeholder">${wireframeIcon(24)}</div>
      <div class="destino-incluido-nombre">${d}</div>
    </div>
  `).join('');

  const itinerarioHTML = viaje.itinerario.map(paso => `
    <div class="itinerario-item">
      <div class="itinerario-dia"><span>Día ${paso.dia}</span></div>
      <div class="itinerario-texto">
        <h3>${paso.titulo}</h3>
        <p>${paso.descripcion}</p>
      </div>
    </div>
  `).join('');

  const incluyeHTML = viaje.incluye.map(item => `
    <li class="incluye-item">${iconoIncluye()}<span>${item}</span></li>
  `).join('');

  const relacionados = todos
    .filter(v => v.id !== viaje.id && v.categoria === viaje.categoria)
    .concat(todos.filter(v => v.id !== viaje.id && v.categoria !== viaje.categoria))
    .slice(0, 3);

  const relacionadosHTML = relacionados.map(v => `
    <article class="viaje-card">
      <div class="viaje-card-img img-placeholder">${wireframeIcon()}</div>
      <div class="viaje-card-body">
        <h3>${v.nombre}</h3>
        <div class="viaje-meta">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
          ${v.dias} días · ${v.noches} noches
        </div>
        <div class="viaje-precio">Desde <strong>$${formatoMXN(v.precio)} MXN</strong></div>
        <a href="/viaje-detalle?id=${v.id}" class="btn-ver">Ver viaje</a>
      </div>
    </article>
  `).join('');

  document.getElementById('detalleContent').innerHTML = `
    <section class="detalle-banner">
      <div class="img-placeholder">${wireframeIcon(56)}</div>
      <div class="detalle-banner-overlay">
        <div class="container">
          <div class="detalle-banner-content">
            <div class="detalle-breadcrumb"><a href="/">Inicio</a> / <a href="/viajes">Viajes</a> / ${viaje.nombre}</div>
            <span class="detalle-tag">${viaje.categoria}</span>
            <h1>${viaje.nombre}</h1>
            <p>${viaje.resumen}</p>
          </div>
        </div>
      </div>
    </section>

    <div class="container">
      <div class="detalle-quickfacts reveal">
        <div class="detalle-quickfact">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
          <div><span class="label">Duración</span><span class="valor">${viaje.dias} días · ${viaje.noches} noches</span></div>
        </div>
        <div class="detalle-quickfact">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          <div><span class="label">Destinos incluidos</span><span class="valor">${viaje.destinos.length} paradas</span></div>
        </div>
        <div class="detalle-quickfact">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2 4 5v6c0 5 3.4 8.7 8 11 4.6-2.3 8-6 8-11V5l-8-3Z"/></svg>
          <div><span class="label">Precio desde</span><span class="valor">$${formatoMXN(viaje.precio)} MXN</span></div>
        </div>
        <a href="${mensajeWhatsapp(viaje.nombre)}" target="_blank" rel="noopener" class="btn btn-primary" style="color:#fff;">Cotizar por WhatsApp</a>
      </div>
    </div>

    <div class="container detalle-body">
      <div class="detalle-grid">
        <main class="detalle-main">
          <section class="reveal">
            <h2>Sobre este viaje</h2>
            <p class="detalle-descripcion">${viaje.resumen} Un plan pensado para que solo te preocupes por disfrutar: nosotros coordinamos vuelos, hospedaje y traslados entre cada destino.</p>
          </section>

          <section class="reveal">
            <h2>Destinos que visitarás</h2>
            <div class="destinos-incluidos-grid">${destinosHTML}</div>
          </section>

          <section class="reveal">
            <h2>Itinerario día por día</h2>
            <div class="itinerario-list">${itinerarioHTML}</div>
          </section>

          <section class="reveal">
            <h2>Qué incluye</h2>
            <ul class="incluye-list">${incluyeHTML}</ul>
          </section>
        </main>

        <aside class="detalle-sidebar reveal">
          <h3>${viaje.nombre}</h3>
          <p class="precio-desde">Precio desde</p>
          <p class="precio-monto">$${formatoMXN(viaje.precio)} MXN</p>
          <a href="${mensajeWhatsapp(viaje.nombre)}" target="_blank" rel="noopener" class="btn btn-primary" style="color:#fff;">Cotizar por WhatsApp</a>
          <p class="sidebar-nota">Respuesta en menos de 24 horas.</p>
        </aside>
      </div>
    </div>

    ${relacionados.length ? `
    <section class="relacionados-section">
      <div class="container">
        <h2>También te puede interesar</h2>
        <div class="relacionados-grid">${relacionadosHTML}</div>
      </div>
    </section>` : ''}
  `;

  // Reactivar animaciones reveal para el contenido recién insertado
  const revealItems = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if(entry.isIntersecting){
        setTimeout(() => entry.target.classList.add('is-visible'), i * 60);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
  revealItems.forEach(item => revealObserver.observe(item));
}

const params = new URLSearchParams(window.location.search);
const id = Number(params.get('id'));

fetch('/js/viajes-data.json')
  .then(res => res.json())
  .then(data => {
    const viaje = data.find(v => v.id === id);
    if(!viaje){
      renderNoEncontrado();
      return;
    }
    renderViaje(viaje, data);
  })
  .catch(() => renderNoEncontrado());
