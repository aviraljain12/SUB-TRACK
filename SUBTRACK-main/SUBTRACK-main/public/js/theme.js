// Global theme management script for SUB-TRACK
(function () {
    // Function to apply a theme
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('subtrack-theme', theme);
        
        // Update any toggle buttons on the page
        const toggleBtns = document.querySelectorAll('.theme-toggle-btn i');
        toggleBtns.forEach(icon => {
            if (theme === 'light') {
                icon.className = 'fas fa-sun';
            } else {
                icon.className = 'fas fa-moon';
            }
        });
    }

    // Determine starting theme: saved preference -> system default -> dark
    const savedTheme = localStorage.getItem('subtrack-theme');
    const startTheme = savedTheme || 'dark';
    applyTheme(startTheme);

    // Set up toggle buttons on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        const currentTheme = localStorage.getItem('subtrack-theme') || 'dark';
        applyTheme(currentTheme);

        // Find theme toggle button or create it if not found in sidebar (dashboard pages)
        const themeToggle = document.getElementById('themeToggleBtn');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const nextTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
                applyTheme(nextTheme);
            });
        }
    });
})();
