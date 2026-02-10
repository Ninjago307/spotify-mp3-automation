const SearchEngine = require('./lib/search');
const Matcher = require('./lib/matcher');

async function test() {
    console.log("Testing Search & Matcher...");

    // Mock Track
    const track = {
        name: "Blinding Lights",
        artist: "The Weeknd",
        cover: "http://example.com/cover.jpg"
    };

    const searcher = new SearchEngine();
    const matcher = new Matcher();

    try {
        const candidates = await searcher.findCandidates(track);
        console.log(`Found ${candidates.length} candidates.`);
        candidates.forEach(c => console.log(`- ${c.title} (${c.channel})`));

        const best = matcher.findBestMatch(track, candidates);
        if (best) {
            console.log("\nBEST MATCH:");
            console.log(`Title: ${best.title}`);
            console.log(`Channel: ${best.channel}`);
            console.log(`Score: ${matcher.calculateScore(track, best)}`);
        } else {
            console.log("\nNo match found.");
        }

    } catch (e) {
        console.error(e);
    }
}

test();
