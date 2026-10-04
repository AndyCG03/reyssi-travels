// Traducciones del sitio.
// Todos los textos viven en locales/<idioma>.json. Las páginas HTML solo
// tienen marcadores {{clave}} que se reemplazan aquí antes de enviarlas.
//
//   {{nav.home}}            texto (puede incluir HTML simple como <br> o <em>)
//   {{url:wa.customize}}    texto codificado para usarse dentro de una URL
//   {{_lang.current}}       idioma actual (es / en)
//   {{_lang.other}}         el otro idioma (para el botón de cambio)
//
// Para agregar un idioma: crea locales/<codigo>.json con las mismas claves
// que es.json y añade el código a SUPPORTED.
const fs = require('fs');
const path = require('path');

const SUPPORTED = ['es', 'en'];
const DEFAULT = 'es';
const DIR = path.join(__dirname, 'locales');
const cache = new Map();

function load(lang) {
  const file = path.join(DIR, `${lang}.json`);
  const { mtimeMs } = fs.statSync(file);
  const hit = cache.get(lang);
  if (hit && hit.mtimeMs === mtimeMs) return hit.dict;
  const dict = JSON.parse(fs.readFileSync(file, 'utf8'));
  cache.set(lang, { mtimeMs, dict });
  return dict;
}

const lookup = (dict, key) => key.split('.').reduce((obj, k) => (obj == null ? undefined : obj[k]), dict);

function flatten(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj || {})) {
    if (v && typeof v === 'object') flatten(v, `${prefix}${k}.`, out);
    else out[prefix + k] = v;
  }
  return out;
}

// Idioma pedido: ?lang=xx (se guarda en cookie) > cookie > español.
function resolveLang(req, res) {
  const q = req.query && req.query.lang;
  if (SUPPORTED.includes(q)) {
    res.append('Set-Cookie', `lang=${q}; Path=/; Max-Age=31536000; SameSite=Lax`);
    return q;
  }
  const m = (req.headers.cookie || '').match(/(?:^|;\s*)lang=([a-z]{2})/);
  return m && SUPPORTED.includes(m[1]) ? m[1] : DEFAULT;
}

function translate(html, lang) {
  const dict = load(lang);
  const base = load(DEFAULT);
  const other = SUPPORTED.find(l => l !== lang) || DEFAULT;
  return html.replace(/\{\{\s*(url:)?([\w.-]+)\s*\}\}/g, (match, asUrl, key) => {
    let value;
    if (key === '_lang.current') value = lang;
    else if (key === '_lang.other') value = other;
    else value = lookup(dict, key) ?? lookup(base, key);
    if (value == null) {
      console.warn(`[i18n] falta la clave "${key}" (${lang})`);
      return match;
    }
    value = String(value);
    return asUrl ? encodeURIComponent(value) : value.replace(/"/g, '&quot;');
  });
}

// Textos que usa el JavaScript del navegador (rama "js" del diccionario).
function clientScript(lang) {
  const strings = { ...flatten(load(DEFAULT).js), ...flatten(load(lang).js) };
  const json = JSON.stringify(strings).replace(/</g, '\\u003c');
  return `<script>window.I18N=${json};window.__t=function(k,fb){return window.I18N[k]||fb;};</script>`;
}

module.exports = { SUPPORTED, DEFAULT, resolveLang, translate, clientScript };
