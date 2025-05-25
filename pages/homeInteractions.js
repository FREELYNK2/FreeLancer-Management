export function initSmoothScroll() {
  // Select all anchor links in navigation that start with '#'
  document.querySelectorAll('nav a[href^="#"]').forEach(link => {
    // Add click event listener to each link
    link.addEventListener('click', function (e) {
      e.preventDefault(); // Prevent default anchor behavior
      const target = document.querySelector(this.getAttribute('href')); // Get target element
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' }); // Smooth scroll to target
      }
    });
  });
}

export function showToastMessage() {
  const toast = document.createElement('section'); // Create new section element
  toast.className = 'toast-message'; // Add CSS class
  toast.textContent = 'Welcome to Freelynk!'; // Set text content
  document.body.appendChild(toast); // Add to DOM
  setTimeout(() => toast.style.opacity = 1, 300); // Fade in after 300ms
  setTimeout(() => toast.style.opacity = 0, 4000); // Fade out after 4s
  setTimeout(() => toast.remove(), 4500); // Remove element after fade out
}

export function initSearchFilter() {
  const searchInput = document.querySelector('.search-section input'); // Get search input
  if (searchInput) {
    // Add input event listener
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase(); // Get search query in lowercase
      const serviceCards = document.querySelectorAll('.service-card'); // Get all service cards
      serviceCards.forEach(card => {
        // Get card title and description text
        const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const description = card.querySelector('p')?.textContent.toLowerCase() || '';
        // Show/hide based on search match
        card.style.display = (title.includes(query) || description.includes(query)) ? 'inline-block' : 'none';
      });
    });
  }
}

export function initScrollToServices() {
  const searchBtn = document.querySelector('.hero-search-btn'); // Get search button
  const scrollTarget = document.querySelector('.popular-services'); // Get target section
  if (searchBtn && scrollTarget) {
    // Add click event to scroll to services
    searchBtn.addEventListener('click', () => {
      scrollTarget.scrollIntoView({ behavior: 'smooth' }); // Smooth scroll
    });
  }
}

export function initHamburgerMenu() {
  const menuToggle = document.querySelector('.menu-toggle'); // Get menu toggle button
  const menu = document.querySelector('.menu'); // Get menu element

  if (menuToggle && menu) {
    // Toggle menu on button click
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent event bubbling
      menu.classList.toggle('show'); // Toggle 'show' class
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && !menuToggle.contains(e.target)) {
        menu.classList.remove('show'); // Remove 'show' class
      }
    });

    // Close menu when clicking nav links
    menu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('show'); // Remove 'show' class
      });
    });
  }
}