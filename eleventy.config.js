module.exports = async function(eleventyConfig) {
const { EleventyHtmlBasePlugin } = await import("@11ty/eleventy");	
eleventyConfig.addPlugin(EleventyHtmlBasePlugin);	
eleventyConfig.addPassthroughCopy({ "src/media": "img" });
eleventyConfig.addPassthroughCopy({ "src/fonts": "css/fonts" });
}

module.exports.config = {
  dir: {
    input: "src/root",
    output: "_site",
    includes: "../includes",
    data: "../data",
  },
  pathPrefix: "/github-repo/",
};

