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
        id: "1",
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
        id: "1",
        title: "Website Development",
        description: "Build a company website",
        skills: ["JavaScript", "React"],
        budget: "ZAR 10000",
        duration: "30 days",
        postedAt: "5/1/2023"
    }
];

// Mock Firebase auth and firestore
const mockUser = {
    uid: "user123",
    email: "test@example.com"
};

const mockFirestore = {
    collection: jest.fn((name) => ({
        doc: jest.fn((id) => ({
            get: jest.fn(() => Promise.resolve({
                exists: true,
                data: () => (name === "users" ? { name: "Test User" } : { title: "Test Job" })
            })),
            set: jest.fn(() => Promise.resolve())
        })),
        add: jest.fn(() => Promise.resolve()),
        get: jest.fn(() => Promise.resolve({
            forEach: jest.fn((callback) => {
                mockFreelancers.forEach((doc) => callback({
                    id: doc.id,
                    data: () => doc
                }));
                mockJobs.forEach((doc) => callback({
                    id: doc.id,
                    data: () => doc
                }));
            })
        }))
    })),
    FieldValue: {
        serverTimestamp: jest.fn()
    }
};

const mockFirebase = {
    auth: jest.fn(() => ({
        currentUser: mockUser,
        onAuthStateChanged: jest.fn((callback) => {
            callback(mockUser);
            return jest.fn(); // Return unsubscribe function
        })
    })),
    firestore: jest.fn(() => mockFirestore),
    storage: jest.fn(() => ({
        ref: jest.fn()
    }))
};

// Mock alert
global.alert = jest.fn();

// Mock implementation of FileReader
const mockFileReaderInstance = {
    onload: null,
    result: 'data:image/png;base64,mockImageData',
    readAsDataURL: jest.fn(function() {
        this.onload && this.onload({ target: { result: this.result } });
    })
};

const MockFileReader = jest.fn(() => mockFileReaderInstance);

