#!/bin/bash

# Test that authors list matches authors.log
# Usage: songbook-test-authors [--json-dir=path]

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Run list-authors from the same directory as this script
node "$SCRIPT_DIR/list-authors.js" "$@" | diff - authors.log

if [ $? -eq 0 ]; then
    echo "✓ Authors list matches authors.log"
    exit 0
else
    echo "✗ Authors list changed! Update with: npm run update-authors"
    exit 1
fi
