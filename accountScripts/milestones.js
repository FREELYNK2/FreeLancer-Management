import { db, storage } from "../accountScripts/auth.js";
import { formatDate, createModal, showError } from "../accountScripts/ui.js";
import { exportMilestonesPDF, exportMilestonesCSV } from "./export.js";

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

        // Show feedback if available
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

        item.innerHTML = `
          <article class="milestone-info">
            <h4>${milestone.name}</h4>
            <p>Due: ${formatDate(milestone.dueDate)}</p>
            <p>Amount: ZAR ${milestone.amount?.toFixed(2) || "0.00"}</p>
            <p>Status: <em class="status-${milestone.status}">${
          milestone.status
        }</em></p>
          </article>
          ${submissionHtml}
          ${feedbackHtml}
          ${actionButtons}
          ${
            milestone.status === "pending" && isFreelancerView
              ? `<button class="submit-work" data-job-id="${jobId}" data-milestone-id="${doc.id}">
              Submit Work
            </button>`
              : ""
          }
        `;

        // Handle work submission button
        const submitBtn = item.querySelector(".submit-work");
        if (submitBtn) {
          submitBtn.addEventListener("click", () => {
            showSubmissionForm(jobId, doc.id);
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
        await db
          .collection("jobs")
          .doc(e.target.dataset.jobId)
          .collection("milestones")
          .doc(e.target.dataset.milestoneId)
          .update({
            status: "Approved And Paid",
            approvedAt: new Date().toISOString(),
            clientFeedback: feedback || "Approved without comments",
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
            status: "Pending",
            rejectionReason:
              feedback || "Changes requested without specific feedback",
            rejectedAt: new Date().toISOString(),
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
