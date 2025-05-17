import {
  auth,
  setupAuthListener,
  setupLogout,
} from "../accountScripts/auth.js";
import {
  loadApplications,
  loadPostedJobs,
} from "../accountScripts/applications.js";
import { setupTabs } from "../accountScripts/ui.js";
import { showPaymentsHistory } from "../accountScripts/payments.js";

const homeButton = document.getElementById("home");
homeButton.addEventListener("click", () => {
  window.location.href = "freelancing.html";
});

document.addEventListener("DOMContentLoaded", function () {
  setupAuthListener(async (user) => {
    if (!user) {
      console.log("No user logged in");
      return;
    }

    // Load user info
    const userNameElement = document.getElementById("user-name");
    userNameElement.textContent = user.displayName || "User";

    // Setup logout
    setupLogout("logout-btn");

    // Load both applications and posted jobs
    await Promise.all([loadApplications(user.uid), loadPostedJobs(user.uid)]);
    setupTabs();
  });
  document
    .getElementById("viewPayments")
    ?.addEventListener("click", showPaymentsHistory);
});

// PDF Export Function
async function exportActivitiesToPDF() {
  try {
    // Show loading state
    const btn = document.getElementById("export-pdf");
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

    // Create PDF
    const doc = new jsPDF();

    // Add header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text("Freelynk Activity Report", 105, 20, { align: "center" });

    // Add metadata
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(
      `User: ${document.getElementById("user-name").textContent}`,
      14,
      35
    );

    // Get data
    const activities = await fetchUserActivities();

    // Prepare table
    const headers = [["Activity", "Date", "Status"]];
    const data = activities.map((act) => [
      act.description,
      act.date,
      {
        content: act.status,
        styles: { textColor: getStatusColor(act.status) },
      },
    ]);

    // Add table
    doc.autoTable({
      head: headers,
      body: data,
      startY: 45,
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
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
      columnStyles: {
        0: { cellWidth: "auto", fontStyle: "bold" },
        1: { cellWidth: 30 },
        2: { cellWidth: 25 },
      },
    });

    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Page ${i} of ${pageCount}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }

    // Save PDF
    doc.save(
      `Freelynk_Activities_${new Date().toISOString().slice(0, 10)}.pdf`
    );
  } catch (error) {
    console.error("PDF export failed:", error);
    alert("Failed to generate PDF. See console for details.");
  } finally {
    const btn = document.getElementById("export-pdf");
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-file-pdf"></i> Export to PDF';
    }
  }
}

// Helper function to fetch activities
// In your fetchUserActivities function, replace the timestamp handling with this:

async function fetchUserActivities() {
  const user = firebase.auth().currentUser;
  if (!user) return [];

  const activities = [];
  const db = firebase.firestore();

  // Fetch applications (freelancer)
  const appsSnapshot = await db
    .collection("applications")
    .where("freelancerId", "==", user.uid)
    .get();

  appsSnapshot.forEach((doc) => {
    const app = doc.data();
    const appliedDate = app.appliedAt
      ? app.appliedAt.toDate
        ? app.appliedAt.toDate()
        : new Date(app.appliedAt)
      : new Date();

    activities.push({
      description: `Applied for ${app.jobTitle || "project"}`,
      date: appliedDate.toLocaleDateString(),
      status: app.status || "pending",
    });
  });

  // Fetch posted jobs (client)
  const jobsSnapshot = await db
    .collection("jobs")
    .where("userId", "==", user.uid)
    .get();

  jobsSnapshot.forEach((doc) => {
    const job = doc.data();
    const createdDate = job.createdAt
      ? job.createdAt.toDate
        ? job.createdAt.toDate()
        : new Date(job.createdAt)
      : new Date();

    activities.push({
      description: `Posted: ${job.title || "project"}`,
      date: createdDate.toLocaleDateString(),
      status: job.status || "open",
    });
  });

  return activities.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Status color mapping
function getStatusColor(status) {
  const statusColors = {
    pending: [237, 137, 54], // orange
    approved: [56, 161, 105], // green
    rejected: [229, 62, 62], // red
    submitted: [66, 153, 225], // blue
    open: [100, 100, 100], // gray
  };
  return statusColors[status.toLowerCase()] || [0, 0, 0];
}

// Initialize when DOM loads
document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("export-pdf")
    ?.addEventListener("click", exportActivitiesToPDF);
});
