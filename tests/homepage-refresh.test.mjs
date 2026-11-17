import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {apps,liveApps,displayVersion} from '../src/data/apps.ts';
import {archiveEvents,archiveApps,archiveCheckedAt} from '../src/data/archive.mjs';
import {publicArchiveEvidence} from '../src/data/archive-public.mjs';
import {refreshedEvents} from '../src/data/archive-refresh-20261117.mjs';
import {refreshReceipt,packageFor,expectedRelease} from './helpers/release-sync-20261116.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('every live platform matches its independently rechecked public metadata',()=>{
 assert.equal(refreshReceipt.android.length,16);
 assert.equal(refreshReceipt.ios.KR.apps.length,11);
 for(const app of liveApps)for(const platform of ['ios','android'])if(app.stores[platform])assert.deepEqual(app.release[platform],expectedRelease(app.slug,platform),app.slug+'/'+platform);
 assert.equal(apps['pipi-hello'].release.ios.version,'1.1.1');
 assert.equal(apps['pipi-hello'].release.android.version,'1.1.0');
 assert.equal(displayVersion(apps['pipi-hello']),'','unverified cross-platform parity must not be invented');
});
test('27 observation records retain independent public URLs, versions and date semantics',()=>{
 assert.equal(refreshedEvents.length,27);assert.equal(archiveCheckedAt,refreshReceipt.observedAt);
 for(const e of refreshedEvents){
  const row=e.platform==='ios'?refreshReceipt.ios.KR.apps.find(a=>a.bundleId===packageFor(e.app)):refreshReceipt.android.find(a=>a.package===packageFor(e.app));
  assert.ok(row);assert.equal(e.version,row.version);assert.equal(e.date,refreshReceipt.observedAt);assert.equal(e.kind,'observed');
  assert.equal(e.storeUpdated,expectedRelease(e.app,e.platform).updated);
  assert.ok(['apps.apple.com','play.google.com'].includes(new URL(e.url).hostname));
  const actual=archiveEvents.find(a=>a.id===e.id);assert.equal(actual.timeBasis,'observation-date');
  for(const lang of ['ko','ja','en'])assert.ok(e.summary[lang]&&e.title[lang]);
 }
 assert.deepEqual([...archiveApps].sort(),Object.keys(apps).sort());
 for(const slug of ['pipi-spend','pipi-bp','pipi-dream'])assert.ok(archiveEvents.some(e=>e.app===slug&&e.platform==='android'));
});
test('archive adds to the prior 41 records without manufacturing releases for the upcoming app',()=>{
 const old=archiveEvents.filter(e=>!e.id.endsWith('-observed-20261117'));
 assert.equal(old.length,41);assert.equal(archiveEvents.length,68);
 assert.ok(archiveEvents.filter(e=>e.app==='pipi-legion').every(e=>e.kind==='asset'&&e.version===null));
 const published=JSON.parse(read('public/archive-evidence.json'));assert.equal(published.checkedAt,archiveCheckedAt);assert.deepEqual(published,publicArchiveEvidence);
});
for(const lang of ['ko','ja','en'])test(`${lang}: crew stays complete and public archive starts with actual release records`,()=>{
 const home=read(`dist/${lang}/index.html`),archive=read(`dist/${lang}/archive/index.html`);
 const crew=home.match(/<section class="crew-section"[\s\S]*?<\/section>/)[0];
 assert.equal((crew.match(/class="sticker sticker--clean"/g)||[]).length,12);
 assert.doesNotMatch(crew,/한 번 눌러|Tap one|タップして/,'noninteractive artwork does not promise an action');
 assert.doesNotMatch(archive,/archive-journey-index|archive-exhibits/);
 assert.match(archive,/<time datetime="2026-11-17">2026-11-17<\/time>/);
 assert.ok(!archive.includes('/assets/apps/dialogos/submission/20261116-1.webp'));
});
test('crew contact sheet adapts to text size and keeps captions in flow',()=>{
 const css=read('public/styles-stickerbook.css');
 assert.match(css,/repeat\(auto-fit, minmax\(min\(100%, 8rem\), 1fr\)\)/);
 const label=css.match(/\.sticker \.label \{([^}]+)\}/)[1];assert.match(label,/position: relative/);assert.match(label,/font-size: \.8rem/);assert.doesNotMatch(label,/position:\s*absolute|white-space:\s*nowrap|overflow:\s*hidden/);
});
test('supporting copy preserves Korean words and Japanese strict line boundaries',()=>{
 const css=read('public/styles-stickerbook.css');
 assert.match(css,/html\[lang\^="ko"\] :is\(\.app-media-footnote, \.app-store-name-note, \.app-previous-name, \.footer, \.scribble\)\s*\{\s*word-break: keep-all;/);
 assert.match(css,/html\[lang\^="ja"\] :is\(\.app-media-footnote, \.footer-tagline\)\s*\{\s*line-break: strict;\s*overflow-wrap: normal;/);
});
test('archive compact filters preserve their names',()=>{
 const css=read('public/styles-archive.css');
 assert.match(css,/@media \(max-width: 550px\) \{ \.archive-app-buttons img \{ display: none; \} \}/);
 assert.doesNotMatch(css,/\.archive-app-buttons[^}]+text-overflow:\s*ellipsis/);
});
