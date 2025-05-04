/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

// Load HTML content
const html = fs.readFileSync(path.resolve(__dirname, '../pages/admin.html'), 'utf8');

describe('Admin Dashboard', () => {
  beforeEach(() => {
    document.body.innerHTML = html;
    
    // Mock Firebase functions
    window.firebase = {
      initializeApp: jest.fn(),
      firestore: {
        collection: jest.fn(),
        getDocs: jest.fn(),
        deleteDoc: jest.fn(),
        doc: jest.fn()
      },
      auth: {
        getAuth: jest.fn(),
        signOut: jest.fn(),
        onAuthStateChanged: jest.fn()
      }
    };
    
    // Mock DOM elements
    window.confirm = jest.fn();
    window.alert = jest.fn();
  });

  test('renders the admin dashboard structure', () => {
    // Header section
    expect(document.querySelector('header h1').textContent).toBe('User Management');
    expect(document.getElementById('logoutBtn')).toBeTruthy();
    
    // Main content
    expect(document.querySelector('main section h2').textContent).toBe('User Controls');
    expect(document.getElementById('searchInput')).toBeTruthy();
    expect(document.getElementById('roleFilter')).toBeTruthy();
    
    // Table structure
    const table = document.querySelector('table');
    expect(table).toBeTruthy();
    expect(table.querySelector('caption').textContent).toBe('Registered Users');
    expect(table.querySelectorAll('thead th').length).toBe(6);
    expect(document.getElementById('usersTableBody')).toBeTruthy();
    
    // Dialog
    expect(document.getElementById('confirmDialog')).toBeTruthy();
  });

  test('search form has proper accessibility attributes', () => {
    const searchInput = document.getElementById('searchInput');
    expect(searchInput.getAttribute('placeholder')).toBe('Search users...');
    expect(searchInput.getAttribute('type')).toBe('text');
    
    const roleFilter = document.getElementById('roleFilter');
    expect(roleFilter.querySelectorAll('option').length).toBe(4);
    expect(roleFilter.querySelector('option[value="all"]').textContent).toBe('All Roles');
  });

  test.skip('table has proper semantic structure', () => {
    const table = document.querySelector('table');
    expect(table.getAttribute('role')).toBe('table');
    
    const headers = table.querySelectorAll('th');
    headers.forEach(header => {
      expect(header.getAttribute('scope')).toBe('col');
    });
    
    expect(table.querySelector('tbody').getAttribute('id')).toBe('usersTableBody');
  });

  test('confirmation dialog has proper structure', () => {
    const dialog = document.getElementById('confirmDialog');
    expect(dialog.querySelector('p').getAttribute('id')).toBe('dialogMessage');
    
    const buttons = dialog.querySelectorAll('button');
    expect(buttons.length).toBe(2);
    expect(buttons[0].getAttribute('id')).toBe('confirmBtn');
    expect(buttons[0].getAttribute('value')).toBe('confirm');
    expect(buttons[1].getAttribute('value')).toBe('cancel');
  });

  test('scripts are properly loaded', () => {
    const scripts = document.querySelectorAll('script[type="module"]');
    expect(scripts.length).toBe(2);
    expect(scripts[0].getAttribute('src')).toBe('../pages/firebaseauth.js');
    expect(scripts[1].getAttribute('src')).toBe('../pages/admin.js');
  });

  test.skip('logout button triggers sign out', () => {
    // Mock the auth module
    const mockSignOut = jest.fn(() => Promise.resolve());
    window.firebase.auth.signOut.mockImplementation(mockSignOut);
    
    // Mock window.location
    delete window.location;
    window.location = { href: '' };
    
    // Trigger the logout button click
    document.getElementById('logoutBtn').click();
    
    expect(mockSignOut).toHaveBeenCalled();
    expect(window.location.href).toBe('index.html');
  });

  test.skip('confirmation dialog works properly', () => {
    const dialog = document.getElementById('confirmDialog');
    const confirmBtn = document.getElementById('confirmBtn');
    
    // Test dialog show/hide
    dialog.showModal();
    expect(dialog.open).toBe(true);
    
    confirmBtn.click();
    expect(dialog.open).toBe(false);
  });
});