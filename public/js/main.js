// ===============================
// Motion (window.Motion, servido en /js/vendor/motion.js)
// Solo se usa para el scroll-video del hero. Las animaciones de
// entrada (textos y reveals) son CSS puro + IntersectionObserver,
// así NUNCA dependen de que Motion cargue.
// ===============================
const Motion = window.Motion || {};
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ===============================
// LOADER — se oculta al terminar de cargar (con tope de seguridad)
// ===============================
const loader = document.getElementById("loader");
if (loader) {
  let hidden = false;
  const hideLoader = () => {
    if (hidden) return;
    hidden = true;
    loader.classList.add("loaded");
    setTimeout(() => loader.remove(), 650);
  };
  if (document.readyState === "complete") {
    hideLoader();
  } else {
    window.addEventListener("load", hideLoader);
  }
  setTimeout(hideLoader, 4000); // fallback por si 'load' tarda demasiado
}

// ===============================
// NAVBAR SCROLL (cambia estilo)
// ===============================
const navbar = document.getElementById("navbar");
const heroForNav = document.getElementById("hero");
const isHome = !!heroForNav;
const isMobileView = window.matchMedia("(max-width: 768px)").matches;

// El intro "solo el video → aparece al primer scroll" es para DESKTOP.
// En móvil el video se reproduce solo y los textos se muestran de entrada.
const introActive = isHome && !reduceMotion && !isMobileView;
const waFloat = document.querySelector(".wa-float");

if (isHome) {
  if (introActive) {
    navbar.classList.add("nav-intro");
    if (waFloat) waFloat.classList.add("wa-hidden");
  } else {
    heroForNav.classList.add("reveal-text"); // móvil / reduced: textos visibles ya
  }
}

// Sobre el hero la navbar es transparente; se vuelve sólida (blanca) al pasarlo.
const navThreshold = () => (isHome ? heroForNav.offsetHeight - 80 : 50);

const updateNav = () => {
  const y = window.scrollY;
  if (introActive) {
    navbar.classList.toggle("nav-intro", y <= 16);
    heroForNav.classList.toggle("reveal-text", y > 16);
    if (waFloat) waFloat.classList.toggle("wa-hidden", y <= 16);
  }
  if (isHome) heroForNav.classList.toggle("hero-scrolled", y > 40); // oculta el indicador de scroll
  navbar.classList.toggle("scrolled", y > navThreshold());
};
window.addEventListener("scroll", updateNav, { passive: true });
updateNav();

// ===============================
// HAMBURGER + DRAWER MOBILE
// ===============================
const hamburger = document.querySelector(".hamburger");
const drawer = document.querySelector(".nav-drawer");
const overlay = document.querySelector(".nav-overlay");
const closeBtn = document.querySelector(".drawer-close");
const drawerLinks = document.querySelectorAll(".drawer-links a");

// Verificar que los elementos existan antes de agregar eventos
if (hamburger && drawer && overlay) {
  // Abrir menú
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    drawer.classList.toggle("open");
    overlay.classList.toggle("show");
    // Prevenir scroll del body cuando el menú está abierto
    if (drawer.classList.contains("open")) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  });

  // Cerrar menú (botón X)
  if (closeBtn) {
    closeBtn.addEventListener("click", closeMenu);
  }

  // Cerrar menú (overlay)
  overlay.addEventListener("click", closeMenu);

  // Cerrar al hacer click en link
  drawerLinks.forEach(link => {
    link.addEventListener("click", closeMenu);
  });
}

function closeMenu() {
  if (hamburger) hamburger.classList.remove("active");
  if (drawer) drawer.classList.remove("open");
  if (overlay) overlay.classList.remove("show");
  document.body.style.overflow = "";
}

// ===============================
// REVEAL ON SCROLL — IntersectionObserver + CSS transitions
// Sin dependencia de Motion. El ocultar/transicionar lo hace el CSS
// (clase .js en <html>); acá solo agregamos .visible al entrar en viewport.
// ===============================
const reveals = document.querySelectorAll(".reveal");

