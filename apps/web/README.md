# digiVoice web — runnable demo app

Real Vite + React + TypeScript app. Two views:

1. **Desktop banking** — digibank-web shell with the digiVoice chat panel and the
   confirmation card side-by-side. State switcher: `draft · clarify · frozen · audit`.
   The card always ends at "Approve on your phone →" — the browser is display +
   draft capture only; the phone is the sole signer.
2. **Future surfaces** — interactive feasibility sims for the three surfaces that
   will exist but aren't shippable today:
   - **Smart speaker** — voice Q&A (bills due, spend); sensitive answers ping the
     phone; spoken approval is never accepted.
   - **Wireless earbuds** — read-aloud of drafts/receipts; fraud warnings duck the
     media; PINs/card numbers are never spoken.
   - **In-car (CarPlay / Android Auto / IVI)** — audio-only while driving; the card
     appears only at standstill; it still can't sign.

## Deployed

**https://digivoice-app.vercel.app** — production build on Vercel.

```sh
npm run build        # writes dist/ (wipes dist/.vercel)
cd dist && vercel link --yes --project digivoice-app && vercel --prod
```

## Run

```sh
npm install
npm run dev        # dev server
npm run build      # typecheck + production build
npm run preview    # serve the built app
```

Screenshots in `screenshots/` were captured from the running production build.
