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

### As a Package in Another Project

```javascript
const { build, render } = require('songbook-md-json-parser');

// Build markdown to JSON (./songs -> ./build/songs)
build();

// Render JSON back to markdown (./build/songs -> ./songs)
render();

// Specify a project directory
build({ projectDir: __dirname });

// Or with custom paths
build({
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
    "build:songs": "songbook-md-json-parser"
  }
}
```

Then run:

```bash
npm run build:songs
```

This will build songs from `./songs` to `./build/songs` in your project's directory.

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
```

## API

### `build(options)`

Converts all markdown files in the songs directory to JSON.

**Parameters:**
- `options` (object, optional):
  - `projectDir` (string): The root directory of your project (default: `process.cwd()`)
  - `inputDir` (string): Custom input directory (default: `projectDir/songs`)
  - `outputDir` (string): Custom output directory (default: `projectDir/build/songs`)

**Example:**

```javascript
const { build } = require('songbook-md-json-parser');

// Default usage - uses current working directory
build();

// Specify project directory
build({ projectDir: __dirname });

// Custom paths
build({
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

## Examples

The `examples/` folder contains additional utility scripts:

### `render.js`
Converts JSON files back to markdown format (reverse operation):

```bash
node examples/render.js
```

This script reads JSON files from `build/songs/` and converts them back to markdown in `songs/`.

### `render-without-translation.js`
Similar to `render.js`, but strips translation data from the songs:

```bash
node examples/render-without-translation.js
```

Useful for creating translation-free versions of your songbook.

## License

ISC
