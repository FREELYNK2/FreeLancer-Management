import {
  initAuthStateListener,
  getCurrentUser,
} from "../Index2 scripts/auth.js";
import { initEventListeners } from "../Index2 scripts/events.js";
import { loadJobs, loadFreelancers } from "../Index2 scripts/db.js";
import {
  renderJobs,
  renderFreelancers,
  elements,
} from "../Index2 scripts/ui.js";
import {
  performGlobalSearch,
  searchJobs,
  searchFreelancers,
} from "../Index2 scripts/search.js";

// App state
const state = {
  jobs: [],
  freelancers: [],
  currentUser: null,
  searchTerm: "",
  filters: {
    budget: "",
    duration: "",
    rate: "",
    experience: "",
  },
};

// Initialize application
const initApp = () => {
  // First check if user is already logged in
  state.currentUser = getCurrentUser();

  // Set up auth state listener
  initAuthStateListener((user) => {
    state.currentUser = user;
    if (user) {
      loadInitialData();
    }
  });

  initEventListeners();
  setupSearchHandlers();
};

// Load initial data
const loadInitialData = async () => {
  try {
    const [jobs, freelancers] = await Promise.all([
      loadJobs(),
      loadFreelancers(),
    ]);

    state.jobs = jobs;
    state.freelancers = freelancers;

    renderJobs(jobs);
    renderFreelancers(freelancers);
  } catch (error) {
    console.error("Error loading initial data:", error);
  }
};

// Setup search handlers
const setupSearchHandlers = () => {
  // Global search
  elements.globalSearchBtn?.addEventListener("click", handleGlobalSearch);
  elements.globalSearchInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleGlobalSearch();
  });

  // Job search filters
  elements.jobBudgetFilter?.addEventListener("change", handleJobFilterChange);
  elements.jobDurationFilter?.addEventListener("change", handleJobFilterChange);

  // Freelancer search filters
  elements.freelancerRateFilter?.addEventListener(
    "change",
    handleFreelancerFilterChange
  );
  elements.freelancerExperienceFilter?.addEventListener(
    "change",
    handleFreelancerFilterChange
  );

  // Form submissions
  elements.jobSearchForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    handleJobFilterChange();
  });

  elements.freelancerSearchForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    handleFreelancerFilterChange();
  });
};

// Search handler functions
const handleGlobalSearch = () => {
  state.searchTerm = elements.globalSearchInput.value;
  const { jobs, freelancers } = performGlobalSearch(
    state.jobs,
    state.freelancers,
    state.searchTerm
  );
  renderJobs(jobs);
  renderFreelancers(freelancers);
};

const handleJobFilterChange = () => {
  state.searchTerm = elements.jobSearchInput?.value || "";
  state.filters.budget = elements.jobBudgetFilter?.value || "";
  state.filters.duration = elements.jobDurationFilter?.value || "";

  const filteredJobs = searchJobs(state.jobs, state.searchTerm, {
    budget: state.filters.budget,
    duration: state.filters.duration,
  });

  renderJobs(filteredJobs);
};

const handleFreelancerFilterChange = () => {
  state.searchTerm = elements.freelancerSearchInput?.value || "";
  state.filters.rate = elements.freelancerRateFilter?.value || "";
  state.filters.experience = elements.freelancerExperienceFilter?.value || "";

  const filteredFreelancers = searchFreelancers(
    state.freelancers,
    state.searchTerm,
    {
      rate: state.filters.rate,
      experience: state.filters.experience,
    }
  );

  renderFreelancers(filteredFreelancers);
};

// Start the app when DOM is ready
if (document.readyState === "complete") {
  initApp();
} else {
  document.addEventListener("DOMContentLoaded", initApp);
}
