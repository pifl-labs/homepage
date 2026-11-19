import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {appList,apps,appName,storeAppName,liveAppCount} from '../src/data/apps.ts';
import {publicPortfolioEvidence} from '../src/data/public-portfolio.ts';
import {currentIOS,currentAndroid,androidDay,syncReceipt,beforeReleaseSync,beforeLaterEdits,laterLayers,syncDeltas,sourceText,packageFor,currentAndroidName,currentIOSName,expectedRelease} from './helpers/release-sync-20261116.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const sha=s=>createHash('sha256').update(s).digest('hex');
const schema=h=>[...h.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(m=>JSON.parse(m[1])).find(x=>x['@type']==='SoftwareApplication');

test('fresh evidence distinguishes complete KR inventory, partial anonymous responses and regional iOS',()=>{
 assert.equal(syncReceipt.android.completeNativeInventory,16);assert.equal(syncReceipt.android.apps.length,16);
 assert.deepEqual(Object.fromEntries(Object.entries(syncReceipt.ios).map(([c,v])=>[c,v.apps.length])),{KR:11,JP:10,US:10});
 for(const c of ['KR','JP','US']){assert.equal(syncReceipt.ios[c].HTTP,200);assert.equal(syncReceipt.anonymousAndroidInventory[c].HTTP,200);assert.equal(syncReceipt.anonymousAndroidInventory[c].apps.length,10);for(const a of syncReceipt.ios[c].apps){assert.equal(a.artistId,1893574694);assert.equal(a.sellerName,'PiFl Labs Co., Ltd.');}}
 for(const c of ['JP','US']){assert.equal(syncReceipt.nativeAndroidNames[c].apps.length,15);assert(!syncReceipt.ios[c].apps.some(a=>a.bundleId==='com.pifl.pipi.tide'));}
});
test('all sixteen observed Android products appear exactly once; Legion alone stays upcoming',()=>{
 assert.equal(appList.length,17);assert.equal(liveAppCount,16);assert.equal(new Set(appList.map(a=>a.slug)).size,17);
 assert.deepEqual(appList.filter(a=>a.status==='soon').map(a=>a.slug),['pipi-legion']);
 assert.deepEqual(new Set(publicPortfolioEvidence.packages),new Set(syncReceipt.android.apps.map(a=>a.package)));
 for(const row of syncReceipt.android.apps){const app=appList.find(a=>packageFor(a.slug)===row.package);assert.ok(app,row.package);assert.equal(app.status,'live');assert.equal(new URL(app.stores.android).searchParams.get('id'),row.package);assert.equal(app.release.android.version,currentAndroid(app.slug).version);assert.equal(app.release.android.updated,androidDay(currentAndroid(app.slug)));}
});
test('each published iOS version is sourced from its own current public response',()=>{
 for(const app of appList){const seen=currentIOS(app.slug);assert.equal(Boolean(app.stores.ios),Boolean(seen),app.slug);if(seen){assert.equal(app.release.ios.version,seen.version);assert.equal(app.release.ios.updated,expectedRelease(app.slug,'ios').updated);assert.equal(app.stores.ios.match(/id(\d+)$/)[1],String(seen.trackId));}}
});
for(const lang of ['ko','ja','en'])test(lang+': displayed names and actual store labels respect current localized or explicitly KR destinations',()=>{
 for(const app of appList.filter(a=>a.status==='live')){
  assert.equal(storeAppName(app,'android',lang),currentAndroidName(app.slug,lang),app.slug+' Android');
  if(app.stores.ios)assert.equal(storeAppName(app,'ios',lang),currentIOSName(app.slug,lang),app.slug+' iOS');
  if(app.slug!=='pipi-tide')assert.equal(appName(app,lang),currentIOSName(app.slug,lang)??currentAndroidName(app.slug,lang),app.slug+' display');
 }
 const words=apps['pipi-words'];assert.equal(words.storeNamesCheckedAt,'2026-11-16');
 if(lang==='ja'){const h=read(`dist/${lang}/apps/pipi-words/index.html`);assert(h.includes('ことば習慣：TOPIK韓国語単語帳'));assert(h.includes('ことば習慣：韓国語・TOPIK単語帳'));assert(h.includes('datetime="2026-11-16"'));}
});
for(const lang of ['ko','ja','en'])test(lang+': new public entries have working original links, no invented screenshots or iOS releases',()=>{
 for(const slug of ['pipi-bp','pipi-sky','pipi-dream']){const a=apps[slug],h=read(`dist/${lang}/apps/${slug}/index.html`),j=schema(h);assert.equal(a.catalogPreview,false);assert.equal(a.content[lang].shots.length,0);assert.equal(j.operatingSystem,'Android');assert.deepEqual(j.installUrl,[a.stores.android]);assert.equal(j.datePublished,undefined);assert.doesNotMatch(h,/class="app-soon-pill"|class="app-shots-scroll"|store-badge--soon/);assert(existsSync(new URL('../dist/'+lang+'/apps/'+slug+'/privacy/index.html',import.meta.url)));}
 const tide=apps['pipi-tide'],h=read(`dist/${lang}/apps/pipi-tide/index.html`);assert.equal(new URL(tide.stores.ios).pathname.split('/')[1],'kr');assert.equal(new URL(tide.stores.android).searchParams.get('gl'),'KR');assert.equal(new URL(tide.stores.android).searchParams.get('hl'),'ko');assert.equal((h.match(/\(KR\)/g)??[]).length,8);assert.match(h,/"operatingSystem":"iOS, Android"/);
});
test('BP and Dream public descriptions retain medical and transcription boundaries; no health data introduced',()=>{
 const bp=apps['pipi-bp'].content.en,dream=apps['pipi-dream'].content.en,sky=apps['pipi-sky'].content.en;
 assert.match(bp.lede,/does not measure blood pressure/);assert.match(bp.ctaSub,/Not a tool for diagnosis, treatment or prevention/);assert.match(bp.downloadNote,/optional one-time Pro.*No subscription/);
 assert.match(dream.downloadNote,/Android 13\+.*supported language.*system may download a speech model/);assert.doesNotMatch(JSON.stringify(apps['pipi-dream'].content),/iOS 26|iPhone|Preparing for public release|公開の準備|출시를 준비/);
 assert.match(sky.ctaSub,/not a live camera feed or a weather forecast/);assert.match(sky.features[0].desc,/requires internet/);
});
test('exact current source deltas restore historical hashes but reject unknown source edits',()=>{
 // Later layers, newest first: a layer's after-bytes are the current file with every newer layer reversed,
 // and its before-bytes are what the next older layer (or the sync) ends with.
 for(const[i,layer]of laterLayers.entries())for(const[file,row]of Object.entries(layer)){const s=beforeLaterEdits(file,sourceText(file),{through:i});assert.equal(sha(s),row.afterSHA256);assert.equal(sha(beforeLaterEdits(file,sourceText(file),{through:i+1})),row.beforeSHA256);const older=laterLayers.slice(i+1).find(l=>l[file])?.[file]??syncDeltas[file];assert.equal(row.beforeSHA256,older.afterSHA256);assert.throws(()=>beforeLaterEdits(file,sourceText(file)+'\nUNAPPROVED',{through:i+1}),/unrecorded source edit/);}
 for(const[file,row]of Object.entries(syncDeltas)){const s=beforeLaterEdits(file,sourceText(file));assert.equal(sha(s),row.afterSHA256);assert.equal(sha(beforeReleaseSync(file,s)),row.beforeSHA256);assert.throws(()=>beforeReleaseSync(file,s+'\nUNAPPROVED'),/unrecorded source edit/);}
});
test('minimum entrance fix removes the cause, not text size, layout or overflow by concealment',()=>{
 const css=read('public/styles-stickerbook.css');const frames=css.match(/@keyframes stickIn \{([^}]*\}[^}]*\}[^}]*\})/s)?.[1];assert.ok(frames);assert.doesNotMatch(frames,/1\.05|rotate\(-20deg\)|rotate\(3deg\)|overflow|font-size/);assert.match(frames,/scale\(\.6\) rotate\(0\)/);assert.match(frames,/70% \{ transform: scale\(1\) rotate\(0\)/);
});

test('footer keeps current localized app links within their tracks without clipping or shrinking',()=>{const s=read('public/styles-stickerbook.css');assert.match(s,/\.footer-grid > \* \{ min-width: 0; \}/);assert.match(s,/\.footer-col a \{ overflow-wrap: anywhere; \}/);});

test('the approved shared-home CSS correction has a source-content cache key',()=>{
 const href='/styles-stickerbook.css?v='+sha(read('public/styles-stickerbook.css')).slice(0,12);
 assert.ok(read('src/layouts/BaseLayout.astro').includes(`href="${href}"`));
 for(const lang of ['ko','ja','en'])for(const route of ['', 'apps/pipi-dream/']){
  assert.ok(read(`dist/${lang}/${route}index.html`).includes(`href="${href}"`));
 }
});
