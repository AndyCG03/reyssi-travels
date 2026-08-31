const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;
const MEGATRAVELER_URL = 'https://www.megatravel.com.mx/tools/megatraveler.php';
let magazineStatusCache = { available: false, checkedAt: 0 };

function checkMagazineAvailability() {
  return new Promise((resolve) => {
    const request = https.get(MEGATRAVELER_URL, { timeout: 5000 }, (response) => {
      const available = response.statusCode >= 200 && response.statusCode < 400;
      response.resume();
      resolve(available);
    });
    request.on('timeout', () => request.destroy());
    request.on('error', () => resolve(false));
  });
}

app.use(express.static(path.join(__dirname, 'public'), {
  extensions: ['html'],
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    } else if (/\.(css|js)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    }
  }
}));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/viajes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'viajes.html'));
});

app.get('/terminos', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'terminos.html'));
});

app.get('/privacidad', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'privacidad.html'));
});

app.get('/api/megatraveler-status', async (req, res) => {
  const cacheIsFresh = Date.now() - magazineStatusCache.checkedAt < 15 * 60 * 1000;
  if (!cacheIsFresh) {
    magazineStatusCache = {
      available: await checkMagazineAvailability(),
      checkedAt: Date.now()
    };
  }
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.json({ available: magazineStatusCache.available });
});

app.listen(PORT, () => {
  console.log(`Reyssi Travels corriendo en http://localhost:${PORT}`);
});
