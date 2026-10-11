#!/usr/bin/env node
/**
 * Builds the PWA: runs `expo export --platform web`, then injects the PWA tags
 * (manifest, iOS meta, service-worker registration) into dist/index.html.
 * Expo copies everything in public/ (manifest.json, sw.js, icons/) into dist/.
 *
 * Usage: npm run build:web
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const indexPath = path.join(root, 'dist', 'index.html');

console.log('▶ Exporting web build...');
execSync('npx expo export --platform web', { cwd: root, stdio: 'inherit' });

console.log('▶ Injecting PWA tags into dist/index.html...');
let html = fs.readFileSync(indexPath, 'utf8');

const headTags = `
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#FF6B6B" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="Talk Trap" />
    <link rel="apple-touch-icon" href="/icons/icon-180.png" />
    <meta name="description" content="Pull a card. The rest is up to you. Party, couple and friends card games — free in your browser." />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Talk Trap" />
    <meta property="og:title" content="Talk Trap · Pull a card. The rest is up to you." />
    <meta property="og:description" content="Questions, dares and drinking games for couples, friends and parties. Free, no sign-up." />
    <meta property="og:image" content="/icons/icon-512.png" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="Talk Trap" />
    <meta name="twitter:description" content="Pull a card. The rest is up to you." />
    <meta name="twitter:image" content="/icons/icon-512.png" />
`;

const swScript = `
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
          navigator.serviceWorker.register('/sw.js').catch(function () {});
        });
      }
    </script>
`;

if (!html.includes('rel="manifest"')) {
  html = html.replace('</head>', headTags + '</head>');
}
if (!html.includes('serviceWorker')) {
  html = html.replace('</body>', swScript + '</body>');
}
html = html.replace(/<title>[^<]*<\/title>/, '<title>Talk Trap</title>');

fs.writeFileSync(indexPath, html);
console.log('✅ PWA build ready in dist/. Serve with: npm run serve:web');
