var TODOS = [];
var grid = document.getElementById('viajesGrid');
var totalEl = document.getElementById('totalViajes');
var buscador = document.getElementById('buscador');
var filtroContinente = document.getElementById('filtroContinente');
var filtroCategoria = document.getElementById('filtroCategoria');
var filtroPrecio = document.getElementById('filtroPrecio');
var filtroOrden = document.getElementById('filtroOrden');
var resetBtn = document.getElementById('resetFiltros');
var wireframeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>';

function formatoMXN(n){
  return n.toLocaleString('es-MX');
}

function render(lista){
  totalEl.textContent = lista.length;
  if(lista.length === 0){
    grid.innerHTML = '<div class="sin-resultados"><h3>No encontramos viajes con esos filtros</h3><p>Intenta ajustar tu b&uacute;squeda o limpiar los filtros.</p></div>';
    return;
  }
  grid.innerHTML = lista.map(function(d, i){
    return '<article class="viaje-full-card" style="animation-delay:' + Math.min(i,8) * 0.05 + 's">' +
      '<div class="viaje-full-img img-placeholder">' +
        '<span class="viaje-tag">' + d.categoria + '</span>' +
        wireframeIcon +
      '</div>' +
      '<div class="viaje-full-body">' +
        '<span class="viaje-meta">' + d.dias + ' d&iacute;as &middot; ' + d.noches + ' noches</span>' +
        '<h3>' + d.nombre + '</h3>' +
        '<div class="viaje-precio">Desde <strong>$' + formatoMXN(d.precio) + ' MXN</strong></div>' +
        '<a href="/viaje-detalle?id=' + d.id + '" class="btn-ver">Ver viaje</a>' +
      '</div>' +
    '</article>';
  }).join('');
}

function aplicarFiltros(){
  var texto = buscador.value.trim().toLowerCase();
  var continente = filtroContinente.value;
  var categoria = filtroCategoria.value;
  var precioRango = filtroPrecio.value;
  var orden = filtroOrden.value;
  var filtrados = TODOS.filter(function(d){
    var matchTexto = !texto || d.nombre.toLowerCase().includes(texto);
    var matchContinente = !continente || d.continente === continente;
    var matchCategoria = !categoria || d.categoria === categoria;
    var matchPrecio = true;
    if(precioRango){
      var parts = precioRango.split('-');
      matchPrecio = d.precio >= Number(parts[0]) && d.precio <= Number(parts[1]);
    }
    return matchTexto && matchContinente && matchCategoria && matchPrecio;
  });
  if(orden === 'precio-asc') filtrados.sort(function(a,b){ return a.precio - b.precio; });
  if(orden === 'precio-desc') filtrados.sort(function(a,b){ return b.precio - a.precio; });
  if(orden === 'duracion-asc') filtrados.sort(function(a,b){ return a.dias - b.dias; });
  if(orden === 'duracion-desc') filtrados.sort(function(a,b){ return b.dias - a.dias; });
  render(filtrados);
}

buscador.addEventListener('input', aplicarFiltros);
filtroContinente.addEventListener('change', aplicarFiltros);
filtroCategoria.addEventListener('change', aplicarFiltros);
filtroPrecio.addEventListener('change', aplicarFiltros);
filtroOrden.addEventListener('change', aplicarFiltros);
resetBtn.addEventListener('click', function(){
  buscador.value = '';
  filtroContinente.value = '';
  filtroCategoria.value = '';
  filtroPrecio.value = '';
  filtroOrden.value = '';
  aplicarFiltros();
});

fetch('/js/viajes-data.json').then(function(r){ return r.json(); }).then(function(data){
  TODOS = data;
  render(TODOS);
}).catch(function(){
  grid.innerHTML = '<div class="sin-resultados"><h3>No se pudieron cargar los viajes</h3></div>';
});
