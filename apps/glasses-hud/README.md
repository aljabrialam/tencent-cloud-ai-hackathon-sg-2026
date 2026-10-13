# digiVoice glasses HUD — Meta Ray-Ban Display surface

React + Vite + TypeScript on `@wearables-ui-toolkit/mrbd` — the HUD view of the
same typed draft. The glasses propose and display; the phone is the sole signer.
On scam/frozen verdicts the HUD shows "Paused — see your phone".

## Deployed

**https://digivoice-hud.vercel.app** — production build on Vercel. The landing
page composites the app's real state renders (`public/hud/`) onto a drawn
glasses mock, cycling all 8 states; [`?bare=1`](https://digivoice-hud.vercel.app/?bare=1)
opens the interactive HUD app itself.

```sh
npm run build        # writes dist/ (wipes dist/.vercel)
cp vercel.json dist/ # SPA fallback rewrite
cd dist && vercel link --yes --project digivoice-hud && vercel --prod
```

## Run

```sh
npm install
npm run dev        # dev server
npm run build      # typecheck + production build
npm run preview    # serve the built app
```

## Files

| Path | What |
|---|---|
| `src/App.tsx` | HUD shell — states list + detail |
| `src/StatesList.tsx` | All HUD states (draft, clarify, frozen, receipt, …) |
| `src/StateDetail.tsx` | Per-state lens rendering |
| `film.html` | Recorded wearer-view film (GitHub Pages) |
| `TEST-EVIDENCE.md` | Toolkit validation + test-gate evidence |
