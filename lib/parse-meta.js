const path = require('path');
const fs = require('fs');
const { getContentsJSON, getIndexJSON } = require('./Contents');

/**
 * Parse songbook contents file to JSON
 * 
 * Parses a contents markdown file that contains categories and song lists,
 * and converts it to a structured JSON format.
 * 
 * @param {object} options - Optional configuration
 * @param {string} options.projectDir - The root directory of the project (default: process.cwd())
 * @param {string} options.contentsFile - Path to contents file (default: projectDir/contents.md)
 * @param {string} options.outputFile - Path to output JSON file (default: projectDir/build/contents.json)
 * @param {boolean} options.saveToFile - Whether to save to file (default: true)
 * 
 * @returns {Array} Array of categories with items
 * 
 * @example
 * // Default usage
 * const categories = parseContents();
 * 
 * @example
 * // Custom paths
 * parseContents({
 *     contentsFile: './CONTENTS.md',
 *     outputFile: './dist/contents.json'
 * });
 * 
 * @example
 * // Just return data without saving
 * const categories = parseContents({ saveToFile: false });
 */
function parseContents(options = {}) {
    const projectDir = options.projectDir || process.cwd();
    const defaults = getDefaultPaths(projectDir);
    const contentsFile = options.contentsFile || defaults.contentsFile;
    const outputFile = options.outputFile || defaults.contentsJsonFile;
    const saveToFile = options.saveToFile !== false;

    console.log(`Parsing contents from: ${contentsFile}`);

    if (!fs.existsSync(contentsFile)) {
        throw new Error(`Contents file not found: ${contentsFile}`);
    }

    const categories = getContentsJSON(contentsFile);

    if (saveToFile) {
        const outputDir = path.dirname(outputFile);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        fs.writeFileSync(outputFile, JSON.stringify(categories, null, 2), 'utf8');
        console.log(`✓ Contents saved to: ${outputFile}`);
    }

    return categories;
}

/**
 * Parse songbook index file to JSON
 * 
 * Parses an index markdown file that contains song aliases and IDs,
 * and converts it to a structured JSON format (object with song_id: alias mapping).
 * 
 * @param {object} options - Optional configuration
 * @param {string} options.projectDir - The root directory of the project (default: process.cwd())
 * @param {string} options.indexFile - Path to index file (default: projectDir/index.md)
 * @param {string} options.outputFile - Path to output JSON file (default: projectDir/build/index.json)
 * @param {boolean} options.saveToFile - Whether to save to file (default: true)
 * 
 * @returns {Object} Object mapping song IDs to aliases
 * 
 * @example
 * // Default usage
 * const index = parseIndex();
 * 
 * @example
 * // Custom paths
 * parseIndex({
 *     indexFile: './INDEX.md',
 *     outputFile: './dist/index.json'
 * });
 * 
 * @example
 * // Just return data without saving
 * const index = parseIndex({ saveToFile: false });
 */
function parseIndex(options = {}) {
    const projectDir = options.projectDir || process.cwd();
    const defaults = getDefaultPaths(projectDir);
    const indexFile = options.indexFile || defaults.indexFile;
    const outputFile = options.outputFile || defaults.indexJsonFile;
    const saveToFile = options.saveToFile !== false;

    console.log(`Parsing index from: ${indexFile}`);

    if (!fs.existsSync(indexFile)) {
        throw new Error(`Index file not found: ${indexFile}`);
    }

    const index = getIndexJSON(indexFile);

    if (saveToFile) {
        const outputDir = path.dirname(outputFile);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        fs.writeFileSync(outputFile, JSON.stringify(index, null, 2), 'utf8');
        console.log(`✓ Index saved to: ${outputFile}`);
    }

    return index;
}

module.exports = {
    parseContents,
    parseIndex
};
