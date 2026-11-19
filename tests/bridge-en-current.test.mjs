import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const html=readFileSync('dist/en/apps/pipi-bridge/index.html','utf8');
test('EN Bridge uses verified public US listing media without overriding shared release metadata',()=>{
 assert.match(html,/iOS v1\.1\.3.*Android v1\.0\.3/s);
 assert.doesNotMatch(html,/iOS 1\.0\.2|20261023-[123]\.webp/);
 assert.match(html,/us-listing-20261120\/library.webp/);
 assert.match(html,/English screenshot on the public US App Store listing/);
 assert.match(html,/rollout of these features is not yet independently confirmed/);
 assert.match(html,/US App Store listing · iOS 1\.2\.0 observed/);
 assert.match(html,/width="598" height="1300"/);
 assert.match(html,/capture build and device are not independently verified/);
 const image=readFileSync('public/assets/apps/pipi-bridge/us-listing-20261120/library.webp');
 assert.equal(createHash('sha256').update(image).digest('hex'),'3a17f68f1895583db9996d0d0ea23c40718c4e8fd8ebb6548e7724930a0b3eeb');
});
test('all locale reviewer entrances preserve both guide and cards links',()=>{
 for(const lang of ['en','ko','ja']){
  const page=readFileSync(`dist/${lang}/apps/pipi-bridge/index.html`,'utf8');
  for(const path of ['library/','library/cards/'])assert.ok(page.includes(`href="/en/apps/pipi-bridge/${path}"`));
 }
 assert.ok(existsSync('dist/en/apps/pipi-bridge/library/cards/index.html'));
});
