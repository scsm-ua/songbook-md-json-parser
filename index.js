const { Song } = require('./lib/Song');
const { Page } = require('./lib/Page');
const { processFiles } = require('./lib/process-files');
const { parseSongs } = require('./lib/parse-songs');
const { parsePages } = require('./lib/parse-pages');
const { render } = require('./lib/render');
const { parseContents, parseIndex } = require('./lib/parse-meta');
const { getDefaultPaths } = require('./lib/config');
const { build } = require('./build');
const { 
    validateSong, 
    validateSongFile, 
    validatePage,
    validatePageFile,
    validateDirectory,
    formatValidationResults 
} = require('./lib/validate');
const { listAuthors } = require('./lib/list-authors');

module.exports = {
    build,
    parseSongs,
    parsePages,
    render,
    parseContents,
    parseIndex,
    Song,
    Page,
    processFiles,
    getDefaultPaths,
    validateSong,
    validateSongFile,
    validatePage,
    validatePageFile,
    validateDirectory,
    formatValidationResults,
    listAuthors
};
