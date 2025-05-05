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

        // Return serialized JSON data for all languages
        return `<script>
      window.languageStrings = ${JSON.stringify(allStrings)};
      
      // Function to get URL parameters
      function getUrlParam(name, defaultValue = null) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name) || defaultValue;
      }
      
      // Function to update the page language
      function updatePageLanguage() {
        const lang = getUrlParam('lang', 'en');
        const strings = window.languageStrings[lang] || window.languageStrings.en;
        
        // Update all text elements with their translations
        Object.keys(strings).forEach(key => {
          const elements = document.querySelectorAll(\`[data-string="\${key}"]\`);
          elements.forEach(el => {
            el.textContent = strings[key];
          });
        });
      }
      
      // Initialize when DOM is ready
      document.addEventListener('DOMContentLoaded', updatePageLanguage);
    </script>`;
    });

    console.log('🔤 String loader registered languageData shortcode');
}