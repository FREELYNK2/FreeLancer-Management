/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';

// Mock Firebase modules
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn()
}));
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  setDoc: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn()
}));
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn()
}));

// Load the actual module after mocks
import '../pages/firebaseauth.js';

describe('Firebase Auth Module', () => {
  let emailInput, passwordInput, nameInput, popup;

  beforeEach(() => {
    document.body.innerHTML = `
      <input type="text" id="fName" value="Test User" />
      <input type="email" id="rEmail" value="test@example.com" />
      <input type="password" id="rPassword" value="password123" />
      <input type="email" value="test@example.com" />
      <input type="password" value="password123" />
      <button id="hireTalentBtn"></button>
      <button id="findWorkBtn"></button>
      <button id="loginBtn"></button>
    `;

    // Setup popup manually for showPopup test
    popup = document.createElement('div');
    popup.id = 'popupMessageBox';
    document.body.appendChild(popup);
  });

  test('should validate email correctly', () => {
    const { isValidEmail } = require('../pages/firebaseauth.js');
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
  });

  test('showPopup displays message', () => {
    const { showPopup } = require('../pages/firebaseauth.js');
    showPopup('Hello!', 'success');

    const popupBox = document.getElementById('popupMessageBox');
    expect(popupBox).not.toBeNull();
    expect(popupBox.style.display).toBe('block');
    expect(popupBox.innerText).toBe('Hello!');
  });

  test('handleSignUp shows error on missing fields', () => {
    document.getElementById('rEmail').value = '';
    const { handleSignUp } = require('../pages/firebaseauth.js');
    const mockPopup = jest.spyOn(window, 'showPopup');
    handleSignUp('freelancer');
    expect(mockPopup).toHaveBeenCalledWith('Please fill in all fields', 'error');
    mockPopup.mockRestore();
  });

  test('handleSignUp shows error on invalid email', () => {
    document.getElementById('rEmail').value = 'invalid-email';
    const { handleSignUp } = require('../pages/firebaseauth.js');
    const mockPopup = jest.spyOn(window, 'showPopup');
    handleSignUp('freelancer');
    expect(mockPopup).toHaveBeenCalledWith('Please enter a valid email address', 'error');
    mockPopup.mockRestore();
  });

  test('handleSignIn shows error on empty fields', async () => {
    document.querySelector('input[type="email"]').value = '';
    const { handleSignIn } = require('../pages/firebaseauth.js');
    const mockPopup = jest.spyOn(window, 'showPopup');
    await handleSignIn();
    expect(mockPopup).toHaveBeenCalledWith('Please enter both email and password', 'error');
    mockPopup.mockRestore();
  });

  test('handleSignIn shows error on invalid email format', async () => {
    document.querySelector('input[type="email"]').value = 'bademail';
    const { handleSignIn } = require('../pages/firebaseauth.js');
    const mockPopup = jest.spyOn(window, 'showPopup');
    await handleSignIn();
    expect(mockPopup).toHaveBeenCalledWith('Invalid email format', 'error');
    mockPopup.mockRestore();
  });
});
