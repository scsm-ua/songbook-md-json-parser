const fs = require('fs');

// Index.
function getContentsJSON(CONTENTS_FILE) {
    var data = fs.readFileSync(CONTENTS_FILE);
    var text = data.toString();
    var categories = convertContentsToJSON(text);

    // Filter empty categories.
    categories = categories.filter((category) => category.items.length > 0);

    // console.log(JSON.stringify(categories, null, 4));
    return categories;
}

function getIndexJSON(INDEX_FILE) {
    var data = fs.readFileSync(INDEX_FILE);
    var text = data.toString();
    var index = convertIndexToJSON(text);

    // console.log(JSON.stringify(index, null, 4));
    return index;
}

// Private.

function convertIndexToJSON(text) {
    var lines = text.split(/\n/).filter(i => !!i);
    var songs = {};

    lines.forEach((line) => {

        var match = line.match(/^\s?- \[([^\]]+)\]\(songs\/([^\)]+)\.md\)/);

        if (match) {
            var song_alias = match[1];
            var song_id = match[2];
            if (!(song_id in songs)) {
                songs[song_id] = song_alias;
            } else {
                console.warn('- Duplicate index line', line);
            }
        } else {
            console.warn('- No match in index for line', line);
        }
    });

    return songs;
}

function convertContentsToJSON(text) {
    var lines = text.split(/\n/);
    var categories = [];
    var last_line_id;

    function getLastCategory(options) {
        if ((options && options.create_new) || !categories.length) {
            // Category template.
            categories.push({
                name: null,
                items: []
            });
        }

        return categories[categories.length - 1];
    }

    lines.forEach((line) => {
        var { line_id, name, filename, filepath } = getIndexLineInfo(line);
        switch (line_id) {
            case 'name':
                var cateogory = getLastCategory({ create_new: true });
                cateogory.name = name;
                break;
            case 'song':
                getLastCategory().items.push({
                    id: filename,
                    filepath: filepath,
                    title: name
                });
                break;
            default:
            // Silent. Too much non used lines.
        }
        last_line_id = line_id;
    });

    return categories;
}

const index_line_types = {
    name: /^### (.+)/,
    // Extract only filename without extension.
    song: /^\s?- \[([^\]]+)\]\((songs\/([^\)]+)\.md)\)/
};

function getIndexLineInfo(line) {
    for (var id in index_line_types) {
        var m = line.match(index_line_types[id]);
        if (m) {
            return {
                line_id: id,
                name: m[1],
                filename: m[3],
                filepath: m[2]
            };
        }
    }
    return {
        line_id: null,
        name: null,
        filename: null
    };
}

module.exports = {
    getContentsJSON,
    getIndexJSON
};

