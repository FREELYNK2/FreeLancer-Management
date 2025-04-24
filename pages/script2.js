const payButton = document.getElementById('simulate-pay');
const message = document.getElementById('payment-message');

payButton.addEventListener('click', () => {
  payButton.disabled = true;
  payButton.textContent = "Processing...";
  message.textContent = "";

  setTimeout(() => {
    message.textContent = "Payment simulated successfully!";
    payButton.textContent = "Paid";
    payButton.style.backgroundColor = "#5cb85c";
  }, 2000);
});