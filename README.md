# OtázkoJar (jarwpapers)

Expo SDK 53 / React Native 0.79 app.

## Setup

```bash
npm install
```

A plain `npm install` works; no `--legacy-peer-deps` or `--force` needed.

## Run on the web (PWA)

```bash
npm run build:web   # builds the PWA into dist/
npm run serve:web   # serves it at http://localhost:8000
npx eas-cli deploy  # deploys dist/ to EAS Hosting (HTTPS link for phone testing)
```

The web build is a full PWA: installable to the home screen, works offline, and unlocks
the "Golden Jar" bonus deck when launched from the home-screen icon.

## Run on emulators / simulators

```bash
npm run android   # Android emulator (start one from Android Studio first, or let Expo launch it)
npm run ios       # iOS Simulator (requires Xcode)
```

Both commands open the app in **Expo Go**. Expo Go only supports one SDK version at a time, so the
emulator/simulator must have the Expo Go build for **SDK 53**. When Expo asks
"Expo Go x.y.z is recommended for SDK 53... Install the recommended Expo Go version?", answer **yes**.

### Troubleshooting

- **iOS: "You have not agreed to the Xcode license agreements"** — run `sudo xcodebuild -license accept` once.
- **Android emulator window crashes on launch** — start it from the terminal with software rendering:
  `~/Library/Android/sdk/emulator/emulator -avd Pixel_9 -gpu swiftshader_indirect`
  (or `-no-window` to run it headless), then run `npm run android`.

## Scripts

- `npm run validate:data` / `npm run validate:full` — dataset sanity checks
- `npm run i18n:list-missing -- <lang>` — list questions missing a translation for a language
