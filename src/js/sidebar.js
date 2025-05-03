{
    // Enhanced toggle functionality for all screen sizes
    document.getElementById('sidebarToggle').addEventListener('click', function (e) {
        const sidebar = document.getElementById('sidebar');
        // Remove the initial collapse state if it exists
        releaseSidebar();
        sidebar.classList.toggle('collapsed');
        document.body.classList.toggle('sidebar-collapsed');

        // Save preference in localStorage
        const isCollapsed = sidebar.classList.contains('collapsed');

        localStorage.setItem('sidebarCollapsed', isCollapsed);
    });

    // Mobile menu toggle
    document.getElementById('mobileMenuToggle').addEventListener('click', function () {
        // Remove the initial collapse state if it exists
        releaseSidebar();
        const sidebar = document.getElementById('sidebar');
        const mobileTitle = document.getElementById('mobileTitle');
        mobileTitle.classList.toggle('collapsed');
        sidebar.classList.toggle('open');

        // Toggle icon between bars and X
        const icon = this.querySelector('i');
        if (sidebar.classList.contains('open')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
        } else {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        }

        // Toggle aria-expanded for accessibility
        this.setAttribute('aria-expanded', sidebar.classList.contains('open'));
    });

    // Close sidebar when clicking content area in mobile mode
    document.querySelector('.content-wrapper').addEventListener('click', function () {
        const mobileTitle = document.getElementById('mobileTitle');
        const sidebar = document.getElementById('sidebar');

        // Only act if we're in mobile mode and the sidebar is open
        if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            mobileTitle.classList.remove('collapsed');
            // Change the mobile menu icon back to bars
            const icon = document.querySelector('#mobileMenuToggle i');
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');

            // Update aria-expanded for accessibility
            document.getElementById('mobileMenuToggle').setAttribute('aria-expanded', 'false');
        }
    });

    // Restore sidebar state from localStorage on page load
    document.addEventListener('DOMContentLoaded', function () {
        // Remove the initial collapse state if it exists
        const sidebar = document.getElementById('sidebar');
        const mobileTitle = document.getElementById('mobileTitle');
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';

        if (isCollapsed) {
            sidebar.classList.add('collapsed');
            document.body.classList.add('sidebar-collapsed');
        }

        // Handle window resize events to adjust layout
        function handleResize() {
            if (window.innerWidth <= 768) {
                // Reset sidebar state on mobile
                sidebar.classList.remove('collapsed');
                document.body.classList.remove('sidebar-collapsed');
                mobileTitle.classList.remove('collapsed');
                // Close mobile sidebar when resizing
                if (sidebar.classList.contains('open')) {
                    sidebar.classList.remove('open');
                    const icon = document.querySelector('#mobileMenuToggle i');
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                    document.getElementById('mobileMenuToggle').setAttribute('aria-expanded', 'false');
                }
            }
            else if (localStorage.getItem('sidebarCollapsed') === 'true') {
                sidebar.classList.add('collapsed');
            }
        }
        window.addEventListener('resize', handleResize);
        handleResize(); // Run once on load
    });

    function releaseSidebar() {
        document.documentElement.classList.remove('sidebar-collapsed-init');
        document.documentElement.style.setProperty('--sidebar-active-transition-speed', 'var(--sidebar-transition-speed)');
    }
}
