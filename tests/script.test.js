/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

// Load HTML content
const html = fs.readFileSync(path.resolve(__dirname, '../pages/index2.html'), 'utf8');

// Mock data
const mockFreelancers = [
    {
        id: 1,
        name: "John Doe",
        title: "Web Developer",
        skills: ["JavaScript", "HTML", "CSS"],
        rate: "R500/hr",
        bio: "Experienced web developer",
        location: "Johannesburg",
        experience: "5 years",
        photo: ""
    }
];

const mockJobs = [
    {
        id: 1,
        title: "Website Development",
        description: "Build a company website",
        skills: ["JavaScript", "React"],
        budget: "ZAR 10000",
        duration: "30 days",
        postedAt: "5/1/2023"
    }
];

// Mock alert
global.alert = jest.fn();

// Mock implementation of FileReader
class MockFileReader {
    constructor() {
        this.onload = null;
        this.result = 'data:image/png;base64,mockImageData';
    }
    readAsDataURL() {
        this.onload && this.onload({ target: { result: this.result } });
    }
}

// Set up the DOM
beforeEach(() => {
    document.body.innerHTML = html;
    
    // Mock localStorage
    const localStorageMock = (function() {
        let store = {
            freelancers: JSON.stringify(mockFreelancers),
            jobs: JSON.stringify(mockJobs)
        };
        
        return {
            getItem: jest.fn((key) => store[key]),
            setItem: jest.fn((key, value) => {
                store[key] = value.toString();
            }),
            clear: jest.fn(() => {
                store = {};
            })
        };
    })();
    
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    // Mock FileReader
    global.FileReader = MockFileReader;
    
    // Load the script
    require('../pages/script.js');
    
    // Expose helper functions from the script
    global.highlightSearchTerms = window.highlightSearchTerms;
    global.filterBudget = window.filterBudget;
    global.filterDuration = window.filterDuration;
    global.filterRate = window.filterRate;
    global.filterExperience = window.filterExperience;
    
    // Trigger DOMContentLoaded
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe('View Navigation', () => {
    test('should switch to home view', () => {
        const homeBtn = document.getElementById('homeBtn');
        homeBtn.click();
        
        expect(document.getElementById('homeView').classList).not.toContain('hidden');
        expect(document.getElementById('freelancerView').classList).toContain('hidden');
        expect(document.getElementById('clientView').classList).toContain('hidden');
        expect(homeBtn.classList).toContain('active');
    });
    
    test('should switch to freelancer view', () => {
        const freelancerBtn = document.getElementById('freelancerBtn');
        freelancerBtn.click();
        
        expect(document.getElementById('freelancerView').classList).not.toContain('hidden');
        expect(document.getElementById('homeView').classList).toContain('hidden');
        expect(document.getElementById('clientView').classList).toContain('hidden');
        expect(freelancerBtn.classList).toContain('active');
    });
    
    test('should switch to client view', () => {
        const clientBtn = document.getElementById('clientBtn');
        clientBtn.click();
        
        expect(document.getElementById('clientView').classList).not.toContain('hidden');
        expect(document.getElementById('homeView').classList).toContain('hidden');
        expect(document.getElementById('freelancerView').classList).toContain('hidden');
        expect(clientBtn.classList).toContain('active');
    });
});

describe('Freelancer Functionality', () => {
    test('should show freelancer profile form', () => {
        document.getElementById('freelancerBtn').click();
        document.getElementById('createFreelancerProfileBtn').click();
        
        expect(document.getElementById('freelancerProfileForm').classList).not.toContain('hidden');
        expect(document.getElementById('jobListings').classList).toContain('hidden');
    });
    
    test('should show job listings', () => {
        document.getElementById('freelancerBtn').click();
        document.getElementById('browseJobsBtn').click();
        
        expect(document.getElementById('jobListings').classList).not.toContain('hidden');
        expect(document.getElementById('freelancerProfileForm').classList).toContain('hidden');
    });
    
    test('should save freelancer profile', async () => {
        document.getElementById('freelancerBtn').click();
        document.getElementById('createFreelancerProfileBtn').click();
        
        // Fill out the form
        document.getElementById('freelancerName').value = 'Jane Smith';
        document.getElementById('freelancerTitle').value = 'UX Designer';
        document.getElementById('freelancerSkills').value = 'UI, UX, Figma';
        document.getElementById('freelancerRate').value = '600';
        document.getElementById('freelancerBio').value = 'Experienced UX designer';
        document.getElementById('freelancerLocation').value = 'Cape Town';
        document.getElementById('freelancerExperience').value = '4';
        
        // Mock file upload
        const file = new Blob([''], { type: 'image/png' });
        Object.defineProperty(file, 'name', { value: 'profile.png' });
        const fileInput = document.getElementById('freelancerPhoto');
        Object.defineProperty(fileInput, 'files', { value: [file] });
        
        const formSubmitEvent = new Event('submit', { cancelable: true });
        document.getElementById('freelancerProfileForm').dispatchEvent(formSubmitEvent);
        
        // Wait for FileReader to complete
        await new Promise(resolve => setTimeout(resolve, 0));
        
        // Verify localStorage was updated
        expect(localStorage.setItem).toHaveBeenCalledWith(
            'freelancers',
            expect.stringContaining('Jane Smith')
        );
        expect(alert).toHaveBeenCalledWith('Profile saved successfully!');
    });
    
    test('should handle photo upload', async () => {
        const file = new Blob([''], { type: 'image/png' });
        Object.defineProperty(file, 'name', { value: 'profile.png' });
        const fileInput = document.getElementById('freelancerPhoto');
        Object.defineProperty(fileInput, 'files', { value: [file] });
        
        const changeEvent = new Event('change');
        fileInput.dispatchEvent(changeEvent);
        
        // Wait for FileReader to complete
        await new Promise(resolve => setTimeout(resolve, 0));
        
        expect(document.getElementById('photoPreview').innerHTML).not.toBe('');
    });
});

describe('Client Functionality', () => {
    test('should show job post form', () => {
        document.getElementById('clientBtn').click();
        document.getElementById('postJobFormBtn').click();
        
        expect(document.getElementById('jobPostForm').classList).not.toContain('hidden');
        expect(document.getElementById('freelancersContainer').classList).toContain('hidden');
    });
    
    test('should show freelancers list', () => {
        document.getElementById('clientBtn').click();
        document.getElementById('browseFreelancersBtn').click();
        
        expect(document.getElementById('freelancersContainer').classList).not.toContain('hidden');
        expect(document.getElementById('jobPostForm').classList).toContain('hidden');
    });
    
    test('should post new job', () => {
        document.getElementById('clientBtn').click();
        document.getElementById('postJobFormBtn').click();
        
        // Fill out the form
        document.getElementById('jobTitle').value = 'Website Redesign';
        document.getElementById('jobDescription').value = 'Redesign company website';
        document.getElementById('jobSkills').value = 'HTML, CSS, JavaScript';
        document.getElementById('jobBudget').value = '15000';
        document.getElementById('jobDuration').value = '45';
        
        const formSubmitEvent = new Event('submit', { cancelable: true });
        document.getElementById('jobPostForm').dispatchEvent(formSubmitEvent);
        
        // Verify localStorage was updated
        expect(localStorage.setItem).toHaveBeenCalledWith(
            'jobs',
            expect.stringContaining('Website Redesign')
        );
        expect(alert).toHaveBeenCalledWith('Job posted successfully!');
    });
});

describe('Search Functionality', () => {
    test('should perform global search', () => {
        document.getElementById('clientBtn').click(); // Switch to client view first
        document.getElementById('globalSearchInput').value = 'developer';
        document.getElementById('globalSearchBtn').click();
        
        // Check if any freelancer cards are shown (since we're on client view)
        expect(document.querySelectorAll('.freelancer-card').length).toBeGreaterThan(0);
    });
    
    test('should filter jobs', () => {
        document.getElementById('freelancerBtn').click();
        document.getElementById('browseJobsBtn').click();
        
        document.getElementById('jobSearchInput').value = 'website';
        document.getElementById('jobBudgetFilter').value = '0-10000';
        document.getElementById('jobDurationFilter').value = '1-60';
        
        const formSubmitEvent = new Event('submit', { cancelable: true });
        document.getElementById('jobSearchForm').dispatchEvent(formSubmitEvent);
        
        expect(document.querySelectorAll('.job-card').length).toBeGreaterThan(0);
    });
    
    test('should filter freelancers', () => {
        document.getElementById('clientBtn').click();
        document.getElementById('browseFreelancersBtn').click();
        
        document.getElementById('freelancerSearchInput').value = 'developer';
        document.getElementById('freelancerRateFilter').value = '0-1000';
        document.getElementById('freelancerExperienceFilter').value = '1-10';
        
        const formSubmitEvent = new Event('submit', { cancelable: true });
        document.getElementById('freelancerSearchForm').dispatchEvent(formSubmitEvent);
        
        expect(document.querySelectorAll('.freelancer-card').length).toBeGreaterThan(0);
    });
});

describe('Helper Functions', () => {
    test('should highlight search terms', () => {
        const result = highlightSearchTerms('JavaScript Developer', 'script');
        expect(result).toContain('<mark class="highlight">Script</mark>');
    });
    
    test('should filter by budget', () => {
        expect(filterBudget('ZAR 2000', '1000-5000')).toBe(true);
        expect(filterBudget('ZAR 6000', '1000-5000')).toBe(false);
    });
    
    test('should filter by duration', () => {
        expect(filterDuration('15 days', '8-30')).toBe(true);
        expect(filterDuration('35 days', '8-30')).toBe(false);
    });
    
    test('should filter by rate', () => {
        expect(filterRate('R600/hr', '500-1000')).toBe(true);
        expect(filterRate('R1200/hr', '500-1000')).toBe(false);
    });
    
    test('should filter by experience', () => {
        expect(filterExperience('5 years', '4-7')).toBe(true);
        expect(filterExperience('8 years', '4-7')).toBe(false);
    });
});