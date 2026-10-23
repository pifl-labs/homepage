import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {archiveEvents,archiveMedia,archiveNames} from '../src/data/archive.mjs';
test('archive preserves distinct events, unknown versions and sanitized provenance',()=>{
 assert.equal(new Set(archiveEvents.map(e=>e.id)).size,archiveEvents.length);
 const first=archiveEvents.find(e=>e.id==='focus-first-approval');
 assert.equal(first.version,null);assert.equal(first.timeBasis,'notification-date');
 assert.equal(archiveEvents.find(e=>e.id==='draw-approved-10').version,'1.0');
 const focus=archiveEvents.find(e=>e.id==='focus-121');
 assert.notEqual(focus.timestamp,focus.milestones.approvalNotifiedAt);
 for(const e of archiveEvents){assert.ok(e.timeBasis);for(const lang of ['ko','ja','en'])assert.ok(e.title[lang]&&e.summary[lang]);}
 const data=JSON.parse(readFileSync('public/archive-evidence.json','utf8'));
 assert.deepEqual(data.events,archiveEvents);assert.deepEqual(data.names,archiveNames);
 assert.doesNotMatch(JSON.stringify(data),/mail\.google|message_id|@|token|TestFlight/i);
 for(const media of Object.values(archiveMedia))for(const key of ['oldIcon','oldShot','newShot'])if(media[key])assert.ok(existsSync('public'+media[key]));
});
for(const lang of ['ko','ja','en'])test(`${lang}: archive includes 14 apps, all events and accessible filter controls`,()=>{
 const html=readFileSync(`dist/${lang}/archive/index.html`,'utf8');
 assert.equal((html.match(/data-app-summary=/g)||[]).length,14);
 assert.equal((html.match(/data-event /g)||[]).length,archiveEvents.length);
 assert.ok(html.includes('aria-live="polite"'));assert.ok(html.includes('type="reset"'));
 assert.ok(html.includes(`https://pifl-labs.com/${lang}/archive/`));
});
test('archive browser logic is external under the production self-only script policy',()=>{
 const headers=readFileSync('public/_headers','utf8');assert.match(headers,/script-src 'self';/);
 for(const lang of ['ko','ja','en']){
  const html=readFileSync(`dist/${lang}/archive/index.html`,'utf8');
  assert.match(html,/<script[^>]+src="\/archive-client\.js\?v=3"/);
  const scripts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.filter(([,attrs,body])=>!attrs.includes('application/ld+json')&&body.trim()).length,0,'executable inline JS would be blocked by deployed CSP');
 }
});
test('all 14 canonical apps have representative records and no fabricated beta releases',()=>{
 assert.equal(new Set(archiveEvents.map(e=>e.app)).size,14);
 assert.equal(Object.keys(archiveMedia).length,14);
 for(const slug of ['kkachi','pipi-sky','pipi-legion']){
  assert.ok(archiveEvents.filter(e=>e.app===slug).every(e=>e.kind==='asset'&&e.version===null));
  assert.equal(archiveMedia[slug].upcoming,true);
 }
 for(const slug of ['pipi-tide','pipi-sudoku'])assert.ok(archiveEvents.filter(e=>e.app===slug).every(e=>e.platform==='android'&&e.kind==='observed'&&e.version===null));
});
