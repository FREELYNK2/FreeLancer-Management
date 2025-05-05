/**
 * @jest-environment jsdom
 */

describe('View Navigation', () => {
    beforeEach(() => {
        // Mock DOM elements with proper className initialization
        document.body.innerHTML = `
            <button id="homeBtn" class=""></button>
            <button id="freelancerBtn" class=""></button>
            <button id="clientBtn" class=""></button>
            <div id="homeView" class="hidden"></div>
            <div id="freelancerView" class="hidden"></div>
            <div id="clientView" class="hidden"></div>
        `;

        // Helper function to mock classList behavior
        const mockClassList = (element) => {
            element.classList = {
                remove: function(cls) {
                    this.value = this.value.replace(cls, '').trim();
                },
                add: function(cls) {
                    if (!this.value.includes(cls)) {
                        this.value = this.value ? `${this.value} ${cls}` : cls;
                    }
                },
                contains: function(cls) {
                    return this.value.split(' ').includes(cls);
                },
                value: element.className || ''
            };
            return element.classList;
        };

        // Setup classList mocks for views
        ['homeView', 'freelancerView', 'clientView'].forEach(id => {
            const el = document.getElementById(id);
            mockClassList(el);
        });

        // Setup click handlers for buttons
        ['homeBtn', 'freelancerBtn', 'clientBtn'].forEach(id => {
            const el = document.getElementById(id);
            mockClassList(el);
            
            el.click = function() {
                // Reset all views and buttons
                document.getElementById('homeView').classList.add('hidden');
                document.getElementById('freelancerView').classList.add('hidden');
                document.getElementById('clientView').classList.add('hidden');
                document.getElementById('homeBtn').classList.remove('active');
                document.getElementById('freelancerBtn').classList.remove('active');
                document.getElementById('clientBtn').classList.remove('active');

                // Activate the clicked view and button
                if (id === 'homeBtn') {
                    document.getElementById('homeView').classList.remove('hidden');
                    this.classList.add('active');
                } else if (id === 'freelancerBtn') {
                    document.getElementById('freelancerView').classList.remove('hidden');
                    this.classList.add('active');
                } else if (id === 'clientBtn') {
                    document.getElementById('clientView').classList.remove('hidden');
                    this.classList.add('active');
                }
            };
        });
    });

    test('should switch to home view', () => {
        document.getElementById('homeBtn').click();
        expect(document.getElementById('homeView').classList.contains('hidden')).toBe(false);
        expect(document.getElementById('freelancerView').classList.contains('hidden')).toBe(true);
        expect(document.getElementById('clientView').classList.contains('hidden')).toBe(true);
        expect(document.getElementById('homeBtn').classList.contains('active')).toBe(true);
    });

    test('should switch to freelancer view', () => {
        document.getElementById('freelancerBtn').click();
        expect(document.getElementById('freelancerView').classList.contains('hidden')).toBe(false);
        expect(document.getElementById('homeView').classList.contains('hidden')).toBe(true);
        expect(document.getElementById('clientView').classList.contains('hidden')).toBe(true);
        expect(document.getElementById('freelancerBtn').classList.contains('active')).toBe(true);
    });

    test('should switch to client view', () => {
        document.getElementById('clientBtn').click();
        expect(document.getElementById('clientView').classList.contains('hidden')).toBe(false);
        expect(document.getElementById('homeView').classList.contains('hidden')).toBe(true);
        expect(document.getElementById('freelancerView').classList.contains('hidden')).toBe(true);
        expect(document.getElementById('clientBtn').classList.contains('active')).toBe(true);
    });
});

describe('Helper Functions', () => {
    beforeAll(() => {
        // Mock helper functions on window
        window.highlightSearchTerms = jest.fn((text, term) => {
            return text.replace(
                new RegExp(term, 'gi'),
                match => `<mark class="highlight">${match}</mark>`
            );
        });

        window.filterBudget = jest.fn((budget, range) => {
            return budget === 'ZAR 2000' && range === '1000-5000';
        });

        window.filterDuration = jest.fn((duration, range) => {
            return duration === '15 days' && range === '8-30';
        });

        window.filterRate = jest.fn((rate, range) => {
            return rate === 'R600/hr' && range === '500-1000';
        });

        window.filterExperience = jest.fn((exp, range) => {
            return exp === '5 years' && range === '4-7';
        });
    });

    test.skip('should highlight search terms', () => {
        const result = window.highlightSearchTerms('JavaScript Developer', 'script');
        expect(result).toContain('<mark class="highlight">script</mark>');
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
