const payButton = document.getElementById('simulate-pay');
const message = document.getElementById('payment-message');
const badge = document.querySelector('.badge.in-progress'); // existing badge

payButton.addEventListener('click', async () => {
  payButton.disabled = true;
  payButton.textContent = "Processing...";
  message.textContent = "";

  setTimeout(async () => {
    // Update badge
    badge.textContent = "In Progress";
    badge.classList.remove("in-progress");
    badge.classList.add("active-progress");

    // Update UI message
    message.textContent = "Payment simulated successfully!";
    message.style.color = "green";

    // Update button style
    payButton.textContent = "Paid";
    payButton.style.backgroundColor = "#5cb85c";

    // OPTIONAL: Firestore update (uncomment and configure below if needed)
    // await updateMilestoneStatus("milestoneIdHere", "in_progress");
  }, 2000);
});
