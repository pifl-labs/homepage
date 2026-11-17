import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {archiveReleaseCards,buildReleaseCards} from '../src/data/archive-release-cards.mjs';
import {publicArchiveEvents,publicationFor} from '../src/data/archive-public.mjs';
import {matchesRecord} from '../public/archive-filters.mjs';

const cards=(app,version)=>archiveReleaseCards.filter(c=>c.app===app&&c.version===version);
test('paired records have the same confirmed scope, preserve per-platform facts and count once',()=>{
 assert.equal(archiveReleaseCards.length,40);
 assert.equal(archiveReleaseCards.filter(c=>c.releases.length===2).length,9);
 assert.deepEqual(archiveReleaseCards.flatMap(c=>c.releases.map(e=>e.id)).sort(),publicArchiveEvents.map(e=>e.id).sort());
 const [log]=cards('pipi-log','1.0.15');
 assert.deepEqual(log.releases.map(e=>[e.platform,e.publication.basis,e.publication.date]),[
  ['ios','ios-released-kst','2026-11-17'],['android','play-updated','2026-11-16'],
 ]);
 assert.equal(log.releases[0].publication.timestamp,'2026-11-16T20:07:52Z');
 for(const platform of ['ios','android'])assert.equal(matchesRecord({app:log.app,platform:'ios android'},new Set([log.app]),{platform}),true);
 const [sudoku]=cards('pipi-sudoku','1.0.2');
 assert.deepEqual(sudoku.releases.map(r=>r.publication.date),['2026-11-01','2026-10-29']);
});

test('equal version alone or equal display summaries do not establish feature parity',()=>{
 for(const [app,v] of [['pipi-tide','1.2.0'],['pipi-dday','2.0.2']]){
  const candidates=cards(app,v);assert.equal(candidates.length,2);
  assert.notEqual(candidates[0].summary.ko,candidates[1].summary.ko);
  const releases=candidates.flatMap(c=>c.releases).map(e=>({...e,title:{ko:'same'},summary:{ko:'same'}}));
  assert.equal(buildReleaseCards(releases).length,2);
 }
 assert.deepEqual(cards('pipi-dday','2.0.3')[0].releases.map(e=>e.platform),['android']);
 assert.equal(cards('pipi-hello','1.1.1')[0].releases.length,1);
 assert.equal(cards('pipi-hello','1.1.0')[0].releases.length,2);
 const hello=publicArchiveEvents.filter(e=>e.app==='pipi-hello'&&e.version!=='1.0.10');
 assert.equal(buildReleaseCards(hello,[['pipi-hello-android-observed-20261117','pipi-hello-ios-observed-20261117']]).length,3);
});
test('query date never becomes a displayed release date',()=>{
 const e={platform:'android',kind:'observed',date:'2026-11-18',observedAt:'2026-11-18',source:'public-store',timeBasis:'observation-date',version:'1.0.0'};
 assert.equal(publicationFor(e),null);
 assert.equal(publicationFor({...e,storeUpdated:'2026-11-01'}).date,'2026-11-01');
 assert.equal(cards('pipi-words','1.1.0')[0].releases[0].publication.basis,'play-updated');
 assert.equal(cards('pipi-draw','1.2.2 (52)')[0].releases[0].publication.basis,'play-production');
 assert.equal(buildReleaseCards([e]).length,0);
});
for(const l of ['ko','ja','en'])test(`${l}: landing list only features verified apps; grouped date display is in the card`,()=>{
 const home=readFileSync(`dist/${l}/index.html`,'utf8');
 const archive=readFileSync(`dist/${l}/archive/index.html`,'utf8');
 assert.doesNotMatch(home,/pipi-legion|app-card--soon/);
 assert.match(home,/iOS v2\.0\.2.*Android v2\.0\.3/s);
 const pairs=[...archive.matchAll(/data-event-id="pipi-log-shared-1\.0\.15"[^>]*>(.*?)<\/li>/gs)];
 assert.equal(pairs.length,1);
 assert.match(pairs[0][1],/data-release-platform="ios".*datetime="2026-11-17".*data-release-platform="android".*datetime="2026-11-16"/s);
 assert.ok(archive.indexOf('pipi-dday-android-203')<archive.indexOf('pipi-log-shared-1.0.15'));
});
