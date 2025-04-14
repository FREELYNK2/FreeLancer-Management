// script.test.js

const { toggleDarkMode, isEmailValid } = require('./script');

test('toggles dark mode class', () => {
  const classes = new Set();
  expect(toggleDarkMode(classes)).toBe(true);   // dark mode on
  expect(toggleDarkMode(classes)).toBe(false);  // dark mode off
});

test('validates email addresses', () => {
  expect(isEmailValid("test@example.com")).toBe(true);
  expect(isEmailValid("invalid-email")).toBe(false);
});
