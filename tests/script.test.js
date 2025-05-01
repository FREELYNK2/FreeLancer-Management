/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

// 1. Load your actual HTML structure
const html = fs.readFileSync(path.resolve(__dirname, '../pages/index2.html'), 'utf8');

// 2. Mock Data
const freelancers = [
    {
      id: 1,
      name: "Elias Baloyi",
      title: "Web Designer",
      company: "DesignHub",
      rate: "$120/hr",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      skills: ["Figma", "Adobe XD", "HTML/CSS", "UI/UX"],
      location: "Limpopo, Tzaneen",
      experience: "8 years",
      bio: "Creative web designer with 8 years of experience creating beautiful, user-friendly interfaces. Specialized in responsive design and UX principles."
    },
    {
      id: 2,
      name: "Leon Maputla",
      title: "Full Stack Developer",
      company: "TechSolutions",
      rate: "$150/hr",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      skills: ["JavaScript", "React", "Node.js"],
      location: "Limpopo, Polokwane",
      experience: "10 years",
      bio: "Full-stack developer passionate about building scalable web applications."
    },
    {
      id: 3,
      name: "Ezra Nkontwana",
      title: "UX Designer",
      company: "DigitalSA",
      rate: "R800/hr",
      image: "https://randomuser.me/api/portraits/women/63.jpg",
      skills: ["User Research", "Wireframing", "Prototyping", "Adobe Creative Suite"],
      location: "Johannesburg, South Africa",
      experience: "5 years",
      bio: "Johannesburg-based UX designer passionate about creating inclusive digital experiences for African users."
    },
    {
      id: 4,
      name: "Phetho Nemavhola",
      title: "Graphic Designer",
      company: "Creative Afrika",
      rate: "R650/hr",
      image: "https://randomuser.me/api/portraits/women/25.jpg",
      skills: ["Branding", "Illustration", "Print Design", "Packaging"],
      location: "Cape Town, South Africa",
      experience: "4 years",
      bio: "Award-winning graphic designer specializing in brand identities for African startups and NGOs."
    },
    {
      id: 5,
      name: "Lerato Khumalo",
      title: "Frontend Developer",
      company: "TechAfrica",
      rate: "R950/hr",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
      skills: ["React", "Vue.js", "TypeScript", "CSS"],
      location: "Durban, South Africa",
      experience: "6 years",
      bio: "Specializing in building performant web applications for the African market."
    },
    {
      id: 6,
      name: "Nsovo Nkuna",
      title: "DevOps Engineer",
      company: "CloudAfrica",
      rate: "R1100/hr",
      image: "https://randomuser.me/api/portraits/men/22.jpg",
      skills: ["AWS", "Docker", "Kubernetes", "CI/CD"],
      location: "Pretoria, South Africa",
      experience: "7 years",
      bio: "Helping African businesses scale their infrastructure with cloud technologies."
    },
    {
      id: 7,
      name: "Khutso Mashapu",
      title: "Mobile Developer",
      company: "AppFactory",
      rate: "R900/hr",
      image: "https://randomuser.me/api/portraits/men/45.jpg",
      skills: ["Flutter", "React Native", "Firebase", "Android"],
      location: "Port Elizabeth, South Africa",
      experience: "5 years",
      bio: "Building cross-platform mobile apps that solve real African problems."
    },
    {
      id: 8,
      name: "Vhulenda Mashamba",
      title: "Data Scientist",
      company: "DataFirst",
      rate: "R1200/hr",
      image: "https://randomuser.me/api/portraits/men/87.jpg",
      skills: ["Python", "Machine Learning", "SQL", "TensorFlow"],
      location: "Bloemfontein, South Africa",
      experience: "8 years",
      bio: "Applying data science to solve unique challenges in the Southern African context."
    },
    {
      id: 9,
      name: "Paballo Lipopo",
      title: "Backend Developer",
      company: "CodeZA",
      rate: "R850/hr",
      image: "https://randomuser.me/api/portraits/men/33.jpg",
      skills: ["Node.js", "Python", "MongoDB", "API Design"],
      location: "Soweto, South Africa",
      experience: "4 years",
      bio: "Specializing in building robust backend systems for high-growth startups."
    },
    {
      id: 10,
      name: "Thando Nkosi",
      title: "Digital Marketer",
      company: "GrowthAfrica",
      rate: "R750/hr",
      image: "https://randomuser.me/api/portraits/men/91.jpg",
      skills: ["SEO", "Social Media", "Content Strategy", "Google Ads"],
      location: "Polokwane, South Africa",
      experience: "5 years",
      bio: "Helping African brands grow their digital presence through data-driven marketing."
    },
    {
      id: 11,
      name: "Siyabonga Zulu",
      title: "Cybersecurity Specialist",
      company: "SecureZA",
      rate: "R1300/hr",
      image: "https://randomuser.me/api/portraits/men/56.jpg",
      skills: ["Ethical Hacking", "Pen Testing", "Network Security", "GDPR"],
      location: "Nelspruit, South Africa",
      experience: "9 years",
      bio: "Protecting African businesses from evolving cyber threats with cutting-edge security solutions."
    }
  ];

