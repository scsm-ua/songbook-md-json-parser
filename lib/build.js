const path = require('path');
const { Song } = require('./Song');
const { processFiles } = require('./process-files');

/**
 * Build markdown song files to JSON
 * 
 * Converts all markdown (.md) files from the input directory to JSON (.json) files
 * in the output directory. Each markdown file is parsed into a structured Song object
 * and saved as formatted JSON.
 * 
 * @param {object} options - Optional configuration
 * @param {string} options.projectDir - The root directory of the project (default: process.cwd())
 * @param {string} options.inputDir - Custom input directory (default: projectDir/songs)
 * @param {string} options.outputDir - Custom output directory (default: projectDir/build/songs)
 * 
 * @example
 * // Default usage - uses current working directory
 * build();
 * 
 * @example
 * // Specify project directory
 * build({ projectDir: __dirname });
 * 
 * @example
 * // Custom paths
 * build({
 *     inputDir: './my-songs',
 *     outputDir: './dist/songs'
 * });
 */
function build(options = {}) {
    const projectDir = options.projectDir || process.cwd();
    const inputDir = options.inputDir || path.join(projectDir, 'songs');
    const outputDir = options.outputDir || path.join(projectDir, 'build', 'songs');

    console.log(`Building songs from: ${inputDir}`);
    console.log(`Output directory: ${outputDir}`);

    processFiles({
        inputDir: inputDir,
        outputDir: outputDir,
        inExt: '.md',
        outExt: '.json',
        processContent: (mdContent) => {
            const song = new Song({ text: mdContent });
            return JSON.stringify(song.json, null, 2);
        }
    });
}

module.exports = { build };
