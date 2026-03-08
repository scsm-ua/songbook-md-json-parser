# Schema & Validation

Technical documentation for the JSON schema and validation system.

## Schema Overview

Songs are validated against a JSON Schema that ensures structural correctness.

### Required Fields

- `meta` - Metadata object
  - `first_line` (string, required) - First line of the song
- `title` - Array of strings (at least 1)
- `verses` - Array of verse objects (at least 1)

### Optional Fields

- `author` - Array of author names
- `subtitle` - Array of subtitle strings  
- `word_by_word` - Array for word-by-word translation
- `embeds` - Array of audio/video embed objects

### Meta Object

- `first_line` (string, **required**)
- `page` (number | string | array) - Page number(s)
- `author` (string) - Author name in meta
- `no-author` (number) - Must be `1` if present
- `translation` (string) - Must be `"no"` if present
- `verse parentheses` (string) - Must be `"non bold"` if present
- `inline verse` (string) - Must be `"non bold"` if present

### Verse Object

All fields optional:
- `number` (string) - Verse number
- `text` (array of strings) - Verse lines (min 1 if present)
- `word_by_word` (array of strings) - Word-by-word translation
- `translation` (array of strings) - Verse translation
- `subtitle` (array of strings) - Verse subtitle

### Embed Object

All fields required:
- `title` (string)
- `embed_url` (string)
- `iframe_url` (string)
- `embed_code` (string)

### Author Validation Rule

At least ONE of these must be present:
- Root-level `author` array
- `meta.author` string
- `meta.no-author` set to `1`

## Schema Files

### Source Schema
**File:** `schema/song.source.js`

The schema is maintained in a readable JavaScript format:

```javascript
module.exports = {
  MetaSchema: {
    type: Object,
    properties: {
      first_line: { type: String, required: true },
      page: { type: [Number, String, [Number]] },
      // ...
    }
  },
  
  SongSchema: {
    type: Object,
    required: ['meta', 'title', 'verses'],
    properties: {
      meta: { $ref: '#/definitions/MetaSchema' },
      // ...
    }
  },
  
  custom_rules: {
    author_required: { /* anyOf rule */ }
  }
}
```

**Benefits:**
- Clean, readable format
- Easy to modify
- Single source of truth
- Nested schema definitions

### Building the Schema

Convert source to JSON Schema for AJV:

```bash
npm run build:schema
# or
node schema/build-schema.js
```

This generates `schema/song.ajv-build.json` from `schema/song.source.js`.

**Build process:**
1. Reads `schema/song.source.js`
2. Converts simplified format to JSON Schema
3. Type conversions: `String` → `{"type": "string"}`, `[String]` → `{"type": "array", "items": {"type": "string"}}`
4. Resolves `$ref` references
5. Applies custom rules
6. Writes `schema/song.ajv-build.json`

## Validation API

### validateSong(data, options)

Validates a song object.

```javascript
const { validateSong } = require('songbook-md-json-parser');

const result = validateSong(songData);
// Returns: { valid: boolean, errors: array|null }

if (!result.valid) {
  console.error(result.errors);
}
```

**Options:**
- `throwOnError` (boolean) - Throw error instead of returning result

### validateSongFile(filePath, options)

Validates a JSON file.

```javascript
const { validateSongFile } = require('songbook-md-json-parser');

const result = validateSongFile('./song.json');
// Returns: { valid: boolean, errors: array|null, file: string }
```

### validateDirectory(dirPath, options)

Validates all JSON files in a directory.

```javascript
const { validateDirectory } = require('songbook-md-json-parser');

const results = validateDirectory('./json/songs', { recursive: true });
// Returns: { totalFiles, validFiles, invalidFiles: [...] }

if (results.invalidFiles.length > 0) {
  console.error('Validation failed!');
}
```

**Options:**
- `recursive` (boolean) - Search subdirectories
- `throwOnError` (boolean) - Throw on validation failure
- `pattern` (string) - File matching pattern (default: '*.json')

### formatValidationResults(results)

