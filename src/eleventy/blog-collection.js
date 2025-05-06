/**
 * Blog Collection Module for Eleventy
 * Configures blog post collections and related features
 */

/**
 * Add blog collection functionality to Eleventy
 * @param {Object} eleventyConfig - Eleventy configuration object
 * @param {Object} options - Optional configuration options
 */
module.exports = function(eleventyConfig, options = {}) {
    // Add blog collection
    eleventyConfig.addCollection("blog", function(collectionApi) {
        // Get all items with the "blog" tag, sorted by date
        return collectionApi.getFilteredByTag("blog")
            .sort((a, b) => b.date - a.date);
    });

    // Add a date filter for formatting dates
    eleventyConfig.addFilter("date", function(date, format) {
        if (!date) return '';

        const d = new Date(date);

        // Basic implementation, you may want to use a library like luxon/date-fns for more formats
        switch (format) {
            case 'YYYY-MM-DD':
                return d.toISOString().slice(0, 10);
            case 'DD MMM YYYY':
                return d.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                });
            case 'MMMM D, YYYY':
                return d.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                });
            default:
                return d.toISOString().slice(0, 10);
        }
    });

    // Add default directory for blog post thumbnails
    eleventyConfig.addGlobalData("blogDefaults", {
        thumbnailPath: "/img/blog/",
        defaultThumbnail: "/img/blog/default-thumbnail.jpg",
    });

    console.log('📝 Blog collection registered');
};