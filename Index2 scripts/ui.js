// DOM elements
export const elements = {
  homeView: document.getElementById("homeView"),
  freelancerView: document.getElementById("freelancerView"),
  clientView: document.getElementById("clientView"),
  jobsContainer: document.getElementById("jobsContainer"),
  freelancersList: document.getElementById("freelancersList"),
  freelancerProfileForm: document.getElementById("freelancerProfileForm"),
  jobPostForm: document.getElementById("jobPostForm"),
  globalSearchInput: document.getElementById("globalSearchInput"),
  globalSearchBtn: document.getElementById("globalSearchBtn"),
  jobSearchInput: document.getElementById("jobSearchInput"),
  freelancerSearchInput: document.getElementById("freelancerSearchInput"),
  homeBtn: document.getElementById("homeBtn"),
  freelancerBtn: document.getElementById("freelancerBtn"),
  clientBtn: document.getElementById("clientBtn"),
  findFreelancersBtn: document.getElementById("findFreelancersBtn"),
  postJobBtn: document.getElementById("postJobBtn"),
  createFreelancerProfileBtn: document.getElementById(
    "createFreelancerProfileBtn"
  ),

  jobBudgetFilter: document.getElementById("jobBudgetFilter"),
  jobDurationFilter: document.getElementById("jobDurationFilter"),
  freelancerRateFilter: document.getElementById("freelancerRateFilter"),
  freelancerExperienceFilter: document.getElementById(
    "freelancerExperienceFilter"
  ),
  jobSearchForm: document.getElementById("jobSearchForm"),
  freelancerSearchForm: document.getElementById("freelancerSearchForm"),

  browseJobsBtn: document.getElementById("browseJobsBtn"),
  postJobFormBtn: document.getElementById("postJobFormBtn"),
  browseFreelancersBtn: document.getElementById("browseFreelancersBtn"),
  freelancerName: document.getElementById("freelancerName"),
  freelancerTitle: document.getElementById("freelancerTitle"),
  freelancerSkills: document.getElementById("freelancerSkills"),
  freelancerRate: document.getElementById("freelancerRate"),
  freelancerBio: document.getElementById("freelancerBio"),
  freelancerLocation: document.getElementById("freelancerLocation"),
  freelancerExperience: document.getElementById("freelancerExperience"),
  freelancerPhoto: document.getElementById("freelancerPhoto"),
  jobTitle: document.getElementById("jobTitle"),
  jobDescription: document.getElementById("jobDescription"),
  jobSkills: document.getElementById("jobSkills"),
  jobBudget: document.getElementById("jobBudget"),
  jobDuration: document.getElementById("jobDuration"),
  photoPreview: document.getElementById("photoPreview"),
};

export const showView = (viewName) => {
  elements.homeView.classList.add("hidden");
  elements.freelancerView.classList.add("hidden");
  elements.clientView.classList.add("hidden");

  elements[`${viewName}View`].classList.remove("hidden");

  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.id === `${viewName}Btn`);
  });
};

export const showSection = (sectionName) => {
  const currentView = document.querySelector('[id$="View"]:not(.hidden)');
  currentView.querySelectorAll(".section").forEach((section) => {
    section.classList.add("hidden");
  });
  document.getElementById(sectionName).classList.remove("hidden");
};

// Rendering Functions
export const renderJobs = (jobs, searchTerm = "") => {
  elements.jobsContainer.innerHTML =
    jobs.length > 0
      ? jobs.map((job) => createJobCard(job, searchTerm)).join("")
      : '<p class="no-results">No jobs found</p>';
};

const createJobCard = (job, searchTerm) => {
  return `
    <article class="job-card" data-id="${job.id}">
      <h3>${highlightText(job.title, searchTerm)}</h3>
      <p class="description">${highlightText(job.description, searchTerm)}</p>
      <p class="budget">${highlightText(job.budget, searchTerm)}</p>
      <p class="duration">${highlightText(job.duration, searchTerm)}</p>
      <div class="skills">
        ${job.skills
          .map(
            (skill) => `
          <span class="skill-tag">${highlightText(skill, searchTerm)}</span>
        `
          )
          .join("")}
      </div>
      <p class="posted">Posted: ${job.postedAt}</p>
      <button class="apply-btn" data-id="${job.id}">Apply</button>
    </article>
  `;
};

export const renderFreelancers = (freelancers, searchTerm = "") => {
  elements.freelancersList.innerHTML =
    freelancers.length > 0
      ? freelancers
          .map((freelancer) => createFreelancerCard(freelancer, searchTerm))
          .join("")
      : '<p class="no-results">No freelancers found</p>';
};

const createFreelancerCard = (freelancer, searchTerm) => {
  return `
    <article class="freelancer-card" data-id="${freelancer.id}">
      ${
        freelancer.photo
          ? `
        <img src="${freelancer.photo}" class="profile-photo" alt="${freelancer.name}">
      `
          : '<div class="profile-photo empty"></div>'
      }
      <h3>${highlightText(freelancer.name, searchTerm)}</h3>
      <p class="title">${highlightText(freelancer.title, searchTerm)}</p>
      <p class="rate">${highlightText(freelancer.rate, searchTerm)}</p>
      ${
        freelancer.bio
          ? `
        <p class="bio">${highlightText(
          freelancer.bio.length > 100
            ? freelancer.bio.substring(0, 100) + "..."
            : freelancer.bio,
          searchTerm
        )}</p>
      `
          : ""
      }
      <div class="skills">
        ${freelancer.skills
          .map(
            (skill) => `
          <span class="skill-tag">${highlightText(skill, searchTerm)}</span>
        `
          )
          .join("")}
      </div>
      <p class="location">${highlightText(freelancer.location, searchTerm)}</p>
      <p class="experience">${highlightText(
        freelancer.experience,
        searchTerm
      )}</p>
      <button class="hire-btn" data-id="${freelancer.id}">Contact</button>
    </article>
  `;
};

// Helper Functions
const highlightText = (text, term) => {
  if (!term || !text) return text;
  try {
    const regex = new RegExp(
      `(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    return text.toString().replace(regex, '<mark class="highlight">$1</mark>');
  } catch (e) {
    return text;
  }
};

export const showLoading = (element) => {
  const originalText = element.textContent;
  element.textContent = "Loading...";
  element.disabled = true;
  return () => {
    element.textContent = originalText;
    element.disabled = false;
  };
};
