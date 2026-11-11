import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const landing = readFileSync(new URL('../src/components/AppLanding.astro', import.meta.url), 'utf8');
const css = readFileSync(new URL('../public/styles-app-landing.css', import.meta.url), 'utf8');
const section = landing.match(/<section\b[^>]*id="draw-ja-photo-guide"[^>]*>[\s\S]*?<\/section>/)?.[0];

test('the new photo-selection guide appears only in Japanese Draw', () => {
  assert.ok(section);
  assert.equal((landing.match(/id="draw-ja-photo-guide"/g) ?? []).length, 1);
  assert.match(landing, /app\.slug === 'pipi-draw' && lang === 'ja' && \(\s*<section[^>]+id="draw-ja-photo-guide"/);
});

test('the single action opens the existing Japanese guide rather than a file or conversion demo', () => {
  assert.equal((section.match(/<a\b/g) ?? []).length, 1);
  assert.match(section, /href="https:\/\/pipi-worlds\.com\/ja\/guides\/photo-to-coloring-outline\/" hreflang="ja"/);
  assert.match(section, /<span>ガイドを読む<\/span>/);
});

test('the copy states free photo selection, keeping photos local, and no conversion function', () => {
  assert.match(section, /<h2 id="draw-ja-photo-guide-title">写真選び<\/h2>/);
  assert.match(section, /<p style="text-wrap: balance">主役・背景・写真の端を見比べる無料ガイドです。写真は手元に置いたまま読めます。写真の変換機能ではありません。<\/p>/);
});

test('the guide section adds no upload controls, script, image or download behavior', () => {
  assert.doesNotMatch(section, /<form|<input|<button|<script|<img|<iframe|download=|target=|onclick|fetch\(|localStorage|app-download-note/);
});

test('the new section reuses the existing resource hierarchy without adding shared styles', () => {
  for (const value of ['app-section app-section--bridge-resource', 'app-bridge-resource', 'app-bridge-resource-link', 'aria-labelledby="draw-ja-photo-guide-title"']) assert.ok(section.includes(value), value);
  assert.doesNotMatch(section, /<style|btn-primary|<br/);
  assert.deepEqual([...section.matchAll(/style="([^"]*)"/g)].map(match => match[1]), ['text-wrap: balance']);
});

test('the English checklist call stays intact immediately before the Japanese conditional', () => {
  assert.match(landing, /\{app\.slug === 'pipi-draw' && lang === 'en' && <DrawPhotoChecklist \/>\}\{app\.slug === 'pipi-draw' && lang === 'ja'/);
});

test('the reused resource styles support narrow layouts and visible keyboard focus', () => {
  assert.match(css, /\.app-bridge-resource \{[^}]*minmax\(0, 1fr\)/);
  assert.match(css, /\.app-bridge-resource-link \{[^}]*max-width: 100%/);
  assert.match(css, /\.app-bridge-resource-link:focus-visible \{[^}]*outline: 2px solid/);
  assert.match(css, /@media \(max-width: 760px\) \{\s*\.app-bridge-resource \{ grid-template-columns: minmax\(0, 1fr\);/);
});
