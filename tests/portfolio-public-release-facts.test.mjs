import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
const source=readFileSync(new URL('../src/data/apps.ts',import.meta.url),'utf8');
const receipt=JSON.parse(readFileSync(new URL('../docs/release/public-facts-20261008.json',import.meta.url),'utf8'));
const current = JSON.parse(readFileSync(new URL('../docs/release/homepage-app-audit-20261102.json', import.meta.url), 'utf8')).apps;
const laterLogIOS = JSON.parse(readFileSync(new URL('../docs/release/log-ios-public-20261106.json',import.meta.url),'utf8'));
const laterVoyageAndroid = JSON.parse(readFileSync(new URL('../docs/release/voyage-android-public-20261113.json',import.meta.url),'utf8'));
const variables={'com.pifl.pipi.wordvoyage':'wordVoyage','com.pifl.pipi.hello':'hello','com.pifl.pipi.words':'words','com.pifl.pipi.log':'log'};
const slugs={'com.pifl.pipi.wordvoyage':'pipi-word-voyage','com.pifl.pipi.hello':'pipi-hello','com.pifl.pipi.words':'pipi-words','com.pifl.pipi.log':'pipi-log'};
const playDay=text=>new Date(`${text} UTC`).toISOString().slice(0,10);
const block=v=>source.match(new RegExp(`const ${v}: AppMeta = \\{([\\s\\S]*?)\\n\\};`))?.[1];
for(const [bundle,v] of Object.entries(variables))test(`${bundle}: observed iOS version and UTC date replace older metadata`,()=>{
 const later = bundle==='com.pifl.pipi.log' ? laterLogIOS.apps.find(a=>a.lang==='ko').app : null;
 const r=later??current.find(a=>a.slug===slugs[bundle]).ios.ko;
 const checkedAt=later?laterLogIOS.observedAt:'2026-11-02';
 assert.ok(block(v));assert.ok(block(v).includes(`ios: { version: '${r.version}', updated: '${r.currentVersionReleaseDate.slice(0,10)}', checkedAt: '${checkedAt}' }`));
});
test('Words iOS destination uses all three current public listing names and keeps aliases',()=>{
 const b=block('words');const ios=b.match(/ios: \{ ko: '([^']+)', ja: '([^']+)', en: '([^']+)' \}/);
 for(const [i,l] of ['ko','ja','en'].entries())assert.equal(ios[i+1],receipt.ios['com.pifl.pipi.words'].iosNames[l]);
 assert.match(b,/previousName: 'PiPi Words'/);assert.match(b,/id6770267735/);assert.match(b,/com\.pifl\.pipi\.words/);
});
test('Android versions and different update dates keep independent dated evidence',()=>{
 for(const [bundle,v] of Object.entries(variables)){
  const a=current.find(x=>x.slug===slugs[bundle]);
  assert.deepEqual(a.playProduction.map(r=>r.name),[a.android.en.version],`${bundle}: public listing matches the production track`);
  const newer = bundle==='com.pifl.pipi.wordvoyage' ? laterVoyageAndroid : null;
  const observed = newer ? newer.apps.find(r=>r.lang==='en').app : a.android.en;
  const checkedAt = newer ? newer.observedAt : '2026-11-02';
  assert.ok(block(v).includes(`android: { version: '${observed.version}', updated: '${playDay(observed.updatedDisplay)}', checkedAt: '${checkedAt}' }`));
 }
 // The 2026-10-08 receipt stays as history; its unverified timezone note is not rewritten.
 assert.equal(receipt.android['com.pifl.pipi.wordvoyage'].timezone,'UNVERIFIED');assert.equal(receipt.android['com.pifl.pipi.log'].updatedCalendar,'2026-10-04');
});
test('Platforms keep their own versions when they differ, and observations stay dated',()=>{
 assert.match(block('words'),/ios: \{ version: '1\.0\.14'/);assert.match(block('words'),/android: \{ version: '1\.1\.0'/);
 for(const v of Object.values(variables))assert.match(block(v),/checkedAt: '2026-11-02',\n  \}/);
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
