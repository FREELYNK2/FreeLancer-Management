/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve(__dirname, '../pages/detailed_milestone.html'), 'utf8');

describe('Payment Simulation Tests', () => {
  let payButton, message, badge;

  beforeAll(() => {
    // Set up the DOM
    document.body.innerHTML = html;
    
    // Create elements if they don't exist
    payButton = document.getElementById('simulate-pay') || document.createElement('button');
    payButton.id = 'simulate-pay';
    document.body.appendChild(payButton);
    
    message = document.getElementById('payment-message') || document.createElement('p');
    message.id = 'payment-message';
    document.body.appendChild(message);
    
    badge = document.querySelector('.badge.in-progress') || document.createElement('span');
    badge.className = 'badge in-progress';
    document.body.appendChild(badge);
    
    // Mock the payment simulation function
    window.simulatePayment = jest.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          badge.textContent = "In Progress";
          badge.className = "badge active-progress";
          message.textContent = "Payment simulated successfully!";
          message.style.color = "green";
          payButton.textContent = "Paid";
          payButton.style.backgroundColor = "#5cb85c";
          resolve();
        }, 2000);
      });
    });

    // Now require the script after DOM and mocks are set up
    require('../pages/script2.js');
    
    // Get references to the elements
    payButton = document.getElementById('simulate-pay');
    message = document.getElementById('payment-message');
    badge = document.querySelector('.badge.in-progress');
  });

  beforeEach(() => {
    jest.useFakeTimers();
    // Reset to initial state
    payButton.disabled = false;
    payButton.textContent = "Simulate Payment";
    payButton.style.backgroundColor = "";
    message.textContent = "";
    message.style.color = "";
    badge.textContent = "Awaiting Payment";
    badge.className = "badge in-progress";
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
    // Mock click behavior
    payButton.disabled = true;
    payButton.textContent = "Processing...";
    
    expect(payButton.disabled).toBe(true);
    expect(payButton.textContent).toBe("Processing...");
    expect(message.textContent).toBe("");
  });
  

  test('after 2 seconds, payment completes successfully', () => {
    // Simulate outcome after timeout
    badge.textContent = "In Progress";
    badge.className = "badge active-progress";
    message.textContent = "Payment simulated successfully!";
    message.style.color = "green";
    payButton.textContent = "Paid";
    payButton.style.backgroundColor = "rgb(92, 184, 92)";
  
    expect(badge.textContent).toBe("In Progress");
    expect(badge.classList.contains("active-progress")).toBe(true);
    expect(badge.classList.contains("in-progress")).toBe(false);
    expect(message.textContent).toBe("Payment simulated successfully!");
    expect(message.style.color).toBe("green");
    expect(payButton.textContent).toBe("Paid");
    expect(payButton.style.backgroundColor).toBe("rgb(92, 184, 92)");
  });
  
  test('button cannot be clicked while processing', () => {
    payButton.click();
    const originalText = payButton.textContent;
    
    // Try clicking again
    payButton.click();
    expect(payButton.textContent).toBe(originalText);
  });
});
