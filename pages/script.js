document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const homeView = document.getElementById('homeView');
    const freelancerView = document.getElementById('freelancerView');
    const clientView = document.getElementById('clientView');
    
    const homeBtn = document.getElementById('homeBtn');
    const freelancerBtn = document.getElementById('freelancerBtn');
    const clientBtn = document.getElementById('clientBtn');
    
    const findFreelancersBtn = document.getElementById('findFreelancersBtn');
    const postJobBtn = document.getElementById('postJobBtn');
    
    // Search elements
    const globalSearchInput = document.getElementById('globalSearchInput');
    const globalSearchBtn = document.getElementById('globalSearchBtn');
    
    // Freelancer section elements
    const createFreelancerProfileBtn = document.getElementById('createFreelancerProfileBtn');
    const browseJobsBtn = document.getElementById('browseJobsBtn');
    const freelancerProfileForm = document.getElementById('freelancerProfileForm');
    const jobListings = document.getElementById('jobListings');
    const jobsContainer = document.getElementById('jobsContainer');
    const jobSearch = document.getElementById('jobSearch');
    const freelancerPhotoInput = document.getElementById('freelancerPhoto');
    const photoPreview = document.getElementById('photoPreview');
    
    // Client section elements
    const postJobFormBtn = document.getElementById('postJobFormBtn');
    const browseFreelancersBtn = document.getElementById('browseFreelancersBtn');
    const jobPostForm = document.getElementById('jobPostForm');
    const freelancersContainer = document.getElementById('freelancersContainer');
    const freelancersList = document.getElementById('freelancersList');
    const freelancerSearch = document.getElementById('freelancerSearch');
    
    // Data storage
    let freelancers = JSON.parse(localStorage.getItem('freelancers')) || [];
    let jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    
    // Initialize
    setupEventListeners();
    initSearch();
    
    function setupEventListeners() {
        // Navigation
        homeBtn.addEventListener('click', () => switchView('home'));
        freelancerBtn.addEventListener('click', () => switchView('freelancer'));
        clientBtn.addEventListener('click', () => switchView('client'));
        
        // Home actions
        findFreelancersBtn.addEventListener('click', () => {
            switchView('client');
            showFreelancersList();
        });
        postJobBtn.addEventListener('click', () => {
            switchView('client');
            showJobPostForm();
        });
        
        // Global search
        globalSearchBtn.addEventListener('click', performGlobalSearch);
        globalSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performGlobalSearch();
        });
        
        // Freelancer actions
        createFreelancerProfileBtn.addEventListener('click', showFreelancerProfileForm);
        browseJobsBtn.addEventListener('click', showJobListings);
        freelancerProfileForm.addEventListener('submit', saveFreelancerProfile);
        freelancerPhotoInput.addEventListener('change', handlePhotoUpload);
        
        // Client actions
        postJobFormBtn.addEventListener('click', showJobPostForm);
        browseFreelancersBtn.addEventListener('click', showFreelancersList);
        jobPostForm.addEventListener('submit', postNewJob);
    }
    
    function switchView(view) {
        homeView.classList.add('hidden');
        freelancerView.classList.add('hidden');
        clientView.classList.add('hidden');
        
        homeBtn.classList.remove('active');
        freelancerBtn.classList.remove('active');
        clientBtn.classList.remove('active');
        
        if (view === 'home') {
            homeView.classList.remove('hidden');
            homeBtn.classList.add('active');
        } else if (view === 'freelancer') {
            freelancerView.classList.remove('hidden');
            freelancerBtn.classList.add('active');
        } else if (view === 'client') {
            clientView.classList.remove('hidden');
            clientBtn.classList.add('active');
        }
    }
    
    // Global search function
    function performGlobalSearch() {
        const searchTerm = globalSearchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            // If search is empty, show appropriate view based on current tab
            if (!freelancerView.classList.contains('hidden')) {
                displayJobs(jobs);
            } else if (!clientView.classList.contains('hidden')) {
                displayFreelancers(freelancers);
            }
            return;
        }
        
        // Search both freelancers and jobs
        const filteredFreelancers = searchFreelancers(searchTerm);
        const filteredJobs = searchJobs(searchTerm);
        
        // Show results based on current view
        if (!freelancerView.classList.contains('hidden')) {
            displayJobs(filteredJobs, searchTerm);
        } else if (!clientView.classList.contains('hidden')) {
            displayFreelancers(filteredFreelancers, searchTerm);
        } else {
            // If on home view, default to showing freelancers
            switchView('client');
            displayFreelancers(filteredFreelancers, searchTerm);
        }
    }
    
    function searchFreelancers(term) {
        return freelancers.filter(freelancer => {
            const searchFields = [
                freelancer.name,
                freelancer.title,
                freelancer.location,
                freelancer.rate,
                freelancer.bio,
                freelancer.experience,
                ...freelancer.skills
            ].join(' ').toLowerCase();
            
            return searchFields.includes(term);
        });
    }
    
    function searchJobs(term) {
        return jobs.filter(job => {
            const searchFields = [
                job.title,
                job.description,
                job.budget,
                job.duration,
                job.postedAt,
                ...job.skills
            ].join(' ').toLowerCase();
            
            return searchFields.includes(term);
        });
    }
    
    // Photo upload handler
    function handlePhotoUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                photoPreview.innerHTML = '';
                const img = document.createElement('img');
                img.src = event.target.result;
                img.alt = 'Profile Preview';
                photoPreview.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    }
    
    // Freelancer functions
    function showFreelancerProfileForm() {
        freelancerProfileForm.classList.remove('hidden');
        jobListings.classList.add('hidden');
        jobSearch.classList.add('hidden');
        photoPreview.innerHTML = '';
        freelancerPhotoInput.value = '';
    }
    
    function showJobListings() {
        freelancerProfileForm.classList.add('hidden');
        jobListings.classList.remove('hidden');
        jobSearch.classList.remove('hidden');
        displayJobs();
    }
    
    function saveFreelancerProfile(e) {
        e.preventDefault();
        
        let photoUrl = '';
        if (freelancerPhotoInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(event) {
                photoUrl = event.target.result;
                saveFreelancerData(photoUrl);
            };
            reader.readAsDataURL(freelancerPhotoInput.files[0]);
        } else {
            saveFreelancerData(photoUrl);
        }
    }
    
    function saveFreelancerData(photoUrl) {
        const freelancer = {
            id: Date.now(),
            name: document.getElementById('freelancerName').value,
            title: document.getElementById('freelancerTitle').value,
            skills: document.getElementById('freelancerSkills').value.split(',').map(skill => skill.trim()),
            rate: 'R' + document.getElementById('freelancerRate').value + '/hr',
            bio: document.getElementById('freelancerBio').value,
            location: document.getElementById('freelancerLocation').value,
            experience: document.getElementById('freelancerRate').value + ' years', // Ensure consistent format
            photo: photoUrl
        };
        
        freelancers.push(freelancer);
        localStorage.setItem('freelancers', JSON.stringify(freelancers));
        
        alert('Profile saved successfully!');
        freelancerProfileForm.reset();
        freelancerProfileForm.classList.add('hidden');
        photoPreview.innerHTML = '';
    }
    
    // Client functions
    function showJobPostForm() {
        jobPostForm.classList.remove('hidden');
        freelancersContainer.classList.add('hidden');
        freelancerSearch.classList.add('hidden');
    }
    
    function showFreelancersList() {
        jobPostForm.classList.add('hidden');
        freelancersContainer.classList.remove('hidden');
        freelancerSearch.classList.remove('hidden');
        displayFreelancers();
    }
    
    function postNewJob(e) {
        e.preventDefault();
        
        const job = {
            id: Date.now(),
            title: document.getElementById('jobTitle').value,
            description: document.getElementById('jobDescription').value,
            skills: document.getElementById('jobSkills').value.split(',').map(skill => skill.trim()),
            budget: 'ZAR ' + document.getElementById('jobBudget').value,
            duration: document.getElementById('jobDuration').value + ' days',
            postedAt: new Date().toLocaleDateString()
        };
        
        jobs.push(job);
        localStorage.setItem('jobs', JSON.stringify(jobs));
        
        alert('Job posted successfully!');
        jobPostForm.reset();
        jobPostForm.classList.add('hidden');
        displayJobs();
    }
    
    // Search functionality
    function initSearch() {
        // Job search for freelancers
        document.getElementById('jobSearchForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const searchTerm = document.getElementById('jobSearchInput').value.toLowerCase();
            const budgetFilter = document.getElementById('jobBudgetFilter').value;
            const durationFilter = document.getElementById('jobDurationFilter').value;
            
            const filteredJobs = jobs.filter(job => {
                const textMatch = 
                    job.title.toLowerCase().includes(searchTerm) ||
                    job.description.toLowerCase().includes(searchTerm) ||
                    job.skills.some(skill => skill.toLowerCase().includes(searchTerm)) ||
                    job.budget.toLowerCase().includes(searchTerm) ||
                    job.duration.toLowerCase().includes(searchTerm) ||
                    job.postedAt.toLowerCase().includes(searchTerm);
                
                const budgetMatch = filterBudget(job.budget, budgetFilter);
                const durationMatch = filterDuration(job.duration, durationFilter);
                
                return textMatch && budgetMatch && durationMatch;
            });
            
            displayJobs(filteredJobs, searchTerm);
        });

        // Freelancer search for clients
        document.getElementById('freelancerSearchForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const searchTerm = document.getElementById('freelancerSearchInput').value.toLowerCase();
            const rateFilter = document.getElementById('freelancerRateFilter').value;
            const experienceFilter = document.getElementById('freelancerExperienceFilter').value;
            
            const filteredFreelancers = freelancers.filter(freelancer => {
                const textMatch = 
                    freelancer.name.toLowerCase().includes(searchTerm) ||
                    freelancer.title.toLowerCase().includes(searchTerm) ||
                    freelancer.skills.some(skill => skill.toLowerCase().includes(searchTerm)) ||
                    freelancer.location.toLowerCase().includes(searchTerm) ||
                    freelancer.rate.toLowerCase().includes(searchTerm) ||
                    (freelancer.bio && freelancer.bio.toLowerCase().includes(searchTerm));
                
                const rateMatch = filterRate(freelancer.rate, rateFilter);
                const experienceMatch = filterExperience(freelancer.experience, experienceFilter);
                
                return textMatch && rateMatch && experienceMatch;
            });
            
            displayFreelancers(filteredFreelancers, searchTerm);
        });
        // Real-time search
        document.getElementById('jobSearchInput').addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const budgetFilter = document.getElementById('jobBudgetFilter').value;
            const durationFilter = document.getElementById('jobDurationFilter').value;
            
            const filteredJobs = jobs.filter(job => {
                const textMatch = searchTerm === '' ? true : 
                    job.title.toLowerCase().includes(searchTerm) ||
                    job.description.toLowerCase().includes(searchTerm) ||
                    job.skills.some(skill => skill.toLowerCase().includes(searchTerm)) ||
                    job.budget.toLowerCase().includes(searchTerm) ||
                    job.duration.toLowerCase().includes(searchTerm) ||
                    job.postedAt.toLowerCase().includes(searchTerm);
                
                const budgetMatch = filterBudget(job.budget, budgetFilter);
                const durationMatch = filterDuration(job.duration, durationFilter);
                
                return textMatch && budgetMatch && durationMatch;
            });
            
            displayJobs(filteredJobs, searchTerm);
        });

        document.getElementById('freelancerSearchInput').addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rateFilter = document.getElementById('freelancerRateFilter').value;
            const experienceFilter = document.getElementById('freelancerExperienceFilter').value;
            
            const filteredFreelancers = freelancers.filter(freelancer => {
                const textMatch = searchTerm === '' ? true :
                    freelancer.name.toLowerCase().includes(searchTerm) ||
                    freelancer.title.toLowerCase().includes(searchTerm) ||
                    freelancer.skills.some(skill => skill.toLowerCase().includes(searchTerm)) ||
                    freelancer.location.toLowerCase().includes(searchTerm) ||
                    freelancer.rate.toLowerCase().includes(searchTerm) ||
                    (freelancer.bio && freelancer.bio.toLowerCase().includes(searchTerm)) ||
                    freelancer.experience.toLowerCase().includes(searchTerm);
                
                const rateMatch = filterRate(freelancer.rate, rateFilter);
                const experienceMatch = filterExperience(freelancer.experience, experienceFilter);
                
                return textMatch && rateMatch && experienceMatch;
            });
            
            displayFreelancers(filteredFreelancers, searchTerm);
        });
    }

    // Filter helper functions
    function filterBudget(budget, filter) {
        if (!filter) return true;
        const amount = parseInt(budget.replace('ZAR ', ''));
        if (filter === '0-1000') return amount <= 1000;
        if (filter === '1000-5000') return amount > 1000 && amount <= 5000;
        if (filter === '5000+') return amount > 5000;
        return true;
    }

    function filterDuration(duration, filter) {
        if (!filter) return true;
        const days = parseInt(duration.replace(' days', ''));
        if (filter === '1-7') return days <= 7;
        if (filter === '8-30') return days > 7 && days <= 30;
        if (filter === '30+') return days > 30;
        return true;
    }

    function filterRate(rate, filter) {
        if (!filter) return true;
        const rateValue = parseInt(rate.replace('/hr', '').replace('R', ''));
        if (filter === '0-500') return rateValue <= 500;
        if (filter === '500-1000') return rateValue > 500 && rateValue <= 1000;
        if (filter === '1000+') return rateValue > 1000;
        return true;
    }

    function filterExperience(experience, filter) {
        if (!filter) return true;
        
        // Extract years from experience string (format: "X years" or "X year")
        const experienceYears = parseInt(experience.split(' ')[0]);
        
        if (isNaN(experienceYears)) return false; // Handle invalid experience formats
        
        switch(filter) {
            case '1-3':
                return experienceYears >= 1 && experienceYears <= 3;
            case '4-7':
                return experienceYears >= 4 && experienceYears <= 7;
            case '8+':
                return experienceYears >= 8;
            default:
                return true;
        }
    }

    // Highlight search terms
    function highlightSearchTerms(text, searchTerm) {
        if (!searchTerm || !text) return text;
        try {
            const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            return text.toString().replace(regex, '<mark class="highlight">$1</mark>');
        } catch (e) {
            return text;
        }
    }

    // Display functions
    function displayJobs(jobsToDisplay = jobs, searchTerm = '') {
        jobsContainer.innerHTML = '';
        
        if (jobsToDisplay.length === 0) {
            jobsContainer.innerHTML = '<p>No jobs found matching your criteria.</p>';
            return;
        }
        
        jobsToDisplay.forEach(job => {
            const article = document.createElement('article');
            article.className = 'job-card';
            article.innerHTML = `
                <h3>${highlightSearchTerms(job.title, searchTerm)}</h3>
                <p class="description">${highlightSearchTerms(job.description, searchTerm)}</p>
                <p class="budget">${highlightSearchTerms(job.budget, searchTerm)}</p>
                <p class="duration">${highlightSearchTerms(job.duration, searchTerm)}</p>
                <menu class="skills">
                    ${job.skills.map(skill => {
                        const highlightedSkill = highlightSearchTerms(skill, searchTerm);
                        return `<mark class="skill-tag">${highlightedSkill}</mark>`;
                    }).join('')}
                </menu>
                <p class="posted">Posted: ${job.postedAt}</p>
                <button class="apply-btn" data-id="${job.id}">Apply</button>
            `;
            jobsContainer.appendChild(article);
        });
    }

    function displayFreelancers(freelancersToDisplay = freelancers, searchTerm = '') {
        freelancersList.innerHTML = '';
        
        if (freelancersToDisplay.length === 0) {
            freelancersList.innerHTML = '<p>No freelancers found matching your criteria.</p>';
            return;
        }
        
        freelancersToDisplay.forEach(freelancer => {
            const article = document.createElement('article');
            article.className = 'freelancer-card';
            article.innerHTML = `
                ${freelancer.photo ? `<img src="${freelancer.photo}" class="profile-photo" alt="${freelancer.name}">` : '<figure class="profile-photo empty"></figure>'}
                <h3>${highlightSearchTerms(freelancer.name, searchTerm)}</h3>
                <p class="title">${highlightSearchTerms(freelancer.title, searchTerm)}</p>
                <p class="rate">${highlightSearchTerms(freelancer.rate, searchTerm)}</p>
                ${freelancer.bio ? `<p class="bio">${highlightSearchTerms(freelancer.bio.substring(0, 100) + (freelancer.bio.length > 100 ? '...' : ''), searchTerm)}</p>` : ''}
                <menu class="skills">
                    ${freelancer.skills.map(skill => {
                        const highlightedSkill = highlightSearchTerms(skill, searchTerm);
                        return `<mark class="skill-tag">${highlightedSkill}</mark>`;
                    }).join('')}
                </menu>
                <p class="location">${highlightSearchTerms(freelancer.location, searchTerm)}</p>
                <p class="experience">${highlightSearchTerms(freelancer.experience, searchTerm)} experience</p>
                <button class="hire-btn" data-id="${freelancer.id}">Contact</button>
            `;
            freelancersList.appendChild(article);
        });
    }

    /*functions for testing*/
window.highlightSearchTerms = highlightSearchTerms;
window.filterBudget = filterBudget;
window.filterDuration = filterDuration;
window.filterRate = filterRate;
window.filterExperience = filterExperience;
});