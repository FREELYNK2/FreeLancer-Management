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

    // Add header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(`Milestones Report: ${jobTitle}`, 105, 20, { align: "center" });

    // Add metadata
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

    // Add table
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