if (reduceMotion || !("IntersectionObserver" in window)) {
  // Mostrar todo de inmediato
  reveals.forEach(el => el.classList.add("visible"));
} else {
  // Delay escalonado por grupo → efecto cascada
  const groupSelector =
    ".confianza-grid, .servicios-grid, .destinos-grid, .proceso-steps, .testimonios-grid, .faq-list";
  document.querySelectorAll(groupSelector).forEach(group => {
    [...group.querySelectorAll(":scope > .reveal")].forEach((kid, i) => {
      kid.style.transitionDelay = (i * 90) + "ms";
    });
  });

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        obs.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -80px 0px", threshold: 0.08 });

  reveals.forEach(el => io.observe(el));
}

// ===============================
// HERO SCROLL-VIDEO (scrub)
// Desktop: el video avanza con el scroll. Móvil/reduced-motion: queda el poster.
// Usa Motion.scroll() si está disponible; si no, calcula el progreso a mano.
// ===============================
(function initHeroScrub() {
  const section = document.getElementById("hero");
  const video = section && section.querySelector(".hero-video");
  if (!section || !video || !video.dataset.src) return;

  if (reduceMotion) return; // reduced-motion: queda el poster fijo

  // MÓVIL: reproducir el video liviano en loop (fluido) — sin scrub (el seek es entrecortado en móviles)
  if (window.matchMedia("(max-width: 768px)").matches) {
    video.src = video.dataset.srcMobile || video.dataset.src;
    video.loop = true;
    video.muted = true;
    video.setAttribute("playsinline", "");
    const tryPlay = () => { const pr = video.play(); if (pr && pr.catch) pr.catch(() => {}); };
    if (video.readyState >= 2) tryPlay();
    else video.addEventListener("loadeddata", tryPlay, { once: true });
    return;
  }

  // DESKTOP: scrub con el scroll
  video.src = video.dataset.src;
  video.load();

  let duration = 0;
  let target = 0;
  let current = 0;
  video.addEventListener("loadedmetadata", () => { duration = video.duration || 0; });

  const manualProgress = () => {
    const scrollable = Math.max(section.offsetHeight - window.innerHeight, 1);
    const scrolled = Math.min(Math.max(-section.getBoundingClientRect().top, 0), scrollable);
    return scrolled / scrollable;
  };

  if (typeof Motion.scroll === "function") {
    Motion.scroll((p) => { target = (duration || 0) * p; }, {
      target: section,
      offset: ["start start", "end end"],
    });
  } else {
    const onScroll = () => { target = (duration || 0) * manualProgress(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Suavizado (lerp) para un scrub fluido
  const loop = () => {
    if (duration && video.readyState >= 1) {
      current += (target - current) * 0.12;
      if (Math.abs(target - current) < 0.0008) current = target;
      try { video.currentTime = current; } catch (e) {}
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
})();

// ===============================
// COUNT UP (stats animadas)
// ===============================
const counters = document.querySelectorAll(".count-up");

const runCounter = (counter) => {
  const target = +counter.getAttribute("data-target");
  const suffix = counter.getAttribute("data-suffix") || "";
  let current = 0;

  const increment = target / 80;

  const update = () => {
    current += increment;

    if (current < target) {
      counter.innerText = Math.floor(current) + suffix;
      requestAnimationFrame(update);
    } else {
      counter.innerText = target + suffix;
    }
  };

  update();
};

// Trigger cuando entra en viewport
const counterObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      runCounter(entry.target);
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

counters.forEach(counter => {
  counterObserver.observe(counter);
});

// ===============================
// FORMULARIO (validación básica)
// ===============================
const form = document.getElementById("forma-consulta");
const mensaje = document.getElementById("form-mensaje");

if (form) {
  const submitBtn = form.querySelector(".btn-submit");
  const btnText = submitBtn ? submitBtn.innerHTML : "";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = form.nombre?.value.trim();
    const email = form.email?.value.trim();
    const destino = form.destino?.value.trim();

    if (!nombre || !email || !destino) {
      showMessage("Por favor completá los campos obligatorios.", "err");
      return;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showMessage("Por favor ingresá un email válido.", "err");
      return;
    }

    // Payload con todos los campos del formulario
    const payload = {
      nombre,
      email,
      destino,
      whatsapp: form.whatsapp?.value.trim() || "",
      presupuesto: form.presupuesto?.value || "",
      mensaje: form.mensaje?.value.trim() || "",
    };

    // Estado "enviando"
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = "Enviando…";
    }

    try {
      const res = await fetch("/api/consulta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok) {
        showMessage(data.mensaje || "Consulta enviada correctamente. Te contacto pronto 🙌", "ok");
        form.reset();
      } else {
        showMessage(data.mensaje || "No pudimos enviar tu consulta. Probá de nuevo o escribime por WhatsApp.", "err");
      }
    } catch (err) {
      showMessage("Hubo un problema de conexión. Probá de nuevo o escribime por WhatsApp.", "err");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = btnText;
      }
    }
  });
}

function showMessage(text, type) {
  if (mensaje) {
    mensaje.textContent = text;
    mensaje.className = "form-mensaje " + type;
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
      if (mensaje) {
        mensaje.style.display = "none";
        setTimeout(() => {
          if (mensaje) mensaje.style.display = "";
        }, 300);
      }
    }, 5000);
  }
}

