import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {chromium} from '/Users/pirate/.npm/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs';
import {scanRenderedText} from '/Users/pirate/pifl-labs/tools/web_text_geometry.mjs';
import {archiveEvents} from '../../../src/data/archive.mjs';
const root=process.env.QA_OUTPUT || '/tmp/archive-release-qa';mkdirSync(root,{recursive:true});
const base=process.env.QA_URL || 'http://127.0.0.1:4328';
const changed=archiveEvents.filter(e=>e.contentEvidence),results=[],flows=[],errors=[];
const b=await chromium.launch({channel:'chrome',headless:true});
const fingerprint=Object.fromEntries(['src/components/Archive.astro','src/data/archive.mjs','src/data/archive-release-highlights-20261117.mjs','public/archive-evidence.json','public/archive-release-notes-20261117.json',...['ko','ja','en'].map(l=>`dist/${l}/archive/index.html`)].map(f=>[f,createHash('sha256').update(readFileSync(f)).digest('hex')]));
writeFileSync(root+'/fingerprint.json',JSON.stringify(fingerprint,null,2));
try {
 const p=await b.newPage({reducedMotion:'reduce'});p.on('pageerror',e=>errors.push(String(e)));
 if(process.env.CAPTURE_BEFORE==='1') {
  await p.setViewportSize({width:375,height:900});await p.goto('https://pifl-labs.com/ko/archive/?app=dialogos');
  const old=p.locator('[data-event]').filter({hasText:'이 기록의 상세 기능 변경 내용은 미확인입니다.'}).first();await old.scrollIntoViewIfNeeded();await p.waitForTimeout(700);await old.screenshot({path:root+'/before-generic-ko-375.png'});
 }
 for(const lang of ['ko','ja','en']) for(const width of [320,375,768,1280,1920]) for(const theme of ['light','dark']) for(const scale of [1,2]) {
  const id=`${lang}-${width}-${theme}-${scale}`;await p.setViewportSize({width,height:900});await p.goto(`${base}/${lang}/archive/`);
  await p.evaluate(async ({theme,scale})=>{document.documentElement.dataset.theme=theme;document.documentElement.style.fontSize=`${scale*100}%`;await document.fonts.ready;},{theme,scale});
  assert.equal(await p.locator('[data-event]:visible').count(),68);
  for(const e of changed) assert.equal(await p.locator(`[data-event-id="${e.id}"] h3`).innerText(),e.title[lang]);
  const first=p.locator('[data-event-id="dialogos-android-observed-20261117"]');await first.scrollIntoViewIfNeeded();await p.waitForTimeout(1200);await first.scrollIntoViewIfNeeded();await p.waitForTimeout(300);await first.screenshot({path:`${root}/${id}-current.png`,animations:'disabled'});
  for(const eventId of ['dialogos-android-observed-20261117','dialogos-public']) {
   const card=p.locator(`[data-event-id="${eventId}"]`);await card.locator('summary').click();assert.equal(await card.locator('details').evaluate(e=>e.open),true);
  }
  const historical=p.locator('[data-event-id="dialogos-public"]');await historical.scrollIntoViewIfNeeded();await p.waitForTimeout(1200);await historical.scrollIntoViewIfNeeded();await p.waitForTimeout(300);await historical.screenshot({path:`${root}/${id}-historical-source.png`,animations:'disabled'});
  const layout=await p.evaluate(ids=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,overflow:document.documentElement.scrollWidth>innerWidth,
   cards:ids.map(id=>{const el=document.querySelector(`[data-event-id="${id}"]`);return {id,box:{width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height},blocks:[...el.querySelectorAll('h3,article>p,details[open] dt,details[open] dd')].map(n=>({text:n.textContent,width:n.clientWidth,scrollWidth:n.scrollWidth,font:getComputedStyle(n).fontSize,color:getComputedStyle(n).color,lineHeight:getComputedStyle(n).lineHeight,wordBreak:getComputedStyle(n).wordBreak}))};}),
   broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src)}),changed.map(e=>e.id));
  const diagnostic=await p.evaluate(scanRenderedText);writeFileSync(`${root}/${id}-text.json.gz`,gzipSync(JSON.stringify(diagnostic)));
  // Preserve every raw diagnostic (including unsupported/UNVERIFIED); human visual review is separate.
  results.push({id,...layout,diagnosticStatus:diagnostic.status,findings:diagnostic.findings,unsupported:diagnostic.unsupported});
  if(width===320&&theme==='light'&&scale===2)for(const e of changed){const el=p.locator(`[data-event-id="${e.id}"]`);await el.scrollIntoViewIfNeeded();await el.screenshot({path:`${root}/${lang}-320-large-${e.id}.png`,animations:'disabled'});}
  writeFileSync(root+'/matrix.json',JSON.stringify({fingerprint,results,errors},null,2));
  console.log(id,layout.overflow?'OVERFLOW':'ok');
 }
 for(const lang of ['ko','ja','en']) {
  await p.setViewportSize({width:375,height:900});await p.goto(`${base}/${lang}/archive/`);
  const hello=p.locator('[data-app-toggle="pipi-hello"]');await hello.click();assert.equal(await hello.getAttribute('aria-pressed'),'true');assert.ok(p.url().includes('app=pipi-hello'));
  await p.locator('[name="platform"]').selectOption('android');assert.ok(await p.locator('[data-event]:visible').count()>0);
  assert.equal(await p.locator('[data-event]:visible:not([data-platform="android"])').count(),0);
  const card=p.locator('[data-event-id="pipi-hello-android-observed-20261117"]');await card.locator('summary').focus();await p.keyboard.press('Enter');assert.ok(await card.locator('details').evaluate(e=>e.open));
  const link=card.locator('a[href="/archive-release-notes-20261117.json"]');await link.click();const response=await p.request.get(p.url());assert.equal(response.status(),200);assert.equal((await response.json()).records.length,37);
  await p.goBack();assert.equal(await p.locator('[name="platform"]').inputValue(),'android');
  await p.locator('[data-clear-apps]').click();assert.equal(await hello.getAttribute('aria-pressed'),'false');await p.locator('button[type="reset"]').click();assert.equal(await p.locator('[data-event]:visible').count(),68);
  flows.push({lang,mobileFilter:true,platformFilter:true,keyboardDetails:true,evidenceLink:true,backPreservesFilters:true,reset:true});
 }
 writeFileSync(root+'/flows.json',JSON.stringify(flows,null,2));
 assert.equal(results.length,60);assert.equal(errors.length,0);assert.ok(results.every(r=>!r.overflow&&!r.broken.length));
 assert.ok(results.every(r=>r.cards.every(c=>c.blocks.every(x=>x.scrollWidth<=x.width+1))));
 console.log('PASS: 60 matrix cells; 37 summaries each; 3 functional flows');
} finally {await b.close();}
