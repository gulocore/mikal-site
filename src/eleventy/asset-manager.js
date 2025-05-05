/**
 * Asset Management Module for Eleventy
 * Handles asset copying and watch targets
 */

/**
 * Add asset management to Eleventy
 * @param {Object} eleventyConfig - Eleventy configuration object
 * @param {Object} options - Optional configuration options
 * @param {Object} options.assets - Assets to copy (default: images and fonts)
 * @param {Array} options.watchPaths - Additional paths to watch
 */
module.exports = function(eleventyConfig, options = {}) {
    // Default assets to copy
    const defaultAssets = {
        "./src/assets/images": "img",
        "./src/assets/fonts": "css/fonts"
    };

    // Default watch paths
    const defaultWatchPaths = ["./src/**/*"];

    // Merge defaults with provided options
    const assets = options.assets || defaultAssets;
    const watchPaths = options.watchPaths || defaultWatchPaths;

    // Set up watch targets
    watchPaths.forEach(path => {
        console.log(`👀 Adding watch target: ${path}`);
        eleventyConfig.addWatchTarget(path);
    });

    // Set to watch JavaScript dependencies
    eleventyConfig.setWatchJavaScriptDependencies(true);

    // Set up asset copying
    Object.entries(assets).forEach(([source, destination]) => {
        console.log(`📁 Setting up asset copying: ${source} → ${destination}`);
        eleventyConfig.addPassthroughCopy({[source]: destination});
    });

    // Add any additional language detection or asset-related filters
    eleventyConfig.addFilter("getLang", function(inputPath) {
        const match = inputPath.match(/\/(?:root|site)\/([a-z]{2})\//);
        return match ? match[1] : 'en';
    });
};