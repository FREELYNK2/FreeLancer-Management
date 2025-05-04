// Smooth scroll for nav links
document.querySelectorAll('nav a[href^="#"]').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Toast welcome message
window.addEventListener('DOMContentLoaded', () => {
  const toast = document.createElement('section');
  toast.className = 'toast-message';
  toast.textContent = 'Welcome to Freelynk!';
  document.body.appendChild(toast);
  setTimeout(() => toast.style.opacity = 1, 300); // fade in
  setTimeout(() => toast.style.opacity = 0, 4000); // fade out
  setTimeout(() => toast.remove(), 4500); // remove after fade
});

// Real-time search filter for service cards
const searchInput = document.querySelector('.search-section input');

if (searchInput) {
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const serviceCards = document.querySelectorAll('.service-card');

    serviceCards.forEach(card => {
      const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
      const description = card.querySelector('p')?.textContent.toLowerCase() || '';

      card.style.display = (title.includes(query) || description.includes(query)) ? 'inline-block' : 'none';
    });
  });
}

// Bounce scroll to "Popular Services"
const searchBtn = document.querySelector('.hero-search-btn');
const scrollTarget = document.querySelector('.popular-services');

if (searchBtn && scrollTarget) {
  searchBtn.addEventListener('click', () => {
    scrollTarget.scrollIntoView({ behavior: 'smooth' });
  });
}

// Toggle hamburger menu and close when clicking outside
const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.menu');

if (menuToggle && menu) {
  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent toggle from closing immediately
    menu.classList.toggle('show');
  });

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !menuToggle.contains(e.target)) {
      menu.classList.remove('show');
    }
  });

  menu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('show');
    });
  });
}

// Arrow Animation Control

document.addEventListener("DOMContentLoaded", function() {
  const lynkButton = document.getElementById('lynk-button');
  const animatedArrow = document.getElementById('animated-arrow');

  lynkButton.addEventListener('click', function() {
    // Fade out the animated arrow after clicking the button
    if (animatedArrow) {
      animatedArrow.style.transition = "opacity 0.5s ease";
      animatedArrow.style.opacity = "0";
    }
  });
});
