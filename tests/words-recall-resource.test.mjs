import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';import {resources} from '../src/data/resources.mjs';
test('Words worksheet preserves original destinations and self-comparison scope',()=>{const r=resources.find(r=>r.id==='word-recall');assert.equal(r.app,'pipi-words');assert.match(r.description.en,/No automatic grading/);assert.deepEqual(r.variants.map(v=>v.language),['ko','en','ja']);const en=r.variants.find(v=>v.language==='en');assert.equal(en.url,'/assets/printables/one-word-recall-card-en.pdf');assert.equal(en.textUrl,'/assets/printables/one-word-recall-card-en.txt');});
test('Exact canonical approved PDF and text bytes are not regenerated',()=>{
 const specs=[['pdf','3797398d187a4d01f203e4562f80c28018fb198ee36aa31f1acf7462177d7b81'],['txt','fb7f9da760a06573ce2c665484c05e95bad0c1183caab397dfa12cd1bcbd13b3']];
 for(const [ext,sha]of specs){const b=readFileSync(new URL('../public/assets/printables/one-word-recall-card-en.'+ext,import.meta.url));assert.equal(createHash('sha256').update(b).digest('hex'),sha);}
});
