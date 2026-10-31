const fs = require('fs');
const path = require('path');
const { Page } = require('./Page');
const { processFiles } = require('./process-files');
const { getDefaultPaths, commonRoot } = require('./config');

/**
 * Build markdown page files to JSON
 * 
 * Converts all markdown (.md) files from the input directory to JSON (.json) files
 * in the output directory. Each markdown file is parsed into a structured Page object
 * and saved as formatted JSON.
 * 
 * @param {object} options - Optional configuration
 * @param {string} options.projectDir - The root directory of the project (default: process.cwd())
 * @param {string} options.inputDir - Custom input directory (default: projectDir/pages)
 * @param {string} options.outputDir - Custom output directory (default: projectDir/json/pages)
 * 
 * @example
 * // Default usage - uses current working directory
 * parsePages();
 * 
 * @example
 * // Specify project directory
 * parsePages({ projectDir: __dirname });
 * 
 * @example
 * // Custom paths
 * parsePages({
 *     inputDir: './my-pages',
 *     outputDir: './dist/pages'
 * });
 */
function parsePages(options = {}) {
    const projectDir = options.projectDir || process.cwd();
    const defaults = getDefaultPaths(projectDir);
    const inputDir = options.inputDir || defaults.pagesDir;
    const outputDir = options.outputDir || defaults.pagesJsonDir;

    if (!fs.existsSync(inputDir)) {
        console.log(`No pages directory found at ${inputDir}, skipping.`);
        return false;
    }

    const rootDir = commonRoot(inputDir, outputDir);
    console.log(`Root: ${rootDir}`);
    console.log(`Building pages from: ${path.relative(rootDir, inputDir)}`);
    console.log(`Output directory: ${path.relative(rootDir, outputDir)}`);

    processFiles({
        inputDir: inputDir,
        outputDir: outputDir,
        inExt: '.md',
        outExt: '.json',
        processContent: (mdContent) => {
            const page = new Page({ text: mdContent });
            return JSON.stringify(page.json, null, 2);
        }
    });
    return true;
}

module.exports = { parsePages };
