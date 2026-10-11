# Talk Trap (formerly Paper Jar) — Roadmap & Progress

> ✅ done · 🔨 in progress · ⬜ not started · ⏸️ deferred  
> Last updated: 2026-10-11

## 🧪 Ready for you to test

**Checkpoint 7 (2026-10-11): Talk Trap rename, seasonal packs + skins, ads, sip tally, cheaper Premium**

🔗 **https://snack-f1451e12-d578-45f1-80ba-3277e2f9f4ea.expo.app**  
*(Hard-refresh or reinstall PWA — cache `v7`.)*

1. **Name** — the app is now **Talk Trap** everywhere (title, splash, share images, install name).
2. **3D icons** — home tiles, style picker, rules and paywall use colorful 3D icons (Microsoft Fluent, MIT) instead of plain emoji.
3. **Seasonal packs** — Home → “🍂 Seasonal”: **Halloween** (Classic + Drinks, Oct 1–Nov 5) and **Cozy Fall** (Sep 15–Nov 30) are open now with a “⏳ Limited” corner. **Christmas** (Classic + Drinks) shows as “Opens 20. 11.” Settings → Testing → “Open all seasonal packs” to try it today.
4. **Premium skins** — Color screen → “Premium skins”: Halloween, Fall, Winter backgrounds with floating icons (bats, leaves, snowflakes) on Home, games and paywall. Locked → start free trial, or watch an ad for 24 h.
5. **Drinks** — first time you pick Drinks: 🔞 legal-drinking-age-where-you-are notice (or “Play Classic instead”). In game: **Sip tally** bar — tap a name +1, hold −1, add players, 🏆 results (Sip champion / Hydration hero + water/no-driving note), reset.
6. **Mute tip** — every rules sheet + Party setup tells people to turn on Do Not Disturb before passing the phone around. Partner rules: put other screens away.
7. **Workout rule** — can’t do a move? Give a compliment or do a group challenge — agreed before you start.
8. **Premium (preview)** — Settings → Testing → “Preview paywall & ads”. Paywall now uses your current background. Lower prices: **49 Kč / month · 249 Kč / year · 449 Kč lifetime**. Every plan says **Start free trial** (beta, no card). Locked pack → “Watch a short ad: play this pack free for 1 hour”.
9. **Ads (preview)** — with the preview on and no Premium: a short skippable ad break every 15 cards (12 rounds in Party). These are our own “house ads” (placeholders) until an ad network is connected.
10. **Terms** — legal drinking age by location + sip tally is not a drinking contest.

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

## Checkpoint 7 — Talk Trap
- ✅ Rename, 3D icons, seasonal packs (Halloween, Fall, Christmas) with dates
- ✅ Premium skins + ad unlocks (deck 1 h, skin 24 h), house-ad breaks
- ✅ Sip tally, drinking-age gate, mute tip, workout fallback rule
- ✅ Lower prices, beta free trial on every plan, paywall matches theme
- ⏸️ Real ads (AdMob / AdSense) + real payments (RevenueCat / Paddle) — needs accounts

## Still to do
- ⬜ B7 Remote play (rooms across phones) — Supabase Realtime
- ⬜ B8 Soft launch (CZ): domain, landing page, store listing, TikTok/IG clips
- ⬜ B9 Native apps — Xcode license, EAS build, App Store / Play review
- ⬜ Native-speaker review of other languages; lawyer review of legal text
