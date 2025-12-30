#!/usr/bin/env node

const { parseContents } = require('./index');

// When run as a CLI, use the current working directory
try {
    parseContents();
} catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
}
