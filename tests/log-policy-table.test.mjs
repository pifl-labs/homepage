import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('policy table region preserves content and supports keyboard scrolling',()=>{
 const s=read('src/components/ScrollableLegalTable.astro');
 assert.match(s,/overflow-x:\s*auto/);assert.match(s,/tabindex="0"/);
 assert.match(s,/role="region"/);assert.match(s,/aria-label=\{label\}/);
 assert.match(s,/:focus-visible/);assert.match(s,/<slot\s*\/>/);
 assert.doesNotMatch(s,/overflow(?:-x)?:\s*(?:hidden|clip)/);
});
for(const loc of ['ko/','ja/','en/',''])test(`Log ${loc||'default'} policy wraps all three tables`,()=>{
 const s=read(`src/pages/${loc}apps/pipi-log/privacy.astro`);
 assert.equal((s.match(/<ScrollableLegalTable label=/g)||[]).length,3);
 assert.equal((s.match(/<\/ScrollableLegalTable>/g)||[]).length,3);
 assert.equal((s.match(/<table>/g)||[]).length,3);
 for(const [,body] of s.matchAll(/<ScrollableLegalTable label="[^"]+">([\s\S]*?)<\/ScrollableLegalTable>/g)){
  assert.match(body.trim(), /^<table>[\s\S]*<\/table>$/);
  assert.equal((body.match(/<table>/g)||[]).length,1);
  assert.doesNotMatch(body,/<ScrollableLegalTable|<h2/);
 }
 assert.match(s,/PiPi Log/); // Historical app identity remains discoverable.
});

test('large text preserves table column reading width and wraps long prose',()=>{
 const table=read('src/components/ScrollableLegalTable.astro');
 assert.match(table,/min-width:\s*36em/);
 assert.match(table,/class="legal-table-hint"/);
 const css=read('public/styles-log-policy.css');
 assert.match(css,/overflow-wrap:\s*anywhere/);
 assert.match(css,/html\[lang="ko"\] \.legal-table-scroll td:first-child\s*\{\s*white-space:\s*nowrap/);
 assert.doesNotMatch(css,/overflow(?:-x)?:\s*(?:hidden|clip)/);
});

test('Korean app rename uses the correct topic particle',()=>{
 const s=read('src/pages/ko/apps/pipi-log/privacy.astro');
 assert.match(s,/기분 한 칸은 생체정보에 직접 접근하지 않음/);
 assert.doesNotMatch(s,/기분 한 칸는/);
});

test('all locales retain original effective date, disclose revision and distinguish journal from secure entitlement',()=>{
 const cases=[
  ['ko/','2026년 5월 17일','2026년 9월 23일','앱 자체에서 별도로 암호화하지 않습니다','구매 권한 상태는 Keychain/Keystore'],
  ['ja/','2026年5月17日','2026年9月23日','アプリ独自の暗号化は行いません','購入権限の状態は Keychain/Keystore'],
  ['en/','May 17, 2026','September 23, 2026','without separate app-level encryption','Purchase entitlement status is stored in platform secure storage'],
  ['','May 17, 2026','September 23, 2026','without separate app-level encryption','Purchase entitlement status is stored in platform secure storage'],
 ];
 for(const [locale,effective,updated,journal,purchase] of cases){
  const s=read(`src/pages/${locale}apps/pipi-log/privacy.astro`);
  assert.ok(s.includes(effective),`${locale} original effective date`);
  assert.ok(s.includes(updated),`${locale} revision date`);
  assert.ok(s.includes(journal),`${locale} journal storage`);
  assert.ok(s.includes(purchase),`${locale} entitlement storage`);
  assert.doesNotMatch(s,/Sensitive data stored in secure storage|機密情報の安全な保存領域|민감 정보의 보안 저장소/);
 }
});
