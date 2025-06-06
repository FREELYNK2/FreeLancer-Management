import { db } from "../accountScripts/auth.js";
import { formatDate } from "../accountScripts/ui.js";

async function fetchMilestones(jobId) {
  const query = await db
    .collection("jobs")
    .doc(jobId)
    .collection("milestones")
    .orderBy("createdAt", "desc")
    .get();

  return query.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function exportMilestonesPDF(jobId, jobTitle) {
  try {
    const milestones = await fetchMilestones(jobId);
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(`Milestones Report: ${jobTitle}`, 105, 20, { align: "center" });

    // metadata
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

    // Prepare table data with feedback column
    const headers = [
      ["Name", "Due Date", "Amount", "Status", "Client Feedback"],
    ];
    const data = milestones.map((milestone) => [
      milestone.name,
      formatDate(milestone.dueDate),
      `ZAR ${milestone.amount?.toFixed(2) || "0.00"}`,
      milestone.status,
      milestone.clientFeedback ||
        milestone.rejectionReason ||
        "No feedback provided",
    ]);

    // table
    doc.autoTable({
      head: headers,
      body: data,
      startY: 40,
      styles: {
        fontSize: 10,
        cellPadding: 3,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [66, 153, 225],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 25 },
        2: { cellWidth: 20 },
        3: { cellWidth: 20 },
        4: { cellWidth: 60 },
      },
    });

    // Save PDF
    doc.save(
      `Milestones_${jobTitle.replace(/[^a-z0-9]/gi, "_")}_${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`
    );
  } catch (error) {
    console.error("PDF export failed:", error);
    alert("Failed to export milestones as PDF");
  }
}

export async function exportMilestonesCSV(jobId, jobTitle) {
  try {
    const milestones = await fetchMilestones(jobId);

    // Create CSV content with feedback column
    let csvContent = "Name,Due Date,Amount,Status,Feedback\n";

    milestones.forEach((milestone) => {
      csvContent +=
        `"${milestone.name.replace(/"/g, '""')}",` +
        `"${formatDate(milestone.dueDate)}",` +
        `"ZAR ${milestone.amount?.toFixed(2) || "0.00"}",` +
        `"${milestone.status}",` +
        `"${(
          milestone.clientFeedback ||
          milestone.rejectionReason ||
          "No feedback provided"
        ).replace(/"/g, '""')}"\n`;
    });

    // Create download link
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Milestones_${jobTitle.replace(/[^a-z0-9]/gi, "_")}_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("CSV export failed:", error);
    alert("Failed to export milestones as CSV");
  }
}

// Payment export functions
export async function exportPaymentsPDF(
  payments,
  title = "Payment History",
  userName = "User"
) {
  try {
    if (!window.jspdf) {
      throw new Error(
        "PDF library not loaded. Please wait a moment and try again."
      );
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(title, 105, 20, { align: "center" });

    // metadata
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`User: ${userName}`, 14, 35);

    // Rest of the function remains the same...
    const headers = [
      [
        "Date",
        "Project",
        "Milestone",
        "Amount",
        "Method",
        "Status",
        "Transaction ID",
      ],
    ];

    const data = payments.map((payment) => [
      formatDate(payment.paymentDate),
      payment.jobTitle || "N/A",
      payment.milestoneName || "N/A",
      `ZAR ${payment.amount?.toFixed(2) || "0.00"}`,
      payment.method || "Manual",
      payment.status,
      payment.transactionId || "N/A",
    ]);

    doc.autoTable({
      head: headers,
      body: data,
      startY: 40,
    });

    doc.save(`Payments_${new Date().toISOString().slice(0, 10)}.pdf`);
  } catch (error) {
    console.error("PDF export failed:", error);
    throw error; 
  }
}
export async function exportPaymentsCSV(payments, title = "Payment History") {
  try {
    let csvContent =
      "Date,Project,Milestone,Amount,Method,Status,Transaction ID\n";

    payments.forEach((payment) => {
      csvContent +=
        `"${formatDate(payment.paymentDate)}",` +
        `"${(payment.jobTitle || "N/A").replace(/"/g, '""')}",` +
        `"${(payment.milestoneName || "N/A").replace(/"/g, '""')}",` +
        `"ZAR ${payment.amount?.toFixed(2) || "0.00"}",` +
        `"${payment.method || "Manual"}",` +
        `"${payment.status}",` +
        `"${payment.transactionId || "N/A"}"\n`;
    });

    // Create download link
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Payments_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("CSV export failed:", error);
    alert(`Failed to export CSV: ${error.message}`);
  }
}
