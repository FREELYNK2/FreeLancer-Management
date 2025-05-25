import { db, storage } from "../accountScripts/auth.js";
import { formatDate, createModal, showError } from "../accountScripts/ui.js";
import { exportMilestonesPDF, exportMilestonesCSV } from "./export.js";
import { recordPayment } from "../accountScripts/firestore.js";

export async function showMilestonesModal(
  jobId,
  jobTitle,
  isFreelancerView = false
) {
  const modalContent = isFreelancerView
    ? `<section class="export-actions">
         <menu class="export-buttons">
           <li><button class="export-pdf" data-job-id="${jobId}">Export PDF</button></li>
           <li><button class="export-csv" data-job-id="${jobId}">Export CSV</button></li>
         </menu>
       </section>
       <ul id="milestonesList"></ul>`
    : `<section class="export-actions">
         <menu class="export-buttons">
           <li><button class="export-pdf" data-job-id="${jobId}">Export PDF</button></li>
           <li><button class="export-csv" data-job-id="${jobId}">Export CSV</button></li>
         </menu>
       </section>
       <form id="addMilestoneForm">
         <fieldset>
           <legend>New Milestone</legend>
           <input type="text" id="milestoneName" placeholder="Task name" required>
           <input type="date" id="milestoneDueDate" required>
           <input type="number" id="milestoneAmount" placeholder="Amount (ZAR)" min="0" step="0.01" required>
           <button type="submit">Add Milestone</button>
         </fieldset>
       </form>
       <ul id="milestonesList"></ul>`;

  const modal = createModal(`Milestones for ${jobTitle}`, modalContent);

  if (!isFreelancerView) {
    const dateInput = modal.querySelector("#milestoneDueDate");
    if (dateInput) {
      const today = new Date();
      dateInput.min = today.toISOString().split("T")[0];
    }
  }

  // Add export handlers
  modal
    .querySelector(".export-pdf")
    ?.addEventListener("click", () => exportMilestonesPDF(jobId, jobTitle));
  modal
    .querySelector(".export-csv")
    ?.addEventListener("click", () => exportMilestonesCSV(jobId, jobTitle));

  // Load milestones function
  const loadMilestones = async () => {
    try {
      const query = await db
        .collection("jobs")
        .doc(jobId)
        .collection("milestones")
        .orderBy("createdAt", "desc")
        .get();

      const freelancerIds = new Set();
      query.forEach((doc) => {
        if (doc.data().freelancerId) {
          freelancerIds.add(doc.data().freelancerId);
        }
      });

      const freelancers = {};
      await Promise.all(
        Array.from(freelancerIds).map(async (id) => {
          const userDoc = await db.collection("users").doc(id).get();
          if (userDoc.exists) {
            freelancers[id] =
              userDoc.data().displayName || "Unknown Freelancer";
          }
        })
      );
      const list = modal.querySelector("#milestonesList");

      list.innerHTML = "";

      if (query.empty) {
        list.innerHTML = "<li>No milestones yet</li>";
        return;
      }

      query.forEach((doc) => {
        const milestone = doc.data();
        const item = document.createElement("li");
        item.className = `milestone ${milestone.status}`;

        let submissionHtml = "";
        let actionButtons = "";
        let feedbackHtml = "";
        let paymentButton = "";

        // Show feedback 
        if (milestone.clientFeedback || milestone.rejectionReason) {
          feedbackHtml = `
            <article class="feedback-details">
              <h4>Client Feedback:</h4>
              <p>${milestone.clientFeedback || milestone.rejectionReason}</p>
              <p><small>${
                milestone.approvedAt ? "Approved" : "Rejected"
              } on: ${formatDate(
            milestone.approvedAt || milestone.rejectedAt
          )}</small></p>
            </article>
          `;
        }

        if (milestone.status === "submitted") {
          submissionHtml = `
            <article class="submission-details">
              <h4>Submitted Work:</h4>
              <p>${milestone.submission?.description || "No description"}</p>
              ${
                milestone.submission?.files?.length > 0
                  ? `<h5>Attachments:</h5>
                <ul class="submission-files">
                  ${milestone.submission.files
                    .map(
                      (file) => `
                    <li>
                      <a href="${file.url}" target="_blank" download="${file.name}">
                        ${file.name} (${file.type})
                      </a>
                    </li>
                  `
                    )
                    .join("")}
                </ul>`
                  : ""
              }
              <p><small>Submitted on: ${formatDate(
                milestone.submission?.submittedAt
              )}</small></p>
            </article>
          `;

          if (!isFreelancerView) {
            actionButtons = `
              <menu class="approval-buttons">
                <li><button class="approve-btn" data-job-id="${jobId}" data-milestone-id="${doc.id}">
                  Approve
                </button></li>
                <li><button class="reject-btn" data-job-id="${jobId}" data-milestone-id="${doc.id}">
                  Request Changes
                </button></li>
              </menu>
              <dialog class="feedback-dialog" id="feedbackDialog-${doc.id}">
                <form method="dialog">
                  <h4>Provide Feedback</h4>
                  <textarea id="feedbackText-${doc.id}" placeholder="Enter your feedback..." required></textarea>
                  <menu>
                    <li><button value="cancel">Cancel</button></li>
                    <li><button value="confirm" id="confirmFeedback-${doc.id}">Submit</button></li>
                  </menu>
                </form>
              </dialog>
            `;
          }
        }

        // payment button for approved milestones
        if (milestone.status === "Approved And Paid") {
          paymentButton = `
            <button class="view-payment" data-job-id="${jobId}" data-milestone-id="${doc.id}">
              View Payment
            </button>
          `;
        }

        item.innerHTML = `
        <article class="milestone-info">
          <header>
            <h4>${milestone.name}</h4>
            <p>Due: ${formatDate(milestone.dueDate)}</p>
            <p>Amount: ZAR ${milestone.amount?.toFixed(2) || "0.00"}</p>
            <p>Status: <em class="status-${milestone.status}">${
          milestone.status
        }</em></p>
          </header>
          
          ${
            milestone.status === "changes_requested" && isFreelancerView
              ? `
          <section class="feedback-notice">
            <h5>Client Feedback:</h5>
            <blockquote>${milestone.rejectionReason}</blockquote>
            <button class="resubmit-btn" data-job-id="${jobId}" data-milestone-id="${doc.id}">
              Resubmit Work
            </button>
          </section>`
              : ""
          }
          
          ${
            milestone.status === "Approved And Paid"
              ? `
          <footer>
            <button class="view-payment" data-job-id="${jobId}" data-milestone-id="${doc.id}">
              View Payment
            </button>
          </footer>`
              : ""
          }
          
          ${submissionHtml}
          ${feedbackHtml}
          ${actionButtons}
          
          ${
            (milestone.status === "pending" ||
              milestone.status === "changes_requested") &&
            isFreelancerView
              ? `
          <menu class="submission-actions">
            <li>
              <button class="submit-work" data-job-id="${jobId}" data-milestone-id="${
                  doc.id
                }">
                ${
                  milestone.status === "changes_requested"
                    ? "Resubmit Work"
                    : "Submit Work"
                }
              </button>
            </li>
          </menu>`
              : ""
          }
        </article>
      `;

        const resubmitBtn = item.querySelector(".resubmit-btn");
        if (resubmitBtn) {
          resubmitBtn.addEventListener("click", () => {
            showSubmissionForm(jobId, doc.id);
          });
        }

        // Handle work submission button
        const submitBtn = item.querySelector(".submit-work");
        if (submitBtn) {
          submitBtn.addEventListener("click", () => {
            showSubmissionForm(jobId, doc.id);
          });
        }

        // Handle payment view button
        const paymentBtn = item.querySelector(".view-payment");
        if (paymentBtn) {
          paymentBtn.addEventListener("click", () => {
            showPaymentDetails(jobId, doc.id);
          });
        }

        list.appendChild(item);
      });
    } catch (error) {
      console.error("Error loading milestones:", error);
      modal.querySelector("#milestonesList").innerHTML = `
        <li class="error">Error loading milestones</li>
      `;
    }
  };

  // Handle form submission (client view only)
  if (!isFreelancerView) {
    modal
      .querySelector("#addMilestoneForm")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector("button[type='submit']");

        try {
          submitBtn.disabled = true;
          submitBtn.textContent = "Adding...";

          // Get form values
          const name = form.querySelector("#milestoneName").value.trim();
          const dueDate = form.querySelector("#milestoneDueDate").value;
          const amount = parseFloat(
            form.querySelector("#milestoneAmount").value
          );

          // Validate inputs
          if (!name || !dueDate || isNaN(amount)) {
            throw new Error("Please fill all fields with valid values");
          }

          // Create complete milestone data
          const milestoneData = {
            name: name,
            dueDate: dueDate,
            amount: amount,
            status: "pending",
            createdAt: new Date().toISOString(),
            jobTitle: jobTitle,
          };

          // Add to Firestore
          await db
            .collection("jobs")
            .doc(jobId)
            .collection("milestones")
            .add(milestoneData);

          form.reset();
          await loadMilestones();
        } catch (error) {
          console.error("Error adding milestone:", error);
          alert(`Failed to add milestone: ${error.message}`);
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = "Add Milestone";
        }
      });
  }

  // Handle approval/rejection with feedback
  modal.addEventListener("click", async (e) => {
    // Replace the approval handler with this version
    if (e.target.classList.contains("approve-btn")) {
      const dialog = modal.querySelector(
        `#feedbackDialog-${e.target.dataset.milestoneId}`
      );
      const confirmBtn = dialog.querySelector(
        `#confirmFeedback-${e.target.dataset.milestoneId}`
      );

      confirmBtn.onclick = async () => {
        const feedback = dialog.querySelector(
          `#feedbackText-${e.target.dataset.milestoneId}`
        ).value;

        // Get the milestone data
        const milestoneRef = db
          .collection("jobs")
          .doc(e.target.dataset.jobId)
          .collection("milestones")
          .doc(e.target.dataset.milestoneId);

        const milestoneDoc = await milestoneRef.get();
        const milestone = milestoneDoc.data();

        // Get freelancerId either from milestone or application
        let freelancerId = milestone.freelancerId;

        if (!freelancerId) {
          // Fallback to getting from application if not in milestone
          const applicationsQuery = await db
            .collection("applications")
            .where("jobId", "==", e.target.dataset.jobId)
            .where("status", "==", "approved")
            .limit(1)
            .get();

          if (!applicationsQuery.empty) {
            freelancerId = applicationsQuery.docs[0].data().freelancerId;
          }
        }

        if (!freelancerId) {
          throw new Error("Cannot approve - no freelancer assigned");
        }

        // Record payment
        await recordPayment(
          e.target.dataset.jobId,
          e.target.dataset.milestoneId,
          {
            amount: milestone.amount,
            method: "Manual",
            transactionId: `PMT-${Date.now()}`,
            jobTitle: milestone.jobTitle || "Untitled Job",
            milestoneName: milestone.name,
            freelancerId: freelancerId,
            status: "completed",
            paymentDate: new Date().toISOString(),
          }
        );

        // Update milestone status
        await milestoneRef.update({
          status: "Approved And Paid",
          approvedAt: new Date().toISOString(),
          clientFeedback: feedback || "Approved without comments",
          paymentStatus: "paid",
          freelancerId: freelancerId, // Ensure this is saved
        });

        await loadMilestones();
        dialog.close();
      };

      dialog.showModal();
    } else if (e.target.classList.contains("reject-btn")) {
      const dialog = modal.querySelector(
        `#feedbackDialog-${e.target.dataset.milestoneId}`
      );
      const confirmBtn = dialog.querySelector(
        `#confirmFeedback-${e.target.dataset.milestoneId}`
      );

      confirmBtn.onclick = async () => {
        const feedback = dialog.querySelector(
          `#feedbackText-${e.target.dataset.milestoneId}`
        ).value;

        await db
          .collection("jobs")
          .doc(e.target.dataset.jobId)
          .collection("milestones")
          .doc(e.target.dataset.milestoneId)
          .update({
            status: "changes_requested", // New status
            rejectionReason:
              feedback || "Changes requested without specific feedback",
            rejectedAt: new Date().toISOString(),
            // Clear previous submission to allow resubmission
            submission: null,
          });

        await loadMilestones();
        dialog.close();
      };
      dialog.showModal();
    }
  });

  // Initial load
  await loadMilestones();
  document.body.appendChild(modal);
}

