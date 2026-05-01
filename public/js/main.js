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
// REVEAL ON SCROLL (animaciones)
// ===============================
const reveals = document.querySelectorAll(".reveal");

const revealOnScroll = () => {
  const windowHeight = window.innerHeight;

  reveals.forEach(el => {
    const elementTop = el.getBoundingClientRect().top;

    if (elementTop < windowHeight - 80) {
      el.classList.add("visible");
    }
  });
};

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);

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
  form.addEventListener("submit", (e) => {
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

    // Simulación envío (puedes conectar a backend después)
    showMessage("Consulta enviada correctamente. Te contacto pronto 🙌", "ok");
    form.reset();
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