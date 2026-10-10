# Paper Jar — Roadmap & Progress

> This file is the single source of truth for progress. ✅ done · 🔨 in progress · ⬜ not started · ⏸️ deferred (with reason)
> Last updated: 2026-10-10

## 🧪 Ready for you to test

**Checkpoint 1 (2026-10-10): Web app + PWA + install reward** — test on both phones:

🔗 **Test link: https://snack-f1451e12-d578-45f1-80ba-3277e2f9f4ea--ih27h3lekg.expo.app**
*(stable link: https://snack-f1451e12-d578-45f1-80ba-3277e2f9f4ea.expo.app — may take a bit to go live)*

1. **Open the link on your iPhone (Safari) and Android (Chrome).** App should load fast and look like the native app.
2. **Play Partner mode** — tap the jar refresh button ~10 times. Every question should be different (no repeats).
3. **Close the tab, reopen the link, play again** — you should still get fresh questions (progress is saved).
4. **Tap the gold "Home Screen Pack" card** — it should show 🔒 and open a step-by-step install guide.
5. **Follow the guide** (iPhone: Share → Add to Home Screen; Android: ⋮ → Add to Home screen / Install).
6. **Open Paper Jar from the new home-screen icon** — you should get a "🎉 Home Screen Pack unlocked!" celebration, and the card now shows ⭐ and opens a 20-question bonus deck.
7. **Turn on Airplane Mode and reopen from the icon** — the app should still work offline (Android; iPhone offline support may need a couple of opens first).
8. **Favorites:** heart a question, open Favorites from home, remove one — a proper confirm dialog should appear (this used to silently fail on web).
9. **Switch language (EN ⇄ CS)** — the question on screen should translate in place instead of being replaced by a new one.
10. **On a laptop**, open the link — the app should render as a centered phone-width column, not stretched.

**Rollback:** every change in this checkpoint is one PR — see below. If you don't like something, tell me the item number and I'll adjust or revert just that piece.

## 🙋 Needs you (blockers only you can resolve)

- ⬜ **Accept the Xcode license** (one-time, enables iOS Simulator + system git): `sudo xcodebuild -license accept`
- ⬜ **Native-speaker review** of Czech + English question content (before public launch)
- ⬜ **Sign-ups** (needed from Milestone 3 onward): Supabase (accounts/sync), RevenueCat or Paddle (payments), PostHog (analytics), domain name

---

## Milestone 0 — Decisions & foundations
- ✅ App name: **Paper Jar** (all languages)
- ✅ Markets: Czech + English simultaneously
- ✅ Pricing model: monthly + yearly (3-day trial) + lifetime
- ✅ Install reward: bonus deck + daily question + streaks
- ✅ Spicy 18+ pack: yes, premium, behind age confirmation
- ⬜ Domain + social handles registered
- ⬜ Terms of service / privacy policy (GDPR)

## Milestone B1 — Installable web app + core polish (CURRENT)
- ✅ Bug fixes from initial review (Brno questions, swipe reset, favorites refresh, dependency cleanup)
- ✅ Web support enabled (react-native-web + Metro)
- ✅ PWA: manifest, icons, service worker (offline play), add-to-home-screen support
- ✅ "Paper Jar" name unified everywhere (was OtázkoJar / jarwpapers mix)
- ✅ No repeated questions (shuffle-bag, progress saved per deck)
- ✅ Web-safe dialogs (replaces Alert.alert which silently fails in browsers)
- ✅ Vibration feedback on new question (Android + Android Chrome)
- ✅ Desktop browser: app renders in phone-width column
- ✅ Debug console logging removed from production paths
- ✅ Duplicate root `FavoritesScreen.js` removed
- ⏸️ Name-entry onboarding — deferred until Party/pass-the-phone mode needs player names
- ⏸️ Sound effects — deferred (needs audio assets; vibration covers feedback for now)

## Milestone B1.5 — Install-to-unlock (first slice of reward system)
- ✅ Standalone/installed detection (web)
- ✅ "Home Screen Pack" bonus deck (20 questions, CS+EN)
- ✅ Locked card on Home with install guide (iOS + Android instructions)
- ✅ Unlock celebration on first launch from home screen icon

## Milestone B2 — Fun & game modes
- ⬜ Party mode (pass-the-phone: turns, dares, timer)
- ⬜ "How well do you know me?" mode with score card
- ⬜ Brno vs. Prague: real rivalry questions
- ⬜ Hint button: real hints or remove
- ⬜ Confetti/juice on question reveal
- ⬜ **FUN TEST GATE:** 10–20 couples play ≥15 min unprompted

## Milestone B3 — Accounts & analytics
- ⬜ Anonymous Supabase accounts, email magic-link upgrade
- ⬜ Favorites/progress/rewards sync
- ⬜ PostHog events (logAction → PostHog)

## Milestone B4 — Habit
- ⬜ Question of the day (web push)
- ⬜ Streaks (personal + couple) with weekly freeze
- ⬜ Weekly pack drop

## Milestone B5 — Freemium & payments
- ⬜ Pack system (free / install-reward / 3-sample / premium)
- ⬜ Paywall rebuild (monthly / yearly+trial / lifetime)
- ⬜ RevenueCat Web Billing or Paddle integration
- ⬜ Spicy 18+ pack behind age gate
- ⬜ Legal: ToS, privacy, VAT

## Milestone B6 — Virality
- ⬜ Share cards (question → story-size image)
- ⬜ Per-question links with rich previews
- ⬜ Brno vs. Prague voting + result cards (CZ) / This-or-That voting (EN)
- ⬜ Referral: invite → both get a pack

## Milestone B8 — Soft launch (CZ + EN)
- ⬜ Creator outreach (lifetime premium for 10–20 creators per market)
- ⬜ Weekly experiments: paywall copy, prices, install prompt timing
- ⬜ Targets: D1 ≥35%, D7 ≥15%, install ≥20%, pay 2–5%, viral ≥0.3

## Milestone B7 — Remote play (post-launch, if numbers justify)
- ⬜ Rooms via Supabase Realtime, join via link (no install)

## Milestone B9 — Native apps
- ⬜ EAS builds, RevenueCat IAP, widgets, enable New Architecture

---

## 🧪 Current test checklist (Batch 1 + install reward)

**On your Mac (fastest):**
1. `cd paper-jar-martin && npm run build:web && npm run serve:web`
2. Open http://localhost:8000 — app should load, play questions, no repeats.

**On your phones (same Wi-Fi as the Mac, while `serve:web` is running):**
- Open `http://<your-Mac-IP>:8000` in Safari (iPhone) / Chrome (Android).
- *(A hosted HTTPS link is listed below if deployment succeeded — prefer that for install testing.)*

**What to check — see PR description for the full step-by-step list.**
