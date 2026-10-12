import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const STATES = ['ambient', 'listening', 'clarify', 'card', 'waiting', 'sent', 'frozen', 'scam'];
mkdirSync('Renders', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 600, height: 600 }, deviceScaleFactor: 2 });
for (const s of STATES) {
  await page.goto(`http://127.0.0.1:4175/?state=${s}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  await page.screenshot({ path: `Renders/hud-${s}.png` });
  console.log('captured', s);
}
await browser.close();
