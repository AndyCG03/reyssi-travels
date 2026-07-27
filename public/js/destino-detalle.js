const wireframeIcon = (size = 32) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="${size}" height="${size}"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>`;

function formatoMXN(n){
  return n.toLocaleString('es-MX');
}

function mensajeWhatsapp(nombre){
  const texto = encodeURIComponent(`Hola, me interesa cotizar el destino "${nombre}" con Reyssi Travels.`);
  return `https://wa.me/525512345678?text=${texto}`;
}

function renderNoEncontrado(){
  document.getElementById('detalleContent').innerHTML = `
    <section class="detalle-notfound">
      <div class="container">
        <h1>No encontramos este destino</h1>
        <p>Puede que el enlace esté incompleto o el destino ya no esté disponible.</p>
        <a href="/destinos" class="btn btn-primary" style="color:#fff;">Ver todos los destinos</a>
      </div>
    </section>
  `;
}

function renderDestino(d, todos){
  document.title = `${d.nombre} — Reyssi Travels`;

  const relacionados = todos
    .filter(t => t.id !== d.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const relacionadosHTML = relacionados.map(r => `
    <article class="destino-rel-card">
      <div class="destino-rel-img img-placeholder">${wireframeIcon()}</div>
      <div class="destino-rel-body">
        <span class="destino-rel-pais">${r.pais} · ${r.continente}</span>
        <h3>${r.nombre}</h3>
        <div class="viaje-meta">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
          ${r.dias} días · ${r.noches} noches
        </div>
        <div class="viaje-precio">Desde <strong>$${formatoMXN(r.precio)} MXN</strong></div>
        <a href="/destino-detalle?id=${r.id}" class="btn-ver">Ver destino</a>
      </div>
    </article>
  `).join('');

  document.getElementById('detalleContent').innerHTML = `
    <section class="detalle-banner">
      <div class="img-placeholder">${wireframeIcon(56)}</div>
      <div class="detalle-banner-overlay">
        <div class="container">
          <div class="detalle-banner-content">
            <div class="detalle-breadcrumb"><a href="/">Inicio</a> / <a href="/destinos">Destinos</a> / ${d.nombre}</div>
            <span class="detalle-tag">${d.categoria}</span>
            <h1>${d.nombre}</h1>
            <p>${d.pais} · ${d.continente}</p>
          </div>
        </div>
      </div>
    </section>

    <div class="container">
      <div class="detalle-quickfacts reveal">
        <div class="detalle-quickfact">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
          <div><span class="label">Duración</span><span class="valor">${d.dias} días · ${d.noches} noches</span></div>
        </div>
        <div class="detalle-quickfact">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          <div><span class="label">País</span><span class="valor">${d.pais}</span></div>
        </div>
        <div class="detalle-quickfact">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2 4 5v6c0 5 3.4 8.7 8 11 4.6-2.3 8-6 8-11V5l-8-3Z"/></svg>
          <div><span class="label">Precio desde</span><span class="valor">$${formatoMXN(d.precio)} MXN</span></div>
        </div>
        <a href="${mensajeWhatsapp(d.nombre)}" target="_blank" rel="noopener" class="btn btn-primary" style="color:#fff;">Cotizar por WhatsApp</a>
      </div>
    </div>

    <div class="container detalle-body">
      <div class="detalle-grid">
        <main class="detalle-main">
          <section class="reveal">
            <h2>Sobre este destino</h2>
            <p class="detalle-descripcion">${d.nombre} en ${d.pais} es un viaje de ${d.dias} días y ${d.noches} noches en la categoría ${d.categoria.toLowerCase()}. Un plan pensado para que solo te preocupes por disfrutar: nosotros coordinamos vuelos, hospedaje y traslados.</p>
          </section>
        </main>

        <aside class="detalle-sidebar reveal">
          <h3>${d.nombre}</h3>
          <p class="precio-desde">Precio desde</p>
          <p class="precio-monto">$${formatoMXN(d.precio)} MXN</p>
          <a href="${mensajeWhatsapp(d.nombre)}" target="_blank" rel="noopener" class="btn btn-primary" style="color:#fff;">Cotizar por WhatsApp</a>
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

fetch('/js/destinos-data.json')
  .then(res => res.json())
  .then(data => {
    const destino = data.find(d => d.id === id);
    if(!destino){
      renderNoEncontrado();
      return;
    }
    renderDestino(destino, data);
  })
  .catch(() => renderNoEncontrado());
