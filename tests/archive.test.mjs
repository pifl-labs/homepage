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
 for(const media of Object.values(archiveMedia))for(const key of ['oldIcon','oldShot','newShot'])assert.ok(existsSync('public'+media[key]));
});
for(const lang of ['ko','ja','en'])test(`${lang}: archive includes 14 apps, all events and accessible filter controls`,()=>{
 const html=readFileSync(`dist/${lang}/archive/index.html`,'utf8');
 assert.equal((html.match(/data-app-summary=/g)||[]).length,14);
 assert.equal((html.match(/data-event /g)||[]).length,archiveEvents.length);
 assert.ok(html.includes('aria-live="polite"'));assert.ok(html.includes('type="reset"'));
 assert.ok(html.includes(`https://pifl-labs.com/${lang}/archive/`));
});
