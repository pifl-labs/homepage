import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {liveApps} from '../src/data/apps.ts';
import {archiveEvents as historicalRecords} from '../src/data/archive.mjs';
import {archiveReleaseCards} from '../src/data/archive-release-cards.mjs';
import {publicArchiveApps,publicArchiveEvents,publicArchiveEvidence,releaseDate,displayKind} from '../src/data/archive-public.mjs';
import storeReceipt from '../docs/release/homepage-store-recheck-20261118.json' with {type:'json'};

const read = path => readFileSync(path,'utf8');
const vague = /미확인|미정|파악.{0,12}(안|않|못)|확인 중|未確認|未定|不明|unverified|undetermined|unknown|\bTBD\b/i;

test('each verified public store version is findable through its own platform in the archive',()=>{
 const releases = archiveReleaseCards.flatMap(card=>card.releases);
 // Read the independently captured store version, not a count inferred from the archive.
 for(const receipt of storeReceipt.android) {
  const app = liveApps.find(a=>a.stores.android && new URL(a.stores.android).searchParams.get('id')===receipt.package);
  assert.ok(app, receipt.package);
  assert.equal(releases.filter(r=>r.app===app.slug&&r.platform==='android'&&r.version===receipt.version).length,1,`${app.slug} Android ${receipt.version}`);
 }
 for(const receipt of storeReceipt.ios.apps) {
  const app = liveApps.find(a=>a.stores.ios?.match(/\/id(\d+)/)?.[1]===String(receipt.trackId));
  assert.ok(app, receipt.bundleId);
  assert.equal(releases.filter(r=>r.app===app.slug&&r.platform==='ios'&&r.version===receipt.version).length,1,`${app.slug} iOS ${receipt.version}`);
 }
});

test('Kkachi 1.1.0 is a single Android release with both store notes and build-specific changes',()=>{
 const cards = archiveReleaseCards.filter(c=>c.app==='kkachi');
 assert.equal(cards.length,1);
 const [card] = cards;
 assert.equal(card.version,'1.1.0');
 assert.deepEqual(card.releases.map(r=>r.platform),['android']);
 assert.deepEqual(card.releases[0].publication,{date:'2026-10-31',basis:'play-updated',region:'KR'});
 assert.equal(card.releases[0].contentEvidence.kind,'store-release-notes');
 assert.equal(card.releases[0].releaseNotesReference.commit,'68ef75c61089c9c170235b5e0a140baa831e6637');
 for(const locale of ['ko','ja','en']) {
  assert.match(card.summary[locale],/Google Play/);
  assert.match(card.summary[locale],/Android.*2027/);
 }
});

test('public archive requires store-backed app, platform, version and concrete change copy',()=>{
 assert.deepEqual([...publicArchiveApps].sort(), liveApps.map(a=>a.slug).sort());
 assert.equal(publicArchiveApps.length,16);
 assert.equal(publicArchiveEvents.length,49);
 assert.equal(new Set(publicArchiveEvents.map(e=>[e.app,e.platform,e.version,e.region].join(':') )).size,49);
 for(const e of publicArchiveEvents) {
  assert.ok(['ios','android'].includes(e.platform));
  assert.match(e.version,/^\d+\.\d+/);
  assert.ok(['released','observed'].includes(e.kind));
  assert.ok(['public-store','store-check'].includes(e.source));
  assert.equal(e.milestones,undefined);
  for(const locale of ['ko','ja','en']) {
   assert.ok(e.title[locale] && e.summary[locale]);
   assert.doesNotMatch(e.title[locale]+e.summary[locale],vague);
  }
 }
 assert.deepEqual(JSON.parse(read('public/archive-evidence.json')),publicArchiveEvidence);
 assert.doesNotMatch(read('public/archive-evidence.json'),/pipi-legion|approvalNotifiedAt|submittedAt/);
});

test('retains historical store dates while removing repeated observations and asset-only rows',()=>{
 for(const e of publicArchiveEvents) {
  const prior=historicalRecords.find(x=>x.id===e.id);
  if(!prior) {assert.equal(e.id,'pipi-dday-android-203');assert.equal(e.version,'2.0.3');continue;}
  for(const key of ['kind','timestamp','date','observedAt','storeUpdated','timeBasis','region','platform','version','source'])assert.equal(e[key],prior[key],e.id+' '+key);
 }
 const sudoku=publicArchiveEvents.filter(e=>e.app==='pipi-sudoku'&&e.platform==='ios');
 assert.deepEqual(sudoku.map(e=>e.id),['pipi-sudoku-ios-102']);
 assert.equal(sudoku[0].contentEvidence.id,'pipi-sudoku-ios-observed-20261117');
 assert.equal(sudoku[0].timestamp,'2026-10-31T16:42:26Z');
 assert.match(sudoku[0].summary.ko,/600개/);
 assert.equal(publicArchiveEvents.filter(e=>e.app==='kkachi').length,1);
 assert.equal(publicArchiveEvents.filter(e=>e.app==='pipi-tide'&&e.platform==='android').length,1);
 assert.ok(publicArchiveEvents.map(releaseDate).every((v,i,a)=>!i||v<=a[i-1]));
 const updates=publicArchiveEvents.filter(e=>e.storeUpdated);
 for(const e of updates) {if(e.platform==='android')assert.equal(releaseDate(e),e.storeUpdated);assert.equal(displayKind(e),'released');}
 const draws=publicArchiveEvents.find(e=>e.id==='draw-android-122');
 assert.equal(displayKind(draws),'observed');
 assert.match(draws.summary.ko,/선 굵기/);
 assert.match(publicArchiveEvents.find(e=>e.id==='pipi-dday-201').summary.ko,/iOS 26/);
});

for(const lang of ['ko','ja','en']) test(`${lang}: no placeholder copy or non-release UI in public HTML`,()=>{
 const html=read(`dist/${lang}/archive/index.html`).match(/<main id="main"[\s\S]*?<\/main>/)[0];
 assert.doesNotMatch(html,vague);
 assert.doesNotMatch(html,/pipi-legion|value="(approved|submitted|asset)"|data-journey-app|data-media-app|\/submission\//);
 assert.equal((html.match(/data-event-id=/g)||[]).length,40);
 assert.equal((html.match(/data-app-toggle=/g)||[]).length,16);
 assert.match(html,/data-event-id="draw-android-122"/);
});
