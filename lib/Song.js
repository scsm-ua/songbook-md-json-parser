const { getEmbedCode } = require('./embeds');
const yaml = require('js-yaml');

class Song {
    constructor({json, text}) {
        this.json = json;
        this.text = text;

        if (this.text && !this.json) {
            this.json = convertSongToJSON(text);
        }
    }

    render() {
        var body = '';

        var json = this.json;

        var meta = Object.assign({}, json.attributes, json.meta);

        // Convert page to int if possible.
        if (typeof meta.page === 'string' && meta.page === String(parseInt(meta.page))) {
            meta.page = parseInt(meta.page);
        } else if (Array.isArray(meta.page)) {
            meta.page = meta.page.map(p => {
                if (p === String(parseInt(p))) {
                    return parseInt(p);
                } else {
                    return p;
                }
            });
        }

        if (Object.keys(meta).length > 0) {
            body += '---\n';
            body += yaml.dump(meta);
            body += '---\n\n';
        }

        if (json.title?.length) {
            json.title.forEach(t => {
                body += `# ${t}\n`;
            });
            body += '\n';
        }

        if (json.subtitle?.length) {
            json.subtitle.forEach(t => {
                body += `## ${t}\n`;
            });
            body += '\n';
        }

        if (json.author?.length) {
            json.author.forEach(t => {
                body += `### ${t}\n\n`;
            });
        }

        json.verses.forEach(v => {
            if (v.subtitle?.length) {
                v.subtitle.forEach(t => {
                    body += `## ${t}\n`;
                });
                body += '\n';
            }
            if (v.number) {
                body += `#### ${v.number}\n`;
                body += '\n';
            }
            if (v.text?.length) {
                v.text.forEach(t => {
                    if (t) {
                        body += `    ${t}\n`;
                    } else {
                        body += '\n';
                    }
                });
                body += '\n';
            }
            if (v.word_by_word?.length) {
                v.word_by_word.forEach(t => {
                    body += `> ${t}\n\n`;
                });
            }
            if (v.translation?.length) {
                v.translation.forEach(t => {
                    body += `${t}\n`;
                    if (!/\\$/.test(t)) {
                        body += '\n';
                    }
                });
            }
        });

        return body;
    }
}

function extractYAMLFrontMatter(fileContent) {
    const match = fileContent.match(/^---\n([\s\S]*?)\n---/);
    if (match) {
        var meta;
        try {
            meta = yaml.load(match[1]);
        } catch(ex) {
            console.error(ex);
        }
        return {
            meta,
            content: fileContent.slice(match[0].length) // Markdown body without front matter
        };
    } else {
        return {
            meta: null,
            content: fileContent
        };
    }
}

function isEmpty(value) {
    if (value === null || value === undefined) return true;
    if (Array.isArray(value) && value.length === 0) return true;
    if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) return true;
    return false;
}

function cleanEmptyAttributes(obj) {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (Array.isArray(obj)) {
        const cleaned = obj
            .map(item => cleanEmptyAttributes(item))
            .filter(item => !isEmpty(item));
        return cleaned.length > 0 ? cleaned : undefined;
    }

    if (typeof obj === 'object') {
        const cleaned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const value = cleanEmptyAttributes(obj[key]);
                if (!isEmpty(value)) {
                    cleaned[key] = value;
                }
            }
        }
        return cleaned;
    }

    return obj;
}

