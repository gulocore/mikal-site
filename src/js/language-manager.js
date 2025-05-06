/**
 * Language preference manager for query parameter-based language switching
 */

const AVAILABLE_LANGUAGES = ['en', 'sv', 'no'];
const LANG_PREF_KEY = 'languagePreference';

/**
 * Get the current language from URL query parameter
 * @returns {string} Language code or default 'en'
 */
function getCurrentLanguageFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const langParam = params.get('lang');
    return AVAILABLE_LANGUAGES.includes(langParam) ? langParam : getStoredLanguagePreference() || 'en';
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
 * Update URL to use the specified language
 * @param {string} langCode - Language code to set
 */
function updateUrlLanguageParameter(langCode) {
    if (!AVAILABLE_LANGUAGES.includes(langCode)) return;

    const url = new URL(window.location.href);
    url.searchParams.set('lang', langCode);
    window.history.pushState({}, '', url.toString());

    // Update the active state in language switcher
    updateLanguageSwitcherActiveState(langCode);

    // Update page content with new language
    if (typeof window.updatePageLanguage === 'function') {
        window.updatePageLanguage(langCode);
    }
}

/**
 * Update the active state in language switcher
 * @param {string} langCode - Language code to set as active
 */
function updateLanguageSwitcherActiveState(langCode) {
    const links = document.querySelectorAll('.language-switcher a');
    links.forEach(link => {
        const linkLang = link.getAttribute('data-language');
        if (linkLang === langCode) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/**
 * Apply preferred language if needed
 */
function applyPreferredLanguage() {
    const currentLang = getCurrentLanguageFromQuery();
    const storedPref = getStoredLanguagePreference();

    // If no language parameter in URL but we have a stored preference
    if (!new URLSearchParams(window.location.search).has('lang') && storedPref) {
        updateUrlLanguageParameter(storedPref);
    } else {
        // Make sure the active state is correct for current language
        updateLanguageSwitcherActiveState(currentLang);

        // If this is a new language, store it
        if (currentLang !== storedPref) {
            saveLanguagePreference(currentLang);
        }
    }
}

/**
 * Setup language switcher to save preferences and update URL
 */
function setupLanguageSwitcher() {
    const languageSwitcher = document.querySelector('.language-switcher');

    if (languageSwitcher) {
        languageSwitcher.addEventListener('click', function (e) {
            // Check if we clicked on a language link
            if (e.target.tagName === 'A') {
                e.preventDefault(); // Prevent default link navigation
                const langCode = e.target.getAttribute('data-language');

                if (langCode && AVAILABLE_LANGUAGES.includes(langCode)) {
                    // Save preference
                    saveLanguagePreference(langCode);

                    // Update URL and page content
                    updateUrlLanguageParameter(langCode);
                }
            }
        });
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function () {
    setupLanguageSwitcher();
    applyPreferredLanguage();
});