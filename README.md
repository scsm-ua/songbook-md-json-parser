# Songbook MD to JSON Parser

A reusable Node.js package that converts markdown song files into structured JSON format.

## Installation

```bash
npm install songbook-md-json-parser
```

Or install from a local path or git repository:

```bash
npm install /path/to/songbook-md-json-parser
# or
npm install github:username/songbook-md-json-parser
```

## Usage

### Validation

The package includes a comprehensive JSON validation system using AJV:

#### Validate a Single JSON File

```javascript
const { validateSongbookFile } = require('songbook-md-json-parser/lib/validate');

// Validate a file
const result = validateSongbookFile('./example/json/my-song.json');

if (result.valid) {
    console.log('✅ Valid!');
} else {
    console.error('❌ Validation errors:', result.errors);
}

// Throw on error
try {
    validateSongbookFile('./song.json', { throwOnError: true });
} catch (error) {
    console.error('Validation failed:', error.message);
}
```

#### Validate a JSON Object

```javascript
const { validateSongbook } = require('songbook-md-json-parser/lib/validate');

const songData = {
    meta: { page: 120, first_line: "song lyrics" },
    title: ["Song Title"],
    verses: [
        { number: "1", text: ["verse line 1", "verse line 2"] }
    ]
};

const result = validateSongbook(songData);
if (!result.valid) {
    console.error(result.errors);
}
```

#### Validate All Files in a Directory

```javascript
const { validateDirectory, formatValidationResults } = require('songbook-md-json-parser/lib/validate');

// Validate all JSON files in a directory
const results = validateDirectory('./example/json');
console.log(formatValidationResults(results));

// Recursive validation
const results = validateDirectory('./build/songs', { recursive: true });

// Results object structure:
// {
//   totalFiles: 5,
//   validFiles: 4,
//   invalidFiles: [
//     { file: 'path/to/file.json', errors: [...] }
//   ]
// }
```

#### CLI Validation

```bash
# Validate files in the example directory
npm run validate

# Or with npx
npx songbook-validate ./example/json

# Validate recursively
npx songbook-validate ./build/songs --recursive
```

### As a Package in Another Project

```javascript
const { build, parseSongs, render } = require('songbook-md-json-parser');

// Build everything - parse songs, contents, and index
build();

// Or parse individually
parseSongs();  // Parse markdown to JSON (./songs -> ./build/songs)
render();      // Render JSON back to markdown (./build/songs -> ./songs)

// Build with options
build({
    songs: true,      // Parse songs (default: true)
    contents: true,   // Parse CONTENTS.md (default: true)
    index: true       // Parse INDEX.md (default: true)
});

// Specify a project directory
parseSongs({ projectDir: __dirname });

// Or with custom paths
parseSongs({
    inputDir: './custom-songs',
    outputDir: './output/songs'
});

// Render with custom JSON preparation (e.g., remove translations)
render({
    prepareJson: (json) => {
        json.meta = json.meta || {};
        json.meta.translation = 'no';
        delete json.verses?.forEach(v => delete v.translation);
    }
});
```

### As an npm Script

Add to your project's `package.json`:

```json
{
  "scripts": {
    "build": "songbook-build",
    "parse:songs": "songbook-parse-songs",
    "parse:contents": "songbook-parse-contents",
    "parse:index": "songbook-parse-index"
  }
}
```

Then run:

```bash
npm run build            # Build everything (songs, contents, index)
npm run parse:songs      # Parse markdown songs to JSON only
npm run parse:contents   # Parse CONTENTS.md to JSON only
npm run parse:index      # Parse INDEX.md to JSON only
npm run validate         # Validate JSON files
```

### Using CLI Commands Directly

You can also run the CLI commands directly using npx:

```bash
npx songbook-build              # Build everything
npx songbook-parse-songs        # Parse songs from markdown to JSON
npx songbook-parse-contents     # Parse contents file
npx songbook-parse-index        # Parse index file
npx songbook-validate           # Validate JSON files
```

These commands will:
- `songbook-build`: Parse songs, CONTENTS.md, and INDEX.md (all operations)
- `songbook-parse-songs`: Parse songs from `./songs` to `./build/songs`
- `songbook-parse-contents`: Parse `./CONTENTS.md` to `./build/contents.json`
- `songbook-parse-index`: Parse `./INDEX.md` to `./build/index.json`

## Project Structure

Your project should have a `songs` folder containing markdown files:

```
your-project/
├── songs/
│   ├── song1.md
│   ├── song2.md
│   └── ...
└── build/
    └── songs/
        ├── song1.json
        ├── song2.json
        └── ...
```build(options)`

Runs all parsing operations (songs, contents, and index).

**Parameters:**
- `options` (object, optional):
  - `projectDir` (string): The root directory of your project (default: `process.cwd()`)
  - `songs` (boolean): Whether to parse songs (default: `true`)
  - `contents` (boolean): Whether to parse contents (default: `true`)
  - `index` (boolean): Whether to parse index (default: `true`)
  - `songsOptions` (object): Options to pass to parseSongs
  - `contentsOptions` (object): Options to pass to parseContents
  - `indexOptions` (object): Options to pass to parseIndex

**Example:**

```javascript
const { build } = require('songbook-md-json-parser');

// Default usage - parse everything
build();

// Parse only songs and contents
build({ index: false });

