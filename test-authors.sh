#!/bin/bash

# Test that authors list matches authors.log
# Usage: ./test-authors.sh [--json-dir=path]

node list-authors.js "$@" | diff - authors.log

if [ $? -eq 0 ]; then
    echo "✓ Authors list matches authors.log"
    exit 0
else
    echo "✗ Authors list changed! Update with: npm run update-authors"
    exit 1
fi
