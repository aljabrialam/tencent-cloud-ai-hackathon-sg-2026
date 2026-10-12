import { chromium } from 'playwright';
import fs from 'fs';

const STATES = ['ambient', 'listening', 'clarify', 'card', 'waiting', 'sent', 'frozen', 'scam'];
const HOLD = 3200; // must match film.html captions

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 600, height: 600 },
  deviceScaleFactor: 2,
  recordVideo: { dir: '.rec-tmp', size: { width: 600, height: 600 } },
});
const page = await ctx.newPage();
await page.goto('http://127.0.0.1:4175/?state=' + STATES[0], { waitUntil: 'networkidle' });
await page.waitForTimeout(HOLD);
for (const s of STATES.slice(1)) {
  await page.goto('http://127.0.0.1:4175/?state=' + s);
  await page.waitForTimeout(HOLD);
}
await ctx.close();
await browser.close();
fs.renameSync('.rec-tmp/' + fs.readdirSync('.rec-tmp')[0], '../../demo/glasses-run.webm');
console.log('done');
