#!/usr/bin/env node

const { listAuthors } = require('./lib/list-authors');

/**
 * CLI tool to list all unique authors from built JSON song files
 * 
 * Usage:
 *   songbook-list-authors [options]
 *   
 * Options:
 *   --json-dir    Custom JSON directory path
 *   --help        Show help
 * 
 * Examples:
 *   songbook-list-authors
 *   songbook-list-authors --json-dir=./custom/path
 */

// Parse CLI arguments
const args = process.argv.slice(2);
const showHelp = args.includes('--help') || args.includes('-h');

// Parse --json-dir argument
let jsonDir;
const jsonDirArg = args.find(arg => arg.startsWith('--json-dir'));
if (jsonDirArg) {
    jsonDir = jsonDirArg.split('=')[1] || args[args.indexOf(jsonDirArg) + 1];
}

if (showHelp) {
    console.log(`
Usage: songbook-list-authors [options]

List all unique authors from built JSON song files.
This command should be run after 'songbook-build'.
Takes only the first author from each song's author array.

Options:
  --json-dir <path>      Custom JSON directory path (default: json/songs)
  --help, -h             Show this help message

Examples:
  songbook-list-authors                        # List primary authors
  songbook-list-authors --json-dir=./custom    # Use custom directory
`);
    process.exit(0);
}

try {
    console.log('Reading authors from JSON files...\n');
    
    const options = {};
    if (jsonDir) {
        options.jsonDir = jsonDir;
    }
    
    const authors = listAuthors(options);
    
    if (authors.length === 0) {
        console.log('No authors found.');
    } else {
        console.log(`Found ${authors.length} unique author${authors.length === 1 ? '' : 's'}:\n`);
        authors.forEach((author, index) => {
            console.log(`${(index + 1).toString().padStart(3)}. ${author}`);
        });
    }
    
    process.exit(0);
} catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
}
