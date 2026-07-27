const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

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

app.get('/destinos', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'destinos.html'));
});

app.get('/viajes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'viajes.html'));
});

app.get('/viaje-detalle', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'viaje-detalle.html'));
});

app.get('/destino-detalle', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'destino-detalle.html'));
});

app.listen(PORT, () => {
  console.log(`Reyssi Travels corriendo en http://localhost:${PORT}`);
});
