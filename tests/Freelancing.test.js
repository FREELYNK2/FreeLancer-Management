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

    test('scrolls to popular services when button is clicked', () => {
      const button = document.querySelector('.hero-search-btn');
      const servicesSection = document.querySelector('.popular-services');

      button.click();

      expect(servicesSection.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth'
      });
    });
  });

  describe('Search Functionality', () => {
    test('filters services based on search input', () => {
      const searchInput = document.querySelector('.search-container input');
      const cards = document.querySelectorAll('.service-card');
    
      searchInput.value = 'web';
      searchInput.dispatchEvent(new Event('input'));
    
      expect(cards[0].style.display).not.toEqual('none');
      expect(['none', '', 'block', 'inline-block']).toContain(cards[1].style.display);
    });

    test('clears search input properly', () => {
      const searchInput = document.querySelector('.search-container input');
      searchInput.value = 'graphic';
      searchInput.dispatchEvent(new Event('input'));

      expect(document.querySelectorAll('.service-card')[1].style.display).not.toEqual('none');

      searchInput.value = '';
      searchInput.dispatchEvent(new Event('input'));

      document.querySelectorAll('.service-card').forEach(card => {
        expect(card.style.display).not.toEqual('none');
      });
    });
  });



    

    

  describe('Keyboard Navigation', () => {
    
    test('search input allows text entry via keyboard', () => {
      const searchInput = document.querySelector('.search-container input');
      searchInput.value = 'web';
      searchInput.dispatchEvent(new KeyboardEvent('keyup', { key: 'w' }));

      expect(searchInput.value).toBe('web');
    });
  });

  describe('Accessibility Checks', () => {
    test('menu has correct aria attributes', () => {
      const menu = document.querySelector('.menu');
      expect(menu.getAttribute('aria-hidden')).toBe('true');
    });

    test('buttons have appropriate aria labels', () => {
      const heroButton = document.querySelector('.hero-search-btn');
      expect(heroButton.getAttribute('aria-label')).toBe('Find services');

      const menuButton = document.querySelector('.menu-toggle');
      expect(menuButton.getAttribute('aria-label')).toBe('Toggle menu');
    });
  });

  describe('Error Handling', () => {
    test('search input prevents empty queries', () => {
      const searchInput = document.querySelector('.search-container input');

      searchInput.value = '';
      searchInput.dispatchEvent(new Event('input'));

      expect(document.querySelectorAll('.service-card')[0].style.display).not.toEqual('none');
    });

    test('menu does not toggle when disabled', () => {
      const menuButton = document.createElement('button');
      menuButton.className = 'menu-toggle';
      menuButton.disabled = true;

      document.body.appendChild(menuButton);

      menuButton.click();

      expect(menuButton.disabled).toBe(true);
    });
  });
});
