import { elements } from "../Index2 scripts/ui.js";
import {
  saveFreelancerProfile,
  postNewJob,
  submitApplication,
} from "../Index2 scripts/db.js";
import { showView, showSection, showLoading } from "../Index2 scripts/ui.js";

const initEventListeners = () => {
  // Verify essential elements exist
  if (!elements.homeBtn || !elements.freelancerBtn || !elements.clientBtn) {
    console.error("Critical navigation elements missing");
    return;
  }

// Get the button element
 elements.homeBtn.addEventListener("click", () => {
    window.location.href = "Freelancing.html";
  });
  
  elements.freelancerBtn.addEventListener("click", () =>
    showView("freelancer")
  );
  elements.clientBtn.addEventListener("click", () => showView("client"));

  // Home actions
  elements.findFreelancersBtn?.addEventListener("click", () => {
    showView("client");
    showSection("freelancersContainer");
  });

  elements.postJobBtn?.addEventListener("click", () => {
    showView("client");
    showSection("jobPostForm");
  });

  // Freelancer actions
  elements.createFreelancerProfileBtn?.addEventListener("click", () => {
    showSection("freelancerProfileForm");
  });

  elements.browseJobsBtn?.addEventListener("click", () => {
    showSection("jobListings");
  });

  // Client actions
  elements.postJobFormBtn?.addEventListener("click", () => {
    showSection("jobPostForm");
  });

  elements.browseFreelancersBtn?.addEventListener("click", () => {
    showSection("freelancersContainer");
  });

  // Form submissions
  elements.freelancerProfileForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const resetButton = showLoading(
      e.target.querySelector('button[type="submit"]')
    );

    try {
      const formData = {
        name: elements.freelancerName.value,
        title: elements.freelancerTitle.value,
        skills: elements.freelancerSkills.value,
        rate: elements.freelancerRate.value,
        bio: elements.freelancerBio.value,
        location: elements.freelancerLocation.value,
        experience: elements.freelancerExperience.value,
      };

      const photoFile = elements.freelancerPhoto.files[0];
      await saveFreelancerProfile(formData, photoFile);

      alert("Profile saved successfully!");
      e.target.reset();
      showSection("jobListings");
    } catch (error) {
      alert(`Error saving profile: ${error.message}`);
    } finally {
      resetButton();
    }
  });

  elements.jobPostForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const resetButton = showLoading(
      e.target.querySelector('button[type="submit"]')
    );

    try {
      const formData = {
        title: elements.jobTitle.value,
        description: elements.jobDescription.value,
        skills: elements.jobSkills.value,
        budget: elements.jobBudget.value,
        duration: elements.jobDuration.value,
      };

      await postNewJob(formData);

      alert("Job posted successfully!");
      e.target.reset();
      showSection("freelancersContainer");
    } catch (error) {
      alert(`Error posting job: ${error.message}`);
    } finally {
      resetButton();
    }
  });

  // Dynamic event delegation
  elements.jobsContainer.addEventListener("click", async (e) => {
    if (e.target.classList.contains("apply-btn")) {
      const jobCard = e.target.closest(".job-card");
      const jobId = jobCard.dataset.id;

      try {
        await submitApplication(jobId);
        alert("Application submitted! The client has been notified.");
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    }
  });

  // Add to events.js
  elements.jobSearchForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const searchTerm = elements.jobSearchInput.value;
    const budgetFilter = elements.jobBudgetFilter.value;
    const durationFilter = elements.jobDurationFilter.value;

    const filteredJobs = searchJobs(state.jobs, searchTerm, {
      budget: budgetFilter,
      duration: durationFilter,
    });

    renderJobs(filteredJobs);
  });

  elements.freelancerSearchForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const searchTerm = elements.freelancerSearchInput.value;
    const rateFilter = elements.freelancerRateFilter.value;
    const experienceFilter = elements.freelancerExperienceFilter.value;

    const filteredFreelancers = searchFreelancers(
      state.freelancers,
      searchTerm,
      {
        rate: rateFilter,
        experience: experienceFilter,
      }
    );

    renderFreelancers(filteredFreelancers);
  });
};

export { initEventListeners };
