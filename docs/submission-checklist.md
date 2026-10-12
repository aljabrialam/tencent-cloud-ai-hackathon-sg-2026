# Submission Checklist

Deadline: **16 Oct 2026, 23:59 SGT**. Form: https://tinyurl.com/TCHackathonSGProjectSubmission
Handbook: https://tinyurl.com/SGHackathonHandbook

## Mandatory (no scoring without these)

- [ ] Team registered (1–3 members, all Singapore-based) — https://qdrl.qq.com/65xN1yft
- [ ] Project built with **CodeBuddy and/or WorkBuddy**
- [ ] **≥ 3 screenshots / screen recordings of CodeBuddy or WorkBuddy chat logs** from the build,
      saved in `design/tool-proof/` and attached to the form
- [ ] Project title: **SayPay**
- [ ] Short blurb (< 10 words): *Speak a payment. Code decides. You sign.*
- [ ] Project description covering:
  - [ ] Overview: target scenarios, users, value proposition (`docs/use-cases.md`)
  - [ ] Real-world insights: pain points, audience, problems solved
  - [ ] Solution design: business + technical architecture, how prompts drive generation
        (`docs/architecture.md`, `docs/business-flow.md`)
  - [ ] Business value: quantifiable metrics (`spec.md` Success Criteria)
- [ ] 16:9 cover image (380×216 recommended) — `design/cover.png` (generate in Miora)
- [ ] State the chosen case study at the start of the presentation: *Banking Track — DBS DCTA,
      Scenario 1*

## Tencent Cloud accounts (user action, before 13 Oct implementation)

- [ ] **ADP**: register individual account → App Dev → create agent "SayPay Drafter" → publish →
      copy **Experience URL** (shareable) and **AppKey** (secret → `apps/service/.env`).
      Guide: https://tinyurl.com/Hackathon-ADP-Guide · video: https://tinyurl.com/ADP-Training-Video
- [ ] **TRTC**: register → Create Application → *Conversational AI* → copy **SDKAppID** +
      **SDKSecretKey** (ASR) → Access Keys → **SecretId/SecretKey** (TTS). Free 10,000 credit-min/month.
      Quickstart: https://tinyurl.com/Hackathon-TRTC-Quickstart · support: Telegram group in the quickstart
- [ ] Hunyuan / OpenAI / Anthropic API key for the Validation Agent
- [ ] Screenshot ADP console (agent config + publish page, **AppKey masked**) and TRTC console
      → `design/tool-proof/` (extra evidence of Tencent tool usage)

## Optional (bonus)

- [ ] Demo video 5–8 min: overview · core agent features · build reflection with
      CodeBuddy/WorkBuddy tips (`docs/demo-script.md`)
- [ ] Project link: GitHub repo + Expo preview / hosted mockup
- [ ] Architecture + trust-boundary diagram (judges across tracks asked for it)

## Judging dimensions (10 × 10 pts) — where each is evidenced

| Dimension | Evidence |
|---|---|
| Impact & Relevance | DBS challenge mapping in README; scam-loss framing |
| Human-Centered Design | Personas, clarify-not-guess, read-aloud, multilingual |
| AI Interaction | Multi-intent parsing, dual-engine validation, provider switching |
| Technical Execution | Policy tests, signature gateway, hash-chained audit |
| Feasibility | Mock boundaries map 1:1 to real DBS systems; adapter pattern |
| Demo & Storytelling | 3-min beat sheet, three refusal flows |
| Innovation & Creativity | Symbolic formulas, freeze-on-discrepancy, cooling-off UX |
| UX & Accessibility | 44 pt targets, colour + icon + words, large type |
| Responsible AI & Ethics | Constitution, zero write path for the model, audit trail |
| Overall Quality | README + docs + Figma + working app |

## Timeline to deadline

| Day | Focus |
|---|---|
| 12 Oct (Sun) | Spec, docs, Figma mockups, README |
| 13 Oct | Shared types, policy engine + tests, mock bank, gateway signature |
| 14 Oct | Expo screens 1–9 against mock service; LLM adapter + validator |
| 15 Oct | Shield, demo hooks, polish, CodeBuddy screenshots, cover image |
| 16 Oct | Demo video, final README status, submit by 18:00 (buffer) |
