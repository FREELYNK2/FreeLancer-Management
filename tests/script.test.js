/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

// Load HTML content
const html = fs.readFileSync(path.resolve(__dirname, '../pages/index2.html'), 'utf8');

// Mock Firebase
jest.mock('firebase/app', () => ({
    initializeApp: jest.fn(),
    firestore: jest.fn(() => ({
        collection: jest.fn(() => ({
            get: jest.fn(() => Promise.resolve({
                forEach: jest.fn()
            })),
            add: jest.fn(() => Promise.resolve({
                id: 'mock-id'
            }))
        }))
    })),
    storage: jest.fn(() => ({
        ref: jest.fn(() => ({
            child: jest.fn(() => ({
                put: jest.fn(() => Promise.resolve({
                    ref: {
                        getDownloadURL: jest.fn(() => Promise.resolve('mock-url'))
                    }
                }))
            }))
        }))
    })),
    firestore: {
        FieldValue: {
            serverTimestamp: jest.fn()
        }
    }
}));

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
    
    // Mock firebase global
    global.firebase = {
        firestore: jest.fn(() => ({
            collection: jest.fn(() => ({
                get: jest.fn(() => Promise.resolve({
                    forEach: jest.fn(callback => {
                        mockFreelancers.forEach(f => callback({ id: f.id, data: () => f }));
                    })
                })),
                add: jest.fn(() => Promise.resolve({ id: 'new-id' }))
            }))
        })),
        storage: jest.fn(() => ({
            ref: jest.fn(() => ({
                child: jest.fn(() => ({
                    put: jest.fn(() => Promise.resolve({
                        ref: {
                            getDownloadURL: jest.fn(() => Promise.resolve('mock-url'))
                        }
                    }))
                }))
            }))
        })),
        firestore: {
            FieldValue: {
                serverTimestamp: jest.fn()
            }
        }
    };
    
    // Load the script
    jest.isolateModules(() => {
        require('../pages/script.js');
    });
    
    // Trigger DOMContentLoaded after a small delay to allow script to load
    setTimeout(() => {
        const event = new Event('DOMContentLoaded');
        document.dispatchEvent(event);
    }, 0);
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

describe('Helper Functions', () => {
    test('should highlight search terms', () => {
        // These functions should be available on the window object from your script
        const result = window.highlightSearchTerms('JavaScript Developer', 'script');
        expect(result).toContain('<mark class="highlight">Script</mark>');
    });
    
    test('should filter by budget', () => {
        expect(window.filterBudget('ZAR 2000', '1000-5000')).toBe(true);
        expect(window.filterBudget('ZAR 6000', '1000-5000')).toBe(false);
    });
    
    test('should filter by duration', () => {
        expect(window.filterDuration('15 days', '8-30')).toBe(true);
        expect(window.filterDuration('35 days', '8-30')).toBe(false);
    });
    
    test('should filter by rate', () => {
        expect(window.filterRate('R600/hr', '500-1000')).toBe(true);
        expect(window.filterRate('R1200/hr', '500-1000')).toBe(false);
    });
    
    test('should filter by experience', () => {
        expect(window.filterExperience('5 years', '4-7')).toBe(true);
        expect(window.filterExperience('8 years', '4-7')).toBe(false);
    });
});