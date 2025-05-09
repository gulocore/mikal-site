import {mobile_size_width} from "../data/global";

document.addEventListener('DOMContentLoaded', function () {
    const sidebar = document.getElementById('sidebar');
    const contentWrapper = document.getElementById('contentWrapper');

    // Handle window resize events to adjust layout
    function handleResize() {
        if (window.innerWidth <= mobile_size_width) {
            sidebar.classList.add('scrollbar-hidden');
            contentWrapper.classList.add('scrollbar-hidden');
        } else {
            sidebar.classList.remove('scrollbar-hidden');
            contentWrapper.classList.remove('scrollbar-hidden');
        }
    }

    window.addEventListener('resize', handleResize);
    handleResize(); // Run once on load
});