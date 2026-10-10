#!/usr/bin/env node

const { validateDirectory, formatValidationResults } = require('./lib/validate');
const { getDefaultPaths } = require('./lib/config');
const path = require('path');

// Get directory from command line arguments or use default from config
const defaultPaths = getDefaultPaths(process.cwd());
const recursive = process.argv.includes('--recursive') || process.argv.includes('-r');

// Schema type is mandatory: --type song | page
const VALID_TYPES = ['song', 'page'];
const typeIndex = process.argv.indexOf('--type');
const type = typeIndex !== -1 ? process.argv[typeIndex + 1] : null;

if (!type || !VALID_TYPES.includes(type)) {
  console.error('\n❌ Error: --type is required. Specify the schema type to validate against:');
  console.error('   --type song');
  console.error('   --type page\n');
  process.exit(1);
}

// First non-flag argument is the directory
const positional = process.argv.slice(2).filter((arg, i, arr) => {
  if (arg.startsWith('-')) return false;
  if (arr[i - 1] === '--type') return false;
  return true;
});
const dirPath = positional[0] || (type === 'page' ? defaultPaths.pagesJsonDir : defaultPaths.jsonDir);

console.log(`\n🔍 Validating ${type} JSON files in: ${path.resolve(dirPath)}`);
if (recursive) {
  console.log('   (Recursive mode enabled)');
}

try {
  const results = validateDirectory(dirPath, { recursive, type });
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
