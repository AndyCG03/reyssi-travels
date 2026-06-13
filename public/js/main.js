// ===============================
// MOTION (motion.dev) — animaciones
// Cargado vía CDN ESM (el proyecto no usa bundler)
// ===============================
// Motion se carga desde /js/vendor/motion.js (window.Motion). Sin CDN.
const { animate, inView, stagger } = window.Motion || {};
const motionReady = typeof animate === "function" && typeof inView === "function";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ===============================
// NAVBAR SCROLL (cambia estilo)
// ===============================
const navbar = document.getElementById("navbar");

window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

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
// ENTRADA DEL HERO (Motion, al cargar)
// El título, texto y botones aparecen en cascada
// ===============================
if (!reduceMotion && motionReady) {
  const heroEls = document.querySelectorAll(
    "#hero .hero-content > *, #hero .hero-scroll, .page-hero .container > *"
  );
  if (heroEls.length) {
    animate(
      heroEls,
      { opacity: [0, 1], transform: ["translateY(20px)", "translateY(0px)"] },
      { duration: 0.95, delay: stagger(0.14, { start: 0.1 }), easing: [0.22, 1, 0.36, 1] }
    );
  }
}

// ===============================
// REVEAL ON SCROLL (Motion)
// Grupos (grillas) → cascada escalonada · sueltos → uno a uno
// ===============================
const reveals = document.querySelectorAll(".reveal");

// Estado inicial: ocultos y desplazados hacia abajo
reveals.forEach(el => {
  el.style.opacity = "0";
  el.style.transform = "translateY(24px)";
});

if (reduceMotion || !motionReady) {
  // Sin animación (o Motion no disponible): mostrar todo de inmediato
  reveals.forEach(el => {
    el.style.opacity = "";
    el.style.transform = "";
    el.classList.add("visible");
  });
} else {
  const show = (el, delay = 0) => {
    animate(
      el,
      { opacity: [0, 1], transform: ["translateY(24px)", "translateY(0px)"] },
      { duration: 0.7, delay, easing: [0.22, 1, 0.36, 1] }
    );
    el.classList.add("visible");
  };

  // Contenedores cuyos hijos .reveal aparecen en cascada
  const groupSelector =
    ".confianza-grid, .servicios-grid, .destinos-grid, .proceso-steps, .testimonios-grid, .faq-list";
  const groups = document.querySelectorAll(groupSelector);
  const grouped = new Set();

  groups.forEach(group => {
    const kids = [...group.querySelectorAll(":scope > .reveal")];
    if (!kids.length) return;
    kids.forEach(k => grouped.add(k));
    inView(group, () => {
      kids.forEach((kid, i) => show(kid, i * 0.09));
    }, { margin: "0px 0px -80px 0px" });
  });

  // Elementos .reveal sueltos (fuera de grupos)
  const standalone = [...reveals].filter(el => !grouped.has(el));
  if (standalone.length) {
    inView(standalone, (el) => show(el), { margin: "0px 0px -80px 0px" });
  }
}

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