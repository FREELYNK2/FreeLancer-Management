document.addEventListener("DOMContentLoaded", function () {
  // Initialize Firebase services
  const auth = firebase.auth();
  const db = firebase.firestore();
  const storage = firebase.storage();

  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      console.log("No user logged in");
      return;
    }

    // Load user info
    const userNameElement = document.getElementById("user-name");
    userNameElement.textContent = user.displayName || "User";

    // Setup logout
    document.getElementById("logout-btn").addEventListener("click", () => {
      auth.signOut().then(() => (window.location.href = "index.html"));
    });

    // Load both applications and posted jobs
    await Promise.all([loadApplications(user.uid), loadPostedJobs(user.uid)]);
    setupTabs();
  });

  async function loadApplications(userId) {
    try {
      const query = await db
        .collection("applications")
        .where("freelancerId", "==", userId)
        .orderBy("appliedAt", "desc")
        .get();

      const applicationsList = document.getElementById("applicationsList");
      const allActivitiesList = document.getElementById("allActivitiesList");

      if (query.empty) {
        applicationsList.innerHTML = "<li>No applications yet</li>";
      } else {
        applicationsList.innerHTML = "";
        query.forEach((doc) => {
          const app = doc.data();
          const appDate = formatDate(app.appliedAt);

          const appItem = document.createElement("li");
          appItem.className = "activity-item";

          const appCard = document.createElement("article");
          appCard.className = "application-card";

          const title = document.createElement("h4");
          title.textContent = app.jobTitle || "Untitled Position";

          const statusPara = document.createElement("p");
          statusPara.innerHTML = `<strong>Status:</strong> <em class="status-${app.status}">${app.status}</em>`;

          const datePara = document.createElement("p");
          datePara.innerHTML = `<strong>Applied:</strong> ${appDate}`;

          // Show different buttons based on status
          if (app.status === "approved") {
            const milestonesBtn = document.createElement("button");
            milestonesBtn.className = "view-milestones";
            milestonesBtn.textContent = "View Milestones";
            milestonesBtn.dataset.jobId = app.jobId;
            appCard.append(title, statusPara, datePara, milestonesBtn);

            milestonesBtn.addEventListener("click", async () => {
              showFreelancerMilestonesModal(app.jobId, app.jobTitle);
            });
          } else {
            const viewBtn = document.createElement("button");
            viewBtn.className = "view-job";
            viewBtn.dataset.jobId = app.jobId;
            viewBtn.textContent = "View Job Details";
            appCard.append(title, statusPara, datePara, viewBtn);
          }

          appItem.appendChild(appCard);
          applicationsList.appendChild(appItem);

          // Add to all activities
          const activityItem = createActivityItem(
            `Applied for ${app.jobTitle}`,
            appDate,
            app.status
          );
          allActivitiesList.appendChild(activityItem);
        });
      }
    } catch (error) {
      console.error("Error loading applications:", error);
      showError("applicationsList", "Error loading applications");
    }
  }

  async function loadPostedJobs(userId) {
    try {
      const query = await db
        .collection("jobs")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get();

      const postedJobsList = document.getElementById("postedJobsList");

      if (query.empty) {
        postedJobsList.innerHTML = "<li>No jobs posted yet</li>";
      } else {
        postedJobsList.innerHTML = "";
        query.forEach(async (jobDoc) => {
          const job = jobDoc.data();
          const jobItem = document.createElement("li");
          jobItem.className = "activity-item";

          const jobCard = document.createElement("article");
          jobCard.className = "job-card";

          jobCard.innerHTML = `
            <h4>${job.title || "Untitled Job"}</h4>
            <p><strong>Budget:</strong> ${job.budget || "Not specified"}</p>
            <p><strong>Posted:</strong> ${formatDate(job.createdAt)}</p>
            <p><strong>Status:</strong> <em class="status-${
              job.status || "open"
            }">${job.status || "open"}</em></p>
          `;

          // Show different buttons based on job status
          if (job.status === "approved") {
            const milestonesBtn = document.createElement("button");
            milestonesBtn.className = "manage-milestones";
            milestonesBtn.textContent = "Manage Milestones";
            milestonesBtn.dataset.jobId = jobDoc.id;
            jobCard.appendChild(milestonesBtn);

            milestonesBtn.addEventListener("click", () => {
              showMilestonesModal(jobDoc.id, job.title);
            });
          } else {
            const viewBtn = document.createElement("button");
            viewBtn.className = "view-applicants";
            viewBtn.textContent = "View Applicants";
            viewBtn.dataset.jobId = jobDoc.id;
            jobCard.appendChild(viewBtn);

            viewBtn.addEventListener("click", async () => {
              showApplicantsModal(jobDoc.id, job.title);
            });
          }

          jobItem.appendChild(jobCard);
          postedJobsList.appendChild(jobItem);
        });
      }
    } catch (error) {
      console.error("Error loading posted jobs:", error);
      showError("postedJobsList", "Error loading posted jobs");
    }
  }

  // Show applicants modal for clients
  async function showApplicantsModal(jobId, jobTitle) {
    const modal = document.createElement("section");
    modal.className = "modal";
    modal.innerHTML = `
      <h3>Applicants for "${jobTitle}"</h3>
      <ul id="applicantsList-${jobId}"></ul>
      <button class="close-modal">Close</button>
    `;

    const applicants = await db
      .collection("applications")
      .where("jobId", "==", jobId)
      .get();

    applicants.forEach((appDoc) => {
      const app = appDoc.data();
      const applicantItem = document.createElement("li");
      applicantItem.className = "applicant";
      applicantItem.innerHTML = `
        <p>Freelancer: ${app.freelancerId}</p>
        <p>Status: <em class="status-${app.status}">${app.status}</em></p>
        ${
          app.status === "pending"
            ? `
          <menu class="action-buttons">
            <li><button class="approve-btn" data-app-id="${appDoc.id}">Approve</button></li>
            <li><button class="reject-btn" data-app-id="${appDoc.id}">Reject</button></li>
          </menu>
        `
            : ""
        }
      `;
      modal
        .querySelector(`#applicantsList-${jobId}`)
        .appendChild(applicantItem);
    });

    // Close modal button
    modal.querySelector(".close-modal").addEventListener("click", () => {
      document.body.removeChild(modal);
    });

    document.body.appendChild(modal);
  }

  // Show milestones management modal for clients
  function showMilestonesModal(jobId, jobTitle) {
    const modal = document.createElement("section");
    modal.className = "modal";
    modal.innerHTML = `
      <h3>Milestones for ${jobTitle}</h3>
      <form id="addMilestoneForm">
        <fieldset>
          <legend>New Milestone</legend>
          <input type="text" placeholder="Task name" required>
          <input type="date" placeholder="Due date" required>
          <input type="number" placeholder="Amount (ZAR)" min="0" required>
          <button type="submit">Add Milestone</button>
        </fieldset>
      </form>
      <ul id="milestonesList"></ul>
      <button class="close-modal">Close</button>
    `;

    // Load existing milestones with submission handling
    const loadMilestones = async () => {
      const query = await db
        .collection("jobs")
        .doc(jobId)
        .collection("milestones")
        .get();
      const list = modal.querySelector("#milestonesList");

      list.innerHTML = "";
      query.forEach((doc) => {
        const milestone = doc.data();
        const item = document.createElement("li");
        item.className = `milestone ${milestone.status}`;

        let submissionHtml = "";
        let actionButtons = "";

        if (milestone.status === "submitted") {
          submissionHtml = `
            <article class="submission-details">
              <h4>Submitted Work:</h4>
              <p>${milestone.submission.description}</p>
              ${
                milestone.submission.files &&
                milestone.submission.files.length > 0
                  ? `
                    <h5>Attachments:</h5>
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
                    </ul>
                  `
                  : ""
              }
              <p><small>Submitted on: ${formatDate(
                milestone.submission.submittedAt
              )}</small></p>
            </article>
          `;

          actionButtons = `
            <menu class="approval-buttons">
              <li><button class="approve-btn" data-job-id="${jobId}" data-milestone-id="${doc.id}">
                Approve
              </button></li>
              <li><button class="reject-btn" data-job-id="${jobId}" data-milestone-id="${doc.id}">
                Request Changes
              </button></li>
            </menu>
          `;
        }

        item.innerHTML = `
          <article class="milestone-info">
            <h4>${milestone.name}</h4>
            <p>Due: ${milestone.dueDate}</p>
            <p>Amount: ZAR ${milestone.amount}</p>
            <p>Status: <em class="status-${milestone.status}">${milestone.status}</em></p>
          </article>
          ${submissionHtml}
          ${actionButtons}
        `;

        list.appendChild(item);
      });
    };

    // Handle approval buttons
    modal.addEventListener("click", async (e) => {
      if (e.target.classList.contains("approve-btn")) {
        await db
          .collection("jobs")
          .doc(e.target.dataset.jobId)
          .collection("milestones")
          .doc(e.target.dataset.milestoneId)
          .update({
            status: "approved",
            approvedAt: new Date().toISOString(),
          });
        loadMilestones();
      }

      if (e.target.classList.contains("reject-btn")) {
        await db
          .collection("jobs")
          .doc(e.target.dataset.jobId)
          .collection("milestones")
          .doc(e.target.dataset.milestoneId)
          .update({
            status: "pending",
            rejectionReason: "Client requested changes",
          });
        loadMilestones();
      }
    });

    // Handle form submission
    modal
      .querySelector("#addMilestoneForm")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const form = e.target;
        await addMilestone(jobId, {
          name: form[0].value,
          dueDate: form[1].value,
          amount: parseFloat(form[2].value),
          status: "pending",
        });
        form.reset();
        loadMilestones();
      });

    // Close modal button
    modal.querySelector(".close-modal").addEventListener("click", () => {
      document.body.removeChild(modal);
    });

    loadMilestones();
    document.body.appendChild(modal);
  }

  // Show milestones view for freelancers
  async function showFreelancerMilestonesModal(jobId, jobTitle) {
    const modal = document.createElement("section");
    modal.className = "modal";
    modal.innerHTML = `
      <h3>Milestones for ${jobTitle}</h3>
      <ul id="milestonesList"></ul>
    `;

    const query = await db
      .collection("jobs")
      .doc(jobId)
      .collection("milestones")
      .get();
    const list = modal.querySelector("#milestonesList");

    query.forEach((doc) => {
      const milestone = doc.data();
      const item = document.createElement("li");
      item.className = `milestone ${milestone.status}`;
      item.innerHTML = `
        <article>
          <h4>${milestone.name}</h4>
          <p>Status: <em class="status-${milestone.status}">${
        milestone.status
      }</em></p>
          ${
            milestone.status === "pending"
              ? `
            <button class="submit-work" data-job-id="${jobId}" data-milestone-id="${doc.id}">
              Submit Work
            </button>
          `
              : ""
          }
          ${
            milestone.status === "submitted"
              ? `
            <p>✅ Submitted (waiting for approval)</p>
          `
              : ""
          }
          ${
            milestone.status === "approved"
              ? `
            <p>🎉 Approved by client!</p>
            ${
              milestone.submission?.files?.length > 0
                ? `
                  <p>Files submitted:</p>
                  <ul class="submission-files">
                    ${milestone.submission.files
                      .map(
                        (file) => `
                      <li>
                        <a href="${file.url}" target="_blank" download="${file.name}">
                          ${file.name}
                        </a>
                      </li>
                    `
                      )
                      .join("")}
                  </ul>
                `
                : ""
            }
          `
              : ""
          }
        </article>
      `;

      // Handle work submission
      const submitBtn = item.querySelector(".submit-work");
      if (submitBtn) {
        submitBtn.addEventListener("click", () => {
          showSubmissionForm(jobId, doc.id);
        });
      }
      list.appendChild(item);
    });
    document.body.appendChild(modal);
  }

  async function showSubmissionForm(jobId, milestoneId) {
    const formModal = document.createElement("section");
    formModal.className = "modal";
    formModal.innerHTML = `
      <h3>Submit Work</h3>
      <form id="workSubmissionForm">
        <fieldset>
          <legend>Work Details</legend>
          <label for="workDescription">Description:</label>
          <textarea id="workDescription" placeholder="Describe your work..." required></textarea>
          
          <label for="fileUpload">Upload Files:</label>
          <input type="file" id="fileUpload" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png,.zip">
          <output id="fileList"></output>
        </fieldset>
        <button type="submit">Submit Work</button>
      </form>
    `;

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

        // Upload files to Firebase Storage using Firebase SDK
        const storageRef = storage.ref();
        const fileUrls = [];

        // Upload each file sequentially to avoid CORS issues
        for (const file of files) {
          try {
            // Create a unique filename with timestamp
            const timestamp = Date.now();
            const fileExt = file.name.split(".").pop();
            const filename = `submission_${timestamp}.${fileExt}`;

            const fileRef = storageRef.child(
              `submissions/${jobId}/${milestoneId}/${filename}`
            );

            // Upload with metadata
            const snapshot = await fileRef.put(file, {
              contentType: file.type,
              customMetadata: {
                originalName: file.name,
              },
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

  // Add new milestone to Firestore
  async function addMilestone(jobId, milestoneData) {
    await db
      .collection("jobs")
      .doc(jobId)
      .collection("milestones")
      .add(milestoneData);
  }

  function showMilestonesModal(jobId, jobTitle) {
    const modal = document.createElement("section");
    modal.className = "modal";
    modal.innerHTML = `
      <h3>Milestones for ${jobTitle}</h3>
      <form id="addMilestoneForm">
        <fieldset>
          <legend>New Milestone</legend>
          <input type="text" id="milestoneName" placeholder="Task name" required>
          <input type="date" id="milestoneDueDate" placeholder="Due date" required>
          <input type="number" id="milestoneAmount" placeholder="Amount (ZAR)" min="0" required>
          <button type="submit">Add Milestone</button>
        </fieldset>
      </form>
      <ul id="milestonesList"></ul>
      <button class="close-modal">Close</button>
    `;

    // Load existing milestones
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

          if (milestone.status === "submitted") {
            submissionHtml = `
              <article class="submission-details">
                <h4>Submitted Work:</h4>
                <p>${milestone.submission.description}</p>
                ${
                  milestone.submission.files?.length > 0
                    ? `
                      <h5>Attachments:</h5>
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
                      </ul>
                    `
                    : ""
                }
                <p><small>Submitted on: ${formatDate(
                  milestone.submission.submittedAt
                )}</small></p>
              </article>
            `;

            actionButtons = `
              <menu class="approval-buttons">
                <li><button class="approve-btn" data-job-id="${jobId}" data-milestone-id="${doc.id}">
                  Approve
                </button></li>
                <li><button class="reject-btn" data-job-id="${jobId}" data-milestone-id="${doc.id}">
                  Request Changes
                </button></li>
              </menu>
            `;
          }

          item.innerHTML = `
            <article class="milestone-info">
              <h4>${milestone.name}</h4>
              <p>Due: ${formatDate(milestone.dueDate)}</p>
              <p>Amount: ZAR ${milestone.amount}</p>
              <p>Status: <em class="status-${milestone.status}">${
            milestone.status
          }</em></p>
            </article>
            ${submissionHtml}
            ${actionButtons}
          `;

          list.appendChild(item);
        });
      } catch (error) {
        console.error("Error loading milestones:", error);
        modal.querySelector("#milestonesList").innerHTML = `
          <li class="error">Error loading milestones</li>
        `;
      }
    };

    // Handle form submission
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

          // Add to Firestore
          await db.collection("jobs").doc(jobId).collection("milestones").add({
            name: name,
            dueDate: dueDate,
            amount: amount,
            status: "pending",
            createdAt: new Date().toISOString(),
          });

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

    // Handle approval buttons
    modal.addEventListener("click", async (e) => {
      if (e.target.classList.contains("approve-btn")) {
        try {
          await db
            .collection("jobs")
            .doc(e.target.dataset.jobId)
            .collection("milestones")
            .doc(e.target.dataset.milestoneId)
            .update({
              status: "approved",
              approvedAt: new Date().toISOString(),
            });
          await loadMilestones();
        } catch (error) {
          console.error("Error approving milestone:", error);
          alert("Failed to approve milestone");
        }
      }

      if (e.target.classList.contains("reject-btn")) {
        try {
          await db
            .collection("jobs")
            .doc(e.target.dataset.jobId)
            .collection("milestones")
            .doc(e.target.dataset.milestoneId)
            .update({
              status: "pending",
              rejectionReason: "Client requested changes",
            });
          await loadMilestones();
        } catch (error) {
          console.error("Error rejecting milestone:", error);
          alert("Failed to reject milestone");
        }
      }
    });

    // Close modal button
    modal.querySelector(".close-modal").addEventListener("click", () => {
      document.body.removeChild(modal);
    });

    loadMilestones();
    document.body.appendChild(modal);
  }

  // Helper functions
  function formatDate(dateValue) {
    if (!dateValue) return "Unknown date";
    try {
      const date = dateValue?.toDate?.() || new Date(dateValue);
      return date.toLocaleDateString();
    } catch {
      return "Unknown date";
    }
  }

  function createActivityItem(action, date, status) {
    const item = document.createElement("li");
    item.className = "activity-item";
    item.textContent = `${action} on ${date} `;

    const statusIndicator = document.createElement("i");
    statusIndicator.className = `status-bubble status-${status}`;
    item.appendChild(statusIndicator);

    return item;
  }

  function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
      const errorItem = document.createElement("li");
      errorItem.className = "error";
      errorItem.textContent = message;
      element.appendChild(errorItem);
    }
  }

  function setupTabs() {
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".activity-content");

    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        tabButtons.forEach((btn) => btn.classList.remove("active"));
        tabContents.forEach((content) => content.classList.add("hidden"));

        const tabId = button.dataset.tab;
        button.classList.add("active");

        if (tabId === "all") {
          document.getElementById("allActivities").classList.remove("hidden");
        } else if (tabId === "applied") {
          document
            .getElementById("appliedActivities")
            .classList.remove("hidden");
        } else if (tabId === "posted") {
          document
            .getElementById("postedActivities")
            .classList.remove("hidden");
        } else if (tabId === "hires") {
          document.getElementById("hiresActivities").classList.remove("hidden");
        }
      });
    });
  }
});
