const fs = require('fs');
const path = require('path');
const { getDefaultPaths } = require('./config');

/**
 * List all unique authors from built JSON song files
 * 
 * Reads all JSON files from the songs directory and extracts unique author names.
 * Only takes the first author from each song's author array.
 * Returns a sorted array of unique authors.
 * 
 * @param {object} options - Optional configuration
 * @param {string} options.projectDir - The root directory of the project (default: process.cwd())
 * @param {string} options.jsonDir - Custom JSON directory (default: projectDir/json/songs)
 * 
 * @returns {string[]} Array of unique author names, sorted alphabetically
 * 
 * @example
 * // Default usage - uses current working directory
 * const authors = listAuthors();
 * console.log(authors);
 * 
 * @example
 * // Custom JSON directory
 * const authors = listAuthors({ jsonDir: './dist/songs' });
 */
function listAuthors(options = {}) {
    const projectDir = options.projectDir || process.cwd();
    const defaults = getDefaultPaths(projectDir);
    const jsonDir = options.jsonDir || defaults.jsonDir;

    if (!fs.existsSync(jsonDir)) {
        throw new Error(`JSON directory not found: ${jsonDir}\nRun 'songbook-build' first to generate JSON files.`);
    }

    const files = fs.readdirSync(jsonDir).filter(f => f.endsWith('.json'));
    
    if (files.length === 0) {
        throw new Error(`No JSON files found in: ${jsonDir}\nRun 'songbook-build' first to generate JSON files.`);
    }

    const authorsSet = new Set();

    for (const file of files) {
        const filePath = path.join(jsonDir, file);
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const song = JSON.parse(content);

            const author = song.meta.author || (song.author && Array.isArray(song.author) && song.author.length > 0 && song.author[0].trim())
            if (author) {
                authorsSet.add(author);
            }
        } catch (error) {
            console.warn(`⚠ Warning: Could not read or parse ${file}:`, error.message);
        }
    }

    return Array.from(authorsSet).sort();
}

module.exports = { listAuthors };
