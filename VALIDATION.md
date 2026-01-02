# Validation Workflow Summary

## Overview

I've implemented a comprehensive JSON validation workflow for your songbook project using AJV (Another JSON Schema Validator). The solution provides both programmatic APIs and CLI tools for validating JSON files.

## Schema Management

### Source Schema
**File:** `schema/song.source.js`

The validation schema is maintained in a simplified, readable JavaScript format:
- Clean object notation with nested schema definitions
- Separate schemas for Meta, Embed, and Verse structures
- Custom validation rules (e.g., author requirement logic)
- Easy to read and maintain

### Schema Build Process
**File:** `schema/build-schema.js`

Converts the source schema to JSON Schema format:

```bash
node schema/build-schema.js
```

This generates `schema/song.ajv-build.json` which is used by AJV for validation.

**Benefits:**
- Single source of truth in readable format
- Automatic generation of complex JSON Schema structures
- Type conversions (e.g., `type: [String]` → `{"type": "array", "items": {"type": "string"}}`)
- Handles nested schema references and custom rules

## What Was Added

### 1. JSON Schema Definition
**File:** `schema/song.ajv-build.json`

A complete JSON Schema that validates song JSON structure:

**Required root fields:** `meta`, `title`, `verses`

**Author validation rule:** Must have EITHER:
- Root-level `author` array, OR
- `meta.author` string, OR  
- `meta.no-author` set to `1`

**Meta object:**
- `first_line` (string, required) - First line of the song
- `page` (optional) - Page number as number, string (e.g., "11/2"), or array of numbers
- `author` (string, optional) - Author name in meta
- `no-author` (number, optional) - Must be `1` if present
- `translation` (string, optional) - Must be `"no"` if present
- `verse parentheses` (string, optional) - Must be `"non bold"` if present
- `inline verse` (string, optional) - Must be `"non bold"` if present

**Title:** Array of strings (at least one)

**Verses:** Array of verse objects (all fields optional):
- `number` (string) - Verse number
- `text` (array of strings, min 1 if present) - Verse lines
- `word_by_word` (array of strings) - Word-by-word translation
- `translation` (array of strings) - Verse translation
- `subtitle` (array of strings) - Verse subtitle

**Optional root-level fields:**
- `word_by_word` (array) - Word-by-word for entire song
- `author` (array) - Author(s) of the song
- `subtitle` (array) - Song subtitle(s)
- `embeds` (array) - Audio/video embeds

**Embeds:** Array of embed objects (all fields required):
- `title` (string, required)
- `embed_url` (string, required)
- `iframe_url` (string, required)
- `embed_code` (string, required)

### 2. Validation Module
**File:** `lib/validate.js`

Provides four main functions:

#### `validateSong(data, options)`
Validates a JSON object against the schema.

```javascript
const result = validateSong(songData);
// Returns: { valid: boolean, errors: array|null }
```

Options:
- `throwOnError` - Throws error instead of returning result

#### `validateSongFile(filePath, options)`
Validates a JSON file.

```javascript
const result = validateSongFile('./song.json');
// Returns: { valid: boolean, errors: array|null, file: string }
```

#### `validateDirectory(dirPath, options)`
Validates all JSON files in a directory.

```javascript
const results = validateDirectory('./example', { recursive: true });
// Returns: { totalFiles, validFiles, invalidFiles: [...] }
```

Options:
- `recursive` - Search subdirectories
- `throwOnError` - Throw on validation failure
- `pattern` - File matching pattern (default: '*.json')

#### `formatValidationResults(results)`
Pretty-prints validation results with emojis and formatting.

### 3. CLI Tool
**File:** `validate.js`

Command-line tool for validation:

```bash
# Validate default directory (./example)
npm run validate

# Validate specific directory
npx songbook-validate ./build/songs

# Recursive validation
npx songbook-validate ./build/songs --recursive
```

Features:
- Color-coded output with emojis
- Returns exit code 1 on validation failure (for CI/CD)
- Shows detailed error messages

### 4. Package Updates
**File:** `package.json`

- Added dependencies: `ajv`, `ajv-formats`
- Added script: `"validate": "node validate.js"`
- Added bin command: `"songbook-validate": "./validate.js"`

### 5. Main Module Exports
**File:** `index.js`

Validation functions are now exported from the main module:

```javascript
const { 
    validateSong, 
    validateSongFile, 
    validateDirectory,
    formatValidationResults 
} = require('songbook-md-json-parser');
```

### 6. Documentation
**File:** `README.md`

Added comprehensive validation documentation with:
- Usage examples for all validation functions
- CLI command examples
- Schema description

## Usage Patterns

### Pattern 1: Validate During Build
```javascript
const { parseSongs, validateDirectory } = require('songbook-md-json-parser');

// Parse songs
parseSongs();

// Validate output
const results = validateDirectory('./build/songs');
if (results.invalidFiles.length > 0) {
    console.error('Validation failed!');
    process.exit(1);
}
```

### Pattern 2: Pre-flight Check
```javascript
const { validateSong } = require('songbook-md-json-parser');

function saveSong(songData) {
    const result = validateSong(songData);
    if (!result.valid) {
        throw new Error('Invalid song data: ' + 
            result.errors.map(e => e.message).join(', '));
    }
    // Save to file...
}
```

### Pattern 3: CI/CD Integration
```bash
# In your CI pipeline
npm run build
npm run validate || exit 1
```

### Pattern 4: Validate Before Rendering
```javascript
const { validateDirectory, render } = require('songbook-md-json-parser');

// Validate JSON files before rendering
const results = validateDirectory('./json/songs');
console.log(`Valid: ${results.validFiles}/${results.totalFiles}`);

if (results.validFiles === results.totalFiles) {
    render(); // Convert back to markdown
}
```

## Benefits

1. **Type Safety:** Ensures JSON files match expected structure
2. **Early Error Detection:** Catch issues before they cause runtime errors
3. **Multiple Interfaces:** Programmatic API, CLI, and npm scripts
4. **Detailed Error Messages:** Know exactly what's wrong and where
5. **Flexible:** Validate single files, objects, or entire directories
6. **CI/CD Ready:** Exit codes and formatting suitable for automation
7. **Standards-Based:** Uses JSON Schema Draft 07

## Testing

The validation has been tested with your example file:

```bash
$ npm run validate

🔍 Validating JSON files in: .../example

📊 Validation Results:
   Total files: 1
   ✅ Valid: 1
   ❌ Invalid: 0
✨ All files are valid!
```

## Next Steps

1. Run `pnpm install` to install AJV dependencies (already done)
2. Test validation: `npm run validate`
3. Modify schema: Edit `schema/song.source.js` and run `node schema/build-schema.js`
4. Integrate validation into your build process
5. Add validation to your CI/CD pipeline

## Files Created/Modified

**Created:**
- `schema/song.source.js` - Source schema in readable format
- `schema/build-schema.js` - Schema converter
- `schema/song.ajv-build.json` - Generated JSON Schema for AJV
- `lib/validate.js` - Validation module
- `validate.js` - CLI tool
- `VALIDATION.md` - This document

**Modified:**
- `package.json` - Added dependencies and scripts
- `index.js` - Exported validation functions
- `README.md` - Added validation documentation
