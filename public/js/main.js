// ===============================
// Motion (window.Motion, servido en /js/vendor/motion.js)
// Solo se usa para el scroll-video del hero. Las animaciones de
// entrada (textos y reveals) son CSS puro + IntersectionObserver,
// así NUNCA dependen de que Motion cargue.
// ===============================
const Motion = window.Motion || {};
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ===============================
// NAVBAR SCROLL (cambia estilo)
// ===============================
const navbar = document.getElementById("navbar");
const heroForNav = document.getElementById("hero");

// Sobre el hero la navbar es transparente (para ver el efecto); se vuelve
// sólida recién al pasarlo. En otras páginas, a partir de 50px.
const navThreshold = () =>
  heroForNav ? heroForNav.offsetHeight - 80 : 50;

const updateNav = () => {
  navbar.classList.toggle("scrolled", window.scrollY > navThreshold());
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

  const isDesktop = window.matchMedia("(min-width: 768px)").matches;
  if (reduceMotion || !isDesktop) return; // móvil / reduced → se ve el poster fijo

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