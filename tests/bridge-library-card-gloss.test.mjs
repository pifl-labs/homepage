import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';

const load=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const topics=JSON.parse(load('src/data/bridge-library-cards.json'));
const item=(topic,korean)=>topics.find(t=>t.id===topic)?.lessons.find(l=>l.korean===korean);

test('card meaning is the English meaning of the Korean phrase, not an activity answer',()=>{
 for(const [topic,korean,meaning] of [
  ['explore_nature_science','동물은 숨을 쉬어요','Animals breathe.'],
  ['explore_nature_science','물에 떠요','It floats on water.'],
  ['explore_art_movement_respect','빠르게, 느리게','Quickly and slowly.'],
  ['explore_art_movement_respect','빨강과 노랑','Red and yellow.'],
  ['explore_art_movement_respect','큰 소리, 작은 소리','Loud and quiet sounds.'],
  ['explore_weather_water_changes','바람이 불어요','The wind is blowing.'],
  ['explore_feelings_calm','기뻐요',"I'm happy."],
  ['math_count_compare','사과가 몇 개예요?','How many apples are there?'],
  ['math_everyday_challenges','둘로 똑같이 나눈 모양을 골라요.','Choose the shape split into two equal parts.'],
  ['math_day_and_clock','세 시 정각',"Three o'clock exactly."],
  ['math_join_take_away_5','하나와 하나를 합치면 몇 개일까요?','How many are there if you put one and one together?'],
 ]) assert.equal(item(topic,korean)?.meaning,meaning,topic+': '+korean);
});

test('existing adult cues remain separate from translation, and quick start is unchanged',()=>{
 const counting=item('math_count_compare','사과가 몇 개예요?');
 assert.equal(counting.tip,'Count three apples.');
 assert.notEqual(counting.meaning,counting.tip);
 assert.equal(item('school_greetings_help','도와주세요').meaning,'Please help me');
 assert.match(item('explore_nature_science','동물은 숨을 쉬어요').mission,/Do not touch or follow/);
});

test('rendered bilingual pairs expose the corrected gloss, not just in the data source',()=>{
 const html=load('dist/en/apps/pipi-bridge/library/cards/print/index.html').replace(/>\s+</g,'><');
 for(const [korean,english] of [['동물은 숨을 쉬어요','Animals breathe.'],['물에 떠요','It floats on water.'],['사과가 몇 개예요?','How many apples are there?']]){
   assert.ok(html.includes(`<p class="bl-ko" lang="ko">${korean}</p><p class="bl-item-meaning">${english}</p>`),korean);
 }
 assert.match(html,/<dt>Grown-up tip<\/dt><dd>Count three apples\.<\/dd>/);
});
