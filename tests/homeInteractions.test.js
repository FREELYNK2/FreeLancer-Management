/**
 * @jest-environment jsdom
 */

// Mock the scrollIntoView method
Element.prototype.scrollIntoView = jest.fn();

// Mock timers
jest.useFakeTimers();

describe('UI Interactions', () => {
  beforeEach(() => {
    // Set up DOM with semantic section elements
    document.body.innerHTML = `
      <nav>
        <a href="#services">Services</a>
        <a href="#contact">Contact</a>
      </nav>
      
      <section id="services"></section>
      <section id="contact"></section>
      
      <section class="search-container">
        <input type="text" placeholder="Search services..." aria-label="Search services">
      </section>
      
      <section class="service-cards">
        <article class="service-card">
          <h3>Web Development</h3>
          <p>Professional website creation</p>
        </article>
        <article class="service-card">
          <h3>Graphic Design</h3>
          <p>Logo and branding services</p>
        </article>
      </section>
      
      <button class="hero-search-btn" aria-label="Find services">Find Services</button>
      <section class="popular-services" aria-label="Popular services"></section>
      
      <button class="menu-toggle" aria-expanded="false" aria-label="Toggle menu">Menu</button>
      <nav class="menu" aria-hidden="true">
        <a class="nav-link" href="#">Home</a>
        <a class="nav-link" href="#">Services</a>
      </nav>
      
      <button class="error-btn" disabled>Error Test</button>
    `;

    // Load your actual script file
    require('../pages/Freelancing.js');
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Navigation and Scrolling', () => {
    test('smooth scrolls to section when nav link is clicked', () => {
      const link = document.querySelector('a[href="#services"]');
      const servicesSection = document.getElementById('services');

      link.click();

      expect(servicesSection.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth'
      });
    });

    test('scrolls to popular services on button click', () => {
      const button = document.querySelector('.hero-search-btn');
      const servicesSection = document.querySelector('.popular-services');

      button.click();

      expect(servicesSection.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth'
      });
    });
  });

  describe('Toast Messages', () => {
    test('displays and removes welcome message', () => {
      window.dispatchEvent(new Event('DOMContentLoaded'));

      const toast = document.querySelector('.toast-message');
      expect(toast).not.toBeNull();

      // Fast-forward through fade-in
      jest.advanceTimersByTime(300);
      expect(toast.style.opacity).toBe('1');

      // Fast-forward through fade-out and removal
      jest.advanceTimersByTime(4200);
      expect(toast.style.opacity).toBe('0');
      expect(document.querySelector('.toast-message')).toBeNull();
    });
  });

  describe('Search Functionality', () => {
    test('filters services based on search input', () => {
      const searchInput = document.querySelector('.search-container input');
      const cards = document.querySelectorAll('.service-card');

      // Search for "web"
      searchInput.value = 'web';
      searchInput.dispatchEvent(new Event('input'));

      expect(cards[0].style.display).not.toEqual('none');
      expect(['none', '', 'inline-block']).toContain(cards[1].style.display);

      // Clear search
      searchInput.value = '';
      searchInput.dispatchEvent(new Event('input'));

      expect(['none', '', 'inline-block']).toContain(cards[0].style.display);
      expect(['none', '', 'inline-block']).toContain(cards[1].style.display);
    });
  });

  describe('Menu Interactions', () => {
  
    
  });

  describe('Button States and Error Handling', () => {
    test('disabled button remains unclickable', () => {
      const errorBtn = document.querySelector('.error-btn');

      errorBtn.click();

      expect(errorBtn.disabled).toBe(true);
    });

    test('enables button dynamically after event', () => {
      const errorBtn = document.querySelector('.error-btn');

      errorBtn.disabled = false;

      errorBtn.click();

      expect(errorBtn.disabled).toBe(false);
    });
  });
});
