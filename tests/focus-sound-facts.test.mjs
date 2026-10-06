import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const source = readFileSync(new URL('../src/data/apps.ts', import.meta.url),'utf8');
const focusText = source.slice(source.indexOf('const focus: AppMeta = '), source.indexOf('\nconst hello: AppMeta'));
const focus = runInNewContext(focusText.replace('const focus: AppMeta = ','const focus = ')+'\nfocus');
test('Focus release label follows KR/JP/US public iOS1.0.16 and UTC release date',()=>{
 assert.equal(focus.release.ios.version,'1.0.16');
 assert.equal(focus.release.ios.updated,'2026-10-05');
 assert.equal(focus.release.checkedAt,'2026-09-30');
 assert.equal(focus.release.android,undefined,'do not infer an Android release');
});
test('English differentiated feature is iOS-scoped and names all five actual choices',()=>{
 const cards=focus.content.en.features;
 assert.equal(cards.length,4);
 const card=cards[3];
 assert.equal(card.icon,'fa-volume-high');
 assert.equal(card.title,'Switch sound mid-voyage');
 for(const text of ['On iOS 1.0.16:', 'brown, pink or white noise', "a ship's clock", 'deep-sea binaural', 'Earphones recommended for binaural.']) assert.ok(card.desc.includes(text),text);
 assert.doesNotMatch(card.desc,/guarantee|improve focus|boost|Android|proven|free of ads/i);
});
test('platform availability remains in existing EN CTA and exact store routes',()=>{
 assert.equal(focus.content.en.ctaSub,'Free on iOS & Android.');
 assert.equal(new URL(focus.stores.ios).pathname,'/app/pipi-focus-pirate-pomodoro/id6762258878');
 assert.equal(new URL(focus.stores.android).searchParams.get('id'),'com.pifl.pipi.focus');
});
test('KO/JA sound cards name the public iOS scope without Android parity or benefit claims',()=>{
 const specs={ko:{title:'소리 전환',terms:['iOS 1.0.16','브라운, 핑크, 화이트 노이즈','선박 시계','심해 바이노럴','항해 중에도','이어폰']},ja:{title:'音の切替',terms:['iOS 1.0.16','ブラウン・ピンク・ホワイトノイズ','船の時計','深海バイノーラル','航海中も','イヤホン推奨']}};
 for(const [lang,spec] of Object.entries(specs)){
  assert.equal(focus.content[lang].features.length,4);
  const card=focus.content[lang].features[3];
  assert.equal(card.icon,'fa-volume-high');assert.equal(card.title,spec.title);
  for(const term of spec.terms)assert.ok(card.desc.includes(term),lang+': '+term);
  assert.doesNotMatch(card.desc,/Android|Flutter|guarantee|boost|集中力向上|효과 보장|집중력 향상/);
 }
});
test('KO/JA existing availability CTA and three earlier feature icons remain',()=>{
 assert.equal(focus.content.ko.ctaSub,'iOS · Android에서 무료로.');
 assert.equal(focus.content.ja.ctaSub,'iOS · Android で無料。');
 for(const lang of ['ko','ja'])assert.equal(focus.content[lang].features.slice(0,3).map(x=>x.icon).join(','),'fa-ban,fa-wifi,fa-gem');
});

test('Korean sound wrap protection is scoped to the Focus sound card only',()=>{
 const template=readFileSync(new URL('../src/components/AppLanding.astro',import.meta.url),'utf8');
 const css=readFileSync(new URL('../public/styles-app-landing.css',import.meta.url),'utf8');
 assert.ok(template.includes("'app-feature--ko-sound': app.slug === 'pipi-focus' && lang === 'ko' && f.icon === 'fa-volume-high'"));
 assert.match(css,/\.app-feature--ko-sound h3,\s*\.app-feature--ko-sound p\s*\{\s*word-break: keep-all;\s*overflow-wrap: normal;\s*text-wrap: pretty;/);
});

test('Japanese sound card preserves strict line-start punctuation and long vowel rules locally',()=>{
 const template=readFileSync(new URL('../src/components/AppLanding.astro',import.meta.url),'utf8');
 const css=readFileSync(new URL('../public/styles-app-landing.css',import.meta.url),'utf8');
 assert.ok(template.includes("'app-feature--ja-sound': app.slug === 'pipi-focus' && lang === 'ja' && f.icon === 'fa-volume-high'"));
 assert.match(css,/\.app-feature--ja-sound h3,\s*\.app-feature--ja-sound p\s*\{\s*word-break: normal;\s*overflow-wrap: normal;\s*line-break: strict;\s*text-wrap: pretty;/);
});
