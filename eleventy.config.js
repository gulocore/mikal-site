module.exports = async function(eleventyConfig) {
  const { EleventyHtmlBasePlugin } = await import("@11ty/eleventy");	
  const autoprefixer = require('autoprefixer');
  const cssnano = require('cssnano');
  const fs = require('fs');
  const postcss = require('postcss');
  const postcssImport = require('postcss-import');
  const esbuild = require('esbuild');
  const path = require('path');

  eleventyConfig.addWatchTarget("./src/**/*");
  eleventyConfig.setWatchJavaScriptDependencies(true);
  eleventyConfig.addPassthroughCopy({ "./src/assets/images": "img" });
  eleventyConfig.addPassthroughCopy({ "./src/assets/fonts": "css/fonts" });
  
  eleventyConfig.on('eleventy.before', async () => {
    // CSS processing
    const cssSourceFile = './src/css/main.css';
    const cssDestinationFile = './_site/css/main.css';
    
    fs.readFile(cssSourceFile, (err, css) => {
      if (err) {
        console.error('Error reading CSS file:', err);
        return;
      }
      
      postcss([
        postcssImport,
        autoprefixer,
        cssnano,
      ])
      .process(css, { from: cssSourceFile, to: cssDestinationFile })
      .then(result => {
        fs.mkdirSync(path.dirname(cssDestinationFile), { recursive: true });
        fs.writeFile(cssDestinationFile, result.css, () => true);
      });
    });

    // JS bundling with esbuild
    try {
      const jsSourceFile = './src/js/main.js';
      
      // Check if main.js exists before attempting to bundle
      fs.access(jsSourceFile, fs.constants.F_OK, async (err) => {
        if (err) {
          console.log('⚠️ main.js not found, skipping JS bundling');
          return;
        }
        
        await esbuild.build({
          entryPoints: [jsSourceFile],
          bundle: true,
          minify: true,
          sourcemap: process.env.NODE_ENV !== 'production',
          outfile: './_site/js/bundle.js',
          format: 'esm',
        });
        console.log('⚡ JS bundle created');
      });
    } catch (err) {
      console.error('Error bundling JavaScript:', err);
    }
  });
};

// Config must be outside the function
module.exports.config = {
  dir: {
    input: "src/root",
    output: "_site",
    includes: "../includes",
    data: "../data",
  },
};
