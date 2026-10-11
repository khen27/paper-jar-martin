# Paper Jar — Roadmap & Progress

> ✅ done · 🔨 in progress · ⬜ not started · ⏸️ deferred  
> Last updated: 2026-10-11

## 🧪 Ready for you to test

**Checkpoint 3 (2026-10-11): Packs + Settings + Habit slice + polish**

🔗 **https://snack-f1451e12-d578-45f1-80ba-3277e2f9f4ea.expo.app**  
*(Hard-refresh or reinstall PWA — cache `v3`.)*

1. **Settings (⚙)** — Party timer is **off by default**; toggle it on, then open Party and confirm timer appears. Toggle off and confirm it stays off.
2. **Party setup** — timer row says off by default; changing it syncs with Settings.
3. **Packs:** Adult Fun (18+ gate once), Workout, Office — each draws pack-specific prompts.
4. **Adult Fun** — confirm dialog; truths / dares / drink-or-cringe; not explicit.
5. **Workout** — movement challenges + fitness questions (inclusive tone).
6. **Office** — work-safe; no romance/alcohol/politics.
7. **Home polish** — Question of the day card, streak chip after you play, clearer Packs section.
8. **Streak** — play any mode, reopen home/settings — streak increments for today.
9. **Language CS/EN** — pack titles and gate copy look natural.

**Rollback:** cite checklist # and I’ll adjust that piece.

## 🙋 Needs you

- ⬜ Xcode license: `sudo xcodebuild -license accept`
- ⬜ Supabase + PostHog + RevenueCat/Paddle + domain (for full cloud B3/B5)
- ⬜ Fun test with real groups (B2 gate)

---

## Milestone B1 / B1.5 / B2
- ✅ Complete (PRs #22, #23)

## Milestone B2.5 — Packs, settings, UX (this checkpoint)
- ✅ Party timer in Settings, **off by default**
- ✅ Adult Fun (18+), Workout, Office packs
- ✅ UX polish: QOTD, streaks chip, packs section, card lift, denser mode cards
- ✅ CS+EN content pass on new packs + Brno rivalry already bilingual

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
