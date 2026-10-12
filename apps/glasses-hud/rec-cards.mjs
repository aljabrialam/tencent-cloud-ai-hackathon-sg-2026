import { chromium } from 'playwright';
const cards = [
  ['phone',   'The phone signs.',           'digiVoice · native dev build · iPhone 16 Pro simulator'],
  ['glasses', 'Meta Ray-Ban Display',       'real @wearables-ui-toolkit/mrbd app · display only · no approve affordance'],
  ['watch',   'Smartwatch',                 'compiled SwiftUI renders · the wrist can show, never sign'],
  ['web',     'digibank web + future surfaces', 'display + draft capture · speaker · earbuds · in-car sims · phone still signs'],
];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
for (const [id, title, sub] of cards) {
  await page.setContent(`<!doctype html><html><body style="margin:0;width:1920px;height:1080px;background:#0B0B0C;display:grid;place-items:center;font-family:-apple-system,Helvetica,sans-serif">
    <div style="text-align:center">
      <div style="color:#E60023;font-size:26px;font-weight:700;letter-spacing:.22em;margin-bottom:26px">DIGIVOICE</div>
      <div style="color:#fff;font-size:72px;font-weight:800">${title}</div>
      <div style="color:#9A9AA0;font-size:30px;margin-top:24px">${sub}</div>
    </div></body></html>`);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `/tmp/card-${id}.png` });
}
await browser.close();
console.log('cards done');
