document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const freelancersGrid = document.getElementById('freelancersGrid');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const profilePage = document.getElementById('profilePage');
    const backButton = document.getElementById('backButton');
    const hireButton = document.getElementById('hireButton');
    
    // Initialize display
    displayFreelancers(freelancers);
    
    // Event listeners
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('input', performSearch);
    
    function performSearch() {
      const searchTerm = searchInput.value.trim().toLowerCase();
      const filtered = searchTerm === '' 
        ? freelancers 
        : freelancers.filter(freelancer => 
            freelancer.title.toLowerCase().includes(searchTerm) || 
            freelancer.skills.some(skill => skill.toLowerCase().includes(searchTerm)) ||
            freelancer.name.toLowerCase().includes(searchTerm)
          );
      displayFreelancers(filtered, searchTerm);
    }
    
    function displayFreelancers(freelancersToDisplay, searchTerm = '') {
      freelancersGrid.innerHTML = '';
      
      if (freelancersToDisplay.length === 0) {
        freelancersGrid.innerHTML = `
          <article class="no-results">
            <p>No freelancers found matching "${searchTerm}"</p>
            <button class="reload-btn">Show all freelancers</button>
          </article>
        `;
        document.querySelector('.reload-btn').addEventListener('click', () => window.location.reload());
        return;
      }
      
      freelancersToDisplay.forEach(freelancer => {
        const card = document.createElement('article');
        card.className = 'freelancer-card';
        
        const highlightedTitle = searchTerm 
          ? freelancer.title.replace(
              new RegExp(searchTerm, 'gi'), 
              match => `<span class="highlight">${match}</span>`
            )
          : freelancer.title;
        
        card.innerHTML = `
          <img src="${freelancer.image}" alt="${freelancer.name}" class="profile-image">
          <section class="card-content">
            <h3>${freelancer.name}</h3>
            <p class="title">${highlightedTitle}</p>
            <p class="company">${freelancer.company}</p>
            <section class="skills">
              ${freelancer.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </section>
          </section>
          <section class="card-footer">
            <span class="rate">${freelancer.rate}</span>
            <span class="location">${freelancer.location}</span>
          </section>
        `;
        
        card.addEventListener('click', () => showProfilePage(freelancer));
        freelancersGrid.appendChild(card);
      });
    }
    
    function showProfilePage(freelancer) {
      document.querySelector('.freelancers-grid').style.display = 'none';
      profilePage.style.display = 'block';
      
      // Populate profile data
      document.getElementById('profileImageLarge').src = freelancer.image;
      document.getElementById('profileName').textContent = freelancer.name;
      document.getElementById('profileTitle').textContent = freelancer.title;
      document.getElementById('profileCompany').textContent = freelancer.company;
      document.getElementById('profileBio').textContent = freelancer.bio;
      document.getElementById('profileExperience').textContent = `${freelancer.experience} of professional experience`;
      document.getElementById('profileRate').textContent = freelancer.rate;
      document.getElementById('profileLocation').textContent = freelancer.location;
      
      const skillsContainer = document.getElementById('profileSkills');
      skillsContainer.innerHTML = freelancer.skills.map(skill => 
        `<span class="skill-tag">${skill}</span>`
      ).join('');
      
      hireButton.href = `mailto:hire@example.com?subject=Hiring ${freelancer.name}&body=I would like to hire ${freelancer.name} for ${freelancer.title} position`;
    }
    
    backButton.addEventListener('click', function() {
      profilePage.style.display = 'none';
      document.querySelector('.freelancers-grid').style.display = 'grid';
    });
  });