const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

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

function sendPage(res, file, status = 200) {
  const html = fs.readFileSync(path.join(PUBLIC, file), 'utf8')
    .replace(/(href|src)="(\/(?:css|js)\/[^"?#]+\.(?:css|js))"/g, (match, attr, url) => {
      const v = versionOf(url.slice(1));
      return v ? `${attr}="${url}?v=${v}"` : match;
    });
  res.status(status).set('Cache-Control', 'no-cache, must-revalidate').type('html').send(html);
}

// ---------- Páginas ----------
const PAGES = { '': 'index.html', index: 'index.html', viajes: 'viajes.html', terminos: 'terminos.html', privacidad: 'privacidad.html' };
app.get(/^\/(index|viajes|terminos|privacidad)?(?:\.html)?\/?$/, (req, res) => {
  sendPage(res, PAGES[req.params[0] || '']);
});

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
  sendPage(res, '404.html', 404);
});

app.listen(PORT, () => {
  console.log(`Reyssi Travels corriendo en http://localhost:${PORT}`);
});
