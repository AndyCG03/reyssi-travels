const express = require('express');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const app = express();

// Motor de vistas (EJS) + middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos: caché larga (1 año). Como las URLs llevan ?v=<mtime>
// (ver helper assetVersion), al cambiar un archivo cambia su URL y el navegador
// lo vuelve a descargar automáticamente. Sin cambios → usa caché (rápido).
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1y',
  etag: true,
  lastModified: true,
}));

// Cache-busting: versión de cada asset según su fecha de modificación.
// En las vistas: <link href="/css/style.css?v=<%= v('css/style.css') %>">
const assetVersion = (relPath) => {
  try {
    return fs.statSync(path.join(__dirname, 'public', relPath)).mtimeMs.toString(36);
  } catch {
    return '1';
  }
};
app.locals.v = assetVersion;

// El HTML nunca se cachea: siempre se sirve fresco para que tome las
// últimas versiones (?v=) de CSS/JS apenas se despliega un cambio.
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.includes('.')) {
    res.set('Cache-Control', 'no-cache');
  }
  next();
});

// ─────────────────────────────────────────────
// Transporte de email (nodemailer)
// Se configura por variables de entorno. Si no están
// definidas, el endpoint registra la consulta pero avisa
// que no se envió email (no se simula nada en el frontend).
// Variables: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS,
//            SMTP_SECURE ("true"/"false"), MAIL_TO, MAIL_FROM
// ─────────────────────────────────────────────
let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
} else {
  console.warn(
    '[Reyssi] SMTP no configurado: las consultas se registran en consola pero no se envían por email. ' +
    'Definí SMTP_HOST, SMTP_USER, SMTP_PASS (y opcional MAIL_TO) para activar el envío.'
  );
}

const escapeHtml = (str = '') =>
  String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Rutas de páginas
app.get('/', (req, res) => res.render('home'));
app.get('/nosotros', (req, res) => res.render('nosotros'));
app.get('/servicios', (req, res) => res.render('servicios'));
app.get('/destinos', (req, res) => res.render('destinos'));
app.get('/contacto', (req, res) => res.render('contacto'));

// API: Formulario de contacto / consultoría
app.post('/api/consulta', async (req, res) => {
  const { nombre, email, whatsapp, destino, presupuesto, mensaje } = req.body || {};

  // Validación
  if (!nombre || !email || !destino) {
    return res.status(400).json({ ok: false, mensaje: 'Faltan campos obligatorios.' });
  }
  if (!emailRegex.test(email)) {
    return res.status(400).json({ ok: false, mensaje: 'El email no es válido.' });
  }

  const datos = { nombre, email, whatsapp, destino, presupuesto, mensaje };
  console.log('Nueva consulta recibida:', datos);

  // Si no hay SMTP configurado, registramos y devolvemos ok
  // (el envío real requiere configurar las variables de entorno).
  if (!transporter) {
    return res.json({
      ok: true,
      mensaje: `¡Gracias ${nombre}! Recibimos tu consulta y te contactamos en menos de 24 hs.`,
    });
  }

  // Enviar email
  try {
    const to = process.env.MAIL_TO || process.env.SMTP_USER;
    const from = process.env.MAIL_FROM || `"Reyssi Travels" <${process.env.SMTP_USER}>`;

    await transporter.sendMail({
      from,
      to,
      replyTo: email,
      subject: `Nueva consulta de ${nombre} — ${destino}`,
      html: `
        <h2>Nueva consulta desde la web</h2>
        <p><b>Nombre:</b> ${escapeHtml(nombre)}</p>
        <p><b>Email:</b> ${escapeHtml(email)}</p>
        <p><b>WhatsApp:</b> ${escapeHtml(whatsapp) || '—'}</p>
        <p><b>Destino / aventura:</b> ${escapeHtml(destino)}</p>
        <p><b>Presupuesto:</b> ${escapeHtml(presupuesto) || '—'}</p>
        <p><b>Mensaje:</b><br>${escapeHtml(mensaje).replace(/\n/g, '<br>') || '—'}</p>
      `,
    });

    res.json({
      ok: true,
      mensaje: `¡Gracias ${nombre}! Recibimos tu consulta y te contactamos en menos de 24 hs.`,
    });
  } catch (err) {
    console.error('Error al enviar el email de la consulta:', err);
    res.status(500).json({
      ok: false,
      mensaje: 'No pudimos enviar tu consulta en este momento. Probá de nuevo o escribinos por WhatsApp.',
    });
  }
});

// 404 — cualquier ruta no encontrada vuelve al inicio
app.use((req, res) => {
  res.status(404).redirect('/');
});

// Puerto — Hostinger usa la variable PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Reyssi Travels corriendo en puerto ${PORT}`);
});