// With custom options for each parser
build({
    songsOptions: { inputDir: './custom-songs' },
    contentsOptions: { contentsFile: './my-contents.md' }
});
```

### `

## API

### `parseSongs(options)`

Converts all markdown files in the songs directory to JSON.

**Parameters:**
- `options` (object, optional):
  - `projectDir` (string): The root directory of your project (default: `process.cwd()`)
  - `inputDir` (string): Custom input directory (default: `projectDir/songs`)
  - `outputDir` (string): Custom output directory (default: `projectDir/build/songs`)

**Example:**

```javascript
const { parseSongs } = require('songbook-md-json-parser');

// Default usage - uses current working directory
parseSongs();

// Specify project directory
parseSongs({ projectDir: __dirname });

// Custom paths
parseSongs({
    inputDir: './my-songs',
    outputDir: './dist/songs'
});
```

### `render(options)`

Converts JSON files back to markdown format (reverse operation).

**Parameters:**
- `options` (object, optional):
  - `projectDir` (string): The root directory of your project (default: `process.cwd()`)
  - `jsonDir` (string): Directory containing JSON files (default: `projectDir/build/songs`)
  - `mdDir` (string): Output directory for markdown files (default: `projectDir/songs`)
  - `prepareJson` (function): Optional callback to modify JSON data before rendering

**Example:**

```javascript
const { render } = require('songbook-md-json-parser');

// Default usage
render();

// Custom paths
render({
    jsonDir: './dist/songs',
    mdDir: './output'
});

// With prepareJson callback to remove translations
render({
    prepareJson: (json) => {
        json.meta = json.meta || {};
        json.meta.translation = 'no';
        json.verses?.forEach(v => {
            delete v.translation;
        });
    }
});
```

### `parseContents(options)`

Parses a songbook contents file (categories and song lists) to JSON.

**Parameters:**
- `options` (object, optional):
  - `projectDir` (string): The root directory of your project (default: `process.cwd()`)
  - `contentsFile` (string): Path to contents file (default: `projectDir/CONTENTS.md`)
  - `outputFile` (string): Path to output JSON file (default: `projectDir/build/contents.json`)
  - `saveToFile` (boolean): Whether to save to file (default: `true`)

**Returns:** Array of categories with items

**Example:**

```javascript
const { parseContents } = require('songbook-md-json-parser');

// Default usage - parses CONTENTS.md and saves to build/contents.json
const categories = parseContents();

// Custom paths
parseContents({
    contentsFile: './my-contents.md',
    outputFile: './dist/contents.json'
});

// Just return data without saving to file
const data = parseContents({ saveToFile: false });
```

### `parseIndex(options)`

Parses a songbook index file (song aliases and IDs) to JSON.

**Parameters:**
- `options` (object, optional):
  - `projectDir` (string): The root directory of your project (default: `process.cwd()`)
  - `indexFile` (string): Path to index file (default: `projectDir/INDEX.md`)
  - `outputFile` (string): Path to output JSON file (default: `projectDir/build/index.json`)
  - `saveToFile` (boolean): Whether to save to file (default: `true`)

**Returns:** Object mapping song IDs to aliases

**Example:**

```javascript
const { parseIndex } = require('songbook-md-json-parser');

// Default usage - parses INDEX.md and saves to build/index.json
const index = parseIndex();

// Custom paths
parseIndex({
    indexFile: './my-index.md',
    outputFile: './dist/index.json'
});

// Just return data without saving to file
const data = parseIndex({ saveToFile: false });
```

### `Song`

The Song class for parsing and rendering individual songs.

```javascript
const { Song } = require('songbook-md-json-parser');

const song = new Song({ text: markdownContent });
console.log(song.json); // Parsed song data
```

### `processFiles`

Low-level utility for processing files with custom logic.

```javascript
const { processFiles } = require('songbook-md-json-parser');

processFiles({
    inputDir: './input',
    outputDir: './output',
    inExt: '.md',
    outExt: '.json',
    processContent: (content) => {
        // Your custom processing logic
        return transformedContent;
    }
});
```

## Validation

The package includes JSON Schema validation using AJV. See the [Validation](#validation) section above for details.

### Schema Source

The validation schema is maintained in a simplified source format at [schema/song.source.js](schema/song.source.js) with:
- Clean, readable JavaScript object notation
- Nested schema definitions (MetaSchema, EmbedSchema, VerseSchema)
- Custom validation rules in `custom_rules`

To regenerate the JSON Schema after modifying the source:

```bash
node schema/build-schema.js
```

This converts [schema/song.source.js](schema/song.source.js) to [schema/song.ajv-build.json](schema/song.ajv-build.json) for AJV validation.

### Schema Validation

The schema is located at [schema/song.ajv-build.json](schema/song.ajv-build.json) and validates:
- Required fields: `meta`, `title`, `verses`
- Meta object with `first_line` (required), `page` (optional, number or array), `author` (optional), `verse parentheses` (optional)
- Array of verses (all fields optional: `text`, `number`, `word_by_word`, `translation`, `synonyms`, `subtitle`)
- Optional top-level fields: `word_by_word`, `author`, `subtitle`, `embeds`

## Markdown Format

Songs should be in markdown format with YAML frontmatter for metadata:

```markdown
---
page: 123
author: John Doe
---

# Song Title

## Subtitle

Verse 1 lyrics here...

[Chorus]
Chorus lyrics here...
```

## License

ISC
