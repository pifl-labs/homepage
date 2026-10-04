import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initialMatch, chooseMatch, nextMatch } from '../public/hello-letter-match.mjs';
const component = readFileSync(new URL('../src/components/HelloLetterMatch.astro', import.meta.url), 'utf8');
const landing = readFileSync(new URL('../src/components/AppLanding.astro', import.meta.url), 'utf8');
const script = readFileSync(new URL('../public/hello-letter-match.mjs', import.meta.url), 'utf8');
test('English Hello only, before actual app screenshots', () => {
  assert.match(landing, /app\.slug === 'pipi-hello' && lang === 'en' && <HelloLetterMatch \/>/);
  assert.ok(landing.indexOf('<HelloLetterMatch />') < landing.indexOf('<!-- SCREENSHOT SHOWCASE'));
});
test('website sample and no audio are explicit; pricing not all-free', () => {
  for (const text of ['This website sample has no audio.', 'free content and an optional annual subscription.', 'role="status"', 'aria-live="polite"', '<noscript>', ':focus-visible', 'min-height: 44px']) assert.ok(component.includes(text), text);
});
test('sample leads to real store options without new destination or tracking', () => {
  assert.match(component, /href="#hello-download">View app download options/);
  assert.match(landing, /id=\{app\.slug === 'pipi-hello' && lang === 'en' \? 'hello-download' : undefined\}/);
});
test('enlarged letters reflow instead of shrinking or clipping', () => {
  assert.match(component, /repeat\(auto-fit, minmax\(min\(100%, 4rem\), 1fr\)\)/);
  assert.doesNotMatch(component, /text-overflow:\s*ellipsis|overflow:\s*hidden|!important/);
});
test('external same-origin module respects existing self-only CSP', () => {
  assert.match(component, /<script is:inline type="module" src="\/hello-letter-match\.mjs\?v=1"><\/script>/);
  assert.doesNotMatch(script, /fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|Audio\s*\(/);
});
test('wrong answer cannot advance and gives gentle accurate feedback', () => {
  const a = initialMatch(), b = chooseMatch(a, 'い');
  assert.equal(b.matched, false); assert.equal(b.feedback, 'That is い. Look for あ.');
  assert.strictEqual(nextMatch(b), b); assert.equal(a.feedback, 'Choose the same shape.');
});
test('correct letter then explicit next makes second question; not autoplay', () => {
  const a = chooseMatch(initialMatch(), 'あ'); assert.equal(a.index, 0); assert.equal(a.matched, true);
  const b = nextMatch(a); assert.equal(b.index, 1); assert.equal(b.matched, false);
  assert.equal(chooseMatch(b, 'あ').matched, false); assert.equal(chooseMatch(b, 'い').matched, true);
});
test('after completion no third question or score inflation; reset returns first', () => {
  const a = chooseMatch(nextMatch(chooseMatch(initialMatch(), 'あ')), 'い');
  assert.strictEqual(nextMatch(a), a); assert.strictEqual(chooseMatch(a, 'あ'), a);
  assert.deepEqual(initialMatch(), { index: 0, matched: false, feedback: 'Choose the same shape.' });
});
test('unknown choice never changes the state', () => {
  const a = initialMatch(); assert.strictEqual(chooseMatch(a, 'unknown'), a);
});
