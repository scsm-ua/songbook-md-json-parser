/**
 * Default configuration for songbook parser
 */

const path = require('path');

/**
 * Get default paths for the songbook parser
 * @param {string} projectDir - The root directory of the project
 * @returns {object} Default paths configuration
 */
function getDefaultPaths(projectDir = process.cwd()) {
    return {
        // Source markdown files directory
        songsDir: path.join(projectDir, 'songs'),
        
        // Output JSON files directory
        jsonDir: path.join(projectDir, 'json', 'songs'),
        
        // Contents file
        contentsFile: path.join(projectDir, 'contents.md'),
        contentsJsonFile: path.join(projectDir, 'json', 'contents.json'),
        
        // Index file
        indexFile: path.join(projectDir, 'index.md'),
        indexJsonFile: path.join(projectDir, 'json', 'index.json')
    };
}

/**
 * Find the shared parent directory of two paths.
 */
function commonRoot(a, b) {
    const aParts = path.resolve(a).split(path.sep);
    const bParts = path.resolve(b).split(path.sep);
    const shared = [];
    for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
        if (aParts[i] !== bParts[i]) break;
        shared.push(aParts[i]);
    }
    return shared.join(path.sep) || path.sep;
}

module.exports = { getDefaultPaths, commonRoot };
