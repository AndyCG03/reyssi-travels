let TODOS = [];

const grid = document.getElementById('viajesGrid');
const totalEl = document.getElementById('totalResultados');
const buscador = document.getElementById('buscador');
const filtroContinente = document.getElementById('filtroContinente');
const filtroCategoria = document.getElementById('filtroCategoria');
const filtroPrecio = document.getElementById('filtroPrecio');
const filtroOrden = document.getElementById('filtroOrden');
const resetBtn = document.getElementById('resetFiltros');

const wireframeIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>`;

function formatoMXN(n){
  return n.toLocaleString('es-MX');
}

function render(lista){
  totalEl.textContent = lista.length;

  if(lista.length === 0){
    grid.innerHTML = `
      <div class="sin-resultados">
        <h3>No encontramos viajes con esos filtros</h3>
        <p>Intenta ajustar tu búsqueda o limpiar los filtros.</p>
      </div>`;
    return;
  }

  grid.innerHTML = lista.map((v, i) => `
    <article class="viaje-full-card" style="animation-delay:${Math.min(i,8) * 0.05}s">
      <div class="viaje-full-img img-placeholder">
        <span class="viaje-tag">${v.categoria}</span>
        ${wireframeIcon}
      </div>
      <div class="viaje-full-body">
        <span class="incluye-destinos">${v.destinos.join(' · ')}</span>
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
}

function aplicarFiltros(){
  const texto = buscador.value.trim().toLowerCase();
  const continente = filtroContinente.value;
  const categoria = filtroCategoria.value;
  const precioRango = filtroPrecio.value;
  const orden = filtroOrden.value;

  let filtrados = TODOS.filter(v => {
    const matchTexto = !texto ||
      v.nombre.toLowerCase().includes(texto) ||
      v.destinos.some(d => d.toLowerCase().includes(texto));
    const matchContinente = !continente || v.continente === continente;
    const matchCategoria = !categoria || v.categoria === categoria;
    let matchPrecio = true;
    if(precioRango){
      const [min, max] = precioRango.split('-').map(Number);
      matchPrecio = v.precio >= min && v.precio <= max;
    }
    return matchTexto && matchContinente && matchCategoria && matchPrecio;
  });

  if(orden === 'precio-asc') filtrados.sort((a,b) => a.precio - b.precio);
  if(orden === 'precio-desc') filtrados.sort((a,b) => b.precio - a.precio);
  if(orden === 'duracion-asc') filtrados.sort((a,b) => a.dias - b.dias);
  if(orden === 'duracion-desc') filtrados.sort((a,b) => b.dias - a.dias);

  render(filtrados);
}

[buscador].forEach(el => el.addEventListener('input', aplicarFiltros));
[filtroContinente, filtroCategoria, filtroPrecio, filtroOrden].forEach(el => el.addEventListener('change', aplicarFiltros));

resetBtn.addEventListener('click', () => {
  buscador.value = '';
  filtroContinente.value = '';
  filtroCategoria.value = '';
  filtroPrecio.value = '';
  filtroOrden.value = '';
  aplicarFiltros();
});

// Cargar datos
fetch('/js/viajes-data.json')
  .then(res => res.json())
  .then(data => {
    TODOS = data;
    render(TODOS);
  })
  .catch(() => {
    grid.innerHTML = `<div class="sin-resultados"><h3>No se pudieron cargar los viajes</h3></div>`;
  });
