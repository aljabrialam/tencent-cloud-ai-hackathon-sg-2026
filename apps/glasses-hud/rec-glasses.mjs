import { chromium } from 'playwright';
const ctx = await chromium.launchPersistentContext('', {
  headless: true,
  viewport: { width: 600, height: 600 },
  recordVideo: { dir: '/tmp/vid-glasses', size: { width: 600, height: 600 } },
});
const page = ctx.pages()[0] ?? await ctx.newPage();
await page.goto('http://127.0.0.1:4175/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
async function tap(t, hold = 2400) {
  const el = page.locator(`text=${t}`).first();
  if (await el.count()) await el.click();
  await page.waitForTimeout(hold);
}
const back = async () => { await page.keyboard.press('Escape'); await page.waitForTimeout(1000); };

await tap('Capture');                 // group list
await tap('Listening', 3000);
await back();
await tap('Clarify', 3000);
await back();                          // → group list
await back();                          // → top-level groups
await tap('Review');
await tap('Draft card', 3200);
await back();
await tap('Waiting', 2600);
await back();
await tap('Sent', 2600);
await back(); await back();
await tap('Stopped');
await tap('Frozen', 3000);
await back();
await tap('Scam pause', 3000);
await ctx.close();
console.log('done');
