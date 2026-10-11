# Paper Jar — Roadmap & Progress

> ✅ done · 🔨 in progress · ⬜ not started · ⏸️ deferred  
> Last updated: 2026-10-11

## 🧪 Ready for you to test

**Checkpoint 4 (2026-10-11): Classic vs Drinks for Partner / Party / Workout**

🔗 **https://snack-f1451e12-d578-45f1-80ba-3277e2f9f4ea.expo.app**  
*(Hard-refresh or reinstall PWA — cache `v4`.)*

1. **Partner** — tap → style picker → **Classic** shows normal talk/challenge deck; **Drinks** shows answer-or-drink + vote-and-sip prompts; Drinks pill on game header.
2. **Party** — same picker; Drinks setup copy mentions answer-or-drink / votes; play a few rounds and confirm vote prompts (e.g. best date energy → winner drinks).
3. **Workout** — Classic = sweat prompts; Drinks = answer-or-drink / vote with sip-or-squats forfeits.
4. **Other modes** (Friends, Brno, Office, Adult, Know Me) — still open directly, no style picker.
5. **CS/EN** — picker titles and drink prompts read naturally in both languages.

**Rollback:** cite checklist # and I’ll adjust that piece.

## 🙋 Needs you

- ⬜ Xcode license: `sudo xcodebuild -license accept`
- ⬜ Supabase + PostHog + RevenueCat/Paddle + domain (for full cloud B3/B5)
- ⬜ Fun test with real groups (B2 gate)

---

## Milestone B1 / B1.5 / B2
- ✅ Complete (PRs #22, #23)

## Milestone B2.5 — Packs, settings, UX
- ✅ Party timer in Settings, **off by default**
- ✅ Adult Fun (18+), Workout, Office packs
- ✅ UX polish: QOTD, streaks chip, packs section, card lift, denser mode cards
- ✅ CS+EN content pass on new packs + Brno rivalry already bilingual
- ✅ Classic vs Drinks style picker for Partner, Party, Workout (answer-or-drink + vote decks)

## Milestone B3 — Accounts & analytics
- ✅ Local analytics event queue (`utils/analytics.js`) ready for PostHog
- ✅ Play events tracked (home, game, party, know-me, adult confirm)
- ⏸️ Cloud anonymous accounts — needs Supabase keys from you
- ⏸️ PostHog flush — needs project key from you

## Milestone B4 — Habit
- ✅ Question of the day (stable daily pick from main deck)
- ✅ Local streaks + weekly freeze (`utils/streaks.js`)
- ⏸️ Web push notifications — needs permission UX + service later
- ⏸️ Weekly pack drop automation — later

## Milestone B5+ 
- ⬜ Freemium payments, virality, soft launch, remote play, native
