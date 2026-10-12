import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const D=new URL('../public/assets/printables/',import.meta.url),pdf=readFileSync(new URL('one-word-recall-card-en.pdf',D)),txt=readFileSync(new URL('one-word-recall-card-en.txt',D),'utf8');
const sha=b=>createHash('sha256').update(b).digest('hex');
test('printable retains exact one-page document-QA accepted PDF bytes',()=>{
 assert.equal(pdf.subarray(0,5).toString(),'%PDF-');assert.equal(pdf.length,3154);assert.equal(sha(pdf),'3797398d187a4d01f203e4562f80c28018fb198ee36aa31f1acf7462177d7b81');
});
test('card is usable without an app and does not invent word data or grades',()=>{
 for(const s of ['No app required','already studied','your own study source','A blank is OK','Compare yourself','No automatic grading or exam score'])assert.ok(txt.includes(s),s);
 assert.ok(!/learn faster|boost memory|proven|guaranteed|exam prediction|stroke-order scoring|customer result/i.test(txt));
});
test('independent printable keeps developer, AI and optional iOS costs transparent',()=>{
 for(const s of ['Optional app','on iOS','Free basic decks','ads and optional word packs/subscription','Paid options are not needed','PiFl Labs','AI-assisted wording','12 Oct 2026'])assert.ok(txt.includes(s),s);
 assert.deepEqual(txt.match(/https?:\/\/\S+/g),['https://apps.apple.com/us/app/id6770267735']);
 assert.ok(!/Android|ad-free|all features free|new app release|test effectiveness/i.test(txt));
});
