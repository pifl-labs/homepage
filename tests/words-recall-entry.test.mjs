import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
const section = readme.split('### Free vocabulary-recall resource\n\n')[1]?.split('\n## 스택')[0];

test('public README exposes exactly the two canonical recall-sheet links', () => {
  assert.ok(section);
  const links = [...section.matchAll(/\[[^\]]+\]\((https:\/\/pifl-labs\.com\/assets\/printables\/one-word-recall-card-en\.(?:pdf|txt))\)/g)].map(x => x[1]);
  assert.deepEqual(links, [
    'https://pifl-labs.com/assets/printables/one-word-recall-card-en.pdf',
    'https://pifl-labs.com/assets/printables/one-word-recall-card-en.txt',
  ]);
  assert.match(section, /A5 PDF/);
});

test('recall-sheet action uses learned words and a reference, not auto grading', () => {
  for (const fact of ['already studied', 'without hints', 'reveal your reference', 'compare for yourself', 'blank attempt is OK']) {
    assert.ok(section.includes(fact), fact);
  }
  assert.ok(section.includes('no automatic grading, exam score or learning outcome is promised'));
  assert.doesNotMatch(section, /guaranteed|proven improvement|customer testimonial|AI handwriting recognition/i);
});

test('free paper and optional limited ad-supported paid app stay separate', () => {
  for (const fact of ['No app or sign-up required.', 'Original PiFl Labs', 'AI assistance', 'optional Vocab Routine iOS link is separate', 'free basic decks with daily limits', 'ads and optional word packs/subscription']) {
    assert.ok(section.includes(fact), fact);
  }
  assert.doesNotMatch(section, /all apps are free|unlimited free|Android update|App Store approval/i);
});

test('existing public resources and official website entry remain available', () => {
  for (const path of ['one-line-journal-en.pdf', 'one-small-start-en.pdf', 'pifl-labs-ios-portfolio-2026-10-11.pdf']) {
    assert.ok(readme.includes('https://pifl-labs.com/assets/' + (path.startsWith('pifl-labs-ios') ? 'press/' : 'printables/') + path));
  }
  assert.ok(readme.includes('[English](https://pifl-labs.com/en/)'));
});
