import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {appList} from '../src/data/apps.ts';
const leads={ko:'Android 앱 전체:',ja:'Android版一覧：',en:'All Android apps:'};
for(const lang of ['ko','ja','en']){
 const html=readFileSync(new URL('../dist/'+lang+'/index.html',import.meta.url),'utf8');
 const catalog=html.match(/<section class="apps-home"[\s\S]*?<\/section>/)[0];
 const anchors=[...catalog.matchAll(/<a\b([^>]*data-company-android-catalog[^>]*)>([\s\S]*?)<\/a>/g)];
 test(lang+': one visible company Android catalog link precedes cards and is not an installation event',()=>{
  assert.equal(anchors.length,1);const [full,attrs,text]=anchors[0];const href=attrs.match(/href="([^"]+)"/)[1].replaceAll('&amp;','&');const u=new URL(href);
  assert.equal(u.origin,'https://play.google.com');assert.equal(u.pathname,'/store/apps/developer');assert.equal(u.searchParams.get('id'),'PiFl Labs');assert.equal(u.searchParams.get('hl'),lang);
  assert.equal(u.searchParams.has('gl'),false);assert.equal(text,'Google Play');assert.match(attrs,/target="_blank"/);assert.match(attrs,/rel="noopener"/);assert.match(attrs,/aria-label="[^"]*PiFl Labs[^\"]*"/);
  assert(!attrs.includes('data-store-link'));assert(catalog.indexOf(full)<catalog.indexOf('class="app-card-grid"'));assert(catalog.includes(leads[lang]));
 });
 test(lang+': existing product cards, download groups and two unreleased products remain unchanged',()=>{
  assert.equal((catalog.match(/class="app-card-main"/g)||[]).length,appList.length);
  assert.equal((catalog.match(/class="app-card-stores"/g)||[]).length,appList.filter(a=>a.status==='live'&&(a.stores.ios||a.stores.android)).length);
  for(const app of appList.filter(a=>a.status==='soon'))assert.deepEqual(app.stores,{});
  assert.equal(appList.some(a=>a.slug==='pipi-bp'),false,'general publisher link must not start held BP page work');
 });
}

import {companyAndroidCatalogUrl,assertCompanyAndroidCatalogAnchor} from '../scripts/company-android-catalog.mjs';
import {storeUrl,websiteCampaign} from '../public/store-attribution.mjs';
const valid={href:companyAndroidCatalogUrl('ko'),'data-company-android-catalog':'true',target:'_blank',rel:'noopener','aria-label':'Google Play PiFl Labs Android'};
test('separate catalog guard accepts only exact company destination and retains no install attribution',()=>{
 for(const lang of ['ko','ja','en']){
  const attrs={...valid,href:companyAndroidCatalogUrl(lang)};
  assert.equal(assertCompanyAndroidCatalogAnchor(attrs,lang,true),true);
  assert.equal(storeUrl(attrs.href,websiteCampaign(lang)),attrs.href);
 }
});
test('catalog guard rejects arbitrary host/owner/path/query/locale or count bypass',()=>{
 const bad=[
  {href:valid.href.replace('play.google.com','example.com')},
  {href:valid.href.replace('https:','http:')},
  {href:valid.href.replace('PiFl%20Labs','Other%20Studio')},
  {href:valid.href.replace('/developer','/details')},
  {href:valid.href.replace('hl=ko','hl=ja')},
  {href:valid.href+'&id=Other'},{href:valid.href+'&gl=KR'},{href:valid.href+'&utm_campaign=install'},
  {'data-company-android-catalog':''},{'data-store-link':valid.href},{target:'_self'},{rel:''},{'aria-label':'download app'},
 ];
 for(const change of bad)assert.throws(()=>assertCompanyAndroidCatalogAnchor({...valid,...change},'ko',true),JSON.stringify(change));
 assert.throws(()=>assertCompanyAndroidCatalogAnchor(valid,'ko',false));
 assert.throws(()=>companyAndroidCatalogUrl('other'));
});
