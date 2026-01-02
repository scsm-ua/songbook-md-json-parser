# Validation Testing Guide

This document explains how validation exit codes work and how to test them.

## Exit Code Implementation

The `validate.js` script follows standard Unix exit code conventions:

- **Exit Code 0**: All files passed validation ✅
- **Exit Code 1**: Validation failed (errors found) ❌

### Implementation Details

Located in [validate.js](validate.js):

```javascript
try {
  const results = validateDirectory(dirPath, { recursive });
  console.log(formatValidationResults(results));
  
  // Exit with error code if validation failed
  if (results.invalidFiles.length > 0) {
    process.exit(1);  // ❌ Validation failed
  } else {
    console.log('✨ All files are valid!\n');
    // Implicit exit code 0 ✅
  }
} catch (error) {
  console.error(`\n❌ Error: ${error.message}\n`);
  process.exit(1);  // ❌ Runtime error
}
```

## Error Collection

The validator **collects ALL errors** before exiting, ensuring you see all issues at once:

1. Scans all JSON files in the directory
2. Validates each file against the schema
3. Collects all validation errors
4. Reports all errors together
5. Exits with appropriate code

## Testing

### Test Fixtures

Test files are organized in `test-fixtures/`:

**Valid examples** in `test-fixtures/valid/`:
- Example song files that pass validation
- Used as reference for correct schema usage

**Invalid test cases** in `test-fixtures/invalid/`:

1. **missing-required-fields.json** - Missing `first_line` and `verses`
2. **missing-author.json** - No author field (violates custom anyOf rule)
3. **empty-title-array.json** - Title array is empty (violates minItems: 1)
4. **empty-verses-array.json** - Verses array is empty (violates minItems: 1)
5. **invalid-page-type.json** - Page is boolean instead of number/string/array
6. **additional-properties.json** - Contains unexpected properties
7. **malformed-json.json** - Invalid JSON syntax

### Running Tests

```bash
# Test with valid files (should exit 0)
npm run validate

# Test with invalid files (should exit 1)
npm run validate:invalid

# Run automated exit code tests
npm test
# or
npm run test
```

### Manual Testing

```bash
# Test with valid files
node validate.js ./test-fixtures/valid

# Test with invalid files
node validate.js ./test-fixtures/invalid

# Check exit code (bash/zsh)
echo $?  # Should print 1 if validation failed

# Test in CI/CD
node validate.js ./json/songs && echo "Passed!" || echo "Failed!"
```

## GitHub Actions Integration

Example workflow:

```yaml
name: Validate Songs

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Validate song files
        run: npm run validate
        # This step will fail the workflow if validation exits with code 1
```

## Error Output Format

When validation fails, you'll see detailed error messages:

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

...
```

## Best Practices

1. **Always run validation before committing** - Catch errors early
2. **Use in CI/CD** - Prevent invalid files from being merged
3. **Check exit codes** - Scripts and CI tools rely on proper exit codes
4. **Fix all errors at once** - Validator shows all errors, not just the first one

## Troubleshooting

**Q: Validation passes locally but fails in CI**
- Check that you're validating the same directory
- Ensure all files are committed to git

**Q: Exit code is always 0**
- Make sure you're checking `$?` immediately after the command
- Verify the command is actually failing (check output)

**Q: Want to validate without exiting**
- Use the library API instead:
  ```javascript
  const { validateDirectory } = require('songbook-md-json-parser/lib/validate');
  const results = validateDirectory('./json/songs');
  // Handle results without exiting
  ```
