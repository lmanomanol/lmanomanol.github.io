// 1. Menu de navigation mobile (ouverture/fermeture accessible)
const menuToggle = document.getElementById("menu-toggle");
const mainNav = document.getElementById("navigation-principale");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Ferme automatiquement le menu mobile après un clic sur un lien
  const navLinks = mainNav.querySelectorAll("a");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// 2. Filtrage dynamique des expériences professionnelles
const filterButtons = document.querySelectorAll(".filter-btn");
const experienceItems = document.querySelectorAll(".timeline-item");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedFilter = button.dataset.filter;

    // Mise à jour visuelle et sémantique (ARIA) des boutons
    filterButtons.forEach((btn) => {
      const isCurrent = btn === button;
      btn.classList.toggle("is-active", isCurrent);
      btn.setAttribute("aria-pressed", String(isCurrent));
    });

    // Affichage ou masquage de chaque expérience selon ses catégories
    experienceItems.forEach((item) => {
      const categories = item.dataset.category.split(" ");
      const shouldShow =
        selectedFilter === "all" || categories.includes(selectedFilter);

      item.classList.toggle("is-hidden", !shouldShow);
    });
  });
});

// 3. Bouton de copie rapide de l'adresse e-mail
const copyEmailBtn = document.getElementById("copy-email-btn");
const emailText = document.getElementById("email-text");

if (copyEmailBtn && emailText) {
  copyEmailBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(emailText.textContent.trim());
      copyEmailBtn.textContent = "Copié";
      setTimeout(() => {
        copyEmailBtn.textContent = "Copier";
      }, 2000);
    } catch {
      // Solution de repli si le navigateur bloque l'API Clipboard
      copyEmailBtn.textContent = "Sélectionner";
    }
  });
}

// 4. Apparition progressive des blocs au défilement (IntersectionObserver)
const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealElements.forEach((el) => observer.observe(el));
} else {
  // Si le navigateur est ancien, on affiche tout immédiatement
  revealElements.forEach((el) => el.classList.add("is-visible"));
}

// 5. Mise à jour automatique de l'année dans le pied de page
const yearSpan = document.getElementById("current-year");
if (yearSpan) {
  yearSpan.textContent = String(new Date().getFullYear());
}

// 8. Barre de progression globale & Parallaxe au défilement vertical
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const rootEl = document.documentElement;
let isTicking = false;

function updateScrollEffects() {
  const scrollY = window.scrollY;
  const maxScroll = Math.max(1, rootEl.scrollHeight - window.innerHeight);
  const globalProgress = Math.min(Math.max(scrollY / maxScroll, 0), 1);

  rootEl.style.setProperty("--scroll-progress", globalProgress.toFixed(4));

  if (!prefersReducedMotion) {
    const heroShift = Math.min(scrollY, 700) * 0.08;
    rootEl.style.setProperty("--hero-shift", heroShift.toFixed(1));
  }

  isTicking = false;
}

window.addEventListener("scroll", () => {
  if (!isTicking) {
    window.requestAnimationFrame(updateScrollEffects);
    isTicking = true;
  }
}, { passive: true });

window.addEventListener("resize", updateScrollEffects);
updateScrollEffects();

// 9. Rail horizontal interactif (glisser à la souris, touchpad & boutons)
const viewport = document.getElementById("research-viewport");
const prevBtn = document.getElementById("research-prev");
const nextBtn = document.getElementById("research-next");
const researchProgressFill = document.getElementById("research-progress-fill");

if (viewport) {
  const updateSliderUI = () => {
    const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth;

    if (prevBtn) prevBtn.disabled = viewport.scrollLeft <= 2;
    if (nextBtn) nextBtn.disabled = viewport.scrollLeft >= maxScrollLeft - 2;

    if (researchProgressFill && viewport.scrollWidth > 0) {
      const ratio = (viewport.scrollLeft + viewport.clientWidth) / viewport.scrollWidth;
      researchProgressFill.style.transform = `scaleX(${Math.min(Math.max(ratio, 0), 1).toFixed(4)})`;
    }
  };

  // Navigation via les boutons fléchés (avance d'une carte complète)
  const scrollByCard = (direction) => {
    const firstCard = viewport.querySelector(".research-card");
    const step = firstCard ? firstCard.offsetWidth + 24 : 400;
    viewport.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  if (prevBtn) prevBtn.addEventListener("click", () => scrollByCard(-1));
  if (nextBtn) nextBtn.addEventListener("click", () => scrollByCard(1));

  // Glisser-déposer à la souris (drag-to-scroll)
  let isDragging = false;
  let startX = 0;
  let startScrollLeft = 0;

  viewport.addEventListener("mousedown", (event) => {
    isDragging = true;
    startX = event.pageX - viewport.offsetLeft;
    startScrollLeft = viewport.scrollLeft;
    viewport.classList.add("is-dragging");
  });

  window.addEventListener("mousemove", (event) => {
    if (!isDragging) return;
    const x = event.pageX - viewport.offsetLeft;
    const distance = (x - startX) * 1.25;
    viewport.scrollLeft = startScrollLeft - distance;
  });

  window.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;
    viewport.classList.remove("is-dragging");
  });

  viewport.addEventListener("scroll", updateSliderUI, { passive: true });
  window.addEventListener("resize", updateSliderUI);
  window.addEventListener("load", updateSliderUI);
  updateSliderUI();
}

// 10. Halo lumineux polaire qui suit le pointeur sur les cartes
const interactiveCards = document.querySelectorAll(".card, .research-card");

interactiveCards.forEach((card) => {
  card.addEventListener("mousemove", (event) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
  });
});

// 11. Apparition en fondu des textes au défilement
const fadeTextElements = document.querySelectorAll(
  ".section-header .section-tag, .section-header h2, .section-header .section-intro, .edu-list li, .badge-panel, .contact-box .section-tag, .contact-box h2, .contact-text"
);

if (!prefersReducedMotion && "IntersectionObserver" in window && fadeTextElements.length) {
  const textFadeObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  fadeTextElements.forEach((el) => {
    el.classList.add("fade-text");
    textFadeObserver.observe(el);
  });
}

// 12. Envoi asynchrone du formulaire de contact via Web3Forms
const contactForm = document.getElementById("contact-form");
const submitBtn = document.getElementById("submit-btn");
const formStatus = document.getElementById("form-status");

if (contactForm && submitBtn && formStatus) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);

    // Si le champ piège caché est coché par un robot, on annule silencieusement
    if (formData.get("botcheck")) {
      return;
    }

    const payload = Object.fromEntries(formData.entries());
    const originalBtnText = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.textContent = "Envoi en cours...";
    formStatus.textContent = "";
    formStatus.className = "form-status";

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        formStatus.textContent = "Message envoyé. Je vous répondrai dans les plus brefs délais.";
        formStatus.classList.add("is-success");
        contactForm.reset();
      } else {
        formStatus.textContent = data.message || "Une erreur est survenue lors de l'envoi. Vous pouvez utiliser mon adresse e-mail directe.";
        formStatus.classList.add("is-error");
      }
    } catch {
      formStatus.textContent = "Connexion impossible. Vérifiez votre accès internet ou contactez-moi directement par e-mail.";
      formStatus.classList.add("is-error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });
}
