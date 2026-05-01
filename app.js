const express = require('express');
const path = require('path');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// API: Formulario de contacto / consultoría
app.post('/api/consulta', (req, res) => {
  const { nombre, email, whatsapp, destino, presupuesto, mensaje } = req.body;

  // Validación básica
  if (!nombre || !email || !destino) {
    return res.status(400).json({ ok: false, mensaje: 'Faltan campos obligatorios.' });
  }

  // Aquí puedes conectar nodemailer o guardar en DB
  // Por ahora logueamos y respondemos OK
  console.log('Nueva consulta recibida:', { nombre, email, whatsapp, destino, presupuesto, mensaje });

  res.json({
    ok: true,
    mensaje: `¡Gracias ${nombre}! Te contactamos en menos de 24 hs.`
  });
});

// Puerto — Hostinger usa la variable PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Reyssi Travels corriendo en puerto ${PORT}`);
});
