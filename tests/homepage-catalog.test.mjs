import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const audit = JSON.parse(readFileSync(new URL('../docs/release/homepage-app-audit-20261023.json', import.meta.url)));
const src = readFileSync(new URL('../src/data/app-catalog.ts', import.meta.url), 'utf8');
const copy = runInNewContext(src.slice(src.indexOf('export const catalogCopy')).replace('export const catalogCopy: Record<string, Record<Lang, string>> =', 'const copy =') + '\ncopy');
test('all ten exposed products have concise localized purpose copy, with no inferred beta launch', () => {
  assert.equal(Object.keys(copy).length, 10);
  for (const value of Object.values(copy)) for (const lang of ['ko','ja','en']) assert.ok(value[lang].length > 30 && value[lang].length < 190);
  for (const slug of ['pipi-legion']) assert.match(copy[slug].en, /not yet verified/);
});
test('nine public products have official localized screenshot provenance and assets', () => {
  assert.equal(audit.length, 9);
  for (const app of audit) for (const lang of ['ko','ja','en']) {
    assert.ok(app.ios[lang].screenshotUrls.length);
    assert.match(app.ios[lang].artworkUrl512, /^https:\/\/.*mzstatic.com\//);
    assert.equal(app.android[lang]['@type'], 'SoftwareApplication');
    assert.ok(existsSync(new URL(`../public/assets/apps/${app.slug}/${lang}/store-preview.webp`, import.meta.url)));
  }
});
for (const lang of ['ko','ja','en']) test(`${lang}: built catalog separates exploration, downloads and optional release history`, () => {
  const html=readFileSync(new URL(`../dist/${lang}/index.html`, import.meta.url),'utf8');
  assert.equal((html.match(/class="app-card-main"/g)||[]).length,10);
  assert.equal((html.match(/class="app-card-preview"/g)||[]).length,9);
  assert.equal((html.match(/class="app-card-stores"/g)||[]).length,9);
  assert.match(html, /<details class="fleet-disclosure">/);
  assert.doesNotMatch(html, /<details class="fleet-disclosure" open/);
  const catalog=html.match(/<section class="apps-home"[\s\S]*?<\/section>/)[0];
  assert.doesNotMatch(catalog,/class="app-card-rel"/);
});
