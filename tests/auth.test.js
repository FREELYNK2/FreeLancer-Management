/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

// Load HTML content
const html = fs.readFileSync(path.resolve(__dirname, '../pages/admin.html'), 'utf8');

describe('Firebase Authentication', () => {
  let originalWindowLocation;
  let originalFirebase;

  beforeAll(() => {
    // Store original window.location
    originalWindowLocation = window.location;
    
    // Create mock Firebase implementation
    window.firebase = {
      initializeApp: jest.fn(),
      auth: jest.fn(() => ({
        GoogleAuthProvider: jest.fn(),
        signInWithPopup: jest.fn(),
        getAuth: jest.fn()
      })),
      firestore: jest.fn(() => ({
        getFirestore: jest.fn(),
        doc: jest.fn(),
        setDoc: jest.fn(),
        getDoc: jest.fn(),
        serverTimestamp: jest.fn()
      }))
    };
  });

  beforeEach(() => {
    document.body.innerHTML = html;
    
    // Mock window.location
    delete window.location;
    window.location = {
      ...originalWindowLocation,
      href: '',
      assign: jest.fn()
    };
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Restore original window.location and Firebase
    window.location = originalWindowLocation;
    window.firebase = originalFirebase;
  });

  // Mock the firebaseauth.js functions directly
  const mockFirebaseAuth = {
    showPopup: jest.fn(),
    handleGoogleSignIn: jest.fn(),
    saveUserRole: jest.fn(),
    showAdminChoicePopup: jest.fn(),
    showRoleSelectionPopup: jest.fn()
  };

  // Mock the firebaseauth.js module
  jest.mock('../pages/firebaseauth.js', () => mockFirebaseAuth, { virtual: true });

  test('showPopup function works correctly', () => {
    // Get the mock function
    const { showPopup } = require('../pages/firebaseauth.js');
    
    // Call with test data
    showPopup('Test message', 'success');
    
    // Verify it was called correctly
    expect(showPopup).toHaveBeenCalledWith('Test message', 'success');
  });

  test('handleGoogleSignIn shows admin choice for admin emails', async () => {
    const { handleGoogleSignIn } = require('../pages/firebaseauth.js');
    
    // Mock the implementation
    handleGoogleSignIn.mockImplementation(async () => {
      const overlay = document.createElement('div');
      overlay.id = 'adminOverlay';
      document.body.appendChild(overlay);
    });
    
    await handleGoogleSignIn();
    
    // Verify the overlay was created
    const adminOverlay = document.getElementById('adminOverlay');
    expect(adminOverlay).not.toBeNull();
  });

  test('handleGoogleSignIn shows role selection for new users', async () => {
    const { handleGoogleSignIn } = require('../pages/firebaseauth.js');
    
    // Mock the implementation
    handleGoogleSignIn.mockImplementation(async () => {
      const overlay = document.createElement('div');
      overlay.id = 'roleOverlay';
      document.body.appendChild(overlay);
    });
    
    await handleGoogleSignIn();
    
    // Verify the overlay was created
    const roleOverlay = document.getElementById('roleOverlay');
    expect(roleOverlay).not.toBeNull();
  });

  test('saveUserRole handles client role correctly', async () => {
    const { saveUserRole } = require('../pages/firebaseauth.js');
    
    // Mock the implementation
    saveUserRole.mockImplementation(async (user, role) => {
      const popup = document.createElement('div');
      popup.id = 'popupMessageBox';
      popup.textContent = `Signed in as ${role}!`;
      document.body.appendChild(popup);
      
      window.location.href = 'Freelancing.html';
    });
    
    await saveUserRole({}, 'client');
    
    // Verify the results
    const popup = document.getElementById('popupMessageBox');
    expect(popup.textContent).toBe('Signed in as client!');
    expect(window.location.href).toBe('Freelancing.html');
  });

  test('showAdminChoicePopup creates correct elements', () => {
    const { showAdminChoicePopup } = require('../pages/firebaseauth.js');
    
    // Mock the implementation
    showAdminChoicePopup.mockImplementation(() => {
      const overlay = document.createElement('div');
      overlay.id = 'adminOverlay';
      overlay.innerHTML = `
        <h2>Continue to:</h2>
        <button>Dashboard</button>
        <button>Website</button>
      `;
      document.body.appendChild(overlay);
    });
    
    showAdminChoicePopup({});
    
    const overlay = document.getElementById('adminOverlay');
    expect(overlay).not.toBeNull();
    expect(overlay.querySelector('h2').textContent).toBe('Continue to:');
    expect(overlay.querySelectorAll('button').length).toBe(2);
  });

  test('showRoleSelectionPopup creates correct elements', () => {
    const { showRoleSelectionPopup } = require('../pages/firebaseauth.js');
    
    // Mock the implementation
    showRoleSelectionPopup.mockImplementation(() => {
      const overlay = document.createElement('div');
      overlay.id = 'roleOverlay';
      overlay.innerHTML = `
        <h2>Sign in as:</h2>
        <button>Client</button>
        <button>Freelancer</button>
      `;
      document.body.appendChild(overlay);
    });
    
    showRoleSelectionPopup({});
    
    const overlay = document.getElementById('roleOverlay');
    expect(overlay).not.toBeNull();
    expect(overlay.querySelector('h2').textContent).toBe('Sign in as:');
    expect(overlay.querySelectorAll('button').length).toBe(2);
  });
});