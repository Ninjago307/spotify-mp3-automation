const { addLog } = require('./utils');

class Matcher {
    constructor() {
    }

    // Levnechstein distance for string similarity
    levenshtein(a, b) {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        Math.min(
                            matrix[i][j - 1] + 1, // insertion
                            matrix[i - 1][j] + 1 // deletion
                        )
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    }

    calculateScore(spotifyTrack, candidate) {
        let score = 0;
        const sTitle = spotifyTrack.name.toLowerCase();
        const sArtist = spotifyTrack.artist.toLowerCase();
        const cTitle = candidate.title.toLowerCase();
        const cChannel = candidate.channel ? candidate.channel.toLowerCase() : '';

        // 1. Title Similarity (0-40 points)
        const dist = this.levenshtein(sTitle, cTitle);
        const maxLength = Math.max(sTitle.length, cTitle.length);
        const similarity = 1 - (dist / maxLength);

        if (similarity > 0.9) score += 40;
        else if (similarity > 0.7) score += 30;
        else if (similarity > 0.5) score += 15;

        // Boost if candidate title contains the full spotify title
        if (cTitle.includes(sTitle)) score += 10;

        // 2. Artist Match (0-30 points)
        // Check if artist name is in candidate title or channel
        if (cTitle.includes(sArtist) || cChannel.includes(sArtist)) {
            score += 30;
        } else {
            // Partial artist match?
            const artistParts = sArtist.split(/[,&]/).map(p => p.trim());
            let partialMatch = false;
            for (const part of artistParts) {
                if (cTitle.includes(part) || cChannel.includes(part)) {
                    partialMatch = true;
                    break;
                }
            }
            if (partialMatch) score += 15;
        }

        // 3. Duration Match (0-20 points)
        // Spotify doesn't always give us duration in the scrape unless we parse it specifically.
        // If we have it, we use it. If not, we skip this check or assume average song length (3-5 mins).
        // Capturing duration from scrape is vital for this.
        // For now, let's look for "Official Audio" or "Lyrics" markers

        // 4. Keywords (0-10 points)
        if (cTitle.includes('official audio') || cTitle.includes('lyrics')) score += 10;

        // Penalties
        if (cTitle.includes('live') && !sTitle.includes('live')) score -= 20;
        if (cTitle.includes('cover') && !sTitle.includes('cover')) score -= 30;
        if (cTitle.includes('remix') && !sTitle.includes('remix')) score -= 20;
        if (cTitle.includes('1 hour') || cTitle.includes('10 hours')) score -= 50; // loop videos

        return score;
    }

    findBestMatch(spotifyTrack, candidates) {
        let bestMatch = null;
        let highestScore = -100;

        for (const candidate of candidates) {
            const score = this.calculateScore(spotifyTrack, candidate);
            addLog(`Scored: ${candidate.title} = ${score}`);

            if (score > highestScore) {
                highestScore = score;
                bestMatch = candidate;
            }
        }

        // Threshold
        if (highestScore < 40) {
            addLog(`Warning: Best match score (${highestScore}) is low for ${spotifyTrack.name}`);
            // We might still return it, or return null if strict.
            // Let's return it but log warning.
        }

        return bestMatch;
    }
}

module.exports = Matcher;
