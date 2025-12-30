#!/usr/bin/env node

const { parseSongs } = require('./lib/parse-songs');

// When run as a CLI, use the current working directory
parseSongs();
