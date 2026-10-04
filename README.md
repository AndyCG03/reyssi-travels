# Reyssi Travels — Proyecto Node.js

## Estructura
```
reyssi-travels/
├── server.js              # Servidor Express
├── package.json
├── data/destinos.json      # Dataset fuente de destinos
└── public/
    ├── index.html          # Landing page
    ├── destinos.html       # Página de todos los destinos con filtros
    ├── css/
    │   ├── tokens.css       # Variables de diseño (colores, tipografías, sombras)
    │   ├── main.css         # Estilos de landing (header, hero, secciones)
    │   └── destinos.css     # Estilos de la página de filtros
    ├── js/
    │   ├── animations.js    # Header con blur al hacer scroll + reveal on scroll + parallax
    │   ├── carousel.js      # Lógica del carrusel de destinos destacados
    │   ├── filters.js       # Lógica de filtros, búsqueda y orden en /destinos
    │   └── destinos-data.json
    └── img/
        └── logo.svg         # Logo recreado de Reyssi Travels
```

## Cómo correr el proyecto

```bash
npm install
npm start
```

Luego abre http://localhost:3000

## Páginas

- **/** — Landing page: header, hero, "¿Por qué viajar con Reyssi?", carrusel de destinos
  destacados (con flechas), viajes destacados, testimonios, galería "Inspírate" y CTA final.
- **/destinos** — Catálogo completo con buscador, filtros por continente / categoría / precio,
  chips de categoría y ordenamiento (precio, duración).

## Notas

- Todas las imágenes de lugares son wireframes/placeholders (ícono de imagen) tal como se pidió,
  listos para reemplazarse por fotos reales — solo hay que sustituir el `<div class="img-placeholder">`
  por un `<img src="...">`.
- El logo se recreó en SVG (`public/img/logo.svg`) inspirado en el isotipo circular azul de Reyssi
  con el avión; puedes reemplazar ese archivo por el PNG/SVG original de tu marca sin tocar el HTML,
  siempre que lo llames igual o ajustes la ruta.
- Efectos premium: header con glassmorphism al hacer scroll, parallax sutil en el hero, reveal-on-scroll
  con easing tipo Apple, hover states con elevación y sombra progresiva.

## Idiomas (multiidioma)

Todos los textos del sitio viven en `locales/`:

- `locales/es.json` — español (idioma por defecto)
- `locales/en.json` — inglés

Las páginas en `public/*.html` son plantillas: en lugar de texto tienen marcadores
como `{{hero.title}}`, que `server.js` (con `i18n.js`) reemplaza antes de enviar la página.

- **Cambiar un texto:** edita el valor en `locales/es.json` (y su traducción en `en.json`).
  No hace falta reiniciar el servidor.
- **Cambiar de idioma:** `?lang=en` o `?lang=es` en cualquier URL; la elección se guarda en
  una cookie. El menú tiene el botón "English / Español".
- **Agregar un idioma:** copia `es.json` como `<codigo>.json`, tradúcelo y añade el código
  a `SUPPORTED` en `i18n.js`.
- Los textos que usa el JavaScript están en la rama `"js"` del JSON.
- El catálogo de Mega Travel (iframe) es de un tercero y siempre se muestra en español.
