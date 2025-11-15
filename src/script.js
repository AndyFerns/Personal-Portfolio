// Wait for the DOM to be fully loaded before running script
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. GitHub API Configuration ---
    const USERNAME = 'AndyFerns';
    const API_URL = `https://api.github.com/users/${USERNAME}/repos?sort=updated&direction=desc`;

    // --- 2. DOM Element Selection ---
    const projectsContainer = document.getElementById('projects-container');
    const loadingState = document.getElementById('loading-state');
    const errorContainer = document.getElementById('error-container');
    const themeToggle = document.getElementById('theme-toggle');

    // --- 3. Theme Toggling Logic ---
    
    /**
     * Applies the selected theme to the document and saves it to localStorage.
     * @param {string} theme - The theme to apply ("light" or "dark").
     */
    function setTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeToggle.setAttribute('aria-label', 'Switch to light mode');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            themeToggle.setAttribute('aria-label', 'Switch to dark mode');
        }
    }

    // Check for saved theme in localStorage
    const savedTheme = localStorage.getItem('theme');
    
    // Check for user's OS preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Initialize theme:
    // 1. Use saved theme if it exists.
    // 2. Else, use OS preference.
    // 3. Else, default to light.
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme(prefersDark ? 'dark' : 'light');
    }

    // Add click event for the toggle button
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });

    // --- 4. API Data Fetching & Display ---

    /**
     * Fetches and displays GitHub projects.
     */
    async function fetchProjects() {
        try {
            const response = await fetch(API_URL);

            // Handle HTTP errors
            if (!response.ok) {
                let errorMessage = `HTTP Error: ${response.status}`;
                if (response.status === 403) {
                    errorMessage = 'GitHub API rate limit exceeded. Please try again in a few minutes.';
                } else if (response.status === 404) {
                    errorMessage = `GitHub user '${USERNAME}' not found.`;
                }
                throw new Error(errorMessage);
            }

            const projects = await response.json();

            // Hide the loading message
            if (loadingState) {
                loadingState.style.display = 'none';
            }

            // Handle case where user has no repositories
            if (projects.length === 0) {
                projectsContainer.innerHTML = '<p>No public repositories found.</p>';
                return;
            }

            // Clear container (in case loading state was there)
            projectsContainer.innerHTML = '';
            
            // Create and append a card for each project
            projects.forEach(project => {
                const projectCard = document.createElement('article');
                projectCard.className = 'project-card';

                // Use defensive coding for potentially null fields
                const description = project.description || 'No description provided.';
                const language = project.language || 'N/A';

                projectCard.innerHTML = `
                    <h3>${project.name}</h3>
                    <p>${description}</p>
                    <div class="project-card-footer">
                        <span class="project-language">${language}</span>
                        <a href="${project.html_url}" target="_blank" rel="noopener noreferrer" class="project-link">
                            View on GitHub
                        </a>
                    </div>
                `;
                projectsContainer.appendChild(projectCard);
            });

        } catch (error) {
            // Handle network errors or errors thrown from the try block
            console.error('Failed to fetch projects:', error);
            
            // Hide loading state
            if (loadingState) {
                loadingState.style.display = 'none';
            }
            
            // Display error message to the user
            displayError(error.message || 'Network error. Please check your connection.');
        }
    }

    /**
     * Displays an error message in the error container.
     * @param {string} message - The error message to display.
     */
    function displayError(message) {
        errorContainer.innerHTML = `<p>${message}</p>`;
    }

    // --- 5. Initial Call ---
    fetchProjects();

});