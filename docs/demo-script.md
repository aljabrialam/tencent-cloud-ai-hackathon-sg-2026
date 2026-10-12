# Demo Script (3 minutes live · 5–8 minute video)

Opens with the required line: **"We chose the Banking Track — DBS, Direct Conversational
Transaction Agent."**

## Beat sheet

| # | Time | Beat | On screen | Say |
|---|---|---|---|---|
| 0 | 0:00 | Hook | Home | "Three banking tasks, three menu trees. Or one sentence — with a system that can't be talked into moving your money." |
| 1 | 0:15 | Happy path | Listening → Confirm → Authorise → Receipt | "Send two hundred to Mum for groceries." Point at the verified badge, the PIN tier, the expiry. Authorise. "Nothing existed until I signed that card." |
| 2 | 0:50 | Multi-intent | Multi-step confirm | "Transfer five hundred from savings to Mum, then buy DBS shares with half of what's left." Point at the formula chip: "The model wrote *half of remaining*; code computed S$1,250. The model never does arithmetic." One biometric, two steps in order. |
| 3 | 1:25 | Clarify | Clarify | "Send fifty to John." Two Johns. "It asks. It never guesses." |
| 4 | 1:45 | Freeze | Frozen | Toggle demo hook: corrupt the draft to S$2,000. "A second, read-only model compares the draft to what I said. Mismatch → frozen. Authorise is gone." |
| 5 | 2:10 | Scam | Scam interstitial | Read the scam line. "Authority, urgency, new account, big number — four cues. Cooling-off, hotline, and even if I continue, policy demands biometric plus a code." |
| 6 | 2:40 | Audit | Audit trail | Open "Why did the agent do this?" "Transcript, draft, validator, every rule that fired, the signature fingerprint — hash-chained." |
| 7 | 2:55 | Close | Architecture slide | "Model drafts. Code decides. Human signs. Gateway only accepts signatures. Built with CodeBuddy and Hunyuan on Tencent Cloud." |

## Video-only additions (to reach 5–8 min)
- 30 s: problem framing with the DBS challenge text.
- 45 s: architecture walkthrough using `docs/architecture.md` diagram.
- 45 s: CodeBuddy / WorkBuddy build reflection with screenshots (mandatory proof).
- 30 s: policy test suite running green.

## Demo data
- Customer: Mei Ling · KYC verified · language EN.
- Accounts: Multiplier ····1188 S$8,420.15 · Savings ····2201 S$3,000.00 · Invest.
- Payees: Mum (PayNow ····4521, last paid 12 Sep) · John Tan (····4521) · John Lim (····8892) ·
  Helper (····7730).
- Assets: DBS D05.SI indicative S$44.12 · Apple AAPL.
- Demo hooks (dev menu): corrupt-draft toggle · force-validator-timeout · reset velocity counter.

## Pre-flight
- Phone on Wi-Fi same as laptop; Expo Go open; service running; LLM provider set and tested.
- Backup: screen recording of the full flow in case of connectivity failure.
