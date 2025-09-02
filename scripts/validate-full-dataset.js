const path = require('path');

function loadDataset() {
  const mod = require(path.resolve(__dirname, '..', 'full_dataset.js'));
  return mod.dataset || mod.default || [];
}

const dataset = loadDataset();
const LANGS = ['en','cs','es','fr','pt','ru','zh','hi','ur','bn'];
const TAG_RE = /^\s*\[[A-Z]{2}\]/;

let missing = 0;
let tagged = 0;
let total = 0;

function checkList(list) {
  if (!Array.isArray(list)) return;
  for (const q of list) {
    if (!q || typeof q !== 'object') continue;
    total++;
    for (const L of LANGS) {
      const s = q[L];
      if (!s || !String(s).trim()) missing++;
      if (s && TAG_RE.test(String(s))) tagged++;
    }
  }
}

for (const t of dataset) {
  checkList(t.questions);
  checkList(t.crazy_questions);
  checkList(t.challenges);
}

console.log(JSON.stringify({ total, missingTranslations: missing, taggedPlaceholders: tagged }, null, 2));
if (missing > 0 || tagged > 0) {
  process.exitCode = 1;
}

