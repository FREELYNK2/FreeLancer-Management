// payments.js - Updated version without role checks
import { db, auth } from "../accountScripts/auth.js";
import { formatDate, createModal } from "../accountScripts/ui.js";
import {
  exportPaymentsPDF,
  exportPaymentsCSV,
} from "../accountScripts/export.js";

export async function showPaymentsHistory() {
  const user = auth.currentUser;
  if (!user) return;

  const modal = createModal(
    "Payment History",
    `<section class="payment-controls">
       <label for="paymentTimeRange">Time Range:</label>
       <select id="paymentTimeRange">
         <option value="all">All Time</option>
         <option value="month">This Month</option>
         <option value="year">This Year</option>
       </select>
       <menu class="export-buttons">
         <li><button id="export-payments-pdf" type="button">Export PDF</button></li>
         <li><button id="export-payments-csv" type="button">Export CSV</button></li>
         <li><button id="printPayments" type="button">Print</button></li>
       </menu>
     </section>
     <section class="payment-list">
       <table>
         <caption>Your Payment History</caption>
         <thead>
           <tr>
             <th scope="col">Date</th>
             <th scope="col">Project</th>
             <th scope="col">Amount</th>
             <th scope="col">Method</th>
             <th scope="col">Status</th>
             <th scope="col">Actions</th>
           </tr>
         </thead>
         <tbody id="paymentsBody"></tbody>
       </table>
     </section>`
  );

  // Load payments
  const paymentsQuery = await db
    .collection("payments")
    .where("freelancerId", "==", user.uid)
    .orderBy("paymentDate", "desc")
    .get();

  const payments = paymentsQuery.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  const tbody = modal.querySelector("#paymentsBody");

  payments.forEach((payment) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${formatDate(payment.paymentDate)}</td>
      <td>${payment.jobTitle || "N/A"}</td>
      <td>ZAR ${payment.amount?.toFixed(2) || "0.00"}</td>
      <td>${payment.method || "Manual"}</td>
      <td class="status-${payment.status.toLowerCase()}">${payment.status}</td>
      <td><button class="view-receipt" type="button" data-payment-id="${
        payment.id
      }">View</button></td>
    `;
    tbody.appendChild(row);
  });

  // Export handlers
  modal
    .querySelector("#export-payments-pdf")
    .addEventListener("click", async () => {
      try {
        const paymentsQuery = await db
          .collection("payments")
          .where("freelancerId", "==", user.uid)
          .orderBy("paymentDate", "desc")
          .get();

        const payments = paymentsQuery.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        await exportPaymentsPDF(payments, "My Payment History");
      } catch (error) {
        console.error("Export failed:", error);
        alert("Failed to export payments. Please try again.");
      }
    });

  modal
    .querySelector("#export-payments-csv")
    .addEventListener("click", async () => {
      try {
        const paymentsQuery = await db
          .collection("payments")
          .where("freelancerId", "==", user.uid)
          .orderBy("paymentDate", "desc")
          .get();

        const payments = paymentsQuery.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        await exportPaymentsCSV(payments, "My Payment History");
      } catch (error) {
        console.error("Export failed:", error);
        alert("Failed to export payments. Please try again.");
      }
    });

  // Print functionality
  modal.querySelector("#printPayments").addEventListener("click", () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment History - ${user.displayName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            caption { font-size: 1.2em; font-weight: bold; margin-bottom: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .status-completed { color: green; }
            .status-pending { color: orange; }
            .status-failed { color: red; }
          </style>
        </head>
        <body>
          <h1>Payment History</h1>
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>User:</strong> ${user.displayName}</p>
          ${modal.querySelector("table").outerHTML}
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  });

  // Receipt viewing
  modal.addEventListener("click", (e) => {
    if (e.target.classList.contains("view-receipt")) {
      showPaymentDetails(e.target.dataset.paymentId);
    }
  });

  document.body.appendChild(modal);
}

export async function showPaymentDetails(paymentId) {
  const paymentDoc = await db.collection("payments").doc(paymentId).get();
  if (!paymentDoc.exists) return;

  const payment = paymentDoc.data();
  const modal = createModal(
    "Payment Receipt",
    `<table>
       <caption>Payment Receipt</caption>
       <tbody>
         <tr>
           <th scope="row">Transaction ID</th>
           <td>${payment.transactionId || "N/A"}</td>
         </tr>
         <tr>
           <th scope="row">Date</th>
           <td>${formatDate(payment.paymentDate)}</td>
         </tr>
         <tr>
           <th scope="row">Project</th>
           <td>${payment.jobTitle || "N/A"}</td>
         </tr>
         <tr>
           <th scope="row">Milestone</th>
           <td>${payment.milestoneName || "N/A"}</td>
         </tr>
         <tr>
           <th scope="row">Amount</th>
           <td>ZAR ${payment.amount?.toFixed(2) || "0.00"}</td>
         </tr>
         <tr>
           <th scope="row">Method</th>
           <td>${payment.method || "Manual"}</td>
         </tr>
         <tr>
           <th scope="row">Status</th>
           <td class="status-${payment.status.toLowerCase()}">${
      payment.status
    }</td>
         </tr>
       </tbody>
     </table>
     <menu class="export-buttons">
       <li><button class="export-pdf" type="button">Export PDF</button></li>
       <li><button class="export-csv" type="button">Export CSV</button></li>
       <li><button class="print-receipt" type="button">Print</button></li>
     </menu>`
  );

  // Export handlers for single payment
  modal.querySelector(".export-pdf").addEventListener("click", () => {
    exportPaymentsPDF([payment], `Payment Receipt - ${payment.transactionId}`);
  });

  modal.querySelector(".export-csv").addEventListener("click", () => {
    exportPaymentsCSV([payment], `Payment Receipt - ${payment.transactionId}`);
  });

  // Print receipt
  modal.querySelector(".print-receipt").addEventListener("click", () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Receipt - ${
            payment.transactionId || payment.id
          }</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { text-align: left; width: 30%; }
            .status-completed { color: green; }
            .status-pending { color: orange; }
            .status-failed { color: red; }
          </style>
        </head>
        <body>
          ${modal.querySelector("table").outerHTML}
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  });

  document.body.appendChild(modal);
}
