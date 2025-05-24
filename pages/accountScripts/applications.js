import { db } from "../accountScripts/auth.js";
import {
  formatDate,
  createModal,
  createActivityItem,
  showError,
} from "../accountScripts/ui.js";
import {
  getUserApplications,
  getUserPostedJobs,
  getJobApplicants,
  updateApplicationStatus,
} from "../accountScripts/firestore.js";
import { showMilestonesModal } from "../accountScripts/milestones.js";

export async function loadApplications(userId) {
  try {
    const query = await getUserApplications(userId);
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

export async function loadPostedJobs(userId) {
  try {
    const query = await getUserPostedJobs(userId);
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

        // Change this condition to check for "approved" status
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

export async function showApplicantsModal(jobId, jobTitle) {
  const modal = createModal(
    `Applicants for "${jobTitle}"`,
    `<ul id="applicantsList-${jobId}"></ul>`
  );

  const applicants = await getJobApplicants(jobId);

  applicants.forEach((appDoc) => {
    const app = appDoc.data();
    const applicantItem = document.createElement("li");
    applicantItem.className = "applicant";
    applicantItem.innerHTML = `
      <p>Freelancer: ${app.freelancerEmail}</p>
      <p>Status: <em class="status-${app.status}">${app.status}</em></p>
      ${
        app.status === "pending"
          ? `<menu class="action-buttons">
          <li><button class="approve-btn" data-app-id="${appDoc.id}" data-job-id="${jobId}">Approve</button></li>
          <li><button class="reject-btn" data-app-id="${appDoc.id}">Reject</button></li>
        </menu>`
          : ""
      }
    `;
    modal.querySelector(`#applicantsList-${jobId}`).appendChild(applicantItem);
  });

  // Handle approve/reject buttons
  modal.addEventListener("click", async (e) => {
    if (e.target.classList.contains("approve-btn")) {
      // Update application status
      await updateApplicationStatus(e.target.dataset.appId, "approved");

      // Update job status to "approved"
      await db.collection("jobs").doc(e.target.dataset.jobId).update({
        status: "approved",
      });

      // Refresh modal and page
      showApplicantsModal(jobId, jobTitle);
      location.reload(); // Refresh to show the new "Manage Milestones" button
    } else if (e.target.classList.contains("reject-btn")) {
      await updateApplicationStatus(e.target.dataset.appId, "rejected");
      showApplicantsModal(jobId, jobTitle);
    }
  });

  document.body.appendChild(modal);
}

export async function showFreelancerMilestonesModal(jobId, jobTitle) {
  await showMilestonesModal(jobId, jobTitle, true);
}