export async function showPaymentDetails(jobId, milestoneId) {
  const paymentsQuery = await db
    .collection("payments")
    .where("jobId", "==", jobId)
    .where("milestoneId", "==", milestoneId)
    .orderBy("paymentDate", "desc")
    .get();

  if (paymentsQuery.empty) {
    alert("No payment records found for this milestone");
    return;
  }

  const payment = paymentsQuery.docs[0].data();
  const modal = createModal(
    "Payment Details",
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
     <button type="button" class="print-payment">Print Receipt</button>`
  );

  // Print functionality
  modal.querySelector(".print-payment").addEventListener("click", () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Receipt - ${payment.transactionId}</title>
          <style>
            body { font-family: Arial; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            caption { font-size: 1.2em; font-weight: bold; margin-bottom: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .status-completed { color: green; }
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

export async function showSubmissionForm(jobId, milestoneId) {
  const formModal = createModal(
    "Submit Work",
    `<form id="workSubmissionForm">
      <fieldset>
        <legend>Work Details</legend>
        <label for="workDescription">Description:</label>
        <textarea id="workDescription" placeholder="Describe your work..." required></textarea>
        
        <label for="fileUpload">Upload Files:</label>
        <input type="file" id="fileUpload" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png,.zip">
        <output id="fileList"></output>
      </fieldset>
      <button type="submit">Submit Work</button>
    </form>`
  );

  // Handle file selection display
  const fileInput = formModal.querySelector("#fileUpload");
  const fileListOutput = formModal.querySelector("#fileList");

  fileInput.addEventListener("change", () => {
    fileListOutput.innerHTML = "";
    if (fileInput.files.length > 0) {
      const fileList = document.createElement("ul");
      fileList.className = "file-list";

      Array.from(fileInput.files).forEach((file) => {
        const fileItem = document.createElement("li");
        fileItem.textContent = `${file.name} (${(file.size / 1024).toFixed(
          2
        )} KB)`;
        fileList.appendChild(fileItem);
      });

      fileListOutput.appendChild(fileList);
    }
  });

  // Handle form submission
  formModal.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const description = formModal.querySelector("#workDescription").value;
    const files = fileInput.files;

    try {
      // Show loading state
      const submitBtn = formModal.querySelector("button[type='submit']");
      submitBtn.disabled = true;
      submitBtn.textContent = "Uploading...";

      // Upload files to Firebase Storage
      const storageRef = storage.ref();
      const fileUrls = [];

      for (const file of files) {
        try {
          const timestamp = Date.now();
          const fileExt = file.name.split(".").pop();
          const filename = `submission_${timestamp}.${fileExt}`;
          const fileRef = storageRef.child(
            `submissions/${jobId}/${milestoneId}/${filename}`
          );

          const snapshot = await fileRef.put(file, {
            contentType: file.type,
            customMetadata: { originalName: file.name },
          });

          const url = await snapshot.ref.getDownloadURL();
          fileUrls.push({
            name: file.name,
            url: url,
            type: file.type,
          });
        } catch (fileError) {
          console.error(`Error uploading ${file.name}:`, fileError);
          throw new Error(`Failed to upload ${file.name}`);
        }
      }

      // Update milestone in Firestore
      await db
        .collection("jobs")
        .doc(jobId)
        .collection("milestones")
        .doc(milestoneId)
        .update({
          status: "submitted",
          submission: {
            description: description,
            files: fileUrls,
            submittedAt: new Date().toISOString(),
          },
        });

      alert("Work submitted successfully!");
      document.body.removeChild(formModal);
    } catch (error) {
      console.error("Submission failed:", error);
      alert(`Failed to submit work: ${error.message}`);
    } finally {
      const submitBtn = formModal.querySelector("button[type='submit']");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Work";
      }
    }
  });

  document.body.appendChild(formModal);
}
