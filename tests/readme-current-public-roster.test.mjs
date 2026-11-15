import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const syncReceipt=JSON.parse(readFileSync('docs/release/public-release-sync-20261116.json','utf8'));
const text=readFileSync('README.md','utf8');
const section=text.match(/### Current public apps — checked 16 November 2026 \(KST\)[\s\S]*?(?=### Ten apps: official store links)/)?.[0];
test('current README directory gives all16 actual Android packages and11 KR iOS URLs',()=>{
 assert.ok(section);assert.equal(section.split('\n').filter(l=>l.startsWith('| ')&&!l.startsWith('| Current')&&!l.startsWith('| ---')).length,16);
 for(const row of syncReceipt.android.apps){assert(section.includes(row.name));assert(section.includes('id='+row.package+'&hl=ko&gl=KR'));}
 for(const row of syncReceipt.ios.KR.apps)assert(section.includes(row.trackViewUrl.split('?')[0]));
 assert.equal((section.match(/\[App Store \(KR\)\]/g)??[]).length,11);assert.equal((section.match(/\[Google Play \(KR\)\]/g)??[]).length,16);
 assert.match(section,/not proof of identical platform features or a device test/);
});
test('all earlier README snapshots and resources remain byte-exact',()=>{
 assert.equal(createHash('sha256').update(text.replace(section,'')).digest('hex'),'89936c04d81a40182904785570882501eab0e96c2912b8fe1e99469d76516865');
});
