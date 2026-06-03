(function () {
    const publicPages = ['login.html', 'signup.html', 'onboarding.html'];
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user && !publicPages.includes(currentPage)) {
        window.location.href = 'login.html';
    } else if (user && publicPages.includes(currentPage) && currentPage !== 'onboarding.html') {
        window.location.href = 'index.html';
    }

    // Export helper functions globally
    window.getCurrentSession = function () {
        const user = JSON.parse(localStorage.getItem('user'));
        return user ? user.username : 'default';
    };

    window.logout = function () {
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    };

    // Check if user needs onboarding (taste profile not set)
    window.checkOnboarding = async function () {
        const session = window.getCurrentSession();
        if (!session || session === 'default') return;
        try {
            const BACKEND_URL = `${window.location.protocol}//${window.location.host}`;
            const res = await fetch(`${BACKEND_URL}/api/taste-profile?session_id=${session}`);
            const profile = await res.json();
            if (!profile.onboarding_complete && currentPage !== 'onboarding.html') {
                window.location.href = 'onboarding.html';
            }
        } catch (e) { /* silently fail — don't block the app */ }
    };

    // Update profile icon if exists
    window.addEventListener('load', () => {
        const currentUser = JSON.parse(localStorage.getItem('user'));
        const profileIcons = document.querySelectorAll('.profile-icon, .w-8.h-8.rounded.bg-blue-500, .w-8.h-8.rounded.bg-netflix-red');
        if (currentUser && profileIcons.length > 0) {
            profileIcons.forEach(icon => {
                icon.textContent = currentUser.username.charAt(0).toUpperCase();
                icon.title = `Logged in as ${currentUser.username} (Click to logout)`;
                icon.style.cursor = 'pointer';
                icon.onclick = (e) => {
                    e.preventDefault();
                    if (confirm('Do you want to logout?')) {
                        window.logout();
                    }
                };
            });
        }

        // Trigger onboarding check on main pages
        if (currentUser && ['index.html', ''].includes(currentPage)) {
            window.checkOnboarding();
        }
    });
})();
