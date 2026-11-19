import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {liveApps} from '../src/data/apps.ts';
import {archiveReleaseCards} from '../src/data/archive-release-cards.mjs';
import {previousPublicArchiveEvents, publicArchiveApps, publicArchiveEvents, publicArchiveEvidence, releaseDate} from '../src/data/archive-public.mjs';
import storeReceipt from '../docs/release/homepage-store-recheck-20261118.json' with {type:'json'};
import latest from '../docs/release/homepage-current-store-20261119.json' with {type:'json'};
import history from '../public/archive-history-sources-20261119.json' with {type:'json'};

const read = path => readFileSync(path,'utf8');
const vague = /미확인|미정|파악.{0,12}(안|않|못)|확인 중|未確認|未定|不明|unverified|undetermined|unknown|\bTBD\b/i;
const all = archiveReleaseCards.flatMap(card=>card.releases);
const versions=(app, platform, version)=>all.filter(r=>r.app===app&&r.platform===platform&&r.version===version);

test('every previous and newly verified public store version has a record for that platform',()=>{
 for (const receipt of [...storeReceipt.android,...latest.android]){
  const app=liveApps.find(a=>a.stores.android&&new URL(a.stores.android).searchParams.get('id')===receipt.package);
  assert.ok(app,receipt.package);
  assert.ok(versions(app.slug,'android',receipt.version).length,`${app.slug} Android ${receipt.version}`);
 }
 for (const receipt of [...storeReceipt.ios.apps,...latest.ios]){
  const app=liveApps.find(a=>a.stores.ios?.match(/\/id(\d+)/)?.[1]===String(receipt.trackId));
  assert.ok(app,receipt.bundleId);
  assert.equal(versions(app.slug,'ios',receipt.version).length,1,`${app.slug} iOS ${receipt.version}`);
 }
});

test('historical Play publishes keep actual date, build and change separately',()=>{
 const k=all.filter(r=>r.app==='kkachi').sort((a,b)=>a.publication.date.localeCompare(b.publication.date));
 assert.deepEqual(k.map(r=>[r.platform,r.version,r.build,r.publication.date]),[
  ['android','1.0.0',undefined,'2026-10-28'],
  ['android','1.1.0','18','2026-10-30'],
  ['android','1.1.0','22','2026-10-31'],
 ]);
 assert.match(k[1].summary.ko,/12개 언어.*토정/);
 assert.match(k[2].summary.ko,/Google Play.*위젯/);
 assert.equal(k[2].releaseNotesReference.commit,'68ef75c61089c9c170235b5e0a140baa831e6637');
 for (const [app,date,storeUpdated] of [['pipi-spend','2026-11-03','2026-10-28'],['pipi-bp','2026-11-05','2026-10-27']]) {
  const [r]=versions(app,'android','1.0.0');
  assert.equal(r.publication.date,date);
  assert.equal(r.storeUpdated,storeUpdated);
  assert.equal(r.publication.basis,'play-console-published');
 }
 for(const [app,ver] of [['pipi-bridge','1.2.0'],['pipi-bridge','1.1.3'],['pipi-hello','1.1.1'],['pipi-hello','1.0.8']]) assert.equal(versions(app,'android',ver).length,0);
 assert.equal(versions('pipi-sky','android','1.0.0').length,4);
 assert.equal(versions('pipi-sudoku','android','1.0.2').length,1);
 assert.deepEqual(versions('pipi-sudoku','android','1.0.2')[0].alternateBuilds.map(x=>x.build),['13','14']);
});

test('audit evidence preserves exact dates and version-specific changes without private console data',()=>{
 assert.equal(history.records.length,240);
 assert.equal(history.records.filter(r=>r.platform==='ios').length,127);
 assert.equal(history.records.filter(r=>r.platform==='android').length,113);
 assert.deepEqual([...publicArchiveApps].sort(),liveApps.map(a=>a.slug).sort());
 assert.equal(new Set(all.map(e=>e.id)).size,all.length);
 const keys=all.map(e=>[e.app,e.platform,e.version,e.build??''].join(':'));
 assert.equal(new Set(keys).size,keys.length);
 for(const e of all){
  assert.ok(['ios','android'].includes(e.platform));
  assert.match(e.version,/^\d+\.\d+(?:\.\d+)?$/);
  assert.match(e.publication.date,/^\d{4}-\d{2}-\d{2}$/);
  assert.ok(['public-store','play-console'].includes(e.source));
  assert.equal(e.milestones,undefined);
  for(const l of ['ko','ja','en']){
   assert.ok(e.title[l] && e.summary[l]);
   assert.doesNotMatch(e.title[l]+e.summary[l],vague);
  }
  if(!e.historyEvidenceId) {assert.equal(e.id,'pipi-tide-ios-observed-20261117');continue;}
  const evidence=history.records.find(r=>r.id===e.historyEvidenceId);assert.ok(evidence,e.id);
  for(const key of ['app','platform','version','observedAt']) assert.equal(e[key],evidence[key],e.id+'/'+key);
  assert.equal(e.publication.date,evidence.date);
  if(e.platform==='ios') {
   assert.equal(evidence.source,'app-store-version-history');
   const date=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(evidence.timestamp));
   assert.equal(date,e.publication.date);
   assert.ok(Object.keys(evidence.notesSha256).length||evidence.releaseNotesReference);
  } else {
   assert.equal(evidence.source,'play-production-history');
   assert.equal(evidence.status,'published');
   assert.ok(evidence.builds.some(b=>b.date===e.publication.date));
   assert.match(evidence.notesSha256,/^[a-f0-9]{64}$/);
  }
 }
 for(const prior of previousPublicArchiveEvents)assert.ok(all.some(e=>e.id===prior.id),prior.id);
 assert.ok(publicArchiveEvents.map(releaseDate).every((v,i,a)=>!i||v<=a[i-1]));
 assert.deepEqual(JSON.parse(read('public/archive-evidence.json')),publicArchiveEvidence);
 assert.doesNotMatch(read('public/archive-evidence.json')+read('public/archive-history-sources-20261119.json'),/pipi-legion|approvalNotifiedAt|submittedAt|\/console\/|\/Users\/|Message-ID:/);
});

for(const lang of ['ko','ja','en']) test(`${lang}: public HTML shows checked cards and groups, not placeholder or approval rows`,()=>{
 const html=read(`dist/${lang}/archive/index.html`).match(/<main id="main"[\s\S]*?<\/main>/)[0];
 assert.doesNotMatch(html,vague);
 assert.doesNotMatch(html,/pipi-legion|value="(approved|submitted|asset)"|data-journey-app|data-media-app|\/submission\//);
 assert.equal((html.match(/data-event-id=/g)||[]).length,archiveReleaseCards.length);
 assert.equal((html.match(/data-app-toggle=/g)||[]).length,16);
 assert.match(html,/data-event-id="pipi-draw-shared-1\.2\.2"/);
});