Pretty-prints validation results.

```javascript
const { validateDirectory, formatValidationResults } = require('songbook-md-json-parser');

const results = validateDirectory('./json/songs');
console.log(formatValidationResults(results));
```

## Validation Testing

### Test Fixtures

Located in `test-fixtures/`:

**Valid examples** (`test-fixtures/valid/`):
- Reference implementations
- Example song files that pass validation

**Invalid test cases** (`test-fixtures/invalid/`):

1. `missing-required-fields.json` - Missing `first_line` and `verses`
2. `missing-author.json` - No author field (violates anyOf rule)
3. `empty-title-array.json` - Title array is empty (violates minItems)
4. `empty-verses-array.json` - Verses array is empty (violates minItems)
5. `invalid-page-type.json` - Wrong type for page
6. `additional-properties.json` - Unexpected properties
7. `malformed-json.json` - Invalid JSON syntax

### Running Tests

```bash
# Test with valid files (exit code 0)
npm run validate

# Test with invalid files (exit code 1)
npm run validate:invalid

# Run all automated tests
npm test
```

### Manual Testing

```bash
# Test specific directory
node validate.js ./test-fixtures/valid

# Check exit code (bash/zsh)
echo $?  # Prints 0 for success, 1 for failure

# Use in scripts
node validate.js ./json/songs && echo "✅ Passed" || echo "❌ Failed"
```

## Exit Codes

The validation tools follow Unix conventions:

- **Exit 0** - All files valid ✅
- **Exit 1** - Validation failed ❌

**Implementation:**

```javascript
const results = validateDirectory(dirPath);

if (results.invalidFiles.length > 0) {
  process.exit(1);  // Fail
}
// Success (implicit exit 0)
```

## Error Output

When validation fails, you'll see detailed messages:

```
🔍 Validating JSON files in: /path/to/files

📊 Validation Results:
   Total files: 7
   ✅ Valid: 0
   ❌ Invalid: 7

❌ Invalid Files:

1. /path/to/missing-required-fields.json
   • root: must have required property 'verses'
   • /meta: must have required property 'first_line'

2. /path/to/missing-author.json
   • root: must match a schema in anyOf
```

## CI/CD Integration

The validation system is designed for CI/CD:

**GitHub Actions Example:**

```yaml
- name: Validate songs
  run: npm run validate
```

The workflow fails if validation returns exit code 1.

**Using the reusable workflow:**

```yaml
jobs:
  validate:
    uses: scsm-ua/songbook-md-json-parser/.github/workflows/songbook-validate.yml@main
```

Automatically runs:
1. Build
2. Validation  
3. Authors test
4. Comments on PR with errors

## Schema Modification

To modify the schema:

1. **Edit source:** `schema/song.source.js`
2. **Rebuild:** `npm run build:schema`
3. **Test:** `npm run validate`
4. **Update tests:** Add new test fixtures if needed

### Example: Add New Field

```javascript
// schema/song.source.js
MetaSchema: {
  properties: {
    // ...existing fields...
    new_field: { 
      type: String, 
      enum: ['value1', 'value2'] 
    }
  }
}
```

Then rebuild:
```bash
npm run build:schema
```

## Best Practices

1. **Always validate after build** - Catch errors early
2. **Use exit codes in CI/CD** - Automatic failure detection
3. **Keep schema source readable** - Use `song.source.js`, not JSON
4. **Add test fixtures for new rules** - Document expected behavior
5. **Rebuild schema after changes** - Run `npm run build:schema`

## Troubleshooting

**Q: Schema changes not taking effect**
- Run `npm run build:schema` after modifying `song.source.js`

**Q: Validation passes locally but fails in CI**
- Check you're validating the same directory
- Ensure all files are committed to git

**Q: Want to validate without exiting**
- Use the API instead of CLI:
  ```javascript
  const results = validateDirectory('./json/songs');
  // Handle results without process.exit()
  ```

**Q: Need custom validation logic**
- Add to `custom_rules` in `song.source.js`
- Rebuild with `npm run build:schema`
