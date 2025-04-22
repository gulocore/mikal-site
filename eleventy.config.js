module.exports = async function(eleventyConfig) {

const { EleventyHtmlBasePlugin } = await import("@11ty/eleventy");	

 const autoprefixer = require('autoprefixer');

 const cssnano = require('cssnano');

 const fs = require('fs');

 const postcss = require('postcss');

 const postcssImport = require('postcss-import');

eleventyConfig.addWatchTarget("./src/**/*");
eleventyConfig.setWatchJavaScriptDependencies(true);


eleventyConfig.addPassthroughCopy({ "./src/assets/images": "img" });
eleventyConfig.addPassthroughCopy({ "./src/assets/fonts": "css/fonts" });

 eleventyConfig.on('eleventy.before', async () => {

   // PostCSS processing

   const cssSourceFile = './src/css/main.css';

   const cssDestinationFile = './_site/css/main.css';

   fs.readFile(cssSourceFile, (err, css) => {

     postcss([

     postcssImport,

     autoprefixer,

     cssnano,

     ])

     .process(css, { from: cssSourceFile, to: cssDestinationFile })

     .then(result => {

       fs.writeFile(cssDestinationFile, result.css, () => true)

     });

   });
 });

module.exports.config = {
  dir: {
    input: "src/root",
    output: "_site",
    includes: "../includes",
    data: "../data",
  },
//  pathPrefix: "/github-repo/",
};
}

