import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const pdf=readFileSync(new URL('../public/assets/printables/one-small-start-en.pdf',import.meta.url));
const txt=readFileSync(new URL('../public/assets/printables/one-small-start-en.txt',import.meta.url),'utf8');
const readme=readFileSync(new URL('../README.md',import.meta.url),'utf8');
test('focus-start PDF keeps the accepted rendered bytes',()=>{
  assert.equal(pdf.length,3159);assert.equal(pdf.subarray(0,5).toString(),'%PDF-');
  assert.equal(createHash('sha256').update(pdf).digest('hex'),'074a394c292a52162dc5c62f132fe5e7bb1e22d40e36b0380a555aa7f846b5cb');
});
test('paper plan leaves duration and stopping decision to the reader',()=>{
  for(const x of ['Your own time box.','No perfect length is assumed.','It is your decision.','PARK IT FOR LATER','My next small step:']) assert.ok(txt.includes(x),x);
  for(const x of ['25-minute','25 minutes','guaranteed','proven','ADHD','cure','testimonial','no tracking','100% private','cloud backup']) assert.ok(!txt.toLowerCase().includes(x.toLowerCase()),x);
});
test('free resource and optional ad-supported app are separate',()=>{
  for(const x of ['No app or sign-up required.','Optional iOS timer: Pomodoro at Sea.','App: free download with ads; optional one-time ad removal.','AI-assisted preparation','https://pifl-labs.com/assets/printables/one-small-start-en.pdf','apps.apple.com/us/app/id6762258878']) assert.ok(txt.includes(x),x);
});
test('README exposes exact resource and text URLs with provenance, not outcomes',()=>{
  for(const x of ['https://pifl-labs.com/assets/printables/one-small-start-en.pdf','https://pifl-labs.com/assets/printables/one-small-start-en.txt','your own time box','AI assistance','no productivity or health outcome','optional Pomodoro at Sea iOS link','one-time ad removal']) assert.ok(readme.includes(x),x);
});
