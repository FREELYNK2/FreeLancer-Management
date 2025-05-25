import {
  filterByBudget,
  filterByDuration,
  filterByRate,
  filterByExperience,
} from "../Index2 scripts/filters.js";

export const performGlobalSearch = (jobs, freelancers, searchTerm) => {
  searchTerm = searchTerm.toLowerCase().trim();

  if (!searchTerm) return { jobs, freelancers };

  return {
    jobs: searchJobs(jobs, searchTerm),
    freelancers: searchFreelancers(freelancers, searchTerm),
  };
};

export const searchJobs = (jobs, searchTerm, filters = {}) => {
  return jobs.filter((job) => {
    const textMatch =
      job.title.toLowerCase().includes(searchTerm) ||
      job.description.toLowerCase().includes(searchTerm) ||
      job.skills.some((skill) => skill.toLowerCase().includes(searchTerm)) ||
      job.budget.toLowerCase().includes(searchTerm) ||
      job.duration.toLowerCase().includes(searchTerm) ||
      job.postedAt.toLowerCase().includes(searchTerm);

    const budgetMatch = filterByBudget(job.budget, filters.budget);
    const durationMatch = filterByDuration(job.duration, filters.duration);

    return textMatch && budgetMatch && durationMatch;
  });
};

export const searchFreelancers = (freelancers, searchTerm, filters = {}) => {
  return freelancers.filter((freelancer) => {
    const textMatch =
      freelancer.name.toLowerCase().includes(searchTerm) ||
      freelancer.title.toLowerCase().includes(searchTerm) ||
      freelancer.skills.some((skill) =>
        skill.toLowerCase().includes(searchTerm)
      ) ||
      freelancer.location.toLowerCase().includes(searchTerm) ||
      freelancer.rate.toLowerCase().includes(searchTerm) ||
      (freelancer.bio && freelancer.bio.toLowerCase().includes(searchTerm)) ||
      freelancer.experience.toLowerCase().includes(searchTerm);

    const rateMatch = filterByRate(freelancer.rate, filters.rate);
    const experienceMatch = filterByExperience(
      freelancer.experience,
      filters.experience
    );

    return textMatch && rateMatch && experienceMatch;
  });
};

export const setupSearchHandlers = () => {

};
