#!/usr/bin/env node

const { parseIndex } = require('./index');

// When run as a CLI, use the current working directory
try {
    parseIndex();
} catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
}
