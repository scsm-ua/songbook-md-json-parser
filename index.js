const { Song } = require('./lib/Song');
const { processFiles } = require('./lib/process-files');
const { parseSongs } = require('./lib/parse-songs');
const { render } = require('./lib/render');
const { parseContents, parseIndex } = require('./lib/parse-meta');
const { getDefaultPaths } = require('./lib/config');
const { build } = require('./build');
const { 
    validateSong, 
    validateSongFile, 
    formatValidationResults 
} = require('./lib/validate');

module.exports = {
    build,
    parseSongs,
    render,
    parseContents,
    parseIndex,
    Song,
    processFiles,
    getDefaultPaths,
    validateSong,
    validateSongFile,
    validateDirectory,
    formatValidationResults
};
