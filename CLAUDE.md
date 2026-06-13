# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Reyssi Travels is a single-page marketing website for an adventure/nature travel
advisory business. It's a minimal Node.js + Express server that serves one static
landing page plus one contact-form API endpoint. The site is in Spanish and is
designed to be deployed on Hostinger's Node.js hosting.

## Commands

```bash
npm install     # install dependencies
npm start       # run the server (node app.js) — http://localhost:3000
npm run dev     # run with nodemon (auto-reload on changes)
```

There is no build step, linter, or test suite. The server reads `PORT` from the
environment (Hostinger sets this), defaulting to 3000.

## Architecture

The whole app is three layers, all small:

- **`app.js`** — the entire backend. Serves `views/index.html` at `/`, serves
  `public/` as static assets, and exposes `POST /api/consulta` for the contact
  form. The endpoint currently only validates `nombre`/`email`/`destino` and
  `console.log`s the submission — it does **not** send email yet. `nodemailer` is
  a dependency intended for wiring up email later (see README for the snippet);
  SMTP credentials would go here.
- **`views/index.html`** — the single page. All sections are anchor-linked
  (`#propuesta`, `#servicios`, `#destinos`, `#proceso`, `#testimonios`,
  `#consultoria`). Adding a section means adding both the markup here and its nav
  link.
- **`public/js/main.js`** — all client behavior, organized in labeled blocks:
  navbar scroll state, mobile hamburger drawer, scroll-reveal animations
  (`.reveal` → `.visible`), animated stat counters (`.count-up` with
  `data-target`/`data-suffix`), smooth in-page scrolling, and form handling.

### Important: the contact form is not connected to the backend

`public/js/main.js` intercepts the form submit, validates client-side, and shows a
**simulated** success message — it never calls `POST /api/consulta`. The backend
endpoint exists but is unused by the frontend. If you're asked to "make the form
work," you need to both add a `fetch('/api/consulta', ...)` call in `main.js` and
implement actual email/persistence in `app.js`.

## Content placeholders

Several hardcoded values in `views/index.html` are placeholders that must be
replaced before the site is real (per README): the WhatsApp number
(`https://wa.me/5491100000000`, appears ~3x), the email
(`hola@reyssitravels.com`, appears ~2x), destination photos (Unsplash URLs), and
the statistics in the `#propuesta` section.
