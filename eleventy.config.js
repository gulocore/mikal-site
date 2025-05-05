/**
 * Main Eleventy Configuration
 * Imports and uses modular configuration components
 *
 * @param {import("@11ty/eleventy").UserConfig} eleventyConfig
 * @returns {import("@11ty/eleventy").EleventyConfig}
 */
module.exports = async function(eleventyConfig) {
    // Import Eleventy core plugins
    const { EleventyHtmlBasePlugin } = await import("@11ty/eleventy");

    // Import our custom modules
    const stringLoader = require('./src/eleventy/string-loader');
    const cssProcessor = require('./src/eleventy/css-processor');
    const jsBundler = require('./src/eleventy/js-bundler');
    const assetManager = require('./src/eleventy/asset-manager');

    // Apply HTML base plugin if needed
    eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

    // Apply our custom modules with default options
    stringLoader(eleventyConfig);
    cssProcessor(eleventyConfig);
    jsBundler(eleventyConfig);
    assetManager(eleventyConfig);
};

// Config must be outside the function
module.exports.config = {
    dir: {
        input: "src/root",
        output: "_site",
        includes: "../includes",
        data: "../data",
    },
    serverOptions: {
        port: 4040
    },
};