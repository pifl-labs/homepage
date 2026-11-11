import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {apps,appList,displayVersion,releaseVersionLabel} from '../src/data/apps.ts';
import {onRequest} from '../functions/_middleware.ts';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const receipt=JSON.parse(read('../docs/release/bridge-ios-public-20261111.json'));
const bridge=apps['pipi-bridge'];
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');

test('Bridge current iOS evidence is public and agrees in KR/JP/US',()=>{
  assert.equal(receipt.observedAt,'2026-11-11');
  assert.deepEqual(receipt.apps.map(r=>r.country).sort(),['jp','kr','us']);
  for(const row of receipt.apps){
    assert.equal(row.HTTP,200);assert.equal(row.app.trackId,6801205183);
    assert.equal(row.app.sellerName,'PiFl Labs Co., Ltd.');assert.equal(row.app.version,'1.0.3');
    assert.equal(row.app.currentVersionReleaseDate,'2026-11-10T20:04:55Z');
    const u=new URL(row.url);assert.equal(u.hostname,'itunes.apple.com');
    assert.equal(u.searchParams.get('id'),'6801205183');assert.equal(u.searchParams.get('country'),row.country);
  }
});
test('only Bridge iOS advances; Android, shared snapshot and earliest date are not invented',()=>{
  assert.deepEqual(bridge.release.ios,{version:'1.0.3',updated:'2026-11-10',checkedAt:'2026-11-11'});
  assert.deepEqual(bridge.release.android,receipt.unchangedAndroidObservation);
  assert.equal(bridge.release.checkedAt,receipt.originalSharedObservation);
  assert.equal(bridge.release.since,undefined);assert.equal(displayVersion(bridge),'');
  assert.equal(releaseVersionLabel(bridge),'iOS v1.0.3 · Android v1.0.2');
});
test('every other app source block stays byte-identical to current main',()=>{
  const source=read('../src/data/apps.ts');
  for(const [name,hash] of Object.entries(receipt.unchangedOtherAppBlocksSHA256)){
    const block=source.match(new RegExp(`const ${name}: AppMeta = \\{[\\s\\S]*?\\n\\};`))?.[0];
    assert.ok(block,name);assert.equal(sha(block),hash,name);
  }
});
for(const lang of ['ko','ja','en'])test(`${lang}: live versions are distinct; submitted 1.0.2 screenshots remain historical`,()=>{
  const html=read(`../dist/${lang}/apps/pipi-bridge/index.html`);
  assert.match(html,/class="bridge-platform-version"[^>]*>iOS v1\.0\.3<\/span>/);
  assert.match(html,/class="bridge-platform-version"[^>]*>Android v1\.0\.2<\/span>/);
  assert.match(html,/datetime="2026-11-10"/);assert.ok(html.includes('iOS 1.0.2 (23)'));
  const schemas=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
  const app=schemas.find(s=>s['@type']==='SoftwareApplication');assert.ok(app);assert.equal(app.softwareVersion,undefined);
  const home=read(`../dist/${lang}/index.html`);
  const row=[...home.matchAll(/<li class="fleet-row">(.*?)<\/li>/gs)].map(m=>m[1]).find(s=>s.includes(`href="/${lang}/apps/pipi-bridge/"`));
  assert.ok(row);assert.match(row,/iOS v1\.0\.3/);assert.match(row,/Android v1\.0\.2/);
  assert.match(home,/<time datetime="2026-11-11"/);
  assert.match(read('../src/components/FleetLog.astro'),/\.fleet-log-section \.fleet-note \{ color: var\(--text-secondary\); \}/);
});
test('small light metadata uses the established foreground; only short version units stay intact',()=>{
  const css=read('../public/styles-bridge-release-version.css');
  assert.match(css,/html\[data-theme="light"\] \.app-rel-ver\[data-bridge-release\]/);
  assert.match(css,/color: var\(--text-primary\)/);
  assert.match(css,/\[data-bridge-release\] ~ time[\s\S]*color: var\(--text-secondary\)/);assert.match(css,/\.bridge-platform-version[\s\S]*white-space: nowrap/);
  assert.doesNotMatch(css,/font-size|overflow|display:\s*none|transform|width:/);
  const hash=sha(css).slice(0,12),url=`/styles-bridge-release-version.css?v=${hash}`;
  for(const lang of ['ko','ja','en'])for(const app of appList){
    const html=read(`../dist/${lang}/apps/${app.slug}/index.html`);
    assert.equal(html.includes(url),app.slug==='pipi-bridge',`${lang}/${app.slug}`);
    assert.equal(/data-bridge-release/.test(html),app.slug==='pipi-bridge',`${lang}/${app.slug}`);
  }
});

test('unprefixed Bridge entry preserves its deep path and redirects to a verified localized page',async()=>{
  for(const lang of ['ko','ja','en']){
    let nextCalls=0;
    const res=await onRequest({request:new Request('https://pifl-labs.com/apps/pipi-bridge/',{headers:{'accept-language':lang}}),next:async()=>{nextCalls++;return new Response('unexpected')}});
    assert.equal(res.status,302);assert.equal(nextCalls,0);
    assert.equal(res.headers.get('location'),`https://pifl-labs.com/${lang}/apps/pipi-bridge/`);
  }
});
