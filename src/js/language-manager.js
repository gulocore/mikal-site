/**
 * Language preference manager for query parameter-based language switching
 */
import {available_languages, lang_pref_key, respect_lang_pref_param} from "../data/global";

const AVAILABLE_LANGUAGES = available_languages;
const LANG_PREF_KEY = lang_pref_key;
const RESPECT_PREF_PARAM = respect_lang_pref_param;

/**
 * Get the current language from URL query parameter or stored preference
 * @returns {string} Language code or default 'en'
 */
function getCurrentLanguage() {
    const params = new URLSearchParams(window.location.search);
    const langParam = params.get('lang');
    const respectPref = params.has(RESPECT_PREF_PARAM);
    const storedPref = getStoredLanguagePreference();

    // If respectLangPref is present and we have a stored preference, use the stored preference
    if (respectPref && storedPref) {
        // Remove the respectLangPref parameter and update URL
        cleanupRespectPrefParam();
        return storedPref;
    }

    // Otherwise use lang parameter if valid, or fallback to stored preference or default
    return AVAILABLE_LANGUAGES.includes(langParam) ? langParam : storedPref || 'en';
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
 * Clean up the respectLangPref parameter from URL
 */
function cleanupRespectPrefParam() {
    const url = new URL(window.location.href);

    if (url.searchParams.has(RESPECT_PREF_PARAM)) {
        url.searchParams.delete(RESPECT_PREF_PARAM);

        // Only do a replace state to avoid creating a new history entry
        window.history.replaceState({}, '', url.toString());
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

    // Always remove the respectLangPref parameter if it exists
    if (url.searchParams.has(RESPECT_PREF_PARAM)) {
        url.searchParams.delete(RESPECT_PREF_PARAM);
    }

    // Use replaceState instead of pushState to avoid adding to browser history
    window.history.replaceState({}, '', url.toString());

    // Update page content with new language
    if (typeof window.updatePageLanguage === 'function') {
        window.updatePageLanguage(langCode);
    }

    // Update navigation links with current language
    updateNavigationLinks(langCode);
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
 * Update navigation links to include the current language
 * @param {string} langCode - The current language code
 */
function updateNavigationLinks(langCode) {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const basePath = link.getAttribute('href').split('?')[0];
        link.setAttribute('href', `${basePath}?lang=${langCode}`);
    });
}

/**
 * Update post cards with the specified language
 * @param {string} langCode - Language code to use
 */
function updatePostCards(langCode) {
    // Skip if no post cards
    const postTitles = document.querySelectorAll('[data-post-title]');
    const postExcerpts = document.querySelectorAll('[data-post-excerpt]');
    if (postTitles.length === 0 && postExcerpts.length === 0) return;

    // Use embedded data if available, otherwise fetch
    if (window.postsLanguageData) {
        // Use embedded data approach

        // Collect all unique post paths
        const postPaths = new Set();
        postTitles.forEach(el => postPaths.add(el.getAttribute('data-post-title')));
        postExcerpts.forEach(el => postPaths.add(el.getAttribute('data-post-excerpt')));

        // Update each post card with embedded data
        postPaths.forEach(function(path) {
            if (!path) return;

            // Get data for current language or fall back to English
            const postData = window.postsLanguageData[path] &&
                (window.postsLanguageData[path][langCode] ||
                    window.postsLanguageData[path]['en']);

            if (!postData) return;

            // Update titles
            const titleElements = document.querySelectorAll(`[data-post-title="${path}"]`);
            if (postData.title) {
                titleElements.forEach(el => {
                    el.textContent = postData.title;
                });
            }

            // Update excerpts
            const excerptElements = document.querySelectorAll(`[data-post-excerpt="${path}"]`);
            if (postData.excerpt) {
                excerptElements.forEach(el => {
                    el.textContent = postData.excerpt;
                });
            }
        });
    } else {
        // Fallback to fetch method in case embedded data isn't available
        // (Keeping the existing fetch implementation as fallback)
        // ...existing fetch implementation...
    }

    // Update post links to include current language
    const postLinks = document.querySelectorAll('.blog-card-link');
    postLinks.forEach(link => {
        const href = link.getAttribute('href');
        const baseUrl = href.split('?')[0];
        link.setAttribute('href', `${baseUrl}?lang=${langCode}`);
    });
}

/**
 * Apply language based on URL parameters and stored preferences
 */
function applyLanguagePreferences() {
    const currentLang = getCurrentLanguage();
    const params = new URLSearchParams(window.location.search);

    // Always update the language switcher active state
    updateLanguageSwitcherActiveState(currentLang);

    // If we have a language from URL or preference
    if (currentLang) {
        // If no language parameter in URL, add it
        if (!params.has('lang')) {
            updateUrlLanguageParameter(currentLang);
        }
        // If language in URL is different from what we determined (due to respectLangPref)
        else if (params.get('lang') !== currentLang) {
            updateUrlLanguageParameter(currentLang);
        }
        // Otherwise just update navigation links and content
        else {
            // Update navigation links
            updateNavigationLinks(currentLang);

            // Ensure content is updated with current language
            if (typeof window.updatePageLanguage === 'function') {
                window.updatePageLanguage(currentLang);
            }

            // Update post cards if present
            updatePostCards(currentLang);

            // If we have a respectLangPref param, clean it up
            cleanupRespectPrefParam();
        }

        // Store this language as preference if it's different from stored one
        const storedPref = getStoredLanguagePreference();
        if (currentLang !== storedPref) {
            saveLanguagePreference(currentLang);
        }
    }

    // Show the language switcher now that it's properly initialized
    const languageSwitcher = document.querySelector('.language-switcher');
    if (languageSwitcher) {
        languageSwitcher.classList.add('initialized');
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

                    // Update the active state
                    updateLanguageSwitcherActiveState(langCode);

                    // Update post cards if present
                    updatePostCards(langCode);
                }
            }
        });
    }
}

/**
 * Setup navigation link handling
 */
function setupNavigationLinks() {
    // Find all navigation links
    const allNavLinks = document.querySelectorAll('.nav-link, .blog-card-link, a[href]:not([data-language])');

    allNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Don't interfere with language switcher links
            if (link.hasAttribute('data-language')) return;

            // Get the href attribute
            const href = link.getAttribute('href');

            // Skip external links, mailto links, and anchors
            if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) return;

            // Build the URL with current language
            const url = new URL(href, window.location.origin);
            const lang = getStoredLanguagePreference() || 'en';

            // If URL doesn't have language parameter, add it
            if (!url.searchParams.has('lang')) {
                url.searchParams.set('lang', lang);
                link.setAttribute('href', url.toString());
            }
        });
    });
}

// Initialize language system
(function() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeLanguageSystem);
    } else {
        initializeLanguageSystem();
    }

    function initializeLanguageSystem() {

        setupLanguageSwitcher();
        setupNavigationLinks();
        applyLanguagePreferences();
    }
})();
