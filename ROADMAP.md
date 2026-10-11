# Paper Jar — Roadmap & Progress

> This file is the single source of truth for progress. ✅ done · 🔨 in progress · ⬜ not started · ⏸️ deferred (with reason)
> Last updated: 2026-10-11

## 🧪 Ready for you to test

**Checkpoint 2 (2026-10-11): Fun modes (B2)** — test on both phones:

🔗 **Test link: https://snack-f1451e12-d578-45f1-80ba-3277e2f9f4ea.expo.app**
*(After deploy; hard-refresh or reinstall PWA if you still see the old home without Party.)*

1. **Home** shows **Party** and **How well do you know me?** (plus Brno for all languages).
2. **Party:** add 2+ names → Start → see “Pass phone to [name]”, a question/dare, optional 30s timer → Next player rotates.
3. **How well do you know me?:** enter two names → Player A locks a secret answer → pass to B → B guesses → reveal + score after 6 rounds.
4. **Brno vs. Prague:** questions should be about the city rivalry (not generic icebreakers).
5. **Partner/Friends:** tap the lightbulb — a real hint tip appears under the question.
6. **Partner/Friends:** each new question should show a short confetti burst.
7. **Splash:** after ~4s the splash should disappear and taps should work (web fix).

**Rollback:** tell me the checklist item number and I’ll adjust or revert that piece.

## 🙋 Needs you

- ⬜ **Accept the Xcode license:** `sudo xcodebuild -license accept`
- ⬜ **Native-speaker review** of Czech + English question content (before public launch)
- ⬜ **Fun test:** 10–20 couples/friends play ≥15 min unprompted (gate before B3)
- ⬜ **Sign-ups** (from B3): Supabase, RevenueCat/Paddle, PostHog, domain

---

## Milestone 0 — Decisions & foundations
- ✅ App name: **Paper Jar**
- ✅ Markets: Czech + English
- ✅ Pricing / install reward / Spicy decisions locked
- ⬜ Domain + social handles
- ⬜ ToS / privacy (GDPR)

## Milestone B1 — Installable web app + core polish
- ✅ Complete (see Checkpoint 1 history / PR #22)

## Milestone B1.5 — Install-to-unlock
- ✅ Complete

## Milestone B2 — Fun & game modes
- ✅ Party mode (pass-the-phone: turns, dares, timer)
- ✅ "How well do you know me?" with score card
- ✅ Brno vs. Prague: real rivalry questions (CS + EN)
- ✅ Hint button shows real conversation tips
- ✅ Confetti on question reveal
- ✅ Splash overlay failsafe on web
- ⬜ **FUN TEST GATE:** 10–20 couples play ≥15 min unprompted

## Milestone B3 — Accounts & analytics
- ⬜ Anonymous Supabase accounts, email magic-link upgrade
- ⬜ Favorites/progress/rewards sync
- ⬜ PostHog events

## Milestone B4 — Habit
- ⬜ Question of the day (web push)
- ⬜ Streaks + weekly freeze
- ⬜ Weekly pack drop

## Milestone B5 — Freemium & payments
- ⬜ Pack system + paywall + Spicy 18+ + legal

## Milestone B6 — Virality
- ⬜ Share cards, question links, voting, referrals

## Milestone B8 — Soft launch (CZ + EN)
- ⬜ Creators + experiments + retention targets

## Milestone B7 — Remote play (post-launch if justified)
- ⬜ Supabase Realtime rooms

## Milestone B9 — Native apps
- ⬜ EAS builds, IAP, widgets, New Architecture