function convertSongToJSON(text) {

    const {meta, content} = extractYAMLFrontMatter(text);

    var lines = content.split(/\n/);

    // Song template.
    var song = {
        meta,
        title: [],
        author: [],
        subtitle: [],
        verses: []
    };

    function getLastVerse(options) {
        if ((options && options.create_new) || !song.verses.length) {
            // Verse template.
            song.verses.push({
                number: null,
                text: [],
                translation: [],
            });
        }

        return song.verses[song.verses.length - 1];
    }

    var last_line_id;

    lines.forEach((line) => {
        var { line_id, line_value, line_match } = getSongLineInfo(line);
        if (line_id && line_id !== 'verse_text') {
            // Disable empty verse line.
            verse_empty_line = false;
        }
        switch (line_id) {
            case 'title':
                song.title.push(line_value);
                break;
            case 'author':
                song.author.push(line_value);
                break;
            case 'subtitle':
                if (song.verses.length === 0) {
                    song.subtitle.push(line_value);
                } else {
                    var verse = getLastVerse({ create_new: last_line_id !== 'subtitle' });
                    verse.subtitle = verse.subtitle || [];
                    verse.subtitle.push(line_value);
                }
                break;
            case 'verse_number':
                getLastVerse({ create_new: true }).number = line_value;
                break;
            case 'verse_text':
                if (verse_empty_line) {
                    verse_empty_line = false;
                    getLastVerse({
                        create_new: false
                    }).text.push('');
                }
                getLastVerse({
                    create_new: last_line_id === 'translation' || last_line_id === 'word_by_word'
                }).text.push(line_value);
                break;
            case 'word_by_word':
                if (song.verses.length === 0) {
                    song.word_by_word = song.word_by_word || [];
                    song.word_by_word.push(line_value);
                } else {
                    var verse = getLastVerse();
                    verse.word_by_word = verse.word_by_word || [];
                    verse.word_by_word.push(line_value);
                }
                break;
            case 'translation':
                getLastVerse().translation.push(line_value);
                break;
            case 'embed_link':
                var embed_url = line_match[2];
                var embed = getEmbedCode(embed_url);
                if (embed) {
                    song.embeds = song.embeds || [];
                    song.embeds.push({
                        title: line_value,
                        embed_url: embed_url,
                        iframe_url: embed.iframe_url,
                        embed_code: embed.embed_code
                    });
                } else {
                    console.warn('Unrecognized embed link', line)
                }
                break;
            case 'attribute':
                var bits = line_value.split(/=/);
                if (bits.length !== 2) {
                    console.error("Can't recognize attribute", line);
                } else {
                    song.attributes = song.attributes || {};
                    var attr_key = bits[0].trim();
                    var attr_value = bits[1].trim();

                    if (attr_value) {
                        if (song.attributes[attr_key] && !Array.isArray(song.attributes[attr_key])) {
                            // Convert to array.
                            song.attributes[attr_key] = [song.attributes[attr_key]];
                        }
    
                        if (Array.isArray(song.attributes[attr_key])) {
                            song.attributes[attr_key].push(attr_value);
                        } else {
                            song.attributes[attr_key] = attr_value;
                        }
                    }
                }
                break;
            default:
                if (!line.trim()) {
                    // Empty line.
                    if (last_line_id === 'verse_text') {
                        verse_empty_line = true;
                    }
                } else {
                    // TODO: better errors processing.
                    console.error("Can't recognize line id", line_id, line);
                }
        }
        if (line_id) {
            // Skip empty lines.
            last_line_id = line_id;
        }
    });

    return cleanEmptyAttributes(song);
}

const song_line_types = {
    title: /^# (.+)/,
    subtitle: /^## (.+)/,
    author: /^### (.+)/,
    verse_number: /^#### (.+)/,
    verse_text: /^    (.+)/,
    attribute: /^> (.+ =.*)/,
    word_by_word: /^> (.+)/,
    embed_link: /^\[([^\]]+)\]\(([^\)]+)\)/,    // Before translation.
    translation: /^([^\s#].+)/
};

function getSongLineInfo(line) {
    for (var id in song_line_types) {
        var m = line.match(song_line_types[id]);
        if (m) {
            return {
                line_id: id,
                line_value: m[1].trimEnd(),
                line_match: m
            };
        }
    }
    return {
        line_id: null,
        line_value: null,
        line_match: null
    };
}

module.exports = {
    Song: Song
};
