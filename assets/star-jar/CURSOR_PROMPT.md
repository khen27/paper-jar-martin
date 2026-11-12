I've added a folder called `star-jar-kit/` to the repo. It contains a new 3D (Microsoft Fluent 3D style) version of our star-jar icon, pre-rendered as separate layers so we can animate it in code, plus a pre-rendered animated loop. Please integrate it into the app.

## What's in the kit
- `layers/` — 1024×1024 transparent PNGs, all on the SAME square canvas (stack them with `position:absolute; inset:0` and they line up perfectly):
  - `00-full.png` — the complete static icon (use as fallback / app icon source)
  - `01-glass-back.png` → `02-stars.png` → `03-glass-front.png` → `04-lid.png` → `05-hero-star.png` → `06-spark-star.png` (this is the bottom-to-top stacking order)
- `layers-webp/` — same layers at 512px WebP (~150KB total). **Use these in the UI**; use the 1024 PNGs only for icon generation.
- `sparkle.png` / `sparkle.webp` — a soft 4-point twinkle sprite for decoration.
- `pivots.json` — transform-origin points (in % of the canvas) for each part: `jarBase`, `lidCenter`, `heroCenter`, `sparkCenter`, `starsCenter`, `jarMouth`. Because every layer is the full canvas, these % values work directly as CSS `transform-origin`.
- `source/` — the Blender scripts that generated everything (ignore; for re-rendering only).
- `demo.html` — **the reference implementation. Open it and treat it as the source of truth** for layer order, pivots, idle loops and the tap "pop" keyframes. Port it; don't reinvent the motion.
- `anim/` — a 2.5s seamless real-3D loop rendered in Blender (lid pops, star shoots out, jar squashes), transparent background, non-interactive, for splash/loading:
  - `jar-loop.webm` (VP9 + alpha, ~360KB) — primary for Chrome/Edge/Firefox/Android
  - `jar-loop.webp` (512px, ~1.7MB) and `jar-loop-320.webp` (~860KB) — animated WebP fallback for Safari/iOS (Safari can't do VP9 alpha)
  - `frames/` — the 60 PNG frames, if you ever need them

## Tasks
1. **Move assets** into our static/public assets folder (e.g. `public/star-jar/`, or wherever this project serves images from) keeping the subfolder structure. Check our stack first and follow its conventions.

2. **Build a reusable `StarJar` component** (React + Framer Motion if we use React and already have it or it's easy to add; otherwise plain CSS keyframes exactly like `demo.html`):
   - Props: `size` (px or CSS length, default ~200px), `interactive` (bool), `autoPopEvery` (optional ms), `onPeak` (callback), `onPopEnd` (callback), `variant: "layered" | "loop" | "static"`.
   - Structure (inside a square, `position:relative`, `overflow: visible`):
     a wrapper `.body` (transform-origin = jarBase) containing glass-back, stars, glass-front; then lid, hero star, spark star, and 2–3 sparkle sprites, all absolutely stacked.
   - **Idle** (always on): gentle whole-jar bob (~1.5% translateY, 3.2s), hero star float (+ small rotate), spark star twinkle (scale/rotate), sparkles fading in/out on staggered delays.
   - **Pop** (on tap/click/Enter/Space when `interactive`): squash-and-stretch on `.body`, stars jiggle, lid pops up-left and spins then lands with a little bounce, hero star shoots up with a full 360° spin + scale and drops back, spark star bursts. Total ~1.05s. Ignore taps while a pop is running.
   - Fire `onPeak` at ~45% of the pop (≈470ms) — that's the visual high point — and `onPopEnd` when it finishes.
   - Only animate `transform` and `opacity`; add `will-change: transform` on animated layers.
   - Respect `prefers-reduced-motion`: no idle loops, and the pop becomes a quick fade/scale of the hero star only.
   - Accessible: `role="button"`, `aria-label` (e.g. "Pull a card"), focusable, keyboard-triggerable; decorative `<img alt="">` for layers.
   - Preload the layer images and don't render the animated version until they're loaded (show `00-full` meanwhile) so layers never pop in out of sync.

3. **Use it in the app**:
   - Replace the current flat jar on the home screen with `<StarJar interactive />`. **Wire `onPeak` into our "pull a card" flow** so tapping the jar is a way to draw a card (the star flying out → the card appearing should feel like one motion; e.g. start the card's enter animation from the jar's mouth position, `pivots.jarMouth`).
   - Use `variant="loop"` for the splash / loading state: render `<video autoplay loop muted playsinline>` with `jar-loop.webm` on browsers that support VP9 alpha, and an `<img>` of `jar-loop-320.webp` on Safari/iOS (detect Safari via UA or a feature check; when unsure, use the WebP). Lazy-load it; never block first paint on it.
   - Make sure parent containers don't clip the lid/hero star when they pop above the jar (leave ~20% headroom or `overflow: visible`).

4. **Update app icons** from `layers/00-full.png`: favicon, PWA manifest icons (192, 512, plus a maskable 512 with ~12% padding on our brand background color), and `apple-touch-icon` (180, solid background — iOS doesn't do transparency). Update the manifest and `<head>` tags accordingly.

5. Don't change the artwork itself (colors/positions) — it's rendered; if something looks off, tell me rather than editing pixels.

When done, give me a short summary of where the component lives, how to use it, and anything you couldn't do.
