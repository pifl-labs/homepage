import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const landing = readFileSync(new URL('../src/components/AppLanding.astro', import.meta.url), 'utf8');
const css = readFileSync(new URL('../public/styles-app-landing.css', import.meta.url), 'utf8');
const section = landing.match(/<section\b[^>]*id="bridge-ja-activity"[^>]*>[\s\S]*?<\/section>/)?.[0];

test('the family activity entry appears only in Japanese Bridge', () => {
  assert.ok(section);
  assert.equal((landing.match(/id="bridge-ja-activity"/g) ?? []).length, 1);
  assert.match(landing, /app\.slug === 'pipi-bridge' && lang === 'ja' && \(\s*<section[^>]+id="bridge-ja-activity"/);
});

test('one language-marked action opens the existing Japanese role-play instructions', () => {
  assert.equal((section.match(/<a\b/g) ?? []).length, 1);
  assert.match(section, /href="https:\/\/pipi-worlds\.com\/ja\/learn\/korean-school-help-phrase\/" hreflang="ja"/);
  assert.match(section, /<span>手順を読む<\/span>/);
});

test('the copy describes parent-child role play, free on-screen steps, and no app or registration', () => {
  assert.match(section, /<h2 id="bridge-ja-activity-title">親子の遊び<\/h2>/);
  const paragraphs = [...section.matchAll(/<p style="text-wrap: balance">(.*?)<\/p>/gs)];
  assert.deepEqual(paragraphs.map(match => match[1]), ['「手伝ってください」を韓国語で言ってみる、親子の役割遊びです。', '無料の手順を画面で読めます。アプリや登録は不要です。']);
});

test('the entry adds no photo, recording, grading, file, form or script controls', () => {
  assert.doesNotMatch(section, /<form|<input|<button|<script|<img|<iframe|download=|target=|onclick|fetch\(|localStorage|\.pdf|録音|採点|効果|写真|app-download-note/);
});

test('the entry reuses resource hierarchy with only two local balanced paragraphs', () => {
  for (const value of ['app-section app-section--bridge-resource', 'app-bridge-resource', 'app-bridge-resource-link', 'aria-labelledby="bridge-ja-activity-title"']) assert.ok(section.includes(value), value);
  assert.doesNotMatch(section, /<style|btn-primary|<br/);
  assert.deepEqual([...section.matchAll(/style="([^"]*)"/g)].map(match => match[1]), ['text-wrap: balance', 'text-wrap: balance']);
});

test('the existing English resource remains before the Japanese entry', () => {
  const en = landing.indexOf("app.slug === 'pipi-bridge' && lang === 'en'");
  const ja = landing.indexOf("app.slug === 'pipi-bridge' && lang === 'ja'");
  assert.ok(en >= 0 && ja > en);
  const existing = landing.slice(en, ja);
  assert.ok(existing.includes('href="https://pipi-worlds.com/en/learn/korean-school-help-phrase/" hreflang="en"'));
  assert.ok(existing.includes('A two-minute family activity with free printables. No app or sign-up needed.'));
  assert.match(existing, /\)\}\{$/);
});

test('the reused resource styles support narrow layouts and visible keyboard focus', () => {
  assert.match(css, /\.app-bridge-resource \{[^}]*minmax\(0, 1fr\)/);
  assert.match(css, /\.app-bridge-resource-link \{[^}]*max-width: 100%/);
  assert.match(css, /\.app-bridge-resource-link:focus-visible \{[^}]*outline: 2px solid/);
  assert.match(css, /@media \(max-width: 760px\) \{\s*\.app-bridge-resource \{ grid-template-columns: minmax\(0, 1fr\);/);
});


test('the normal built-test command preserves its four checks and appends the Bridge guard', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(pkg.scripts['test:built'], 'node scripts/check-store-links.mjs && node scripts/check-draw-landing.mjs && node scripts/check-store-transition.mjs && node scripts/check-script-cache.mjs && node scripts/check-bridge-landing.mjs');
});
