const { Song } = require('./lib/Song');
const { processFiles } = require('./lib/process-files');
const { build } = require('./lib/build');
const { render } = require('./lib/render');

module.exports = {
    build,
    render,
    Song,
    processFiles
};
