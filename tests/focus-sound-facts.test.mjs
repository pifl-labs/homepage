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
test('KO/JA features are unchanged platform availability rather than inferred sound parity',()=>{
 for(const lang of ['ko','ja']){
  assert.equal(focus.content[lang].features.length,4);
  assert.equal(focus.content[lang].features[3].icon,'fa-mobile-screen');
  assert.doesNotMatch(focus.content[lang].features[3].desc,/1\.0\.16|binaural/);
 }
});
