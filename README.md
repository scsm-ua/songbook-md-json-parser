# Songbook MD JSON Parser

Converts markdown song files to structured JSON format with validation.

## Installation

```bash
npm install songbook-md-json-parser
```

## Quick Start for Songbook Projects

### 1. Add to package.json

```json
{
  "scripts": {
    "build": "songbook-build",
    "validate": "songbook-validate ./json/songs",
    "update-authors": "npm run build && songbook-list-authors > authors.log",
    "test:authors": "songbook-test-authors"
  }
}
```

### 2. Run build

```bash
npm run build
```

This parses all markdown files from `./songs` to `./json/songs`.

### 3. Validate

```bash
npm run validate
```

Validates all JSON files against the schema.

## GitHub Actions

Use the reusable workflow in your songbook repo:

```yaml
name: Validate Songbook

on: [push, pull_request]

jobs:
  validate:
    uses: scsm-ua/songbook-md-json-parser/.github/workflows/songbook-validate.yml@main
```

This workflow automatically:
- ✅ Builds the songbook
- ✅ Validates JSON files
- ✅ Tests authors list (if `authors.log` exists)
- ✅ Comments on PR if validation fails

## Authors List Testing

Track changes to song authors automatically.

### Setup

1. **Generate baseline:**
   ```bash
   npm run update-authors
   git add authors.log
   git commit -m "Add authors baseline"
   ```

2. **Test automatically** - The GitHub Actions workflow tests this on every PR

3. **Update when needed:**
   ```bash
   npm run update-authors
   ```

The test fails if authors change, preventing accidental modifications.

## Available Commands

After installing this package, you can use:

### Build Commands
- `songbook-build` - Build everything (songs + metadata)
- `songbook-parse-songs` - Parse songs from `./songs` to `./json/songs`
- `songbook-parse-contents` - Parse `CONTENTS.md` to `json/contents.json`
- `songbook-parse-index` - Parse `INDEX.md` to `json/index.json`

### Validation Commands
- `songbook-validate <dir>` - Validate JSON files
- `songbook-validate <dir> --recursive` - Validate recursively

### Authors Commands
- `songbook-list-authors` - Display all unique authors
- `songbook-test-authors` - Test authors against `authors.log`

## Project Structure

```
your-songbook/
├── songs/              # Input: Markdown files
│   ├── song1.md
│   └── song2.md
├── json/              # Output: Generated JSON
│   └── songs/
│       ├── song1.json
│       └── song2.json
├── authors.log        # Authors baseline (for testing)
├── CONTENTS.md        # Songbook table of contents
├── INDEX.md           # Song aliases and IDs
└── package.json
```

## Using as a Library

```javascript
const { build, parseSongs, validateDirectory } = require('songbook-md-json-parser');

// Build everything
build();

// Parse with custom options
parseSongs({
  projectDir: __dirname,
  inputDir: './custom-songs',
  outputDir: './dist/songs'
});

// Validate
const results = validateDirectory('./dist/songs');
if (results.invalidFiles.length > 0) {
  console.error('Validation failed!');
  process.exit(1);
}
```

### Main API

- `build(options)` - Build all (songs, contents, index)
- `parseSongs(options)` - Parse markdown to JSON
- `render(options)` - Render JSON back to markdown
- `parseContents(options)` - Parse CONTENTS.md
- `parseIndex(options)` - Parse INDEX.md
- `validateSong(data)` - Validate song object
- `validateSongFile(path)` - Validate song file
- `validateDirectory(path, options)` - Validate all files
- `listAuthors(options)` - Get unique authors list

## Song Markdown Format

```markdown
---
page: 123
first_line: "First line of the song"
---

# Song Title

## Subtitle (optional)

Verse 1 line 1
Verse 1 line 2

[Translation]
Translation line 1
Translation line 2
```

## Validation

The package validates JSON against a strict schema:

- **Required:** `meta` (with `first_line`), `title`, `verses`
- **Optional:** `author`, `subtitle`, `word_by_word`, `embeds`
- **Author rules:** Must have root `author`, `meta.author`, or `meta.no-author: 1`

Run validation:
```bash
songbook-validate ./json/songs
```

Returns exit code 1 if validation fails (perfect for CI/CD).

## Documentation

- **[SCHEMA.md](SCHEMA.md)** - Schema details, validation testing, development

## Development

This repository includes automated tests:

```bash
npm test  # Runs validation tests on valid and invalid fixtures
```

Tests run automatically on push/PR via GitHub Actions.

## License

ISC
