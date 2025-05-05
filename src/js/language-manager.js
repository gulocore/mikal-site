/**
 * Language preference manager that respects existing preferences
 */


const AVAILABLE_LANGUAGES = ['en', 'sv', 'no'];
const LANG_PREF_KEY = 'languagePreference';

/**
 * Get the current language from URL path
 * @returns {string|null} Language code or null if not found
 */
function getCurrentLanguageFromPath() {
    const pathMatch = window.location.pathname.match(/^\/(en|sv|no)\//);
    return pathMatch ? pathMatch[1] : null;
}

/**
 * Get the stored language preference
 * @returns {string|null} Stored language preference or null if not set
 */
function getStoredLanguagePreference() {
    return localStorage.getItem(LANG_PREF_KEY);
}

/**
 * Save language preference to localStorage
 * @param {string} langCode - Language code to save
 */
function saveLanguagePreference(langCode) {
    if (AVAILABLE_LANGUAGES.includes(langCode)) {
        localStorage.setItem(LANG_PREF_KEY, langCode);
    }
}

/**
 * Check if user needs to be redirected to their preferred language
 * This redirects a user if they're on a language path that doesn't match their preference
 */
function redirectToPreferredLanguageIfNeeded() {
    const currentLang = getCurrentLanguageFromPath();
    const storedPref = getStoredLanguagePreference();

    // Only redirect if:
    // 1. We have a stored preference
    // 2. We're currently on a language path
    // 3. The current language doesn't match the preference
    if (storedPref && currentLang && currentLang !== storedPref) {
        // Create the new URL by replacing language in path
        const newPath = window.location.pathname.replace(
            new RegExp(`^\\/${currentLang}\\/`),
            `/${storedPref}/`
        );

        // Redirect to the new URL, preserving query string and hash
        window.location.href = newPath + window.location.search + window.location.hash;
    }
}

/**
 * Setup language switcher to save preferences
 * This adds a click handler to language switcher links
 */
function setupLanguageSwitcher() {
    const languageSwitcher = document.querySelector('.language-switcher');

    if (languageSwitcher) {
        languageSwitcher.addEventListener('click', function (e) {
            // Check if we clicked on a language link
            if (e.target.tagName === 'A') {
                // Extract language code from href
                const href = e.target.getAttribute('href');
                const langMatch = href.match(/^\/(en|sv|no)\//);

                if (langMatch) {

                    saveLanguagePreference(langMatch[1]);
                }
            }
        });
    }
}


document.addEventListener('DOMContentLoaded', function () {

    setupLanguageSwitcher();
    redirectToPreferredLanguageIfNeeded();
});
