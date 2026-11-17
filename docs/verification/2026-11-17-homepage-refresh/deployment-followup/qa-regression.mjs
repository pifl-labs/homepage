const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const {scanRenderedText}=await import(process.env.TEXT_GEOMETRY_MODULE);
import {mkdirSync,writeFileSync} from 'node:fs';import assert from 'node:assert/strict';
const root=(process.env.QA_OUTPUT || '/tmp/pifl-home-qa')+'/regression';mkdirSync(root,{recursive:true});const b=await chromium.launch({channel:'chrome',headless:true}),results=[];
try{const p=await b.newPage({viewport:{width:320,height:900},reducedMotion:'reduce'});for(const lang of ['ko','ja','en'])for(const scale of [1,2]){
 const id=`${lang}-320-${scale}`;await p.goto(`http://127.0.0.1:4327/${lang}/`);await p.evaluate(async s=>{document.documentElement.dataset.theme='light';document.documentElement.style.fontSize=`${s*100}%`;await document.fonts.ready;},scale);
 for(const cls of ['app-media-footnote','footer-tagline']){const el=p.locator('.'+cls);await el.scrollIntoViewIfNeeded();await p.waitForTimeout(1200);await el.scrollIntoViewIfNeeded();await p.waitForTimeout(300);await el.screenshot({path:`${root}/${id}-${cls}.png`,animations:'disabled'});}
 const d=await p.evaluate(scanRenderedText);writeFileSync(`${root}/${id}-home-text.json`,JSON.stringify(d));
 const noteRuns=d.runs.filter(r=>r.text.includes('* 審査提出画面')||r.text.includes('* 심사 제출 화면')||r.text.includes('* Review previews'));
 assert.equal(noteRuns.length,1);assert.ok(!d.findings.some(f=>noteRuns.some(r=>r.id===f.runId)));if(lang==='ja')assert.ok(!d.findings.some(f=>f.code==='JA_LINE_START'));
 for(const app of ['pipi-hello','pipi-words']){await p.goto(`http://127.0.0.1:4327/${lang}/archive/?app=${app}`);await p.locator(`[data-app-toggle="${app}"][aria-pressed="true"]`).waitFor();await p.evaluate(async s=>{document.documentElement.dataset.theme='light';document.documentElement.style.fontSize=`${s*100}%`;await document.fonts.ready;},scale);
 const button=p.locator(`[data-app-toggle="${app}"]`);await button.scrollIntoViewIfNeeded();await p.waitForTimeout(600);await p.locator('.archive-app-buttons').screenshot({path:`${root}/${id}-${app}-filters.png`});assert.equal(await button.locator('.archive-check').evaluate(e=>getComputedStyle(e).opacity),'1');
 const media=p.locator(`[data-media-app="${app}"]`);for(const img of await media.locator('img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(e=>e.decode());}await media.scrollIntoViewIfNeeded();await p.waitForTimeout(600);await media.screenshot({path:`${root}/${id}-${app}-media.png`});
 const diagnosis=await p.evaluate(scanRenderedText);writeFileSync(`${root}/${id}-${app}-text.json`,JSON.stringify(diagnosis));assert.ok(!diagnosis.findings.some(f=>['observation','preserved','Preserved','KanaSprout'].includes(f.text)));assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 results.push({lang,scale,app,noteWordBoundary:true,selectedCheckVisible:true,archiveCaptionWordsIntact:true,noHorizontalOverflow:true});
 }
}writeFileSync(`${root}/results.json`,JSON.stringify(results,null,2));console.log('PASS: 12 targeted archive states; 6 home note/footer states');}finally{await b.close();}
