# Authors List Testing

This package provides commands to generate and test the authors list in your songbook repository.

## Setup in Songbook Repo

### 1. Add npm scripts to your songbook's `package.json`:

```json
{
  "scripts": {
    "update-authors": "npm run build && songbook-list-authors > authors.log",
    "test:authors": "songbook-test-authors"
  }
}
```

The `update-authors` script rebuilds and regenerates the `authors.log` baseline file.

### 2. Generate the baseline `authors.log`:

```bash
npm run update-authors
```

This builds the songbook and creates `authors.log` in one command. **Commit this file to git.**

### 3. Test that authors haven't changed:

```bash
npm run test:authors
```

This will:
- ✅ Exit 0 if authors match `authors.log`
- ❌ Exit 1 if authors changed (showing diff)

## GitHub Actions Integration

The reusable workflow `.github/workflows/songbook-validate.yml` **automatically tests authors** after build.

Just use it in your songbook repo's workflow:

```yaml
name: Validate Songbook

on: [push, pull_request]

jobs:
  validate:
    uses: scsm-ua/songbook-md-json-parser/.github/workflows/songbook-validate.yml@main
```

The workflow will:
1. Build the songbook
2. Run validation tests
3. **Test authors list** (if `test:authors` script exists)
4. Comment on PR if anything fails

## When Authors Change

If you intentionally add/remove/modify songs with different authors:

1. Update baseline: `npm run update-authors`
2. Commit the updated `authors.log`

The `update-authors` command rebuilds everything and regenerates the baseline.

## Commands Available

From the songbook repo (after installing this package):

- `songbook-list-authors` - Display authors list to stdout
- `songbook-test-authors` - Compare current authors with authors.log
