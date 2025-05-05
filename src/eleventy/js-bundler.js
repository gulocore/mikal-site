/**
 * JavaScript Bundling Module for Eleventy
 * Handles JS bundling with esbuild
 */

const fs = require('fs');
const esbuild = require('esbuild');
const path = require('path');

/**
 * Add JavaScript bundling to Eleventy
 * @param {Object} eleventyConfig - Eleventy configuration object
 * @param {Object} options - Optional configuration options
 * @param {string} options.sourceFile - Path to source JS file (default: './src/js/main.js')
 * @param {string} options.outputFile - Path to output JS file (default: './_site/js/main.js')
 * @param {string} options.format - Module format (default: 'esm')
 */
module.exports = function(eleventyConfig, options = {}) {
    const jsSourceFile = options.sourceFile || './src/js/main.js';
    const jsOutputFile = options.outputFile || './_site/js/main.js';
    const format = options.format || 'esm';

    eleventyConfig.on('eleventy.before', async () => {
        console.log('🔄 Checking for JS files to bundle...');

        // Check if source file exists before attempting to bundle
        try {
            await fs.promises.access(jsSourceFile, fs.constants.F_OK);

            console.log(`🧩 Bundling JS from ${jsSourceFile}...`);

            // Create output directory if it doesn't exist
            await fs.promises.mkdir(path.dirname(jsOutputFile), { recursive: true });

            // Bundle JS with esbuild
            await esbuild.build({
                entryPoints: [jsSourceFile],
                bundle: true,
                minify: true,
                sourcemap: process.env.NODE_ENV !== 'production',
                outfile: jsOutputFile,
                format: format,
            });

            console.log('⚡ JS bundle created successfully');
        } catch (err) {
            if (err.code === 'ENOENT') {
                console.log('⚠️ main.js not found, skipping JS bundling');
            } else {
                console.error('❌ Error bundling JavaScript:', err);
            }
        }
    });
};