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

// Abrir menú
hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  drawer.classList.toggle("open");
  overlay.classList.toggle("show");
});

// Cerrar menú (botón X)
closeBtn.addEventListener("click", closeMenu);

// Cerrar menú (overlay)
overlay.addEventListener("click", closeMenu);

// Cerrar al hacer click en link
drawerLinks.forEach(link => {
  link.addEventListener("click", closeMenu);
});

function closeMenu() {
  hamburger.classList.remove("active");
  drawer.classList.remove("open");
  overlay.classList.remove("show");
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

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const nombre = form.nombre.value.trim();
  const email = form.email.value.trim();
  const destino = form.destino.value.trim();

  if (!nombre || !email || !destino) {
    showMessage("Por favor completá los campos obligatorios.", "err");
    return;
  }

  // Simulación envío (puedes conectar a backend después)
  showMessage("Consulta enviada correctamente. Te contacto pronto 🙌", "ok");
  form.reset();
});

function showMessage(text, type) {
  mensaje.textContent = text;
  mensaje.className = "form-mensaje " + type;
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

    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
});