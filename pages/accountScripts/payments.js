// payments.js - Updated version without role checks
import { db, auth } from "../accountScripts/auth.js";
import { formatDate, createModal } from "../accountScripts/ui.js";
import {
  exportPaymentsPDF,
  exportPaymentsCSV,
} from "../accountScripts/export.js";

export async function showPaymentsHistory() {
  const user = auth.currentUser;
  if (!user) {
    alert("Please log in to view payment history.");
    return;
  }

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
             <th scope="col">Direction</th>
             <th scope="col">Method</th>
             <th scope="col">Status</th>
             <th scope="col">Actions</th>
           </tr>
         </thead>
         <tbody id="paymentsBody"></tbody>
       </table>
     </section>`
  );

  try {
    // Get all payments where user is either the freelancer or client
    const receivedPayments = db.collection("payments")
      .where("freelancerId", "==", user.uid)
      .orderBy("paymentDate", "desc")
      .get();

    const sentPayments = db.collection("payments")
      .where("clientId", "==", user.uid)
      .orderBy("paymentDate", "desc")
      .get();

    // Wait for both queries to complete
    const [receivedSnap, sentSnap] = await Promise.all([receivedPayments, sentPayments]);
    
    // Combine and sort all payments by date
    const allPayments = [
      ...receivedSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'received' })),
      ...sentSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'sent' }))
    ].sort((a, b) => b.paymentDate - a.paymentDate);

    const tbody = modal.querySelector("#paymentsBody");

    if (allPayments.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7">No payment history found</td></tr>`;
    } else {
      allPayments.forEach((payment) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${formatDate(payment.paymentDate)}</td>
          <td>${payment.jobTitle || "N/A"}</td>
          <td>ZAR ${payment.amount?.toFixed(2) || "0.00"}</td>
          <td class="direction-${payment.type}">${payment.type === 'received' ? 'Received' : 'Sent'}</td>
          <td>${payment.method || "Manual"}</td>
          <td class="status-${payment.status.toLowerCase()}">${payment.status}</td>
          <td><button class="view-receipt" type="button" data-payment-id="${payment.id}">View</button></td>
        `;
        tbody.appendChild(row);
      });
    }

    // Update export handlers to use allPayments
    modal.querySelector("#export-payments-pdf").addEventListener("click", async () => {
      try {
        await exportPaymentsPDF(allPayments, "My Payment History");
      } catch (error) {
        console.error("Export failed:", error);
        alert("Failed to export payments. Please try again.");
      }
    });

    modal.querySelector("#export-payments-csv").addEventListener("click", async () => {
      try {
        await exportPaymentsCSV(allPayments, "My Payment History");
      } catch (error) {
        console.error("Export failed:", error);
        alert("Failed to export payments. Please try again.");
      }
    });

    // Rest of your existing modal code (print, view receipt, etc.)...
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
              .direction-received { color: green; }
              .direction-sent { color: blue; }
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

    modal.addEventListener("click", (e) => {
      if (e.target.classList.contains("view-receipt")) {
        showPaymentDetails(e.target.dataset.paymentId);
      }
    });

    document.body.appendChild(modal);

  } catch (error) {
    console.error("Error loading payment history:", error);
    alert("Failed to load payment history. Please try again.");
  }
}

export async function showPaymentsHistory() {
  const user = auth.currentUser;
  if (!user) {
    alert("Please log in to view payment history.");
    return;
  }

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
             <th scope="col">Type</th>
             <th scope="col">Method</th>
             <th scope="col">Status</th>
             <th scope="col">Counterparty</th>
             <th scope="col">Actions</th>
           </tr>
         </thead>
         <tbody id="paymentsBody"></tbody>
       </table>
     </section>`
  );

  try {
    // Get payments where user is the freelancer (received payments)
    const receivedPayments = db.collection("payments")
      .where("freelancerId", "==", user.uid)
      .orderBy("paymentDate", "desc")
      .get();

    // Get jobs where user is the client (posted jobs)
    const clientJobs = db.collection("jobs")
      .where("userId", "==", user.uid)
      .get();

    // Wait for both queries
    const [receivedSnap, jobsSnap] = await Promise.all([receivedPayments, clientJobs]);
    
    // Get payments for jobs where user is client (sent payments)
    const jobIds = jobsSnap.docs.map(doc => doc.id);
    const sentPayments = jobIds.length > 0 ? 
      db.collection("payments")
        .where("jobId", "in", jobIds)
        .orderBy("paymentDate", "desc")
        .get() : 
      Promise.resolve({ docs: [] });

    const sentSnap = await sentPayments;

    // Combine all payments and sort by date
    const allPayments = [
      ...receivedSnap.docs.map(doc => ({ 
        ...doc.data(), 
        id: doc.id, 
        type: 'Received',
        counterparty: 'Client'
      })),
      ...sentSnap.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        type: 'Sent',
        counterparty: 'Freelancer'
      }))
    ].sort((a, b) => b.paymentDate - a.paymentDate);

    const tbody = modal.querySelector("#paymentsBody");

    if (allPayments.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8">No payment history found</td></tr>`;
    } else {
      // Fetch counterparty names (optional enhancement)
      const userIds = [...new Set(allPayments.map(p => 
        p.type === 'Received' ? p.clientId : p.freelancerId
      ))];
      
      const usersSnap = await db.collection("users")
        .where("uid", "in", userIds)
        .get();
      
      const users = {};
      usersSnap.forEach(doc => {
        users[doc.id] = doc.data().displayName || 'Unknown';
      });

      // Populate table
      allPayments.forEach((payment) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${formatDate(payment.paymentDate)}</td>
          <td>${payment.jobTitle || "N/A"}</td>
          <td>ZAR ${payment.amount?.toFixed(2) || "0.00"}</td>
          <td class="payment-type-${payment.type.toLowerCase()}">${payment.type}</td>
          <td>${payment.method || "Manual"}</td>
          <td class="status-${payment.status.toLowerCase()}">${payment.status}</td>
          <td>${users[payment.type === 'Received' ? payment.clientId : payment.freelancerId] || payment.counterparty}</td>
          <td><button class="view-receipt" type="button" data-payment-id="${payment.id}">View</button></td>
        `;
        tbody.appendChild(row);
      });
    }

    // Export handlers
    modal.querySelector("#export-payments-pdf").addEventListener("click", async () => {
      try {
        await exportPaymentsPDF(allPayments, "My Payment History");
      } catch (error) {
        console.error("Export failed:", error);
        alert("Failed to export payments. Please try again.");
      }
    });

    modal.querySelector("#export-payments-csv").addEventListener("click", async () => {
      try {
        await exportPaymentsCSV(allPayments, "My Payment History");
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
              .payment-type-received { color: green; font-weight: bold; }
              .payment-type-sent { color: blue; font-weight: bold; }
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

  } catch (error) {
    console.error("Error loading payment history:", error);
    alert("Failed to load payment history. Please try again.");
  }
}
