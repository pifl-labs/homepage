import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
const source=readFileSync(new URL('../src/data/apps.ts',import.meta.url),'utf8');
const receipt=JSON.parse(readFileSync(new URL('../docs/release/public-facts-20261008.json',import.meta.url),'utf8'));
const variables={'com.pifl.pipi.wordvoyage':'wordVoyage','com.pifl.pipi.hello':'hello','com.pifl.pipi.words':'words','com.pifl.pipi.log':'log'};
const block=v=>source.match(new RegExp(`const ${v}: AppMeta = \\{([\\s\\S]*?)\\n\\};`))?.[1];
for(const [bundle,v] of Object.entries(variables))test(`${bundle}: observed iOS version and UTC date replace older metadata`,()=>{
 const r=receipt.ios[bundle];assert.ok(block(v));assert.ok(block(v).includes(`ios: { version: '${r.version}', updated: '${r.updatedUTC}', checkedAt: '${r.observedKSTDay}' }`));
});
test('Words iOS destination uses all three current public listing names and keeps aliases',()=>{
 const b=block('words');const ios=b.match(/ios: \{ ko: '([^']+)', ja: '([^']+)', en: '([^']+)' \}/);
 for(const [i,l] of ['ko','ja','en'].entries())assert.equal(ios[i+1],receipt.ios['com.pifl.pipi.words'].iosNames[l]);
 assert.match(b,/previousName: 'PiPi Words'/);assert.match(b,/id6770267735/);assert.match(b,/com\.pifl\.pipi\.words/);
});
test('Android versions and different update dates keep independent dated evidence',()=>{
 for(const [bundle,r] of Object.entries(receipt.android))assert.ok(block(variables[bundle]).includes(`android: { version: '${r.version}', updated: '${r.updatedCalendar}', checkedAt: '${r.checkedKSTDay}' }`));
 assert.equal(receipt.android['com.pifl.pipi.wordvoyage'].timezone,'UNVERIFIED');assert.equal(receipt.android['com.pifl.pipi.log'].updatedCalendar,'2026-10-04');
});
test('One-platform observations do not fabricate Android releases or erase previous name snapshot dates',()=>{
 for(const v of ['words','hello'])assert.doesNotMatch(block(v),/android: \{ version:/);
 assert.match(block('wordVoyage'),/checkedAt: '2026-09-24'/);assert.match(block('words'),/checkedAt: '2026-09-30'/);
 const fleet=readFileSync(new URL('../src/components/FleetLog.astro',import.meta.url),'utf8');assert.match(fleet,/liveApps\.flatMap\(releaseObservationDates\)/);
 assert.match(source,/app\.release\?\.checkedAt, app\.release\?\.ios\?\.checkedAt, app\.release\?\.android\?\.checkedAt/);
});

test('Words readability repair uses a shorter factual section title and preserves Korean store-label words',()=>{
 assert.match(block('words'), /shotsTitle: 'Words, card by card'/);
 assert.doesNotMatch(block('words'), /shotsTitle: 'Vocabulary that builds like a voyage'/);
 const landing=readFileSync(new URL('../src/components/AppLanding.astro',import.meta.url),'utf8');
 assert.equal((landing.match(/app.slug === 'pipi-words' \|\| app.slug === 'pipi-hello'\) && lang === 'ko' \? 'word-break: keep-all; overflow-wrap: normal'/g)??[]).length,4);
});

test('Fleet observation note preserves each short complete date as a semantic time unit',()=>{
 const fleet=readFileSync(new URL('../src/components/FleetLog.astro',import.meta.url),'utf8');
 assert.match(fleet, /<time datetime=\{date\} style="white-space: nowrap">\{formatDate\(date, lang\)\}<\/time>/);
 assert.match(fleet, /noteBefore: 'Checked against the stores on '/);
 assert.doesNotMatch(fleet, /class="fleet-note"[^>]*style=/);
});