// ===============================
// SCROLL SUAVE PARA LINKS INTERNOS
// ===============================
const links = document.querySelectorAll('a[href^="#"]');

links.forEach(link => {
  link.addEventListener("click", (e) => {
    const targetId = link.getAttribute("href");

    if (targetId === "#") return;

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();

    // Cerrar menú móvil si está abierto
    closeMenu();

    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
});

// ===============================
// FLIP CARDS — tap para girar en dispositivos táctiles (sin hover)
// ===============================
if (window.matchMedia("(hover: none)").matches) {
  document.querySelectorAll(".destino-card").forEach(card => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("a")) return; // dejar pasar el enlace del reverso
      card.classList.toggle("flipped");
    });
  });
}

// ===============================
// FILTROS DE DESTINOS (continente + experiencia)
// ===============================
const filtrosWrap = document.querySelector(".filtros");
if (filtrosWrap) {
  const cards = [...document.querySelectorAll("#destinos .destino-card")];
  const empty = document.querySelector(".destinos-empty");
  const pag = document.querySelector(".paginacion");
  const PER_PAGE = 6;
  const estado = { continente: "todos", interes: "todos", page: 1 };

  const filtrar = () => cards.filter(card => {
    const okC = estado.continente === "todos" || card.dataset.continente === estado.continente;
    const okI = estado.interes === "todos" || (card.dataset.interes || "").split(" ").includes(estado.interes);
    return okC && okI;
  });

  const render = () => {
    const visibles = filtrar();
    const totalPages = Math.max(1, Math.ceil(visibles.length / PER_PAGE));
    if (estado.page > totalPages) estado.page = totalPages;
    const start = (estado.page - 1) * PER_PAGE;
    const enPagina = visibles.slice(start, start + PER_PAGE);

    cards.forEach(card => {
      const show = enPagina.includes(card);
      card.classList.toggle("is-hidden", !show);
      if (show) card.classList.add("visible"); // asegura que se vean (las de otras páginas no pasan por el observer)
    });
    if (empty) empty.style.display = visibles.length ? "none" : "block";

    if (pag) {
      pag.innerHTML = "";
      if (totalPages > 1) {
        const mkBtn = (label, page, opts = {}) => {
          const b = document.createElement("button");
          b.className = "pag-btn" + (opts.active ? " active" : "");
          b.innerHTML = label;
          if (opts.disabled) b.disabled = true;
          b.addEventListener("click", () => {
            estado.page = page; render();
            document.getElementById("destinos").scrollIntoView({ behavior: "smooth", block: "start" });
          });
          return b;
        };
        pag.appendChild(mkBtn("‹", estado.page - 1, { disabled: estado.page === 1 }));
        for (let i = 1; i <= totalPages; i++) pag.appendChild(mkBtn(String(i), i, { active: i === estado.page }));
        pag.appendChild(mkBtn("›", estado.page + 1, { disabled: estado.page === totalPages }));
      }
    }
  };

  filtrosWrap.querySelectorAll(".chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const grupo = chip.dataset.group;
      estado[grupo] = chip.dataset.value;
      estado.page = 1;
      filtrosWrap.querySelectorAll('.chip[data-group="' + grupo + '"]').forEach(c => {
        const activo = c === chip;
        c.classList.toggle("active", activo);
        c.setAttribute("aria-pressed", activo ? "true" : "false");
      });
      render();
    });
  });

  render();
}

