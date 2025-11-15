// Wait for the DOM to be fully loaded before running script
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. GitHub API Configuration ---
    const USERNAME = 'AndyFerns';

    // --- 2. DOM Element Selection ---
    const projectsContainer = document.getElementById('projects-container');
    const errorContainer = document.getElementById('error-container');
    const themeToggle = document.getElementById('theme-toggle');
    const sortSelect = document.getElementById('sort-select'); // New element

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
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme(prefersDark ? 'dark' : 'light');
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });

    // --- 4. API Data Fetching & Display ---

    /**
     * Shows or hides the loading state in the projects container.
     * @param {boolean} isLoading - True to show loading, false to clear.
     */
    function showLoading(isLoading) {
        if (isLoading) {
            projectsContainer.innerHTML = '<p id="loading-state">Loading projects...</p>';
        } else {
            const loadingEl = document.getElementById('loading-state');
            if (loadingEl) {
                loadingEl.remove();
            }
        }
    }
    
    /**
     * Displays an error message in the error container.
     * @param {string} message - The error message to display.
     */
    function displayError(message) {
        errorContainer.innerHTML = `<p>${message}</p>`;
    }

    /**
     * Fetches and displays GitHub projects, sorted by a given parameter.
     * @param {string} sortBy - The sort parameter (e.g., 'updated', 'created').
     */
    async function fetchProjects(sortBy = 'updated') {
        showLoading(true); // Show loading state
        errorContainer.innerHTML = ''; // Clear previous errors

        // Determine sort direction
        // 'full_name' is alphabetical (asc), others are chronological (desc)
        const direction = (sortBy === 'full_name') ? 'asc' : 'desc';
        const API_URL = `https://api.github.com/users/${USERNAME}/repos?sort=${sortBy}&direction=${direction}`;

        try {
            const response = await fetch(API_URL);

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
            
            showLoading(false); // Hide loading message

            if (projects.length === 0) {
                projectsContainer.innerHTML = '<p>No public repositories found.</p>';
                return;
            }

            // Clear container before adding new cards
            projectsContainer.innerHTML = '';
            
            projects.forEach(project => {
                const projectCard = document.createElement('article');
                projectCard.className = 'project-card';

                const description = project.description || 'No description provided.';
                const language = project.language || 'N/A';

                // UPDATED: Added star and fork counts
                projectCard.innerHTML = `
                    <h3>${project.name}</h3>
                    <p>${description}</p>
                    <div class="project-card-footer">
                        <div class="project-details">
                            <span class="project-language">${language}</span>
                            <span class="project-stat" title="Stars">
                                ⭐ ${project.stargazers_count}
                            </span>
                            <span class="project-stat" title="Forks">
                                🍴 ${project.forks_count}
                            </span>
                        </div>
                        <a href="${project.html_url}" target="_blank" rel="noopener noreferrer" class="project-link">
                            View on GitHub
                        </a>
                    </div>
                `;
                projectsContainer.appendChild(projectCard);
            });

        } catch (error) {
            console.error('Failed to fetch projects:', error);
            showLoading(false); // Hide loading on error
            displayError(error.message || 'Network error. Please check your connection.');
        }
    }

    // --- 5. Initial Call & Event Listeners ---
    
    // NEW: Add change event for the sort dropdown
    sortSelect.addEventListener('change', (e) => {
        fetchProjects(e.target.value);
    });

    // Initial project fetch on page load
    // This will use the default selected value from the HTML ('updated')
    fetchProjects(sortSelect.value);

});