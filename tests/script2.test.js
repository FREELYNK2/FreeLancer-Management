/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

// Load the HTML file
const html = fs.readFileSync(path.resolve(__dirname, '../pages/detailed_milestone.html'), 'utf8');

describe('Payment Simulation Tests', () => {
  let payButton, message, badge;

  beforeAll(() => {
    // Set up the DOM
    document.body.innerHTML = html;
    
    // Manually create elements if they don't exist in the HTML
    if (!document.getElementById('simulate-pay')) {
      payButton = document.createElement('button');
      payButton.id = 'simulate-pay';
      document.body.appendChild(payButton);
    }
    
    if (!document.getElementById('payment-message')) {
      message = document.createElement('p');
      message.id = 'payment-message';
      document.body.appendChild(message);
    }
    
    if (!document.querySelector('.badge.in-progress')) {
      badge = document.createElement('span');
      badge.className = 'badge in-progress';
      document.body.appendChild(badge);
    }
    
    // Now require the script after DOM is set up
    require('../pages/script2.js');
    
    // Get references to the elements
    payButton = document.getElementById('simulate-pay');
    message = document.getElementById('payment-message');
    badge = document.querySelector('.badge.in-progress');
  });

  beforeEach(() => {
    // Reset to initial state before each test
    jest.useFakeTimers();
    if (payButton) {
      payButton.disabled = false;
      payButton.textContent = "Simulate Payment";
      payButton.style.backgroundColor = "";
    }
    if (message) {
      message.textContent = "";
      message.style.color = "";
    }
    if (badge) {
      badge.textContent = "Awaiting Payment";
      badge.className = "badge in-progress";
    }
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('initial UI state is correct', () => {
    expect(payButton).not.toBeNull();
    expect(message).not.toBeNull();
    expect(badge).not.toBeNull();
    
    expect(payButton.textContent).toBe("Simulate Payment");
    expect(message.textContent).toBe("");
    expect(badge.textContent).toBe("Awaiting Payment");
    expect(badge.classList.contains("in-progress")).toBe(true);
  });

  test('clicking button disables it and shows processing', () => {
    payButton.click();
    
    expect(payButton.disabled).toBe(true);
    expect(payButton.textContent).toBe("Processing...");
    expect(message.textContent).toBe("");
  });

  test('after 2 seconds, payment completes successfully', () => {
    payButton.click();
    
    // Fast-forward time
    jest.advanceTimersByTime(2000);
    
    expect(badge.textContent).toBe("In Progress");
    expect(badge.classList.contains("active-progress")).toBe(true);
    expect(badge.classList.contains("in-progress")).toBe(false);
    expect(message.textContent).toBe("Payment simulated successfully!");
    expect(message.style.color).toBe("green");
    expect(payButton.textContent).toBe("Paid");
    expect(payButton.style.backgroundColor).toBe("rgb(92, 184, 92)"); // #5cb85c in rgb
  });

  test('button cannot be clicked while processing', () => {
    payButton.click();
    const originalText = payButton.textContent;
    
    // Try clicking again
    payButton.click();
    expect(payButton.textContent).toBe(originalText); // Shouldn't change
  });
});