const ytSearch = require('yt-search');
const { addLog } = require('./utils');

class SearchEngine {
    constructor() {
    }

    async findCandidates(track) {
        // Generate queries
        const queries = [
            `${track.artist} - ${track.name} lyrics`, // High match for official audio
            `${track.artist} - ${track.name} audio`,
            `${track.artist} - ${track.name} official video`
        ];

        // We use the first query primarily, but could use others if no results
        const primaryQuery = queries[0];

        try {
            addLog(`Searching: "${primaryQuery}"`);
            const results = await ytSearch(primaryQuery);

            if (!results || !results.videos || results.videos.length === 0) {
                return [];
            }

            // Return top 5 candidates
            return results.videos.slice(0, 5).map(v => ({
                title: v.title,
                channel: v.author ? v.author.name : '',
                duration: v.duration.seconds,
                url: v.url,
                views: v.views,
                thumbnail: v.thumbnail
            }));

        } catch (e) {
            addLog(`Search error for "${primaryQuery}": ${e.message}`);
            return [];
        }
    }
}

module.exports = SearchEngine;
