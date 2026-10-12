import { chromium } from 'playwright';
import fs from 'fs';

const JOBS = [
  { url: 'file:///Users/aljabri.alam/Projects/tencent-cloud-ai-hackathon-sg-2026/apps/mobile/film.html',
    out: '../../demo/phone-film.webm', secs: 83 },
  { url: 'file:///Users/aljabri.alam/Projects/tencent-cloud-ai-hackathon-sg-2026/apps/glasses-hud/film.html',
    out: '../../demo/glasses-film.webm', secs: 29 },
  { url: 'file:///Users/aljabri.alam/Projects/tencent-cloud-ai-hackathon-sg-2026/apps/watch/film.html',
    out: '../../demo/watch-film.webm', secs: 17 },
];

const browser = await chromium.launch();
for (const j of JOBS) {
  const ctx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: '.rec-tmp', size: { width: 1920, height: 1080 } },
  });
  const page = await ctx.newPage();
  await page.goto(j.url);
  await page.waitForTimeout(j.secs * 1000);
  await ctx.close();
  const f = fs.readdirSync('.rec-tmp').pop();
  fs.renameSync('.rec-tmp/' + f, j.out);
  console.log('recorded', j.out);
}
await browser.close();
