#!/usr/bin/env node

const { parseSongs } = require('./lib/parse-songs');
const { parseContents, parseIndex } = require('./lib/parse-meta');

/**
 * Build all songbook files
 * 
 * Runs all parsing operations:
 * - Parse songs from markdown to JSON
 * - Parse CONTENTS.md to JSON
 * - Parse INDEX.md to JSON
 * 
 * @param {object} options - Optional configuration
 * @param {string} options.projectDir - The root directory of the project (default: process.cwd())
 * @param {boolean} options.songs - Whether to parse songs (default: true)
 * @param {boolean} options.contents - Whether to parse contents (default: true)
 * @param {boolean} options.index - Whether to parse index (default: true)
 * @param {object} options.songsOptions - Options to pass to parseSongs
 * @param {object} options.contentsOptions - Options to pass to parseContents
 * @param {object} options.indexOptions - Options to pass to parseIndex
 * 
 * @example
 * // Default usage - parse everything
 * build();
 * 
 * @example
 * // Parse only songs and contents
 * build({ index: false });
 * 
 * @example
 * // With custom options for each parser
 * build({
 *     songsOptions: { inputDir: './custom-songs' },
 *     contentsOptions: { contentsFile: './custom-contents.md' }
 * });
 */
function build(options = {}) {
    const {
        projectDir = process.cwd(),
        songs = true,
        contents = true,
        index = true,
        songsOptions = {},
        contentsOptions = {},
        indexOptions = {}
    } = options;

    console.log('Building songbook...\n');

    const results = {
        songs: null,
        contents: null,
        index: null
    };

    try {
        if (songs) {
            console.log('=== Parsing Songs ===');
            parseSongs({ projectDir, ...songsOptions });
            results.songs = 'success';
            console.log();
        }

        if (contents) {
            console.log('=== Parsing Contents ===');
            try {
                results.contents = parseContents({ projectDir, ...contentsOptions });
            } catch (error) {
                console.warn('⚠ Contents parsing failed:', error.message);
                results.contents = 'skipped';
            }
            console.log();
        }

        if (index) {
            console.log('=== Parsing Index ===');
            try {
                results.index = parseIndex({ projectDir, ...indexOptions });
            } catch (error) {
                console.warn('⚠ Index parsing failed:', error.message);
                results.index = 'skipped';
            }
            console.log();
        }

        console.log('✓ Build complete!');
        return results;

    } catch (error) {
        console.error('✗ Build failed:', error.message);
        throw error;
    }
}

// When run as a CLI
if (require.main === module) {
    try {
        build();
    } catch (error) {
        process.exit(1);
    }
}

module.exports = { build };
