const yaml = require('js-yaml');

class Page {
    constructor({json, text}) {
        this.json = json;
        this.text = text;

        if (this.text && !this.json) {
            this.json = convertPageToJSON(text);
        }
    }

    render() {
        var body = '';

        var json = this.json;

        var meta = Object.assign({}, json.meta);

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

        if (json.body) {
            body += json.body;
            body += '\n';
        }

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

function convertPageToJSON(text) {
    const {meta, content} = extractYAMLFrontMatter(text);

    const page = {};

    if (meta && Object.keys(meta).length > 0) {
        page.meta = meta;
    }

    // Body is arbitrary markdown kept as a single string.
    page.body = content.replace(/^\n+/, '').replace(/\s+$/, '');

    return page;
}

module.exports = {
    Page: Page
};
