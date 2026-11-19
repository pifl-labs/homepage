import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const audit = JSON.parse(readFileSync(new URL('../docs/release/homepage-app-audit-20261023.json', import.meta.url)));
const src = readFileSync(new URL('../src/data/app-catalog.ts', import.meta.url), 'utf8');
const copy = runInNewContext(src.slice(src.indexOf('export const catalogCopy')).replace('export const catalogCopy: Record<string, Record<Lang, string>> =', 'const copy =') + '\ncopy');
test('all fifteen registered products have concise localized purpose copy, with no inferred beta launch', () => {
  assert.equal(Object.keys(copy).length, 17);
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
// 2026-11-19 redesign: compact cards with a purpose filter; each store link carries its last checked
// version, so the separate collapsed release list and the home screenshots are gone.
for (const lang of ['ko','ja','en']) test(`${lang}: built catalog has a purpose filter, compact cards and versions beside each store`, async () => {
  const html=readFileSync(new URL(`../dist/${lang}/index.html`, import.meta.url),'utf8');
  const catalog=html.match(/<section class="apps-home"[\s\S]*?<\/section>/)[0];
  const {APP_GROUPS}=await import('../src/data/app-groups.ts');
  assert.equal((catalog.match(/class="fleet-card-main"/g)||[]).length,16);
  assert.equal((catalog.match(/class="fleet-card-stores"/g)||[]).length,16);
  assert.doesNotMatch(html,/fleet-disclosure|class="app-card|app-card-preview|app-media-footnote/);
  const radios=[...catalog.matchAll(/<input\b[^>]*name="fleet-filter"[^>]*value="([^"]+)"/g)].map(m=>m[1]);
  assert.deepEqual(radios,['all',...APP_GROUPS.map(g=>g.key)]);
  assert.match(catalog,/<input\b[^>]*id="fleet-filter-all"[^>]*checked/);
  for(const g of APP_GROUPS){
    assert.ok(catalog.includes(`<label class="fleet-filter-chip" for="fleet-filter-${g.key}">${g.label[lang].replace(/&/g,'&amp;')} <span class="fleet-filter-count">${g.slugs.length}</span></label>`),`${lang} ${g.key}`);
    for(const slug of g.slugs){
      const card=catalog.match(new RegExp(`<article\\b[^>]*class="fleet-card" data-group="([^"]+)"[^>]*>(?:(?!</article>)[\\s\\S])*?href="/${lang}/apps/${slug}/"`));
      assert.equal(card?.[1],g.key,`${lang} ${slug}`);
    }
  }
  // Every store link has its own platform version right beside it (when the store is verified).
  for(const block of catalog.matchAll(/<div class="fleet-card-platform">([\s\S]*?)<\/div>/g)){
    const store=block[1].match(/data-store-link="https:\/\/(apps\.apple|play\.google)\.com/)?.[1];
    assert.ok(store,lang);
    const ver=block[1].match(/data-fleet-platform="(ios|android)"/)?.[1];
    if(ver)assert.equal(ver,store==='apps.apple'?'ios':'android',lang);
  }
});
test('filter needs no script and falls back to the full list where :has() is unsupported', () => {
  const css=readFileSync(new URL('../src/components/app-catalog.css', import.meta.url),'utf8');
  for(const key of ['learn','focus','create','life'])assert.match(css,new RegExp(`\\.apps-home:has\\(#fleet-filter-${key}:checked\\) \\.fleet-card:not\\(\\[data-group="${key}"\\]\\)`));
  assert.match(css,/@supports not selector\(:has\(\*\)\) \{ \.fleet-filter \{ display: none; \} \}/);
  const component=readFileSync(new URL('../src/components/AppCatalog.astro', import.meta.url),'utf8');
  assert.doesNotMatch(component,/<script/);
});

test('account union is represented and unreleased apps cannot advertise downloads', async () => {
  const {appList} = await import('../src/data/apps.ts');
  assert.equal(appList.length,17);
  // 2026-11-02 public listings: Kkachi is live on Google Play; Sudoku is live on both stores.
  const current = JSON.parse(readFileSync(new URL('../docs/release/homepage-app-audit-20261102.json', import.meta.url))).apps;
  assert.equal(appList.filter(a=>a.status==='live').length,16);
  for(const slug of ['pipi-legion']) {
    const app=appList.find(a=>a.slug===slug);assert.equal(app.status,'soon');assert.deepEqual(app.stores,{});
    const seen=current.find(a=>a.slug===slug);assert.equal(seen.ios,undefined);assert.deepEqual(Object.values(seen.android).map(v=>v.publicStatus),[404,404,404]);
  }
  const sudoku=appList.find(a=>a.slug==='pipi-sudoku');
  assert.equal(sudoku.stores.ios,`https://apps.apple.com/app/id${current.find(a=>a.slug==='pipi-sudoku').ios.en.trackViewUrl.match(/id(\d+)/)[1]}`);
  assert.match(readFileSync(new URL('../dist/en/apps/pipi-sudoku/index.html',import.meta.url),'utf8'),/"operatingSystem":"iOS, Android"/);
  for(const slug of ['kkachi','pipi-spend','pipi-bp','pipi-sky','pipi-dream']) {
    const app=appList.find(a=>a.slug===slug);assert.equal(app.status,'live');assert.ok(app.stores.android);assert.equal(app.stores.ios,undefined);
    const html=readFileSync(new URL(`../dist/en/apps/${slug}/index.html`,import.meta.url),'utf8');
    assert.match(html,/"operatingSystem":"Android"/);
    assert.doesNotMatch(html,/href="https:\/\/apps.apple.com\//);
  }
});
