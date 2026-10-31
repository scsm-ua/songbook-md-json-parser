#!/usr/bin/env node

const fs = require('fs');
const { validateDirectory, formatValidationResults } = require('./lib/validate');
const { getDefaultPaths } = require('./lib/config');
const path = require('path');

// Get directory from command line arguments or use default from config
const defaultPaths = getDefaultPaths(process.cwd());
const recursive = process.argv.includes('--recursive') || process.argv.includes('-r');

// Optional schema type: --type song | page
const VALID_TYPES = ['song', 'page'];
const typeIndex = process.argv.indexOf('--type');
const type = typeIndex !== -1 ? process.argv[typeIndex + 1] : null;

if (type && !VALID_TYPES.includes(type)) {
  console.error('\n❌ Error: invalid --type. Valid values:');
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
const dirPath = positional[0] || null;

// An explicit directory needs an explicit schema type
if (dirPath && !type) {
  console.error('\n❌ Error: --type is required when a directory is specified:');
  console.error('   --type song');
  console.error('   --type page\n');
  process.exit(1);
}

// Build list of validation targets:
// - with --type: validate that type (given dir or its default dir)
// - without --type: validate all default dirs that exist (songs + pages)
const targets = [];
if (type) {
  targets.push({
    type,
    dir: dirPath || (type === 'page' ? defaultPaths.pagesJsonDir : defaultPaths.jsonDir)
  });
} else {
  targets.push({ type: 'song', dir: defaultPaths.jsonDir });
  if (fs.existsSync(defaultPaths.pagesJsonDir)) {
    targets.push({ type: 'page', dir: defaultPaths.pagesJsonDir });
  }
}

let hasErrors = false;

for (const target of targets) {
  console.log(`\n🔍 Validating ${target.type} JSON files in: ${path.resolve(target.dir)}`);
  if (recursive) {
    console.log('   (Recursive mode enabled)');
  }

  try {
    const results = validateDirectory(target.dir, { recursive, type: target.type });
    console.log(formatValidationResults(results));

    if (results.invalidFiles.length > 0) {
      hasErrors = true;
    }
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    hasErrors = true;
  }
}

if (hasErrors) {
  process.exit(1);
} else {
  console.log('✨ All files are valid!\n');
}
