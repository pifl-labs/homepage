import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {archiveEvents,archiveMedia} from '../src/data/archive.mjs';
import {publicArchiveApps,publicArchiveEvents,publicArchiveEvidence} from '../src/data/archive-public.mjs';
test('historical input preserves distinct source timestamps behind the public projection',()=>{
 assert.equal(new Set(archiveEvents.map(e=>e.id)).size,archiveEvents.length);
 const first=archiveEvents.find(e=>e.id==='focus-first-approval');
 assert.equal(first.version,null);assert.equal(first.timeBasis,'notification-date');
 assert.equal(archiveEvents.find(e=>e.id==='draw-approved-10').version,'1.0');
 const focus=archiveEvents.find(e=>e.id==='focus-121');
 assert.notEqual(focus.timestamp,focus.milestones.approvalNotifiedAt);
 for(const e of archiveEvents){assert.ok(e.timeBasis);for(const lang of ['ko','ja','en'])assert.ok(e.title[lang]&&e.summary[lang]);}
 const data=JSON.parse(readFileSync('public/archive-evidence.json','utf8'));
 assert.deepEqual(data,publicArchiveEvidence);
 assert.doesNotMatch(JSON.stringify(data),/mail\.google|message_id|@|token|TestFlight/i);
 for(const media of Object.values(archiveMedia))for(const key of ['oldIcon','oldShot','newShot'])if(media[key])assert.ok(existsSync('public'+media[key]));
});
for(const lang of ['ko','ja','en'])test(`${lang}: archive lists only released apps and records and accessible filter controls`,()=>{
 const html=readFileSync(`dist/${lang}/archive/index.html`,'utf8');
 assert.equal((html.match(/data-app-summary=/g)||[]).length,publicArchiveApps.length);
 assert.equal((html.match(/data-event /g)||[]).length,publicArchiveEvents.length);
 assert.doesNotMatch(html, /pipi-legion|data-journey-app|data-media-app|class="archive-exhibits"|\/submission\//);
 assert.ok(html.includes('aria-live="polite"'));assert.ok(html.includes('type="reset"'));
 assert.ok(html.includes(`https://pifl-labs.com/${lang}/archive/`));
});
test('archive browser logic is external under the production self-only script policy',()=>{
 const headers=readFileSync('public/_headers','utf8');
 // Inline scripts stay blocked: only same-origin files and Cloudflare Web Analytics' injected beacon (versioned path) may run.
 assert.deepEqual(headers.match(/script-src ([^;]+);/)[1].trim().split(/\s+/),["'self'",'https://static.cloudflareinsights.com/beacon.min.js','https://static.cloudflareinsights.com/beacon.min.js/']);
 for(const lang of ['ko','ja','en']){
  const html=readFileSync(`dist/${lang}/archive/index.html`,'utf8');
  assert.match(html,/<script[^>]+src="\/archive-client\.js\?v=5"/);
  const scripts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.filter(([,attrs,body])=>!attrs.includes('application/ld+json')&&body.trim()).length,0,'executable inline JS would be blocked by deployed CSP');
 }
});
test('legacy input keeps provenance without promoting assets or beta releases',()=>{
 assert.equal(new Set(archiveEvents.map(e=>e.app)).size,17);
 assert.equal(Object.keys(archiveMedia).length,17);
 for(const slug of ['pipi-legion']){
  assert.ok(archiveEvents.filter(e=>e.app===slug).every(e=>e.kind==='asset'&&e.version===null));
  assert.equal(archiveMedia[slug].upcoming,true);
 }
 // 2026-11-02: Kkachi and Tide have dated Android production observations only; Sudoku has its first public iOS record.
 for(const slug of ['kkachi','pipi-tide']){
  assert.equal(archiveMedia[slug].upcoming,false);
  assert.ok(archiveEvents.filter(e=>e.app===slug&&e.observedAt<='2026-11-02').every(e=>e.platform!=='ios'&&e.kind!=='released'));
  assert.ok(archiveEvents.some(e=>e.app===slug&&e.kind==='observed'&&e.platform==='android'&&e.version&&e.timeBasis==='observation-date'));
 }
 const sudokuIos=archiveEvents.filter(e=>e.app==='pipi-sudoku'&&e.platform==='ios'&&e.kind==='released');
 assert.deepEqual(sudokuIos.map(e=>[e.kind,e.version,e.timestamp]),[['released','1.0.2','2026-10-31T16:42:26Z']]);
 assert.ok(archiveEvents.filter(e=>e.app==='pipi-sudoku'&&e.platform==='android'&&e.observedAt<='2026-11-02').every(e=>e.kind==='observed'&&e.version===null));
});
