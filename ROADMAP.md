# Paper Jar — Roadmap & Progress

> ✅ done · 🔨 in progress · ⬜ not started · ⏸️ deferred  
> Last updated: 2026-10-11

## 🧪 Ready for you to test

**Checkpoint 5 (2026-10-11): Game-style UI + Classic/Drinks in every section**

🔗 **https://snack-f1451e12-d578-45f1-80ba-3277e2f9f4ea.expo.app**  
*(Hard-refresh or reinstall PWA — cache `v5`.)*

1. **Home** — colorful game tiles grouped into For two / Group games / Packs; “Card of the day” looks like a playing card; buttons squish when tapped.
2. **Style picker** — Partner, Friends, Party, Adult Fun, Workout, Brno vs. Praha and Office each open a sheet: 🎤 Classic or 🍻 Drinks.
3. **Adult Fun** — 18+ gate once, then the picker. Classic has no drink prompts any more; Drinks is truth-or-drink + votes.
4. **Workout** — Classic = moves and gym talk; Drinks = answer-or-drink with a squat/burpee alternative on every forfeit.
5. **Card screen** — white playing card with a colored type band (Question / Wild card / Dare, or Answer or drink / Vote / Do it or drink), card counter, big 🎲 Next card button, yellow drinks rule in Drinks mode.
6. **Party** — chunky Start / Next player buttons, player name chip, same card style.
7. **Golden Jar** (renamed from Home Screen Pack) — still unlocks by installing to the home screen.
8. **Know Me** and **Golden Jar** — open directly, no picker.

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
- ✅ Classic vs Drinks for every section (Partner, Friends, Party, Adult, Workout, Brno, Office)
- ✅ Game-style UI: tile menu, style sheet, playing-card screen; Home Screen Pack → Golden Jar

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
