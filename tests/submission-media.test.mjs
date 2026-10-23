import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const media=JSON.parse(readFileSync(new URL('../src/data/app-submission-media.json',import.meta.url)));
test('submission images have exact official sources, localized labels and no invented build capture claim',()=>{
 assert.equal(Object.keys(media).length,12);
 assert.equal(media['pipi-sky'],undefined);
 assert.equal(media['pipi-legion'],undefined);
 for(const [slug,item] of Object.entries(media)){
  assert.match(item.source,/^https:\/\/appstoreconnect.apple.com\/apps\/\d+\/distribution\/ios\/version\//);
  assert.equal(item.buildVisualVerified,false);
  for(const shot of item.shots){
   assert.match(shot.source,/^https:\/\/is\d-ssl.mzstatic.com\//);
   assert.ok(existsSync(new URL('../public'+shot.src,import.meta.url)),`${slug}: missing image`);
   for(const lang of ['ko','ja','en'])assert.ok(shot.label[lang]);
  }
 }
 assert.equal(media['pipi-sudoku'].version,'1.0.0 (11)');
 assert.equal(media['pipi-sudoku'].pending,true);
});
