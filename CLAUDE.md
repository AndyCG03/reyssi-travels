# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Reyssi Travels is a multi-page marketing website for an adventure/nature travel
advisory business. It's a Node.js + Express server that renders EJS templates and
exposes one contact-form API endpoint. The site is in Spanish and is designed to
be deployed on Hostinger's Node.js hosting.

## Commands

```bash
npm install     # install dependencies
npm start       # run the server (node app.js) — http://localhost:3000
npm run dev     # run with nodemon (auto-reload on changes)
```

There is no build step, linter, or test suite. The server reads `PORT` from the
environment (Hostinger sets this), defaulting to 3000.

> On this machine `npm install` may fail with `UNABLE_TO_VERIFY_LEAF_SIGNATURE`
> (proxy/AV SSL inspection). Fix: `$env:NODE_OPTIONS="--use-system-ca"; npm install`.

## Architecture

- **`app.js`** — the backend. Sets EJS as the view engine and serves five page
  routes (`/`, `/nosotros`, `/servicios`, `/destinos`, `/contacto`), each
  `res.render`-ing the matching view. Unknown routes 302-redirect to `/`. Serves
  `public/` as static assets. `POST /api/consulta` validates the contact form and
  sends an email via **nodemailer** when SMTP env vars are set (see below);
  without them it logs the submission and still returns `ok` so dev works.
- **`views/`** — EJS templates. `partials/` holds the shared chrome:
  `head.ejs` (doctype/head, includes `nav.ejs`), `nav.ejs` (top nav + mobile
  drawer, active link via the `page` local), `footer.ejs` (footer + WhatsApp float
  + the `main.js` script tag), `page-hero.ejs` (compact banner for inner pages,
  takes `ph_title`/`ph_subtitle`/`ph_tag`/`ph_img`), and `cta.ejs` (reusable CTA
  band, optional `cta_title`/`cta_text`). Each page includes head → content →
  footer. Only `home.ejs` has the full-screen `#hero`; inner pages use `page-hero`.
- **`public/css/style.css`** — the entire design system. CSS custom properties in
  `:root` define the palette ("Cielo aventura": sky blue `#0EA5E9` + navy
  `#0C4A6E` + adventure-orange accent `#EA580C`) and tokens. **Change colors via
  these variables**, not per-rule hex. Two gradients drive most fills:
  `--blue-grad` (sky→navy) and `--gold-grad` (orange; legacy name, no yellow).
- **`public/js/main.js`** — an ES module. Imports **Motion** (motion.dev) from a
  CDN (`type="module"` script). Handles: navbar scroll state, mobile drawer,
  Motion hero/page-hero entrance, staggered `.reveal` fade-ins (grids stagger
  their children; standalone elements fade individually), stat counters
  (`.count-up`), smooth anchor scroll, and the real contact-form submission
  (`fetch` to `/api/consulta` with loading/success/error states). All blocks guard
  for missing elements and honor `prefers-reduced-motion`.

## Contact form email (SMTP)

`POST /api/consulta` sends mail only when these env vars are set:
`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` (required), plus optional `SMTP_PORT`
(default 465), `SMTP_SECURE` (`true`/`false`), `MAIL_TO`, `MAIL_FROM`. The form
body is HTML-escaped before sending.

## Content placeholders

Hardcoded placeholders to replace before going live: the WhatsApp number
(`https://wa.me/5491100000000`) and email (`hola@reyssitravels.com`) in
`nav`/`footer`/`contacto`, the Unsplash destination/hero photos, and the
statistics in `nosotros.ejs` (`#propuesta`).
