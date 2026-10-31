#!/usr/bin/env node

const { parsePages } = require('./lib/parse-pages');

// When run as a CLI, use the current working directory
parsePages();
