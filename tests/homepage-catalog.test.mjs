import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const audit = JSON.parse(readFileSync(new URL('../docs/release/homepage-app-audit-20261023.json', import.meta.url)));
const src = readFileSync(new URL('../src/data/app-catalog.ts', import.meta.url), 'utf8');
const copy = runInNewContext(src.slice(src.indexOf('export const catalogCopy')).replace('export const catalogCopy: Record<string, Record<Lang, string>> =', 'const copy =') + '\ncopy');
test('all fifteen registered products have concise localized purpose copy, with no inferred beta launch', () => {
  assert.equal(Object.keys(copy).length, 15);
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
  assert.equal((html.match(/class="app-card-main"/g)||[]).length,15);
  assert.equal((html.match(/class="app-card-preview"/g)||[]).length,12);
  assert.equal((html.match(/class="app-card-stores"/g)||[]).length,13);
  assert.match(html, /<details class="fleet-disclosure">/);
  assert.doesNotMatch(html, /<details class="fleet-disclosure" open/);
  const catalog=html.match(/<section class="apps-home"[\s\S]*?<\/section>/)[0];
  assert.doesNotMatch(catalog,/class="app-card-rel"/);
});

test('account union is represented and unreleased apps cannot advertise downloads', async () => {
  const {appList} = await import('../src/data/apps.ts');
  assert.equal(appList.length,15);
  // 2026-11-02 public listings: Kkachi is live on Google Play; Sudoku is live on both stores.
  const current = JSON.parse(readFileSync(new URL('../docs/release/homepage-app-audit-20261102.json', import.meta.url))).apps;
  assert.equal(appList.filter(a=>a.status==='live').length,13);
  for(const slug of ['pipi-sky','pipi-legion']) {
    const app=appList.find(a=>a.slug===slug);assert.equal(app.status,'soon');assert.deepEqual(app.stores,{});
    const seen=current.find(a=>a.slug===slug);assert.equal(seen.ios,undefined);assert.deepEqual(Object.values(seen.android).map(v=>v.publicStatus),[404,404,404]);
  }
  const sudoku=appList.find(a=>a.slug==='pipi-sudoku');
  assert.equal(sudoku.stores.ios,`https://apps.apple.com/app/id${current.find(a=>a.slug==='pipi-sudoku').ios.en.trackViewUrl.match(/id(\d+)/)[1]}`);
  assert.match(readFileSync(new URL('../dist/en/apps/pipi-sudoku/index.html',import.meta.url),'utf8'),/"operatingSystem":"iOS, Android"/);
  for(const slug of ['pipi-tide','kkachi','pipi-spend']) {
    const app=appList.find(a=>a.slug===slug);assert.equal(app.status,'live');assert.ok(app.stores.android);assert.equal(app.stores.ios,undefined);
    const html=readFileSync(new URL(`../dist/en/apps/${slug}/index.html`,import.meta.url),'utf8');
    assert.match(html,/"operatingSystem":"Android"/);
    assert.doesNotMatch(html,/href="https:\/\/apps.apple.com\//);
  }
});
