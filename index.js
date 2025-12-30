const { Song } = require('./lib/Song');
const { processFiles } = require('./lib/process-files');
const { parseSongs } = require('./lib/parse-songs');
const { render } = require('./lib/render');
const { parseContents, parseIndex } = require('./lib/parse-meta');
const { getDefaultPaths } = require('./lib/config');
const { build } = require('./build');

module.exports = {
    build,
    parseSongs,
    render,
    parseContents,
    parseIndex,
    Song,
    processFiles,
    getDefaultPaths
};
