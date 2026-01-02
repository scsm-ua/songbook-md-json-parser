#!/usr/bin/env node

const { validateDirectory, formatValidationResults } = require('./lib/validate');
const { getDefaultPaths } = require('./lib/config');
const path = require('path');

// Get directory from command line arguments or use default from config
const defaultPaths = getDefaultPaths(process.cwd());
const dirPath = process.argv[2] || defaultPaths.jsonDir;
const recursive = process.argv.includes('--recursive') || process.argv.includes('-r');

console.log(`\n🔍 Validating JSON files in: ${path.resolve(dirPath)}`);
if (recursive) {
  console.log('   (Recursive mode enabled)');
}

try {
  const results = validateDirectory(dirPath, { recursive });
  console.log(formatValidationResults(results));
  
  // Exit with error code if validation failed
  if (results.invalidFiles.length > 0) {
    process.exit(1);
  } else {
    console.log('✨ All files are valid!\n');
  }
} catch (error) {
  console.error(`\n❌ Error: ${error.message}\n`);
  process.exit(1);
}
