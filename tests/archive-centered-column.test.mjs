import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {archiveReleaseCards} from '../src/data/archive-release-cards.mjs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const css = read('public/styles-archive.css');
const styleHash = createHash('sha256').update(css).digest('hex').slice(0,12);

test('archive controls and records use the full homepage container width', () => {
  assert.match(css,/\.archive-column\{container-type:inline-size\}/);
  assert.doesNotMatch(css,/\.archive\s*>\s*\.container\s*\{[^}]*max-(?:width|inline-size)/);
  assert.doesNotMatch(css,/\.archive-history article(?:\s*>\s*details)?\s*\{[^}]*max-(?:width|inline-size)/);
});

for (const locale of ['ko','ja','en']) test(`${locale}: the whole archive is in the shared container with no extra panel`, () => {
  const page = read(`dist/${locale}/archive/index.html`);
  const column = page.match(/<div class="container">\s*<div class="archive-column">([\s\S]*?)<\/div>\s*<\/div>\s*<\/main>/)?.[1];
  assert.ok(column);
  assert.match(column, /<fieldset class="archive-app-picker"/);
  assert.match(column, /<form class="archive-filters"/);
  assert.match(column, /<section class="archive-history"/);
  assert.equal((column.match(/data-event-id=/g)||[]).length, archiveReleaseCards.length);
  assert.doesNotMatch(column, /<aside\b/);
  assert.ok(page.includes(`/styles-archive.css?v=${styleHash}`));
  assert.equal(read('dist/styles-archive.css'),css);
});
