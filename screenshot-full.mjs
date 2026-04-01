import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const url = process.argv[2] || 'http://localhost:3001';
const label = process.argv[3] || 'full';

const dir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const existing = fs.readdirSync(dir).filter(f => f.startsWith('screenshot-')).length;
const num = existing + 1;

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
await new Promise(r => setTimeout(r, 3000));

// Scroll incrementally to trigger IntersectionObserver
const totalHeight = await page.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < totalHeight; y += 500) {
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
    await new Promise(r => setTimeout(r, 50));
}

// Scroll to specific sections for screenshots
const positions = [
    { y: 0, name: 'hero' },
    { y: 500, name: 'hero-video' },
    { y: Math.floor(totalHeight * 0.55), name: 'line-reveal' },
    { y: Math.floor(totalHeight * 0.65), name: 'categories' },
    { y: Math.floor(totalHeight * 0.85), name: 'cta' },
];

for (const pos of positions) {
    await page.evaluate((y) => window.scrollTo(0, y), pos.y);
    await new Promise(r => setTimeout(r, 600));
    const filename = `screenshot-${num}-${pos.name}.png`;
    await page.screenshot({ path: path.join(dir, filename) });
    console.log(`Saved: ${filename}`);
}

await browser.close();
