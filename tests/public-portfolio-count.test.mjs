import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from'node:fs';
import{publicPortfolioEvidence as e,verifiedPublicAppCount as companyCount}from'../src/data/public-portfolio.ts';
import{appList,liveAppCount as showcasedCount}from'../src/data/apps.ts';
const source=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('public count is sourced from exact verified KR Android roster, not curated routes',()=>{
 assert.equal(e.market,'KR');assert.equal(e.platform,'Android');const u=new URL(e.sourceURL);assert.equal(u.origin,'https://play.google.com');assert.equal(u.pathname,'/store/apps/developer');assert.equal(u.searchParams.get('id'),'PiFl Labs');assert.equal(u.searchParams.get('gl'),'KR');assert.equal(u.searchParams.get('hl'),'ko');assert(Number.isFinite(Date.parse(e.observedAt)));
 assert.equal(e.packages.length,14);assert.equal(new Set(e.packages).size,14);assert.equal(companyCount,14);assert.equal(showcasedCount,13);assert.equal(appList.length,15);
});
test('new four public Android products count, internal Sky/Legion do not',()=>{
 for(const id of ['spend','kkachi','sudoku','bp'])assert(e.packages.includes('com.pifl.pipi.'+id));for(const id of ['sky','legion'])assert(!e.packages.includes('com.pifl.pipi.'+id));for(const id of e.packages)assert.match(id,/^com\.pifl\.pipi\.[a-z]+$/);
 assert(Object.isFrozen(e));assert(Object.isFrozen(e.packages));
});
test('all curated live app Android destinations are a subset; no BP page or unreleased store invented',()=>{
 const ids=appList.filter(a=>a.status==='live').map(a=>new URL(a.stores.android).searchParams.get('id'));assert.equal(ids.length,13);for(const id of ids)assert(e.packages.includes(id));assert.deepEqual(e.packages.filter(id=>!ids.includes(id)),['com.pifl.pipi.bp']);
 assert(!appList.some(a=>a.slug==='pipi-bp'));for(const a of appList.filter(a=>a.status==='soon'))assert.deepEqual(a.stores,{});
});
for(const lang of ['ko','ja','en'])test(lang+': company homepage uses public count; existing app catalog source unchanged',()=>{
 const s=source('src/pages/'+lang+'/index.astro');assert.match(s,/import \{ verifiedPublicAppCount \} from '\.\.\/\.\.\/data\/public-portfolio'/);assert(!s.includes('liveAppCount'));assert.equal((s.match(/\{verifiedPublicAppCount\}/g)||[]).length,7);if(lang==='ja')assert(!s.includes('{verifiedPublicAppCount}つ'));
 const html=source('dist/'+lang+'/index.html');assert.match(html,/<span><b>14<\/b>/);assert(!html.includes('<span><b>13</b>'));assert.equal((html.match(/class="app-card-main"/g)||[]).length,15);assert.equal((html.match(/class="app-card-stores"/g)||[]).length,13);
 const scripts=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));const org=scripts.find(x=>x['@type']==='Organization');assert(org&&org.description.includes('14'));assert(!org.description.includes('13'));assert(!org.description.includes('14 apps shipping on iOS and Android'));
});
test('Organization metadata names platform/country variability, never all-platform parity',()=>{
 const s=source('src/layouts/BaseLayout.astro');assert(!s.includes('liveAppCount'));assert(s.includes('지원 플랫폼과 제공 지역은 앱마다 다릅니다'));assert(s.includes('対応プラットフォームや提供地域はアプリごとに異なります'));assert(s.includes('Platforms and regional availability vary by app'));
});
