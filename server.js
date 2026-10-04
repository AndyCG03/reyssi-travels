const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const i18n = require('./i18n');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, 'public');

// ---------- Seguridad ----------
// No anunciar el framework y enviar encabezados de seguridad básicos.
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.set({
    'Strict-Transport-Security': 'max-age=31536000',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  });
  next();
});

// ---------- Versionado de CSS/JS ----------
// Cada <link>/<script> local recibe ?v=<hash del archivo>. Así el CSS/JS se puede
// guardar en caché un año y aun así cada cambio llega al instante (cambia el hash).
const hashes = new Map();
function versionOf(relPath) {
  const file = path.join(PUBLIC, relPath);
  try {
    const { mtimeMs } = fs.statSync(file);
    const cached = hashes.get(file);
    if (cached && cached.mtimeMs === mtimeMs) return cached.hash;
    const hash = crypto.createHash('md5').update(fs.readFileSync(file)).digest('hex').slice(0, 10);
    hashes.set(file, { mtimeMs, hash });
    return hash;
  } catch {
    return null;
  }
}

const SITE = 'https://reyssitravels.com';

function sendPage(req, res, file, status = 200) {
  const lang = i18n.resolveLang(req, res);
  const pagePath = status === 200 ? req.path.replace(/\.html$/, '').replace(/\/index$/, '/') : null;
  let html = i18n.translate(fs.readFileSync(path.join(PUBLIC, file), 'utf8'), lang)
    .replace(/(href|src)="(\/(?:css|js)\/[^"?#]+\.(?:css|js))"/g, (match, attr, url) => {
      const v = versionOf(url.slice(1));
      return v ? `${attr}="${url}?v=${v}"` : match;
    });
  // Textos para el JS del navegador + versiones de la página en cada idioma (SEO)
  let head = i18n.clientScript(lang);
  if (pagePath) {
    const alt = l => `${SITE}${pagePath}${l === i18n.DEFAULT ? '' : `?lang=${l}`}`;
    head += i18n.SUPPORTED.map(l => `<link rel="alternate" hreflang="${l}" href="${alt(l)}">`).join('')
      + `<link rel="alternate" hreflang="x-default" href="${alt(i18n.DEFAULT)}">`;
    if (lang !== i18n.DEFAULT) {
      html = html.replace(/(<link rel="canonical" href=")([^"]+)(")/, (m, a, href, b) => `${a}${href}?lang=${lang}${b}`);
    }
  }
  html = html.replace('</head>', `${head}\n</head>`);
  res.status(status)
    .set({ 'Cache-Control': 'no-cache, must-revalidate', 'Content-Language': lang, 'Vary': 'Cookie' })
    .type('html').send(html);
}

// ---------- Páginas ----------
const PAGES = { '': 'index.html', index: 'index.html', viajes: 'viajes.html', terminos: 'terminos.html', privacidad: 'privacidad.html' };
app.get(/^\/(index|viajes|terminos|privacidad)?(?:\.html)?\/?$/, (req, res) => {
  sendPage(req, res, PAGES[req.params[0] || '']);
});

// Cualquier otro .html es una plantilla interna (p. ej. 404.html): no se sirve tal cual.
app.get(/\.html$/i, (req, res) => sendPage(req, res, '404.html', 404));

// ---------- Archivos estáticos con caché ----------
app.use(express.static(PUBLIC, {
  index: false,
  setHeaders: (res, filePath) => {
    if (/\.(css|js)$/i.test(filePath)) {
      // Con ?v= (lo pone sendPage) el archivo nunca cambia: caché de 1 año.
      const versioned = res.req && res.req.query && res.req.query.v;
      res.setHeader('Cache-Control', versioned ? 'public, max-age=31536000, immutable' : 'no-cache, must-revalidate');
    } else if (/\.(webp|png|jpe?g|svg|gif|ico|woff2?)$/i.test(filePath)) {
      // Imágenes y fuentes: 30 días. Si reemplazas una imagen, usa un nombre nuevo.
      res.setHeader('Cache-Control', 'public, max-age=2592000');
    }
  }
}));

// ---------- 404 ----------
app.use((req, res) => {
  sendPage(req, res, '404.html', 404);
});

app.listen(PORT, () => {
  console.log(`Reyssi Travels corriendo en http://localhost:${PORT}`);
});
