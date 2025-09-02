const path = require('path');

const targetLang = process.argv[2];
if (!targetLang) {
  console.error('Usage: node scripts/list-missing-translations.js <lang>');
  process.exit(1);
}

function loadDataset() {
  const mod = require(path.resolve(__dirname, '..', 'full_dataset.js'));
  return mod.dataset || mod.default || [];
}

const dataset = loadDataset();
const locales = require(path.resolve(__dirname, '..', 'content', 'locales'));
const TAG_RE = /^\s*\[[A-Z]{2}\]/;

const missing = new Set();

function scan(list) {
  if (!Array.isArray(list)) return;
  for (const q of list) {
    if (!q || typeof q !== 'object') continue;
    const cs = String(q.cs || '')
      .replace(/^\s*\[[A-Z]{2}\]\s*/, '')
      .replace(/\s*\(\d+\)/g, '')
      .replace(/\s+([\?\.!:,;])/g, '$1')
      .replace(/\s+$/, '')
      .trim();
    const tr = String(q[targetLang] || '').trim();
    const overlay = (locales[targetLang] || {})[cs];
    if ((!tr || TAG_RE.test(tr)) && !overlay) {
      if (cs) missing.add(cs);
    }
  }
}

for (const t of dataset) {
  scan(t.questions);
  scan(t.crazy_questions);
  scan(t.challenges);
}

console.log(JSON.stringify({ lang: targetLang, count: missing.size, items: Array.from(missing) }, null, 2));

