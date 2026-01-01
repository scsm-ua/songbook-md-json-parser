# Test Fixtures Coverage

This document describes the test coverage for the song JSON schema validation.

## Test Structure

```
test-fixtures/
├── valid/          # Valid example files - test all schema features
└── invalid/        # Invalid test cases - test error detection
```

## Valid Test Fixtures (11 files)

### Schema Feature Coverage

| Feature | Description | Test Files |
|---------|-------------|------------|
| **meta.page: Number** | Single page number | akrodha-paramananda.json, ha-ha-bhaktivinoda.json, jaya-jaya-gaurachander.json, krishna-hoite.json, test-meta-*.json |
| **meta.page: String** | Page as string (e.g., "11/2") | goswaminam-sudhirakhyam.json |
| **meta.page: Array** | Multiple page numbers | jaya-guru-maharaja.json |
| **meta.page: (omitted)** | Page is optional | test-minimal-required-only.json |
| **meta.first_line** ✅ | Required field | All files |
| **meta.author** | Author in meta object | goswaminam-sudhirakhyam.json, krishna-hoite.json, test-all-meta-formats.json |
| **meta.no-author** | Flag for songs with no author | acharya-varyam.json, test-minimal-required-only.json |
| **meta.translation: "no"** | Mark song as untranslated | test-meta-translation-no.json, test-all-meta-formats.json |
| **meta.verse parentheses** | Formatting option | jaya-jaya-gaurachander.json, test-all-meta-formats.json |
| **meta.inline verse** | Formatting option | test-meta-inline-verse.json, test-all-meta-formats.json |
| **title** ✅ | Required array | All files |
| **word_by_word** (root) | Song-level translation | akrodha-paramananda.json, test-all-meta-formats.json |
| **author** (root) | Author array | akrodha-paramananda.json, ha-ha-bhaktivinoda.json, jaya-guru-maharaja.json, jaya-jaya-gaurachander.json, krishna-hoite.json, test-all-meta-formats.json |
| **subtitle** (root) | Song subtitle | ha-ha-bhaktivinoda.json, test-all-meta-formats.json |
| **verses** ✅ | Required array | All files |
| **verse.number** | Verse numbering | Most files (optional) |
| **verse.text** ✅ | Verse lines (required) | All files |
| **verse.word_by_word** | Per-verse translation | acharya-varyam.json, akrodha-paramananda.json, test-all-meta-formats.json |
| **verse.translation** | Verse translation | Most files |
| **verse.subtitle** | Verse/section subtitle | ha-ha-bhaktivinoda.json, test-all-meta-formats.json |
| **embeds** | Audio/video embeds | jaya-guru-maharaja.json, jaya-jaya-gaurachander.json, krishna-hoite.json, test-all-meta-formats.json |

✅ = Required field

### Test File Descriptions

#### Original Example Files (7 files)
- **acharya-varyam-gaura-dhama-nishtham.json** - Song with no-author, verse word-by-word
- **akrodha-paramananda.json** - Song with root-level word_by_word and author
- **goswaminam-sudhirakhyam.json** - Song with page as string, meta.author
- **ha-ha-bhaktivinoda-thakkura-guroh.json** - Song with subtitle, verse subtitle
- **jaya-guru-maharaja-jati-rajeshvara.json** - Song with page array, embeds
- **jaya-jaya-gaurachander-arotiko-shobha.json** - Song with verse parentheses formatting
- **krishna-hoite-chatur-mukha.json** - Song with embeds, meta.author

#### Additional Test Files (4 files)
- **test-meta-translation-no.json** - Tests `meta.translation: "no"` feature
- **test-meta-inline-verse.json** - Tests `meta.inline verse: "non bold"` feature
- **test-minimal-required-only.json** - Minimal valid song (only required fields)
- **test-all-meta-formats.json** - Comprehensive test with all meta formatting options, both author locations, embeds, and all verse fields

### Coverage Statistics

- **Total Schema Features**: 19 distinct features
- **Covered Features**: 19 (100%)
- **Total Valid Test Files**: 11

## Invalid Test Fixtures (7 files)

Tests for error detection and proper validation:

1. **missing-required-fields.json** - Missing `first_line` and `verses`
2. **missing-author.json** - No author field (violates anyOf rule)
3. **empty-title-array.json** - Title array is empty (minItems violation)
4. **empty-verses-array.json** - Verses array is empty (minItems violation)
5. **invalid-page-type.json** - Page is boolean instead of number/string/array
6. **additional-properties.json** - Contains unexpected properties in meta
7. **malformed-json.json** - Invalid JSON syntax

## Running Tests

```bash
# Validate all valid test fixtures
npm run validate

# Validate invalid test fixtures (should fail)
npm run validate:invalid

# Run automated exit code tests
npm test
```

## Schema Version

This coverage documentation is for the schema defined in:
- [schema/song.source.js](../schema/song.source.js)
- Generated: [schema/song.ajv-build.json](../schema/song.ajv-build.json)

Last updated: 2026-01-01
