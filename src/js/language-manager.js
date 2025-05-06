/**
 * Language preference manager for query parameter-based language switching
 */

const AVAILABLE_LANGUAGES = ['en', 'sv', 'no'];
const LANG_PREF_KEY = 'languagePreference';
const RESPECT_PREF_PARAM = 'respectLangPref';

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

    window.history.pushState({}, '', url.toString());

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

    // Function to fetch language data for a post
    async function fetchPostLangData(postPath) {
        try {
            // Fix for double path - check if path already contains '/blog/posts/'
            const urlPath = postPath.startsWith('/blog/posts/')
                ? postPath
                : `/blog/posts/${postPath}`;

            const response = await fetch(`${urlPath}/${langCode}.json`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error(`Error fetching language data for post ${postPath}:`, error);
        }

        // Fallback to English if requested language not available
        if (langCode !== 'en') {
            try {
                // Same path check for fallback
                const fallbackPath = postPath.startsWith('/blog/posts/')
                    ? postPath
                    : `/blog/posts/${postPath}`;

                const fallbackResponse = await fetch(`${fallbackPath}/en.json`);
                if (fallbackResponse.ok) {
                    return await fallbackResponse.json();
                }
            } catch (error) {
                console.error(`Error fetching fallback language data for post ${postPath}:`, error);
            }
        }

        return null;
    }

    // Collect all unique post paths
    const postPaths = new Set();
    postTitles.forEach(el => postPaths.add(el.getAttribute('data-post-title')));
    postExcerpts.forEach(el => postPaths.add(el.getAttribute('data-post-excerpt')));

    // Fetch and update each post's language data
    postPaths.forEach(async function(path) {
        if (!path) return;

        const langData = await fetchPostLangData(path);
        if (!langData) return;

        // Update titles
        const titleElements = document.querySelectorAll(`[data-post-title="${path}"]`);
        if (langData.title) {
            titleElements.forEach(el => {
                el.textContent = langData.title;
            });
        }

        // Update excerpts
        const excerptElements = document.querySelectorAll(`[data-post-excerpt="${path}"]`);
        if (langData.excerpt) {
            excerptElements.forEach(el => {
                el.textContent = langData.excerpt;
            });
        }
    });

    // Update post links to include current language
    const postLinks = document.querySelectorAll('.post-link');
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
 * Setup navigation link click handlers
 */
function setupNavigationLinks() {
    const sidebarNav = document.getElementById('sidebarNav');

    if (sidebarNav) {
        sidebarNav.addEventListener('click', function(e) {
            // Find closest nav-link if we clicked inside one
            const navLink = e.target.closest('.nav-link');

            if (navLink) {
                // We don't prevent default here, as we want normal navigation
                // The link's href already includes the current language parameter
            }
        });
    }
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