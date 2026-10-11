import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const url = 'https://pifl-labs.com/assets/printables/one-line-journal-en.pdf';
const pdf = readFileSync(new URL('../public/assets/printables/one-line-journal-en.pdf', import.meta.url));
const txt = readFileSync(new URL('../public/assets/printables/one-line-journal-en.txt', import.meta.url), 'utf8');
const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');

test('journal resource keeps the document-QA accepted bytes', () => {
  assert.equal(pdf.length, 3180);
  assert.equal(pdf.subarray(0,5).toString(), '%PDF-');
  assert.equal(createHash('sha256').update(pdf).digest('hex'), '4ba5dac07e719266d5619cfd5cefe3e63d160321c9bb6233b64790f518fb3aa8');
});
test('plaintext companion gives the actual resource URL and optional app boundary', () => {
  for(const s of [url, 'No app or sign-up required.', 'Mood Tile for iOS (optional).', 'App includes ads;', 'one-time upgrade.', 'No subscription.', 'not a health assessment.', 'AI-assisted preparation']) assert.ok(txt.includes(s),s);
});
test('README supplies discovery and a non-clinical transparent resource description', () => {
  for(const s of [url,'one-line-journal-en.txt','Seven undated spaces','AI assistance','not a health assessment','optional Mood Tile iOS link','no subscription']) assert.ok(readme.includes(s),s);
});
test('resource does not claim a new app, Android support, outcomes or cloud backup', () => {
  for(const s of ['clinically','guaranteed','cloud backup','Android','testimonial','no tracking','100% private']) assert.ok(!txt.includes(s),s);
});
