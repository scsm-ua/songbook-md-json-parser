const embeds = {
    soundcloud: {
        render: function(url) {
            var link_match = url.match(/^https:\/\/soundcloud\.com\/(?:[^\/\?]+)\/(?:[^\/\?]+)/);
            if (link_match) {
                var soundcloud_track_url = link_match[0];
                var iframe_url = `https://w.soundcloud.com/player/?url=${encodeURIComponent(soundcloud_track_url)}`;
                return {
                    iframe_url,
                    embed_code: `<iframe width="100%" height="20" scrolling="no" frameborder="no" allow="autoplay" src="${iframe_url}"></iframe>`
                };
            }
        }
    }
}

const renders = Object.values(embeds);

exports.getEmbedCode = function(url) {
    var result;
    renders.find(rule => {
        result = rule.render(url);
        return result;
    });
    return result;
};
