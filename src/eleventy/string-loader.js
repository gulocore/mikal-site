/**
 * Eleventy String Loader
 * Loads language-specific strings from JSON files
 */
const fs = require('fs');
const path = require('path');

module.exports = function(eleventyConfig) {
    // Add global data for available languages
    eleventyConfig.addGlobalData("availableLanguages", ["en", "no", "sv"]);

    // Add a shortcode to serialize the string data for client-side use
    eleventyConfig.addShortcode("languageData", function() {
        const inputPath = this.page.inputPath;
        if (!inputPath) {
            return '{}';
        }

        const dirPath = path.dirname(inputPath);
        const languages = ["en", "no", "sv"];
        const allStrings = {};

        // Load strings for all available languages
        languages.forEach(lang => {
            const langFile = path.join(dirPath, `${lang}.json`);
            if (fs.existsSync(langFile)) {
                try {
                    const content = fs.readFileSync(langFile, 'utf8');
                    allStrings[lang] = JSON.parse(content);
                } catch (error) {
                    console.error(`Error loading ${lang}.json: ${error.message}`);
                    allStrings[lang] = {};
                }
            } else {
                console.warn(`Language file not found: ${langFile}`);
                allStrings[lang] = {};
            }
        });

        // Get access to global i18n data
        const i18n = this.ctx?.i18n || {};

        // Return serialized JSON data for all languages
        return `<script>
      // Page-specific translation strings
      window.languageStrings = ${JSON.stringify(allStrings)};
      
      // Global i18n translations (from data/i18n.js)
      window.i18nGlobal = ${JSON.stringify(i18n)};
      
      // Function to get URL parameters - exposed globally
      window.getUrlParam = function(name, defaultValue = null) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name) || defaultValue;
      }
      
      // Function to update the page language - exposed globally
      window.updatePageLanguage = function(langCode = null) {
        const lang = langCode || window.getUrlParam('lang', 'en');
        
        // Update page-specific translations
        const strings = window.languageStrings[lang] || window.languageStrings.en;
        
        // Update all text elements with their translations
        Object.keys(strings).forEach(key => {
          const elements = document.querySelectorAll(\`[data-string="\${key}"]\`);
          elements.forEach(el => {
            el.textContent = strings[key];
          });
        });
        
        // Update global navigation elements from i18n data
        updateGlobalTranslations(lang);
      }
      
      // Function to update global navigation translations
      function updateGlobalTranslations(lang) {
        if (!window.i18nGlobal || !window.i18nGlobal[lang]) return;
        
        // Get the nav translations for the selected language
        const navTranslations = window.i18nGlobal[lang].nav;
        
        if (navTranslations) {
          // Update nav items
          Object.keys(navTranslations).forEach(key => {
            const elements = document.querySelectorAll(\`[data-nav="\${key}"]\`);
            elements.forEach(el => {
              el.textContent = navTranslations[key];
            });
          });
        }
      }
      
      // Initialize when DOM is ready
      document.addEventListener('DOMContentLoaded', window.updatePageLanguage);
    </script>`;
    });

    console.log('🔤 String loader registered languageData shortcode');
}