// 3. Test Setup
beforeAll(() => {
  document.body.innerHTML = html;
  // Initialize with mock freelancers
  window.freelancers = freelancers;
  require('../pages/script.js');
  
  // Manually trigger DOMContentLoaded since JSDOM doesn't do it automatically
  const event = new Event('DOMContentLoaded');
  document.dispatchEvent(event);
});

// 4. Helper Functions
const triggerEvent = (element, eventType) => {
  if (!element) {
    throw new Error(`Element not found for event: ${eventType}`);
  }
  const event = new Event(eventType);
  element.dispatchEvent(event);
};

const getElement = (selector) => {
  const el = document.querySelector(selector);
  if (!el) {
    throw new Error(`Element not found: ${selector}`);
  }
  return el;
};

const getAllElements = (selector) => document.querySelectorAll(selector);

// 5. Test Suite
describe('Freelancer Application', () => {
  describe('Initialization', () => {
    test('should load all freelancers on startup', () => {
      const cards = getAllElements('.freelancer-card');
      expect(cards.length).toBe(freelancers.length);
    });

    test.skip('should have profile page hidden initially', () => {
      expect(getElement('#profilePage').style.display).toBe('none');
    });
  });

  describe('Search Functionality', () => {
    test('should filter by title', () => {
      getElement('#searchInput').value = 'Frontend';
      triggerEvent(getElement('#searchButton'), 'click');
      
      // Need to wait for DOM update
      setTimeout(() => {
        const cards = getAllElements('.freelancer-card');
        expect(cards.length).toBe(1);
        expect(cards[0].textContent).toContain('Sarah Johnson');
      }, 0);
    });

    test('should filter by skills', () => {
      getElement('#searchInput').value = 'Python';
      triggerEvent(getElement('#searchButton'), 'click');
      
      setTimeout(() => {
        const cards = getAllElements('.freelancer-card');
        expect(cards.length).toBe(1);
        expect(cards[0].textContent).toContain('Michael Chen');
      }, 0);
    });

    test('should show no results when no matches found', () => {
      getElement('#searchInput').value = 'Nonexistent';
      triggerEvent(getElement('#searchButton'), 'click');
      
      setTimeout(() => {
        expect(getElement('#freelancersGrid').innerHTML).toContain('No freelancers found');
      }, 0);
    });

    test('should highlight search terms', () => {
      getElement('#searchInput').value = 'developer';
      triggerEvent(getElement('#searchButton'), 'click');
      
      setTimeout(() => {
        const highlighted = getElement('.highlight');
        expect(highlighted).not.toBeNull();
        expect(highlighted.textContent.toLowerCase()).toBe('developer');
      }, 0);
    });
  });

  describe('Profile Page', () => {
    test('should display profile when card is clicked', () => {
      const firstCard = getAllElements('.freelancer-card')[0];
      triggerEvent(firstCard, 'click');
      
      setTimeout(() => {
        expect(getElement('#profilePage').style.display).toBe('block');
        expect(getElement('#profileName').textContent).toBe('Sarah Johnson');
      }, 0);
    });

    test('should populate all profile fields correctly', () => {
      const firstCard = getAllElements('.freelancer-card')[0];
      triggerEvent(firstCard, 'click');
      
      setTimeout(() => {
        const profile = freelancers[0];
        expect(getElement('#profileTitle').textContent).toBe(profile.title);
        expect(getElement('#profileSkills').children.length).toBe(profile.skills.length);
        expect(getElement('#profileRate').textContent).toBe(profile.rate);
      }, 0);
    });

    test('should set correct hire button mailto link', () => {
      const firstCard = getAllElements('.freelancer-card')[0];
      triggerEvent(firstCard, 'click');
      
      setTimeout(() => {
        const hireLink = getElement('#hireButton').href;
        expect(hireLink).toContain(`subject=Hiring Sarah Johnson`);
        expect(hireLink).toContain(`Frontend Developer`);
      }, 0);
    });
  });

  describe('Navigation', () => {
    test('should return to grid when back button clicked', () => {
      const firstCard = getAllElements('.freelancer-card')[0];
      triggerEvent(firstCard, 'click');
      
      setTimeout(() => {
        triggerEvent(getElement('#backButton'), 'click');
        expect(getElement('#profilePage').style.display).toBe('none');
        expect(getElement('#freelancersGrid').style.display).toBe('grid');
      }, 0);
    });

    test('should show all freelancers after clearing search', () => {
      getElement('#searchInput').value = 'Python';
      triggerEvent(getElement('#searchButton'), 'click');
      
      setTimeout(() => {
        getElement('#searchInput').value = '';
        triggerEvent(getElement('#searchInput'), 'input');
        
        setTimeout(() => {
          expect(getAllElements('.freelancer-card').length).toBe(freelancers.length);
        }, 0);
      }, 0);
    });
  });
});