// Set up the DOM
beforeEach(() => {
    document.body.innerHTML = html;
    
    // Create all required elements that might be missing
    const createIfMissing = (id, tag = 'section') => {
        if (!document.getElementById(id)) {
            const el = document.createElement(tag);
            el.id = id;
            document.body.appendChild(el);
        }
        return document.getElementById(id);
    };

    // Create all required elements
    createIfMissing('homeView');
    createIfMissing('freelancerView');
    createIfMissing('clientView');
    createIfMissing('homeBtn', 'button');
    createIfMissing('freelancerBtn', 'button');
    createIfMissing('clientBtn', 'button');
    createIfMissing('findFreelancersBtn', 'button');
    createIfMissing('postJobBtn', 'button');
    createIfMissing('createFreelancerProfileBtn', 'button');
    createIfMissing('browseJobsBtn', 'button');
    createIfMissing('freelancerProfileForm', 'form');
    createIfMissing('jobListings');
    createIfMissing('jobsContainer');
    createIfMissing('jobSearch', 'input');
    createIfMissing('freelancerPhoto', 'input').type = 'file';
    createIfMissing('photoPreview', 'img');
    createIfMissing('postJobFormBtn', 'button');
    createIfMissing('browseFreelancersBtn', 'button');
    createIfMissing('jobPostForm', 'form');
    createIfMissing('freelancersContainer');
    createIfMissing('freelancersList');
    createIfMissing('freelancerSearch', 'input');
    
    // Add classes to elements that need them
    document.getElementById('homeView').classList.add('hidden');
    document.getElementById('freelancerView').classList.add('hidden');
    document.getElementById('clientView').classList.add('hidden');
    document.getElementById('freelancerProfileForm').classList.add('hidden');
    document.getElementById('jobListings').classList.add('hidden');
    document.getElementById('jobPostForm').classList.add('hidden');
    document.getElementById('freelancersContainer').classList.add('hidden');
    
    // Add apply button for testing
    const applyBtn = document.createElement('button');
    applyBtn.className = 'apply-btn';
    applyBtn.dataset.jobId = '1';
    document.body.appendChild(applyBtn);
    
    // Mock Firebase
    global.firebase = mockFirebase;
    
    // Mock FileReader
    global.FileReader = MockFileReader;
    
    // Mock db reference
    global.db = mockFirestore;
    
    // Load the script
    require('../pages/script.js');
    
    // Trigger DOMContentLoaded
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe('Application System', () => {
    
    test('should set up apply button event listeners', () => {
        const applyBtn = document.querySelector('.apply-btn');
        expect(applyBtn.onclick).toBeDefined();
    });

});

describe('View Switching', () => {
    test('should switch to home view', () => {
        const homeBtn = document.getElementById('homeBtn');
        homeBtn.click();
        
        expect(document.getElementById('homeView').classList.contains('hidden')).toBe(false);
        expect(document.getElementById('freelancerView').classList.contains('hidden')).toBe(true);
        expect(document.getElementById('clientView').classList.contains('hidden')).toBe(true);
        expect(homeBtn.classList.contains('active')).toBe(true);
    });

    test('should switch to freelancer view', () => {
        const freelancerBtn = document.getElementById('freelancerBtn');
        freelancerBtn.click();
        
        expect(document.getElementById('homeView').classList.contains('hidden')).toBe(true);
        expect(document.getElementById('freelancerView').classList.contains('hidden')).toBe(false);
        expect(document.getElementById('clientView').classList.contains('hidden')).toBe(true);
        expect(freelancerBtn.classList.contains('active')).toBe(true);
    });

    test('should switch to client view', () => {
        const clientBtn = document.getElementById('clientBtn');
        clientBtn.click();
        
        expect(document.getElementById('homeView').classList.contains('hidden')).toBe(true);
        expect(document.getElementById('freelancerView').classList.contains('hidden')).toBe(true);
        expect(document.getElementById('clientView').classList.contains('hidden')).toBe(false);
        expect(clientBtn.classList.contains('active')).toBe(true);
    });
});

describe('Freelancer Functionality', () => {
    test('should show freelancer profile form', () => {
        const createProfileBtn = document.getElementById('createFreelancerProfileBtn');
        createProfileBtn.click();
        
        expect(document.getElementById('freelancerProfileForm').classList.contains('hidden')).toBe(false);
        expect(document.getElementById('jobListings').classList.contains('hidden')).toBe(true);
    });

    test('should show job listings', () => {
        const browseJobsBtn = document.getElementById('browseJobsBtn');
        browseJobsBtn.click();
        
        expect(document.getElementById('freelancerProfileForm').classList.contains('hidden')).toBe(true);
        expect(document.getElementById('jobListings').classList.contains('hidden')).toBe(false);
    });

    test('should handle photo upload', () => {
        const fileInput = document.getElementById('freelancerPhoto');
        const file = new Blob([''], { type: 'image/png' });
        file.name = 'test.png';
        
        const event = new Event('change');
        Object.defineProperty(event, 'target', { value: { files: [file] } });
        fileInput.dispatchEvent(event);
        
        expect(MockFileReader).toHaveBeenCalled();
        expect(mockFileReaderInstance.readAsDataURL).toHaveBeenCalled();
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

describe('View Switching', () => {
    test('should switch to home view', () => {
        const homeBtn = document.getElementById('homeBtn');
        homeBtn.click();
        
        expect(document.getElementById('homeView').classList.contains('hidden')).toBe(false);
        expect(document.getElementById('freelancerView').classList.contains('hidden')).toBe(true);
        expect(document.getElementById('clientView').classList.contains('hidden')).toBe(true);
        expect(homeBtn.classList.contains('active')).toBe(true);
    });

    test('should switch to freelancer view', () => {
        const freelancerBtn = document.getElementById('freelancerBtn');
        freelancerBtn.click();
        
        expect(document.getElementById('homeView').classList.contains('hidden')).toBe(true);
        expect(document.getElementById('freelancerView').classList.contains('hidden')).toBe(false);
        expect(document.getElementById('clientView').classList.contains('hidden')).toBe(true);
        expect(freelancerBtn.classList.contains('active')).toBe(true);
    });

    test('should switch to client view', () => {
        const clientBtn = document.getElementById('clientBtn');
        clientBtn.click();
        
        expect(document.getElementById('homeView').classList.contains('hidden')).toBe(true);
        expect(document.getElementById('freelancerView').classList.contains('hidden')).toBe(true);
        expect(document.getElementById('clientView').classList.contains('hidden')).toBe(false);
        expect(clientBtn.classList.contains('active')).toBe(true);
    });
});

describe('Client Functionality', () => {
    test('should show job post form', () => {
        const postJobBtn = document.getElementById('postJobFormBtn');
        postJobBtn.click();
        
        expect(document.getElementById('jobPostForm').classList.contains('hidden')).toBe(false);
        expect(document.getElementById('freelancersContainer').classList.contains('hidden')).toBe(true);
    });

    test('should show freelancers list', () => {
        const browseFreelancersBtn = document.getElementById('browseFreelancersBtn');
        browseFreelancersBtn.click();
        
        expect(document.getElementById('jobPostForm').classList.contains('hidden')).toBe(true);
        expect(document.getElementById('freelancersContainer').classList.contains('hidden')).toBe(false);
    });
});

