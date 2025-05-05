const milestones = [
  {
    id: 1,
    title: "Wireframe Design",
    description: "Creation of mobile wireframes for the new app interface.",
    dueDate: "2025-04-20",
    amount: "$200",
    status: "awaiting"
  },
  {
    id: 2,
    title: "Frontend Implementation",
    description: "Convert wireframes to responsive HTML/CSS.",
    dueDate: "2025-04-30",
    amount: "$350",
    status: "in-progress"
  },
  {
    id: 3,
    title: "Payment Integration",
    description: "Integrate Stripe payment system.",
    dueDate: "2025-05-05",
    amount: "$250",
    status: "completed"
  }
];

const statusMap = {
  awaiting: "Awaiting Payment",
  "in-progress": "In Progress",
  completed: "Completed"
};

const statusClass = {
  awaiting: "in-progress",
  "in-progress": "active-progress",
  completed: "completed"
};

function renderMilestones(filter = "all") {
  const container = document.getElementById("milestone-list");
  container.innerHTML = "";

  milestones
    .filter(m => filter === "all" || m.status === filter)
    .forEach(milestone => {
      const section = document.createElement("section");
      section.classList.add("milestone-card");
      section.innerHTML = `
        <h2>${milestone.title}</h2>
        <p><strong>Description:</strong> ${milestone.description}</p>
        <p><strong>Status:</strong> 
          <span class="badge ${statusClass[milestone.status]}" id="status-${milestone.id}">
            ${statusMap[milestone.status]}
          </span>
        </p>
        <p><strong>Due Date:</strong> ${milestone.dueDate}</p>
        <p><strong>Amount:</strong> ${milestone.amount}</p>
        ${milestone.status !== "completed" ? 
          `<button onclick="simulatePayment(${milestone.id})">Simulate Payment</button>` : 
          `<p style="color:green;"><strong>Paid</strong></p>`}
      `;
      container.appendChild(section);
    });
}

function simulatePayment(id) {
  const milestone = milestones.find(m => m.id === id);
  if (milestone) {
    milestone.status = "completed";
    renderMilestones(document.getElementById("status-filter").value);
  }
}

document.getElementById("status-filter").addEventListener("change", (e) => {
  renderMilestones(e.target.value);
});

document.getElementById("export-btn").addEventListener("click", () => {
  const visibleMilestones = milestones.filter(m => {
    const selected = document.getElementById("status-filter").value;
    return selected === "all" || m.status === selected;
  });

  let csvContent = "data:text/csv;charset=utf-8,Title,Description,Status,Due Date,Amount\n";
  visibleMilestones.forEach(m => {
    csvContent += `${m.title},${m.description},${statusMap[m.status]},${m.dueDate},${m.amount}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "milestones.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

document.getElementById("export-pdf").addEventListener("click", () => {
  const visibleMilestones = milestones.filter(m => {
    const selected = document.getElementById("status-filter").value;
    return selected === "all" || m.status === selected;
  });

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Title and Header Styling
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Milestone Dashboard", 20, 20);

  // Adding spacing after title
  doc.setFontSize(12);
  doc.text("Date Generated: " + new Date().toLocaleString(), 20, 30);
  doc.line(20, 35, 190, 35); // Horizontal line

  // Table Header
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(0, 51, 102); // Dark blue color for header background
  doc.rect(20, 40, 170, 10, "F"); // Header background

  doc.setTextColor(255, 255, 255); // White text
  doc.text("Title", 25, 45);
  doc.text("Status", 70, 45);
  doc.text("Due Date", 120, 45);
  doc.text("Amount", 160, 45);

  // Adding a line after header
  doc.line(20, 50, 190, 50);

  // Adding milestones
  let yPosition = 55;
  visibleMilestones.forEach(milestone => {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0); // Black text for milestone data
    doc.text(milestone.title, 25, yPosition);
    doc.text(statusMap[milestone.status], 70, yPosition);
    doc.text(milestone.dueDate, 120, yPosition);
    doc.text(milestone.amount, 160, yPosition);

    yPosition += 10; // Space between rows
  });

  // Save the PDF
  doc.save("milestones.pdf");
});


// Initial render
renderMilestones();
