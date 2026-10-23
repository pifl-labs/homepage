import test from 'node:test';
import assert from 'node:assert/strict';
import {archiveJourneys} from '../src/data/archive-journeys.mjs';
import {archiveApps,archiveEvents} from '../src/data/archive.mjs';
import {readFileSync} from 'node:fs';
test('every archive app has a localized, sourced journey or explicit evidence limit',()=>{
 assert.deepEqual(archiveJourneys.map(x=>x.app).sort(),[...archiveApps].sort());
 assert.equal(archiveEvents.length,30);
 for(const item of archiveJourneys){
  assert.ok(item.sources.length);
  for(const lang of ['ko','ja','en']){assert.ok(item.limit[lang]);for(const s of item.stages)assert.ok(s.version&&s.text[lang]);}
  for(const s of item.sources)assert.match(s.sha256,/^[a-f0-9]{64}$/);
 }
 for(const slug of ['kkachi','pipi-sky','pipi-legion'])assert.equal(archiveJourneys.find(x=>x.app===slug).stages.length,0);
});
test('all locales render native disclosures without changing dated event counts',()=>{
 for(const lang of ['ko','ja','en']){
  const html=readFileSync(`dist/${lang}/archive/index.html`,'utf8');
  assert.equal((html.match(/data-journey-app=/g)||[]).length,14);
  assert.equal((html.match(/data-event /g)||[]).length,30);
  assert.ok(html.includes('journey-sources'));
 }
});
