/**
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

    // Add a basic getLang filter - we just need a default value for server-side rendering
    // The actual language detection will happen client-side
    eleventyConfig.addFilter("getLang", function(inputPath, page) {
        // Check for lang param in URL data
        if (page && page.url) {
            // In the real site, this will be handled by JavaScript
            // This is just for initial rendering
            return 'en';
        }

        // Try path-based detection as fallback
        const match = inputPath?.match(/\/(?:root|site)\/([a-z]{2})\//);
        if (match && ['en', 'sv', 'no'].includes(match[1])) {
            return match[1];
        }

        // Default to English
        return 'en';
    });
};