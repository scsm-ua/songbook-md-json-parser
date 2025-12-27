const path = require('path');
const { Song } = require('./Song');
const { processFiles } = require('./process-files');

/**
 * Render JSON song files back to markdown
 * 
 * Converts all JSON (.json) files from the input directory back to markdown (.md) files
 * in the output directory. Each JSON file is parsed and rendered as formatted markdown.
 * 
 * @param {object} options - Optional configuration
 * @param {string} options.projectDir - The root directory of the project (default: process.cwd())
 * @param {string} options.jsonDir - Directory containing JSON files (default: projectDir/build/songs)
 * @param {string} options.mdDir - Output directory for markdown files (default: projectDir/songs)
 * @param {function} options.prepareJson - Optional callback to modify JSON data before rendering.
 *                                         Receives the song.json object as parameter.
 * 
 * @example
 * // Default usage - converts build/songs/*.json to songs/*.md
 * render();
 * 
 * @example
 * // Custom paths
 * render({
 *     jsonDir: './dist/songs',
 *     mdDir: './output'
 * });
 * 
 * @example
 * // With prepareJson callback to remove translations
 * render({
 *     prepareJson: (json) => {
 *         json.meta = json.meta || {};
 *         json.meta.translation = 'no';
 *         json.verses?.forEach(v => {
 *             delete v.translation;
 *         });
 *     }
 * });
 */
function render(options = {}) {
    const projectDir = options.projectDir || process.cwd();
    const jsonDir = options.jsonDir || path.join(projectDir, 'build', 'songs');
    const mdDir = options.mdDir || path.join(projectDir, 'songs');

    console.log(`Rendering songs from: ${jsonDir}`);
    console.log(`Output directory: ${mdDir}`);

    processFiles({
        inputDir: jsonDir,
        outputDir: mdDir,
        inExt: '.json',
        outExt: '.md',
        processContent: (jsonContent) => {
            // Parse JSON data
            const jsonData = JSON.parse(jsonContent);
            
            // Create Song instance from JSON data
            const song = new Song({ json: jsonData });

            // Allow custom JSON preparation (e.g., removing translations)
            if (options.prepareJson) {
                options.prepareJson(song.json);
            }
            
            // Return rendered markdown
            return song.render();
        }
    });
}

module.exports = { render };
