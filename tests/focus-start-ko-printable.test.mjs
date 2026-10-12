import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const get=(p)=>readFileSync(new URL('../'+p,import.meta.url));
const pdf=get('public/assets/printables/one-small-start-ko.pdf');
const txt=get('public/assets/printables/one-small-start-ko.txt').toString('utf8');
const readme=get('README.md').toString('utf8');
const license=get('public/assets/printables/jua-OFL.txt').toString('utf8');
test('Korean printable retains actual reviewed one-page bytes',()=>{
 assert.equal(pdf.length,71865);assert.equal(pdf.subarray(0,5).toString(),'%PDF-');
 assert.equal(createHash('sha256').update(pdf).digest('hex'),'06882ed91bd27bf7b23783cc8bdd5f20b42427f0b488e7348bc8f5ec79df8db8');
});
test('Korean paper plan leaves duration and stopping to the reader',()=>{
 for(const s of ['오늘 할 일 하나','눈에 보이는 첫 행동','25분으로 맞출 필요는 없어요.','선택은 내가 해요.','지금 말고, 나중에','다음에 할 작은 행동:'])assert.ok(txt.includes(s),s);
 for(const s of ['집중력이 높아','성적이 올라','임상','치료','자동 채점','추적하지','완전 무료 앱'])assert.ok(!txt.includes(s),s);
});
test('Korean free paper resource does not hide optional app cost/provenance',()=>{
 for(const s of ['앱 설치나 가입은 필요 없어요.','선택: 집중항해 iOS 타이머','광고 포함 무료 다운로드','광고 제거는 선택 1회 구매','AI 작성 보조','효과를 보장하지 않아요.','apps.apple.com/kr/app/id6762258878','https://pifl-labs.com/assets/printables/one-small-start-ko.pdf'])assert.ok(txt.includes(s),s);
});
test('README exposes exact Korean paper and text with honest limits',()=>{
 for(const s of ['https://pifl-labs.com/assets/printables/one-small-start-ko.pdf','https://pifl-labs.com/assets/printables/one-small-start-ko.txt','앱 설치나 가입 없이','작성에 AI를 사용','입증하거나 보장하는 자료는 아닙니다.','광고 제거는 선택 1회 구매','추천·보증을 의미하지 않습니다.'])assert.ok(readme.includes(s),s);
});
test('embedded font attribution and official OFL companion are retained',()=>{
 assert.ok(license.startsWith('Copyright 2018 The Jua Project Authors'));
 assert.ok(license.includes('SIL OPEN FONT LICENSE Version 1.1'));
 assert.ok(readme.includes('https://pifl-labs.com/assets/printables/jua-OFL.txt'));
});
