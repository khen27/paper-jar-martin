/* node scripts/validateDataset.js */
const path = require('path');

function loadDataset() {
  const mod = require(path.resolve(__dirname, '..', 'full_dataset.js'));
  return mod.dataset || mod.default || [];
}

const dataset = loadDataset();
const placeholderRe = /^\s*\[[A-Z]{2}\]/;

let totalRegular = 0, totalCrazy = 0, totalChallenges = 0;
let placeholderCounts = { en: 0, cs: 0 };
let langPresence = {};
let duplicates = new Set();
let seen = new Set();

function scanList(list) {
  for (const q of list) {
    if (!q || typeof q !== 'object') continue;
    const langs = Object.keys(q);
    langs.forEach(l => (langPresence[l] = (langPresence[l] || 0) + 1));
    const key = (q.cs || q.en || Object.values(q)[0] || '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
    if (key) {
      if (seen.has(key)) duplicates.add(key);
      else seen.add(key);
    }
    if (q.en && placeholderRe.test(q.en)) placeholderCounts.en++;
    if (q.cs && placeholderRe.test(q.cs)) placeholderCounts.cs++;
  }
}

for (const t of dataset) {
  scanList(t.questions || []);
  totalRegular += (t.questions || []).length;
  scanList(t.crazy_questions || []);
  totalCrazy += (t.crazy_questions || []).length;
  scanList(t.challenges || []);
  totalChallenges += (t.challenges || []).length;
}

const total = totalRegular + totalCrazy + totalChallenges;

console.log('=== OtázoJar Dataset Report ===');
console.log('Topics:', dataset.length);
console.log('Totals -> Regular:', totalRegular, 'Crazy:', totalCrazy, 'Challenges:', totalChallenges, 'All:', total);
console.log('Language presence keys:', Object.keys(langPresence).sort().join(', '));
console.log('Placeholders -> EN:', placeholderCounts.en, 'CS:', placeholderCounts.cs);
console.log('Approx duplicate canonical entries:', duplicates.size);


