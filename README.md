# Reyssi Travels 🌿

Página web para asesoría de viajes de aventura y naturaleza.
Stack: **Node.js + Express** — lista para subir a Hostinger.

---

## 📁 Estructura del proyecto

```
reyssi-travels/
├── app.js              ← Servidor Express principal
├── package.json
├── views/
│   └── index.html      ← Página principal
└── public/
    ├── css/
    │   └── style.css
    └── js/
        └── main.js
```

---

## 🚀 Cómo subir a Hostinger (Node.js Hosting)

### 1. Preparar el proyecto

```bash
npm install
```

### 2. Comprimir el proyecto

Comprimí la carpeta como `.zip` (sin node_modules).

### 3. En el panel de Hostinger

1. Entrá a **Hosting → Administrar → Node.js**
2. Seleccioná la versión de Node (recomendado: 18 o 20)
3. Configurá el **Entry point**: `app.js`
4. Subí el `.zip` vía **Administrador de archivos** o FTP a `public_html`
5. Descomprimí y ejecutá `npm install` desde la terminal SSH de Hostinger
6. Iniciá la app con el botón **Start** del panel Node.js

### 4. Variables de entorno (opcional)

En el panel de Hostinger → **Variables de entorno**, podés agregar:

```
NODE_ENV=production
```

---

## ✏️ Personalizaciones pendientes (¡hacélas antes de publicar!)

### En `views/index.html`

| Qué cambiar | Dónde buscarlo | Por qué |
|---|---|---|
| Número de WhatsApp | `https://wa.me/5491100000000` (aparece 3 veces) | Tu número real |
| Email | `hola@reyssitravels.com` (aparece 2 veces) | Tu email real |
| Fotos de destinos | URLs de Unsplash | Podés usar las tuyas |
| Estadísticas (150+ viajes, etc.) | Sección `#propuesta` | Usá tus números reales |

### Para activar el envío de emails (formulario)

En `app.js`, en el endpoint `/api/consulta`, agregá nodemailer:

```js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',  // o Gmail, etc.
  port: 465,
  secure: true,
  auth: {
    user: 'hola@reyssitravels.com',
    pass: 'TU_CONTRASEÑA'
  }
});

await transporter.sendMail({
  from: '"Reyssi Travels" <hola@reyssitravels.com>',
  to: 'hola@reyssitravels.com',
  subject: `Nueva consulta de ${nombre}`,
  html: `<p><b>Nombre:</b> ${nombre}</p>
         <p><b>Email:</b> ${email}</p>
         <p><b>WhatsApp:</b> ${whatsapp}</p>
         <p><b>Destino:</b> ${destino}</p>
         <p><b>Presupuesto:</b> ${presupuesto}</p>
         <p><b>Mensaje:</b> ${mensaje}</p>`
});
```

---

## 🧪 Probar en local

```bash
npm install
npm start
# Abrí http://localhost:3000
```

---

## 📦 Dependencias

- `express` — servidor web
- `nodemailer` — envío de emails (opcional, para el formulario)
