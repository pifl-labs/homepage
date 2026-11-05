import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read = path => readFileSync(path, 'utf8');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const resources = [
  ['one-square-at-a-time-en-a4.pdf', '11a9d62e8091020494777c538024b9271b76b0751d3b5f43099d3767d2f30d0e'],
  ['one-square-at-a-time-en.txt', 'ad2b83b89f46e0832ab486de50e9593b2044f0a7d4336b336683ec0db988271d'],
];
test('existing public printable and full text remain byte-for-byte unchanged', () => {
  for (const [name, expected] of resources) for (const dir of ['public', 'dist'])
    assert.equal(sha(readFileSync(`${dir}/assets/printables/${name}`)), expected);
});
test('English Sudoku introduces separate, free practice before official screenshots', () => {
  const html = read('dist/en/apps/pipi-sudoku/index.html');
  assert.match(html, /See where to look next/);
  assert.match(html, /Step-by-step hints show where to look and why/);
  const start = html.indexOf('id="sudoku-paper-practice"');
  assert.ok(start > 0 && start < html.indexOf('class="app-shots-scroll"'));
  const section = html.slice(start, html.indexOf('</section>', start));
  assert.match(section, /One puzzle\. Three hints\./);
  assert.match(section, /No app or account needed/);
  assert.match(section, /not an app screenshot, a built-in app puzzle or the exact in-app hint wording/);
  assert.match(section, /2 pages/);
  assert.match(section, /English/);
  for (const [name] of resources) assert.ok(section.includes(`href="/assets/printables/${name}"`));
  assert.match(section, /download="one-square-at-a-time-en-a4\.pdf"/);
  assert.doesNotMatch(section, /<form|<input|<script|iframe|payment|subscription|guarantee/);
});
test('other languages and apps do not receive an English practice card', () => {
  for (const lang of ['ko', 'ja']) assert.doesNotMatch(read(`dist/${lang}/apps/pipi-sudoku/index.html`), /id="sudoku-paper-practice"/);
  for (const slug of ['pipi-spend','pipi-bridge','pipi-focus','pipi-draw','pipi-word-voyage','pipi-hello','pipi-words','pipi-dday','pipi-log','dialogos','pipi-tide','kkachi','pipi-sky','pipi-legion'])
    for (const lang of ['ko','ja','en']) assert.doesNotMatch(read(`dist/${lang}/apps/${slug}/index.html`), /id="sudoku-paper-practice"/);
});
test('resource uses existing design tokens and no new client script or remote asset', () => {
  const source = read('src/components/SudokuPaperPractice.astro');
  assert.match(source, /var\(--bg-card\)/);
  assert.doesNotMatch(source, /<script|<img|https?:|#[0-9a-f]{3,8}\b/);
  assert.match(read('src/components/AppLanding.astro'), /<slot name="before-showcase"\s*\/>/);
});
