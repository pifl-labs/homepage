import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { japaneseReadingParts } from '../src/components/app-name-parts.mjs';

test('Dream Japanese hero keeps the short 夢日記 reading unit without changing copy', () => {
  const text = '声で残す夢日記';
  assert.deepEqual(japaneseReadingParts(text, 'title'), [
    { text: '声で残す', keepWhole: false },
    { text: '夢日記', keepWhole: true },
  ]);
  assert.equal(japaneseReadingParts(text, 'title').map(part => part.text).join(''), text);
  for (const role of ['name', 'category', 'tagline', 'lede']) {
    assert.deepEqual(japaneseReadingParts(text, role), [{ text, keepWhole: false }]);
  }
  assert.deepEqual(japaneseReadingParts('未知のタイトル', 'title'), [
    { text: '未知のタイトル', keepWhole: false },
  ]);
});

test('only the Japanese Dream hero receives the added reading-unit span', () => {
  const html = readFileSync(new URL('../dist/ja/apps/pipi-dream/index.html', import.meta.url), 'utf8');
  const title = html.match(/<h1\b[^>]*class="app-hero-title"[^>]*>([\s\S]*?)<\/h1>/)?.[1];
  assert.ok(title);
  assert.match(title, /声で残す<span\b[^>]*class="ja-reading-unit"[^>]*>夢日記<\/span>/);
  assert.equal((title.match(/ja-reading-unit/g) ?? []).length, 1);
  assert.doesNotMatch(title, /font-size|display:\s*none|aria-hidden|ellipsis|scale/);
  for (const lang of ['ko', 'en']) {
    const other = readFileSync(new URL(`../dist/${lang}/apps/pipi-dream/index.html`, import.meta.url), 'utf8');
    const h1 = other.match(/<h1\b[^>]*class="app-hero-title"[^>]*>([\s\S]*?)<\/h1>/)?.[1];
    assert.ok(h1);
    assert.doesNotMatch(h1, /ja-reading-unit/);
  }
});