// ===============================
// MAPA INTERACTIVO (Leaflet) — pines con popup por destino
// ===============================
const mapEl = document.getElementById("mapa-mundi");
if (mapEl && window.L) {
  let destinos = [];
  try { destinos = JSON.parse(mapEl.dataset.destinos || "[]"); } catch (e) { destinos = []; }

  const map = L.map(mapEl, {
    scrollWheelZoom: false,   // zoom solo por botones → no secuestra el scroll de la página
    doubleClickZoom: true,
    zoomControl: false,       // agregamos el control en español más abajo
    worldCopyJump: false,
    maxBounds: [[-85, -180], [85, 180]],
    maxBoundsViscosity: 1.0,
    minZoom: 2,
  }).setView([20, 0], 2);

  // Botones de zoom en español
  L.control.zoom({ zoomInTitle: "Acercar", zoomOutTitle: "Alejar" }).addTo(map);

  // noWrap: el mundo no se repite en horizontal
  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: "&copy; OpenStreetMap, &copy; CARTO",
    subdomains: "abcd",
    maxZoom: 18,
    noWrap: true,
    bounds: [[-85, -180], [85, 180]],
  }).addTo(map);

  // Modal de detalle del destino
  const modal = document.getElementById("destino-modal");
  const setText = (sel, val) => { const el = modal && modal.querySelector(sel); if (el) el.textContent = val || ""; };
  const abrirModal = (d) => {
    if (!modal) return;
    const img = modal.querySelector("#dm-img");
    if (img) { img.src = "https://images.unsplash.com/photo-" + d.img + "?w=800&q=80"; img.alt = d.name; }
    setText("#dm-region", d.region);
    setText("#dm-nombre", d.name);
    setText("#dm-desc", d.desc);
    setText("#dm-epoca", d.epoca);
    setText("#dm-duracion", d.duracion);
    const spots = modal.querySelector("#dm-spots");
    if (spots) { spots.innerHTML = ""; (d.lugares || []).forEach(l => { const li = document.createElement("li"); li.textContent = l; spots.appendChild(li); }); }
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  };
  const cerrarModal = () => { if (modal) { modal.hidden = true; document.body.style.overflow = ""; } };
  if (modal) {
    modal.querySelectorAll("[data-close]").forEach(el => el.addEventListener("click", cerrarModal));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) cerrarModal(); });
  }

  const pin = L.divIcon({ className: "mapa-pin", html: "<span></span>", iconSize: [16, 16], iconAnchor: [8, 8] });
  const puntos = [];
  destinos.forEach(d => {
    const m = L.marker([d.lat, d.lng], { icon: pin }).addTo(map);
    const lugares = Array.isArray(d.lugares) ? d.lugares.join(" · ") : "";
    m.bindPopup(
      `<strong>${d.name}</strong>` +
      `<span class="pop-region">${d.region}</span><br>` +
      `<b>Mejor época:</b> ${d.epoca}<br>` +
      `<b>Duración:</b> ${d.duracion}<br>` +
      (lugares ? `<b>Lugares de interés:</b> ${lugares}<br>` : "") +
      `<span class="pop-hint">Tocá el punto para ver más →</span>`
    );
    m.on("mouseover", () => m.openPopup());   // hover → card con info
    m.on("click", () => abrirModal(d));        // click → detalle + lugares recomendados
    puntos.push([d.lat, d.lng]);
  });

  if (puntos.length) map.fitBounds(puntos, { padding: [50, 50], maxZoom: 4 });
}