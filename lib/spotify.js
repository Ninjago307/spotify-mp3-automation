const puppeteer = require('puppeteer-core');
const { addLog, findBrowserPath } = require('./utils');

class SpotifyScraper {
    constructor() {
        this.browser = null;
        this.page = null;
    }

    async init() {
        const browserPath = findBrowserPath();
        if (!browserPath) throw new Error('Supported browser (Edge/Chrome) not found. Please install Edge or Chrome.');

        addLog('Launching Headless Browser...');
        this.browser = await puppeteer.launch({
            executablePath: browserPath,
            headless: false, // Visible for debugging
            args: [
                '--start-maximized',
                '--disable-setuid-sandbox',
                '--disable-infobars',
                '--window-position=0,0',
                '--ignore-certificate-errors',
                '--ignore-certificate-errors-spki-list',
                '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
            ]
        });

        this.page = await this.browser.newPage();
        await this.page.setViewport({ width: 1920, height: 1080 });

        // Block heavy resources
        await this.page.setRequestInterception(true);
        this.page.on('request', (req) => {
            if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                // req.abort(); // Keeping images might be needed for screenshots or some JS checks, but for speed aborting is better. 
                // Actually spotify might check for loading. Let's block fonts and maybe images if not needed for canvas.
                // For now, let's just continue to be safe against detection mechanisms that check for resource loading.
                req.continue();
            } else {
                req.continue();
            }
        });
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }

    async fetchMetadata(url) {
        if (!this.browser) await this.init();

        addLog(`Navigating to ${url}...`);
        try {
            await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        } catch (e) {
            addLog(`Navigation warning: ${e.message} (Proceeding likely loaded)`);
        }

        // 1. Try to extract from JSON (Most reliable for public pages)
        try {
            const data = await this.page.evaluate(() => {
                const script = document.getElementById('initial-state') || document.getElementById('__NEXT_DATA__') || document.querySelector('script[type="application/json"]');
                if (script) return JSON.parse(script.innerText);
                return null;
            });

            // Note: Spotify's internal JSON structure changes. We need to parse it carefully if we rely on it.
            // For now, let's use a robust DOM scraper as the primary method for "Visible" tracks 
            // because the JSON often contains encrypted/obfuscated or limited data for non-logged-in users.
            // But we can use the title/description meta tags easily.
        } catch (e) {
            addLog(`JSON extraction failed: ${e.message}`);
        }

        // 2. DOM Scrape (Robust Visual Scrape)
        const metadata = await this.scrapeDom(url);
        return metadata;
    }

    async scrapeDom(url) {
        addLog('Loading tracks (Visible Mode)...');

        // Initial wait
        try {
            await this.page.waitForSelector('[data-testid="tracklist-row"]', { timeout: 15000 });
        } catch (e) {
            addLog('Warning: Tracklist not immediately found.');
        }

        const isPlaylist = url.includes('/playlist/') || url.includes('/album/');
        const tracks = new Map();

        // Extract Context
        const context = await this.page.evaluate(() => ({
            title: document.querySelector('h1')?.innerText || document.title,
            type: 'music'
        }));

        // SCRAPING LOOP
        let sameCount = 0;
        let lastHeight = 0;

        for (let i = 0; i < 300; i++) {
            // 1. Extract Current View
            const newTracks = await this.page.evaluate(() => {
                const rows = Array.from(document.querySelectorAll('[data-testid="tracklist-row"]'));
                return rows.map(row => {
                    // Try Aria-Label first (Best for "Play Title by Artist")
                    const playBtn = row.querySelector('button[aria-label*="Play"]');
                    let title = "", artist = "";

                    if (playBtn) {
                        const label = playBtn.getAttribute('aria-label');
                        const parts = label.replace(/^Play\s+/i, '').split(' by ');
                        if (parts.length >= 2) {
                            title = parts[0];
                            artist = parts[parts.length - 1];
                        } else {
                            title = parts[0];
                        }
                    }

                    // Fallback to text
                    if (!title) {
                        const titleEl = row.querySelector('div[dir="auto"]');
                        if (titleEl) title = titleEl.innerText;
                        const artistEls = Array.from(row.querySelectorAll('a[href^="/artist/"]'));
                        if (artistEls.length > 0) artist = artistEls.map(a => a.innerText).join(', ');
                    }

                    // Cover Art
                    const img = row.querySelector('img');
                    const cover = img ? img.src : null;

                    return { title, artist, cover, id: title + artist };
                }).filter(t => t.title && t.artist && t.title !== 'Title');
            });

            // 2. Add to Set
            let addedNow = 0;
            newTracks.forEach(t => {
                if (!tracks.has(t.id)) {
                    tracks.set(t.id, t);
                    addedNow++;
                }
            });

            if (addedNow > 0) {
                sameCount = 0;
                addLog(`Scraped ${tracks.size} tracks...`);
            } else {
                sameCount++;
            }

            // 3. Scroll Strategies
            // A. Focus on the list to ensure keyboard events work
            await this.page.click('body').catch(() => { });

            // B. Press PageDown (Standard)
            await this.page.keyboard.press('PageDown');
            await new Promise(r => setTimeout(r, 500));

            // C. Press Space (Alternative)
            if (i % 3 === 0) {
                await this.page.keyboard.press('Space');
                await new Promise(r => setTimeout(r, 500));
            }

            // D. JS Scroll Last Element (Push bottom)
            await this.page.evaluate(() => {
                const rows = document.querySelectorAll('[data-testid="tracklist-row"]');
                if (rows.length > 0) rows[rows.length - 1].scrollIntoView({ block: 'center' });
            });
            await new Promise(r => setTimeout(r, 800));

            // E. Height Check
            const currentHeight = await this.page.evaluate(() => document.body.scrollHeight);
            if (currentHeight === lastHeight && addedNow === 0) {
                if (sameCount > 15) {
                    addLog('No new tracks found for 15 iterations. Stopping.');
                    break;
                }
            } else {
                lastHeight = currentHeight;
            }
        }

        return {
            name: context.title,
            type: context.type,
            tracks: Array.from(tracks.values()).map(t => ({
                name: t.title,
                artist: t.artist,
                cover: t.cover,
                query: `${t.artist} - ${t.name}`
            }))
        };
    }
}

module.exports = SpotifyScraper;
