import {chromium} from '/Users/pirate/.npm/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs';
import {archiveEvents} from '../../../src/data/archive.mjs';
import {mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const root='/tmp/archive-release-readable';mkdirSync(root,{recursive:true});
const b=await chromium.launch({channel:'chrome',headless:true});const results=[];
try{const p=await b.newPage({reducedMotion:'reduce'});
for(const lang of ['ko','ja','en']){
 await p.setViewportSize({width:320,height:900});await p.goto(`http://127.0.0.1:4328/${lang}/archive/`);
 await p.evaluate(async()=>{document.documentElement.dataset.theme='light';document.documentElement.style.fontSize='200%';await document.fonts.ready;});
 for(const e of archiveEvents.filter(e=>e.contentEvidence)){
  await p.setViewportSize({width:320,height:900});const card=p.locator(`[data-event-id="${e.id}"]`);
  if(['dialogos-public','dialogos-android-observed-20261117'].includes(e.id))await card.locator('details').evaluate(el=>el.open=true);
  const before=await card.boundingBox(),navHeight=await p.locator('.nav').evaluate(el=>el.offsetHeight);
  // Tall viewport is ONLY for unobstructed full-card crops. The 900px interaction matrix is separate.
  const captureHeight=Math.ceil(before.height+navHeight+60);await p.setViewportSize({width:320,height:captureHeight});
  await card.evaluate(el=>window.scrollTo({top:el.getBoundingClientRect().top+scrollY-document.querySelector('.nav').offsetHeight-24,behavior:'instant'}));
  const after=await card.boundingBox();assert.equal(after.width,before.width);assert.ok(Math.abs(after.height-before.height)<1);assert.ok(after.y>=navHeight);
  await card.screenshot({path:`${root}/${lang}-${e.id}.png`,animations:'disabled'});results.push({lang,eventId:e.id,width:320,textScale:2,interactionHeight:900,captureHeight,sameTextGeometry:true});
 }
}
writeFileSync(root+'/results.json',JSON.stringify(results,null,2));console.log('111 unobstructed same-width/text card crops; geometry unchanged');
}finally{await b.close();}
