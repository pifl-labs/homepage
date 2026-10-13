import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const get=p=>readFileSync(new URL('../'+p,import.meta.url));
const sha=b=>createHash('sha256').update(b).digest('hex');
const pdf=get('public/assets/printables/one-word-recall-card-ko.pdf');
const txt=get('public/assets/printables/one-word-recall-card-ko.txt').toString('utf8');
const readme=get('README.md').toString('utf8');
test('Korean blank card retains the exact one-page document-QA bytes',()=>{
 assert.equal(pdf.subarray(0,5).toString(),'%PDF-');
 assert.equal(pdf.length,68837);
 assert.equal(sha(pdf),'370709ae7edc8be66eeb7eb3c0811b42d77251b381db9c5afa9fcff376bccc85');
});
test('Korean meanings-to-writing steps permit blank attempts and self-comparison',()=>{
 for(const s of ['이미 배운 단어','뜻만 적어요','안 보고 써봐요','빈칸도 괜찮아요','정답과 직접 비교해요','다음에 다시 볼 곳 하나'])assert.ok(txt.includes(s),s);
});
test('blank card supplies no word dataset, automatic grades or effect claims',()=>{
 for(const s of ['자동 채점·시험 점수·학습 효과 검증은 없어요','별개의 종이 자료','단어나 정답을 제공하지 않아요'])assert.ok(txt.includes(s),s);
 assert.ok(!/효과를 입증|성적을 높|기억력을 향상|Android|광고 없음|완전 무료 앱|신규 앱 출시/.test(txt));
});
test('standalone paper does not require optional app purchase',()=>{
 for(const s of ['앱 설치·가입·구매 없이','선택 앱','무료 다운로드·광고 포함','추가 단어팩/구독은 선택 유료','앱을 설치하거나 가입·구매할 필요는 없어요'])assert.ok(txt.includes(s),s);
 assert.deepEqual(txt.match(/https?:\/\/\S+/g),['https://apps.apple.com/kr/app/id6770267735']);
});
test('developer, AI and print/app limits stay transparent',()=>{
 for(const s of ['피플랩스 원본','AI 작성 보조','2026.10.13','인쇄·앱 실물 검증은 이 자료로 주장하지 않아요'])assert.ok(txt.includes(s),s);
});
test('public README exposes both exact Korean resources without a new release claim',()=>{
 for(const s of ['https://pifl-labs.com/assets/printables/one-word-recall-card-ko.pdf','https://pifl-labs.com/assets/printables/one-word-recall-card-ko.txt','학습 효과·인쇄·앱 실물 검증','새로운 앱 기능이나 SNS 게시가 아닙니다.'])assert.ok(readme.includes(s),s);
});
test('original Jua license is retained rather than silently replaced',()=>{
 const license=get('public/assets/printables/jua-OFL.txt');
 assert.equal(sha(license),'44a7c6e4c5572392ae122d3b1d8c6ba6fd640a7797e675384585d947f2773e3c');
 assert.ok(readme.includes('https://pifl-labs.com/assets/printables/jua-OFL.txt'));
});
test('previous English and Japanese cards stay byte-identical',()=>{
 assert.equal(sha(get('public/assets/printables/one-word-recall-card-en.pdf')),'3797398d187a4d01f203e4562f80c28018fb198ee36aa31f1acf7462177d7b81');
 assert.equal(sha(get('public/assets/printables/one-word-recall-card-ja.pdf')),'fdd5d46a8738de1cd88c725d057929b229ce3dcff4575483e860c15baac3e4d6');
});
