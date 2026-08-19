/*
 * SECCIÓN MEGA TRAVEL — Iframes embebidos del mayorista turístico
 * ===============================================================
 * Esta sección integra iframes de Mega Travel que se actualizan
 * automáticamente con la programación vigente del mayorista.
 * 
 * CÓMO CAMBIAR LOS COLORES (sin #):
 *   Modifica DEST_COLORS y OFERTAS_COLORS abajo.
 *   Los valores son hexadecimales SIN el símbolo #.
 * 
 * TIPOGRAFÍA DISPONIBLE (parámetro ff):
 *   1=Arial, 2=Verdana, 3=Trebuchet MS, 4=Gill Sans,
 *   5=Georgia, 6=Comic Sans MS, 7=Lucida Sans Unicode,
 *   8=Times New Roman, 9=Century Gothic
 * 
 * Si Mega Travel cambia las URLs base, actualiza BASE_DEST
 * y BASE_OFERTAS.
 */

(function() {
  var BASE_DEST = 'https://www.megatravel.com.mx/tools/vi.php';
  var BASE_OFERTAS = 'https://www.megatravel.com.mx/tools/ofertas-viaje.php';

  var DEST_COLORS = {
    txtColor: '4B5563',
    aColor: '1C87C9',
    ahColor: '0B2A4A',
    thBG: '1C87C9',
    thTxColor: 'FFFFFF',
    ff: '9'
  };

  var OFERTAS_COLORS = {
    txtColor: '4B5563',
    lblTPaq: '4B5563',
    lblTRange: '4B5563',
    lblNumRange: '1C87C9',
    itemBack: 'F7F9FB',
    itemHov: 'E2E8F0',
    txtColorHov: '0B2A4A',
    ff: '9'
  };

  var TABS = {
    ofertas: { url: BASE_OFERTAS, params: OFERTAS_COLORS },
    promos:  { url: BASE_DEST, params: DEST_COLORS }
  };

  [1,2,3,4,5,6,7,8,9,10,11,12,13].forEach(function(d) {
    TABS[d] = { url: BASE_DEST, params: Object.assign({}, DEST_COLORS, { Dest: d }) };
  });

  function buildUrl(tabKey) {
    var tab = TABS[tabKey];
    if (!tab) return '';
    var p = new URLSearchParams();
    Object.keys(tab.params).forEach(function(k) { p.set(k, tab.params[k]); });
    return tab.url + '?' + p.toString();
  }

  var iframe = document.getElementById('megaIframe');
  var wrapper = document.getElementById('megaIframeWrapper');
  var loading = document.getElementById('megaLoading');
  var tabs = document.querySelectorAll('.mega-tab');
  var currentTab = 'ofertas';

  function switchTab(tabKey) {
    currentTab = tabKey;
    tabs.forEach(function(t) { t.classList.toggle('is-active', t.dataset.target === tabKey); });
    loading.classList.add('is-visible');
    iframe.classList.remove('is-loaded');
    wrapper.classList.remove('is-loaded');
    iframe.src = buildUrl(tabKey);
  }

  iframe.addEventListener('load', function() {
    loading.classList.remove('is-visible');
    iframe.classList.add('is-loaded');
    wrapper.classList.add('is-loaded');
  });

  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      var target = this.dataset.target;
      if (target === currentTab) return;
      switchTab(target);
    });
  });

  switchTab('ofertas');
})();
