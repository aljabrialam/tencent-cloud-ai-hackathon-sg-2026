import { chromium } from 'playwright';
import fs from 'fs';
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  recordVideo: { dir: '.rec-tmp', size: { width: 1920, height: 1080 } },
});
const page = await ctx.newPage();
await page.goto('file:///Users/aljabri.alam/Projects/tencent-cloud-ai-hackathon-sg-2026/apps/glasses-hud/film.html');
await page.waitForTimeout(29000);
await ctx.close();
await browser.close();
fs.renameSync('.rec-tmp/' + fs.readdirSync('.rec-tmp')[0], '../../demo/glasses-film.webm');
console.log('done');
