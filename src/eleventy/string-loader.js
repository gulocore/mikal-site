/**
 * Loads language-specific strings from JSON files
 */
const fs = require('fs');
const path = require('path');

module.exports = function(eleventyConfig) {
    eleventyConfig.addGlobalData("availableLanguages", ["en", "no", "sv"]);

    // Add a filter to get language-specific post data
    eleventyConfig.addFilter("getPostLangData", function(post, lang) {
        if (!post || !post.inputPath) {
            return {};
        }

        // Get directory path of the post
        const dirPath = path.dirname(post.inputPath);

        // Default language if requested language is not available
        const defaultLang = "en";

        // Try to load language-specific data
        const langFile = path.join(dirPath, `${lang}.json`);
        if (fs.existsSync(langFile)) {
            try {
                const content = fs.readFileSync(langFile, 'utf8');
                return JSON.parse(content);
            } catch (error) {
                console.error(`Error loading ${lang}.json for post ${post.inputPath}: ${error.message}`);
            }
        }

        // Fall back to default language if specified language not found
        if (lang !== defaultLang) {
            const defaultFile = path.join(dirPath, `${defaultLang}.json`);
            if (fs.existsSync(defaultFile)) {
                try {
                    const content = fs.readFileSync(defaultFile, 'utf8');
                    return JSON.parse(content);
                } catch (error) {
                    console.error(`Error loading fallback ${defaultLang}.json for post ${post.inputPath}: ${error.message}`);
                }
            }
        }

        // Return empty object if no language file found
        return {};
    });

    // Add a shortcode to serialize the string data for client-side use
    eleventyConfig.addShortcode("languageData", function() {
        const inputPath = this.page.inputPath;
        if (!inputPath) {
            return '{}';
        }

        const dirPath = path.dirname(inputPath);
        const languages = ["en", "no", "sv"];
        const allStrings = {};

        // Load strings for all languages
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
      
      // Global i18n translations
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
        if (strings) {
          Object.keys(strings).forEach(function(stringKey) {
            const elements = document.querySelectorAll('[data-string="' + stringKey + '"]');
            elements.forEach(function(el) {
              // Special handling for post list items that might contain HTML
              if (el.tagName === 'LI' && strings[stringKey].includes('<')) {
                el.innerHTML = strings[stringKey];
              } else {
                el.textContent = strings[stringKey];
              }
            });
          });
        }
        
        // Update global navigation elements from i18n data
        updateGlobalTranslations(lang);
        
        // Update document title if title element and strings exist
        const titleElement = document.querySelector('[data-string="title"]');
        if (titleElement && strings.title) {
          document.title = strings.title + ' | ' + (window.i18nGlobal?.website_title || '');
        }
      }
      
      // Function to update global navigation translations
      function updateGlobalTranslations(lang) {
        if (!window.i18nGlobal || !window.i18nGlobal[lang]) return;
        
        // Get the nav translations for the selected language
        const navTranslations = window.i18nGlobal[lang].nav;
        
        if (navTranslations) {
          // Update nav items
          Object.keys(navTranslations).forEach(function(navKey) {
            const elements = document.querySelectorAll('[data-nav="' + navKey + '"]');
            elements.forEach(function(el) {
              el.textContent = navTranslations[navKey];
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