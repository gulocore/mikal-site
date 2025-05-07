// Early Back Navigation Detection
// This script runs immediately in the page head
import {available_languages, lang_pref_key, respect_lang_pref_param} from "../../data/global";

(function() {
    // Constants
    const LANG_PREF_KEY = lang_pref_key;
    const RESPECT_PREF_PARAM = respect_lang_pref_param;
    const NAV_HISTORY_KEY = 'navigationHistory';
    const AVAILABLE_LANGUAGES = available_languages;

    // Skip if we're already using respectLangPref
    const params = new URLSearchParams(window.location.search);
    if (params.has(RESPECT_PREF_PARAM)) return;

    // Get current URL for history tracking
    const currentUrl = window.location.pathname + window.location.search;

    // Get navigation history
    let navHistory = [];
    try {
        navHistory = JSON.parse(sessionStorage.getItem(NAV_HISTORY_KEY) || '[]');
    } catch (e) {
        navHistory = [];
    }

    // Check if this is a back navigation
    const isBackNavigation = navHistory.length >= 2 &&
        navHistory[navHistory.length - 2] === currentUrl;

    // If back navigation detected
    if (isBackNavigation) {
        console.log("Back button detected in early head script");

        // Get stored language preference
        const storedPref = localStorage.getItem(LANG_PREF_KEY);

        // Get URL language
        const urlLang = params.get('lang');

        // If preference exists and differs from URL
        if (storedPref && AVAILABLE_LANGUAGES.includes(storedPref) &&
            urlLang !== storedPref) {

            // Force a redirect with respectLangPref
            const url = new URL(window.location.href);
            url.searchParams.set(RESPECT_PREF_PARAM, '');

            // Use replace to avoid adding history entry
            window.location.replace(url.toString());
        }
    }

    // Update navigation history
    if (navHistory.length === 0 || navHistory[navHistory.length - 1] !== currentUrl) {
        if (navHistory.length >= 10) navHistory.shift();
        navHistory.push(currentUrl);

        try {
            sessionStorage.setItem(NAV_HISTORY_KEY, JSON.stringify(navHistory));
        } catch (e) {
            console.error("Error saving navigation history:", e);
        }
    }
})();
