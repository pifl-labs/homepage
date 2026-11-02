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
 // Every record matches the 2026-11-02 App Store Connect listing snapshot: version (build), review state, image sources.
 const current=JSON.parse(readFileSync(new URL('../docs/release/homepage-app-audit-20261102.json',import.meta.url))).apps;
 const token=u=>u.match(/\/thumb\/([^/]+)\//)[1];
 for(const [slug,item] of Object.entries(media)){
  const seen=current.find(a=>a.slug===slug).listingMedia;
  assert.equal(item.version,`${seen.version} (${seen.build})`,slug);
  assert.equal(item.pending,seen.state!=='READY_FOR_DISTRIBUTION',slug);
  assert.deepEqual(item.shots.map(s=>token(s.source)),seen.firstThree.map(token),slug);
 }
 assert.equal(media['pipi-sudoku'].pending,false,'Sudoku iOS 1.0.2 is public');
 for(const slug of ['pipi-tide','kkachi'])assert.equal(media[slug].pending,true,`${slug} iOS is still in review`);
});
