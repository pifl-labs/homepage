import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {apps} from '../src/data/apps.ts';
const a=apps.kkachi, ko=a.content.ko;
const receipt=JSON.parse(readFileSync(new URL('../docs/release/kkachi-ko-painting-entry-20261110.json',import.meta.url),'utf8'));
const html=readFileSync(new URL('../dist/ko/apps/kkachi/index.html',import.meta.url),'utf8');
test('Korean painting entry combines motif/meaning and keeps sharing as two current supported cards',()=>{
 assert.equal(ko.featuresTitle,'내 민화, 이렇게 살펴봐요');
 assert.equal(ko.features.length,2);
 assert.deepEqual(ko.features.map(x=>x.title),receipt.features.map(x=>x.title));
 assert.equal(receipt.url,'https://play.google.com/store/apps/details?id=com.pifl.pipi.kkachi&hl=ko&gl=KR');
 assert(receipt.features.every(x=>x.source.length>0));
 assert.match(ko.features[0].desc,/'그림 읽기'/);
 assert.match(ko.features[1].desc,/공유 이미지에는 생년월일, 이름, 출생지를 넣지 않아요/);
});
test('only Korean gains cards; existing Android-only destination and entertainment/cost limits remain',()=>{
 assert.equal(a.content.en.features.length,0);assert.equal(a.content.ja.features.length,0);
 assert.deepEqual(a.stores,{android:'https://play.google.com/store/apps/details?id=com.pifl.pipi.kkachi'});
 assert.match(ko.ctaSub,/앱 안에 유료 상품이 있어요/);
 assert.match(ko.ctaSub,/오락과 문화 체험/);assert.match(ko.ctaSub,/미래를 예측하거나 보장하지 않아요/);
 assert.doesNotMatch(JSON.stringify(ko.features),/개인정보.*절대|누구나.*무료|의료|재테크|정확한.*미래/);
});
test('built Korean page includes full explanations and both pre-existing exact Google Play entry points',()=>{
 assert(html.includes(ko.featuresTitle));
 for(const f of ko.features){assert(html.includes(f.title));assert(html.includes(f.desc.replaceAll("'",'&#39;'))||html.includes(f.desc));}
 const links=[...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/g)].map(x=>x[1]);
 const play=links.filter(x=>x.includes('play.google.com/store/apps/details'));
 assert.equal(play.length,2);assert(play.every(x=>x.includes('id=com.pifl.pipi.kkachi')));
 assert(!links.some(x=>x.includes('apps.apple.com')));
 assert(html.includes('앱 안에 유료 상품이 있어요'));
 assert(html.includes('미래를 예측하거나 보장하지 않아요'));
});
