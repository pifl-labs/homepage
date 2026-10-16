import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const receipt=JSON.parse(readFileSync(new URL('../docs/release/public-facts-20261017-focus-radio.json',import.meta.url),'utf8'));
const source=readFileSync(new URL('../src/data/apps.ts',import.meta.url),'utf8');
const start=source.indexOf('const focus: AppMeta = '),end=source.indexOf('\nconst hello: AppMeta',start);
assert.ok(start>=0&&end>start);
const focus=runInNewContext(source.slice(start,end).replace('const focus: AppMeta = ','const focus = ')+'\nfocus');
test('Cabin Radio receipt pins the same official public iOS1.1.0 in three regions',()=>{
 assert.deepEqual(Object.keys(receipt.lookup).sort(),['jp','kr','us']);
 for(const [country,r] of Object.entries(receipt.lookup)){
  const url=new URL(r.source);assert.equal(url.origin,'https://itunes.apple.com');assert.equal(url.pathname,'/lookup');assert.equal(url.searchParams.get('id'),'6762258878');assert.equal(url.searchParams.get('country'),country);
  assert.equal(r.HTTP,200);assert.equal(r.trackId,6762258878);assert.equal(r.bundleId,'com.pifl.pipi.focus');assert.equal(r.artistName,'PiFl Labs Co., Ltd.');assert.equal(r.version,'1.1.0');assert.equal(r.currentVersionReleaseDate,'2026-10-15T19:05:28Z');assert.match(r.rawSHA256,/^[0-9a-f]{64}$/);
 }
 assert.equal(receipt.nativeRadioAndStoreImageHoldUnchanged,true);
});
for(const lang of ['ko','ja','en']){
 test(`${lang}: only the fourth sound card explains current iOS Cabin Radio`,()=>{
  const cards=focus.content[lang].features,expected=receipt.copy[lang];
  assert.equal(cards.length,4);assert.equal(cards.map(f=>f.icon).join(','),'fa-ban,fa-wifi,fa-gem,fa-volume-high');
  assert.equal(cards[3].title,expected.title);assert.equal(cards[3].desc,expected.desc);
  assert.ok(cards[3].desc.includes('iOS 1.1.0'));
  assert.doesNotMatch(cards[3].desc,/Android|1\.0\.16|guarantee|boost|proven|no ads|집중력 향상|효과 보장|集中力向上|広告なし/i);
 });
 test(`${lang}: public support describes layering and separate volumes, not effects`,()=>{
  const terms={ko:['로파이','빗소리','각각의 음량','항해 중'],ja:['ローファイ','雨音','別々','航海中'],en:['lo-fi','rain','each volume','mid-voyage']}[lang];
  for(const term of terms)assert.ok(receipt.copy[lang].desc.includes(term));
  assert.ok(receipt.sourceSnippets[lang]);
 });
 const built=new URL(`../dist/${lang}/apps/pipi-focus/index.html`,import.meta.url);
 test(`${lang}: built fourth card preserves exact approved copy and existing destinations`,{skip:!existsSync(built)},()=>{
  const html=readFileSync(built,'utf8');
  const cards=[...html.matchAll(/<article class="app-feature[^"]*"[^>]*>(.*?)<\/article>/gs)].map(m=>m[1]);assert.equal(cards.length,4);
  const card=cards[3],decoded=card.replaceAll('&#39;',"'").replaceAll('&amp;','&').replaceAll('&quot;','"');
  assert.ok(decoded.includes(receipt.copy[lang].title));assert.ok(decoded.includes(receipt.copy[lang].desc));
  assert.match(card,/fa-volume-high/);assert.doesNotMatch(card,/1\.0\.16|Android/);
  assert.ok(html.includes('id6762258878'));assert.ok(html.includes('com.pifl.pipi.focus'));
 });
}

test('Focus enlarged sound card keeps readable inline space without reducing font or hiding text',()=>{
 const template=readFileSync(new URL('../src/components/AppLanding.astro',import.meta.url),'utf8');
 const css=readFileSync(new URL('../public/styles-app-landing.css',import.meta.url),'utf8');
 assert.ok(template.includes("'app-feature--focus-sound': app.slug === 'pipi-focus' && f.icon === 'fa-volume-high'"));
 assert.match(css,/\.app-feature--focus-sound\s*\{\s*padding-inline: 24px;\s*\}/);
 assert.match(css,/\.app-feature--focus-sound h3\s*\{\s*text-wrap: balance;\s*\}/);
});

test('Japanese phrase segmentation is progressive and confined to the existing Focus sound marker',()=>{
 const css=readFileSync(new URL('../public/styles-app-landing.css',import.meta.url),'utf8');
 const template=readFileSync(new URL('../src/components/AppLanding.astro',import.meta.url),'utf8');
 assert.match(css,/@supports \(word-break: auto-phrase\)\s*\{\s*\.app-feature--ja-sound p \{ word-break: auto-phrase; \}\s*\}/);
 assert.ok(template.includes("'app-feature--ja-sound': app.slug === 'pipi-focus' && lang === 'ja' && f.icon === 'fa-volume-high'"));
 assert.match(css,/\.app-feature--ja-sound p\s*\{[^}]*word-break: normal;[^}]*line-break: strict;[^}]*text-wrap: pretty;/s);
});
