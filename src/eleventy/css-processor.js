/**
 * CSS Processing Module for Eleventy
 * Handles CSS processing with PostCSS, autoprefixer, and cssnano
 */

const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const fs = require('fs');
const postcss = require('postcss');
const postcssImport = require('postcss-import');
const path = require('path');

/**
 * Add CSS processing to Eleventy
 * @param {Object} eleventyConfig - Eleventy configuration object
 * @param {Object} options - Optional configuration options
 * @param {string} options.sourceFile - Path to source CSS file (default: './src/css/main.css')
 * @param {string} options.destinationFile - Path to output CSS file (default: './_site/css/main.css')
 */
module.exports = function(eleventyConfig, options = {}) {
    const cssSourceFile = options.sourceFile || './src/css/main.css';
    const cssDestinationFile = options.destinationFile || './_site/css/main.css';

    eleventyConfig.on('eleventy.before', async () => {
        console.log('🎨 Processing CSS...');

        try {
            // Read CSS file
            const css = fs.readFileSync(cssSourceFile);

            // Process with PostCSS
            const result = await postcss([postcssImport, autoprefixer, cssnano])
                .process(css, {from: cssSourceFile, to: cssDestinationFile});

            // Ensure directory exists
            fs.mkdirSync(path.dirname(cssDestinationFile), {recursive: true});

            // Write the processed CSS
            fs.writeFileSync(cssDestinationFile, result.css);

            console.log('✅ CSS processing complete');
        } catch (err) {
            console.error('❌ Error processing CSS:', err);
        }
    });
};