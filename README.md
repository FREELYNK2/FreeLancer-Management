# FREELANCER MANAGEMENT PLATFORM

[![codecov](https://codecov.io/gh/FREELYNK2/FreeLancer-Management/graph/badge.svg?token=AH4D3RWMYF)](https://codecov.io/gh/FREELYNK2/FreeLancer-Management)

## Description
A web-based platform that connects businesses with skilled professionals. Clients can post projects and milestones, while freelancers can apply for jobs, track progress, and manage payments—all in one place.

## Features
- 🔐 Authentication via Google(using Firebase)
- 🧑‍💼 Clients can post jobs and define milestones
- 👨‍💻 Freelancers can apply for and manage jobs
- 💰 Simulated payment system for testing transactions(No API)
- 📊 Admin panel to oversee jobs, users, and progress
- ☁️ Deployed on Azure for public access
- 🖨️ Export pdf/csv files of payments, milestones and projects.

## Important Links
- Azure link: https://nice-dune-05fc61f10.6.azurestaticapps.net
- trello link: https://trello.com/b/xzd8Pjdq/freelancer-management-platform
- discord link: https://discord.com/channels/1358878000418001128/1358878437879713842
- our discord server : https://discord.com/channels/1358823396816978020/1358909874880118824

## Project Structure
The project is organized as follows:

- **`pages/`** - Contains all HTML files (e.g., `index.html`, `Register.html`)
- **`styles/`** - Contains all CSS files (e.g., `styles.css`)
- **`tests/`** - Contains all JavaScript test files (e.g., `example.test.js`)
- **`assets/`** - Contains images and other media files (e.g., `FacebookIcon.png`, `resume_6361827.png`)
- **`Documentation/`** - Contains all project-related documents (e.g., `Wireframes.zip`, `User_Stories_SD_Project.docx`.)

## Technologies Used

- **Frontend:** HTML, CSS, JavaScript
- **Backend & Auth:** Firebase
- **Testing:** Jest

## Getting Started (Local Development)

To run the project locally, make sure you have [Node.js and npm](https://nodejs.org/) installed.

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/freelancer-management-platform.git
   cd freelancer-management-platform
2. Install dependencies:
    ```bash
    npm install
    npm install --save-dev @babel/core @babel/cli
    npm install jest --global

3. Start the development server:
    ```bash
    npm start
