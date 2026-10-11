# Paper Jar — Roadmap & Progress

> ✅ done · 🔨 in progress · ⬜ not started · ⏸️ deferred  
> Last updated: 2026-10-11

## 🧪 Ready for you to test

**Checkpoint 6 (2026-10-11): How-to-play rules, every screen size, Premium preview, sharing, your own cards**

🔗 **https://snack-f1451e12-d578-45f1-80ba-3277e2f9f4ea.expo.app**  
*(Hard-refresh or reinstall PWA — cache `v6`.)*

1. **How to play** — every game (Partner, Friends, Party, Adult, Workout, Brno vs. Praha, Office, Golden Jar, Know Me, Your cards) opens with its rules + extra Drinks rules + the yellow **Fun pact** (bickering = high-five + next card; whoever starts an argument owes a compliment). “Back” returns home. Yellow **?** in the header re-opens it. Settings → turn off “How to play before each game”.
2. **Screen sizes** — phone looks the same as before. iPad / tablet: 3-column tiles. Laptop / desktop: hero on the left, tiles on the right. TV / big monitor (≥1700 px): bigger text and cards. Rotate iPad: layout adapts. Sheets are centered pop-ups on big screens.
3. **Keyboard / TV remote (web)** — on a card: Space / Enter / → = next card, H = hint, F = favorite, S = share, ? = rules, Esc = back. Party: Space = next player.
4. **Share a card** — “📤 Share this card” makes a story-size image (phone share sheet; on desktop it downloads + copies the link). Adult cards share only a teaser, never the card text.
5. **Links** — opening a shared link starts that game on that exact card; `?ref=CODE` remembers who invited you. Party setup + Home tile + Settings have **Invite friends**. Know Me results have “Share our result” (X% in sync).
6. **Your cards** — Home → ✍️ Your cards: pick Question / Wild card / Dare, write, add, delete, “Play my cards”.
7. **Premium (preview only)** — Settings → Testing → “Preview paywall”. Then Adult/Workout/Office and every Drinks edition show 👑 and give 3 free sample cards, then the paywall (monthly 99 Kč · yearly 499 Kč with 3-day trial · lifetime 899 Kč). The button is a **test unlock** — no money moves. Settings → Premium → “Turn off test Premium” resets it. Leave the preview **off** for real players until payments are wired.
8. **Terms & Privacy** — link on Home, Settings and the paywall. Draft text, needs a lawyer.

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

## Rules + responsive (Checkpoint 6)
- ✅ How-to-play sheet + Fun pact for every game, Settings toggle (default on)
- ✅ Responsive phone / tablet / desktop / TV, landscape allowed, keyboard + remote shortcuts

## Milestone B5 — Freemium
- ✅ Entitlements (`utils/entitlements.js`): premium = Adult, Workout, Office, all Drinks, unlimited favorites/custom cards; 3-card free sample
- ✅ New paywall: monthly / yearly + 3-day trial / lifetime, restore, legal links
- ✅ Draft Terms + Privacy (GDPR) screen
- ⏸️ Real payments — RevenueCat (iOS/Android) + Paddle or Stripe (web); needs accounts from you
- ⏸️ Turn gating on for everyone — after payments work

## Milestone B6 — Virality
- ✅ Share-card story image (web) / native share text; adult = teaser only
- ✅ Deep links `?m=&v=&c=` + referral `?ref=` capture; invite buttons; Know Me result share
- ✅ Open Graph / Twitter preview tags
- ⏸️ Referral rewards + live group voting — need Supabase backend
- ⏸️ Own domain + custom OG image

## Milestone B10 (pulled forward) — Your own cards
- ✅ Write / delete / play custom cards (local only)
- ⏸️ Sync + share custom decks — needs Supabase

## Still to do
- ⬜ B7 Remote play (rooms across phones) — Supabase Realtime
- ⬜ B8 Soft launch (CZ): domain, landing page, store listing, TikTok/IG clips
- ⬜ B9 Native apps — Xcode license, EAS build, App Store / Play review
- ⬜ Native-speaker review of other languages; lawyer review of legal text
