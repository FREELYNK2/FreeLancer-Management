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

  test('smooth scrolls to section when nav link is clicked', () => {
    const link = document.querySelector('a[href="#services"]');
    const servicesSection = document.getElementById('services');
    
    link.click();
    
    expect(servicesSection.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth'
    });
  });

  test('displays and removes welcome message', () => {
    window.dispatchEvent(new Event('DOMContentLoaded'));
    
    const toast = document.querySelector('.toast-message');
    expect(toast).not.toBeNull();
    
    // Fast-forward through fade in
    jest.advanceTimersByTime(300);
    expect(toast.style.opacity).toBe('1');
    
    // Fast-forward through fade out and removal
    jest.advanceTimersByTime(4200);
    expect(toast.style.opacity).toBe('0');
    expect(document.querySelector('.toast-message')).toBeNull();
  });

  test.skip('filters services based on search input', () => {
    const searchInput = document.querySelector('.search-container input');
    const cards = document.querySelectorAll('.service-card');
    
    // Search for "web"
    searchInput.value = 'web';
    searchInput.dispatchEvent(new Event('input'));
    
    // More flexible assertion for hidden state
    expect(cards[0].style.display).not.toBe('none');
    expect(cards[1].style.display).toBe('none');
    
    // Clear search
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('input'));
    
    expect(cards[0].style.display).not.toBe('none');
    expect(cards[1].style.display).not.toBe('none');
  });

  test.skip('toggles menu visibility', () => {
    const menuButton = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.menu');
    
    // First click should show menu
    menuButton.click();
    expect(menu.classList.contains('show')).toBe(true);
    expect(menu.getAttribute('aria-hidden')).toBe('false');
    expect(menuButton.getAttribute('aria-expanded')).toBe('true');
    
    // Second click should hide menu
    menuButton.click();
    expect(menu.classList.contains('show')).toBe(false);
    expect(menu.getAttribute('aria-hidden')).toBe('true');
    expect(menuButton.getAttribute('aria-expanded')).toBe('false');
  });

  test('closes menu when clicking outside', () => {
    const menuButton = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.menu');
    
    // First show the menu
    menuButton.click();
    
    // Click on body
    document.body.click();
    
    expect(menu.classList.contains('show')).toBe(false);
    expect(menu.getAttribute('aria-hidden')).toBe('true');
    expect(menuButton.getAttribute('aria-expanded')).toBe('false');
  });

  test('closes menu when selecting a nav item', () => {
    const menuButton = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.menu');
    const navLink = document.querySelector('.nav-link');
    
    // First show the menu
    menuButton.click();
    
    navLink.click();
    
    expect(menu.classList.contains('show')).toBe(false);
    expect(menu.getAttribute('aria-hidden')).toBe('true');
    expect(menuButton.getAttribute('aria-expanded')).toBe('false');
  });
});