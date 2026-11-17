const {chromium} = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import {writeFileSync,mkdirSync,readFileSync} from 'node:fs';
const {scanRenderedText} = await import(process.env.TEXT_GEOMETRY_MODULE); // shared tools/web_text_geometry.mjs
const root=process.env.QA_OUTPUT || '/tmp/pifl-home-qa';mkdirSync(root,{recursive:true});const results=[];
const b=await chromium.launch({channel:'chrome',headless:true});try{const context=await b.newContext({reducedMotion:'reduce'});const p=await context.newPage();
const errors=[];p.on('pageerror',e=>errors.push(String(e)));
for(const lang of ['ko','ja','en'])for(const route of ['','archive/'])for(const width of [320,375,768,1280,1920])for(const theme of ['light','dark'])for(const scale of [1,2]){
 const id=[lang,route?'archive':'home',width,theme,scale].join('-');await p.setViewportSize({width,height:900});await p.goto('http://127.0.0.1:4327/'+lang+'/'+route);await p.evaluate(async ({theme,scale})=>{document.documentElement.dataset.theme=theme;document.documentElement.style.fontSize=`${scale*100}%`;await document.fonts.ready;},{theme,scale});
 if(!route){for(const img of await p.locator('#crew img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(el=>el.decode().catch(()=>{}));}await p.locator('#crew').evaluate(el=>window.scrollTo(0,el.offsetTop-140));}
 const layout=await p.evaluate(()=>{const r=e=>{const x=e.getBoundingClientRect();return {x:x.x,y:x.y,width:x.width,height:x.height}};const wall=document.querySelector('.sticker-wall');const labels=[...document.querySelectorAll('.sticker .label')];return {viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,overflow:document.documentElement.scrollWidth>innerWidth,wall:wall?{...r(wall),columns:getComputedStyle(wall).gridTemplateColumns,crewHeight:document.querySelector('#crew').offsetHeight,labels:labels.map(el=>({text:el.textContent,box:r(el),font:getComputedStyle(el).fontSize,inside:el.getBoundingClientRect().right<=el.parentElement.getBoundingClientRect().right&&el.getBoundingClientRect().bottom<=el.parentElement.getBoundingClientRect().bottom}))}:null,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src),journeyCollapsed:document.querySelector('.archive-journey-index')?!document.querySelector('.archive-journey-index').open:null};});
 await p.screenshot({path:`${root}/${id}.png`});
 if(route){await p.locator('[data-event]:visible').first().scrollIntoViewIfNeeded();await p.screenshot({path:`${root}/${id}-records.png`});}else{await p.locator('.sticker-wall').screenshot({path:`${root}/${id}-crew.png`});}
 // The all-text scanner is a diagnostic, not a visual verdict. Keep its raw unsupported data.
 if((width===320||width===1280)&&theme==='light'){const diagnostic=await p.evaluate(scanRenderedText);writeFileSync(`${root}/${id}-text.json`,JSON.stringify(diagnostic));}
 results.push({id,...layout});console.log(id,layout.overflow?'OVERFLOW':'ok');writeFileSync(`${root}/matrix.json`,JSON.stringify({results,errors},null,2));
}
}finally{await b.close();}
