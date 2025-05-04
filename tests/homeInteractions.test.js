/**
 * @jest-environment jsdom
 */

import {
  initSmoothScroll,
  showToastMessage,
  initSearchFilter,
  initScrollToServices,
  initHamburgerMenu
} from '../pages/homeInteractions';

describe('Homepage Interactions', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.useFakeTimers();
  });

  test('smooth scroll triggers scrollIntoView', () => {
    document.body.innerHTML = `
      <nav><a href="#section1">Go</a></nav>
      <div id="section1"></div>
    `;
    const scrollMock = jest.fn();
    document.getElementById('section1').scrollIntoView = scrollMock;
    initSmoothScroll();
    document.querySelector('nav a').click();
    expect(scrollMock).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  test('toast message appears and disappears', () => {
    showToastMessage();
    const toast = document.querySelector('.toast-message');
    expect(toast).not.toBeNull();
    expect(toast.textContent).toBe('Welcome to Freelynk!');
    jest.advanceTimersByTime(4500);
    expect(document.querySelector('.toast-message')).toBeNull();
  });

  test('search filters service cards by title and description', () => {
    document.body.innerHTML = `
      <div class="search-section"><input></div>
      <div class="service-card"><h3>Design</h3><p>Logos</p></div>
      <div class="service-card"><h3>Dev</h3><p>Code</p></div>
    `;
    initSearchFilter();
    const input = document.querySelector('input');
    input.value = 'dev';
    input.dispatchEvent(new Event('input'));

    const cards = document.querySelectorAll('.service-card');
    expect(cards[0].style.display).toBe('none');
    expect(cards[1].style.display).toBe('inline-block');
  });

  test('scroll to services button triggers scrollIntoView', () => {
    document.body.innerHTML = `
      <button class="hero-search-btn">Search</button>
      <section class="popular-services"></section>
    `;
    const scrollMock = jest.fn();
    document.querySelector('.popular-services').scrollIntoView = scrollMock;
    initScrollToServices();
    document.querySelector('.hero-search-btn').click();
    expect(scrollMock).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  test('hamburger menu toggles and closes on nav link click', () => {
    document.body.innerHTML = `
      <button class="menu-toggle"></button>
      <nav class="menu"><a class="nav-link"></a></nav>
    `;
    initHamburgerMenu();

    const menu = document.querySelector('.menu');
    const toggle = document.querySelector('.menu-toggle');
    const link = document.querySelector('.nav-link');

    toggle.click();
    expect(menu.classList.contains('show')).toBe(true);

    link.click();
    expect(menu.classList.contains('show')).toBe(false);
  });
});
