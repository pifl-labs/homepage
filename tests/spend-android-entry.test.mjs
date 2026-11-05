import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {appList,apps,liveAppCount} from '../src/data/apps.ts';
import {archiveJourneys} from '../src/data/archive-journeys.mjs';
const evidence=JSON.parse(readFileSync('docs/release/spend-android-public-20261105.json','utf8'));
test('Spend joins the original fourteen without inventing an iOS launch or binary version',()=>{
 assert.equal(appList.length,15);assert.equal(liveAppCount,13);
 assert.equal(appList.find(a=>a.slug==='pipi-spend'),apps['pipi-spend']);
 const app=apps['pipi-spend'];assert.equal(app.status,'live');assert.deepEqual(app.stores,{android:'https://play.google.com/store/apps/details?id=com.pifl.pipi.spend'});
 assert.equal(app.release,undefined);assert.equal(app.catalogPreview,false);assert.equal(app.heroShot,undefined);
 assert.deepEqual(appList.filter(a=>a.status==='soon').map(a=>a.slug),['pipi-sky','pipi-legion']);
});
test('all three source markets verify package, actual name, developer and Android',()=>{
 for(const a of evidence.apps){assert.equal(a.status,200);assert.equal(new URL(a.url).searchParams.get('id'),'com.pifl.pipi.spend');assert.equal(a.schema.author.name,'PiFl Labs');assert.equal(a.schema.operatingSystem.toLowerCase(),'android');assert.equal(String(a.schema.offers[0].price),'0');assert.equal(apps['pipi-spend'].nameByLang?.[a.locale]??apps['pipi-spend'].name,a.schema.name);}
 assert.deepEqual(evidence.icon.dimensions,[512,512]);
});
test('Spend history limit is explicit; no fabricated version stages',()=>{
 const j=archiveJourneys.find(x=>x.app==='pipi-spend');assert.deepEqual(j.stages,[]);assert.match(j.limit.en,/first release date.*unverified/);
});
for(const lang of ['en','ko','ja'])test(`${lang}: truthful landing, existing privacy route and home install entry`,()=>{
 const app=readFileSync(`dist/${lang}/apps/pipi-spend/index.html`,'utf8');const home=readFileSync(`dist/${lang}/index.html`,'utf8');
 assert.match(app,/"operatingSystem":"Android"/);assert.match(app,/"applicationCategory":"FinanceApplication"/);
 assert.doesNotMatch(app,/"softwareVersion"|"datePublished"|"dateModified"|class="app-rel-line"|class="app-shots-scroll"/);
 assert.match(app,/data-store-link="https:\/\/play.google.com\/store\/apps\/details\?id=com.pifl.pipi.spend"/);
 const main=app.match(/<main[\s\S]*?<\/main>/)[0];assert.doesNotMatch(main,/apps.apple.com|store-badge--soon/);
 assert.ok(existsSync(`dist/${lang}/apps/pipi-spend/privacy/index.html`));
 assert.match(home,/id="app-pipi-spend"/);
 const start=home.indexOf(`href="/${lang}/apps/pipi-spend/"`);assert.ok(start>0);const slice=home.slice(home.lastIndexOf('<article',start),home.indexOf('</article>',start));
 assert.doesNotMatch(slice,/app-card-preview|apps.apple.com/);assert.match(slice,/com.pifl.pipi.spend/);
 assert.match(main,lang==='en'?/with ads.*one-time Pro/s:lang==='ko'?/광고 포함.*일회성 Pro/s:/広告あり.*買い切りPro/s);
});
