import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const css=readFileSync(new URL('../public/styles-stickerbook.css',import.meta.url),'utf8');
const rule=s=>{const i=css.indexOf(s+' {');assert.ok(i>=0);return css.slice(i,css.indexOf('}',i)+1);};
test('navigation groups wrap and brand can contain enlarged text',()=>{
 assert.match(rule('.nav-inner'),/flex-wrap:\s*wrap/);
 assert.match(rule('.brand'),/flex-wrap:\s*wrap/);
 assert.match(rule('.brand'),/min-width:\s*0/);
 assert.match(rule('.brand'),/max-width:\s*100%/);
 assert.doesNotMatch(rule('.brand'),/overflow:\s*(hidden|clip)|font-size|text-overflow/);
 assert.match(rule('.lang-pill'),/flex-shrink:\s*0/);
});
test('section title balances existing content and Korean detail lede retains word boundaries',()=>{
 assert.match(rule('h2.section-title'),/text-wrap:\s*balance/);
 assert.match(css,/html\[lang\^="ko"\]\s+\.app-hero-lede,[\s\S]*?word-break:\s*keep-all/);
 assert.match(rule('html[lang^="ko"] .app-hero-lede'),/text-wrap:\s*pretty/);
});

test('status and dispatch reflow without minimum-content grid expansion',()=>{
 assert.match(css,/\.dispatch-grid \{ grid-template-columns: repeat\(auto-fit, minmax\(min\(100%, 20rem\), 1fr\)\)/);
 assert.match(css,/\.currently-inner \{\s*display: flex; flex-wrap: wrap/);
 assert.match(rule('.fleet-log .fleet-meta'),/flex-wrap:\s*wrap/);
 assert.match(rule('.fleet-log .fleet-date'),/white-space:\s*normal/);
 assert.match(rule('.fleet-log .fleet-date'),/max-width:\s*100%/);
 assert.match(css,/\.app-section > \.container,[\s\S]*?padding-inline: var\(--page-gutter\)/);
});

test('enlarged information uses real space, wrapping and dictionary hyphens, not hiding or smaller type',()=>{
 assert.match(css,/--page-gutter:\s*clamp\(4px, calc\(10vw - 1rem\), 2rem\)/);
 assert.match(rule('.hero > .container'),/width:\s*100%/);
 assert.match(rule('.hero-grid > *'),/min-width:\s*0/);
 assert.match(css,/\.decoder \{ display: flex; flex-wrap: wrap/);
 assert.match(rule('.apps-home .app-card-body'),/flex: 1 1 12rem; min-width: 0/);
 assert.match(css,/\.apps-home \.app-release-date \{ white-space: normal/);
 assert.match(rule('html[lang^="en"] h1.hero-title .strike'),/hyphens:\s*auto/);
 const reflow=css.slice(css.indexOf('/* Enlarged text: keep information'),css.indexOf('/* ========== entrance animations'));
 assert.doesNotMatch(reflow,/font-size|scale\(|overflow(?:-x)?:|text-overflow|display:\s*none|break-all/);
 assert.match(reflow,/\.pref-group \{ flex-wrap: wrap; max-width: 100%/);
 assert.match(reflow,/\.pref-row \{ flex-wrap: wrap; max-width: 100%/);
});


test('approved R5 makes visitor value the headline with exact approved copy',()=>{
 const expected={ko:'집중도, 배움도, 기록도 가볍게.',ja:'集中も、学びも。記録も、気軽に。',en:'Focus. Learn. Reflect.'};
 for(const [lang,text] of Object.entries(expected)){
  const page=readFileSync(new URL(`../src/pages/${lang}/index.astro`,import.meta.url),'utf8');
  const hero=page.match(/<h1 class="hero-title[^>]*>([\s\S]*?)<\/h1>/)[1];
  const words=hero.replace(/<br\s*\/?\s*>/g,' ').replace(/<[^>]+>/g,'').replaceAll('&shy;','').replace(/\s+/g,' ').trim();
  assert.equal(words,text,lang+' headline original words');
  assert.doesNotMatch(hero,/aria-hidden|display:\s*none|font-size/);
 }
});

test('fleet wraps release metadata before sacrificing the name longest word',()=>{
 assert.match(rule('.fleet-log .fleet-link'),/display:\s*flex/);
 assert.match(rule('.fleet-log .fleet-link'),/flex-wrap:\s*wrap/);
 assert.match(rule('.fleet-log .fleet-main'),/flex:\s*1 1 min-content/);
 assert.doesNotMatch(rule('.fleet-log .fleet-main'),/font-size|overflow|text-overflow|scale\(/);
});


test('approved R5 lede explains separate apps while both existing action destinations remain',()=>{
 const expected={ko:'집중 타이머부터 단어 학습, 감정 기록까지. 지금 필요한 작은 앱을 골라 보세요.',ja:'集中タイマー、ことばの学習、気持ちの記録。いま使いたい小さなアプリを見つけてください。',en:'Small apps for focus, language learning, and a daily journal. Choose the one that fits your day.'};
 for(const [lang,text] of Object.entries(expected)){
  const page=readFileSync(new URL(`../src/pages/${lang}/index.astro`,import.meta.url),'utf8');
  const lede=page.match(/<p class="hero-lede[^>]*>([\s\S]*?)<\/p>/)[1];
  assert.equal(lede.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim(),text);
  assert.match(page,/<a class="btn btn-primary" href="#apps">/);
  assert.match(page,/<a class="btn btn-ghost" href="#crew">/);
 }
});


test('R6 separates Korean words from Japanese normal strict prose without hiding text',()=>{
 for(const selector of ['.annotation-strip > span','.decoder p','.fleet-cat','.app-card-cat','.app-card-tag'])
  assert.ok(css.includes('html[lang^="ko"] '+selector));
 assert.match(css,/html\[lang\^="ja"\] \.eyebrow \{ word-break: normal; line-break: strict; overflow-wrap: normal; \}/);
 assert.match(css,/html\[lang\^="ja"\] \.ja-reading-unit \{ display: inline-block; white-space: nowrap; \}/);
});

test('R6 Japanese name noun boundaries preserve every original code point', async()=>{
 const {japaneseAppNameParts}=await import('../src/components/app-name-parts.mjs');
 const original='集中航海：ポモドーロタイマー';
 assert.deepEqual(japaneseAppNameParts(original).map(x=>x.text),['集中航海：','ポモドーロ','タイマー']);
 for(const name of [original,'ピピ ことばの航海','新しい名前：未知の長い名前','PiPi Words','名前：説明：補足'])
  assert.equal(japaneseAppNameParts(name).map(x=>x.text).join(''),name);
 assert.deepEqual(japaneseAppNameParts('未知の名前')[0],{text:'未知の名前',keepWhole:false});
 for(const file of ['AppCatalog','AppLanding']){
  const component=readFileSync(new URL(`../src/components/${file}.astro`,import.meta.url),'utf8');
  assert.match(component,/lang === 'ja' \? japaneseAppNameParts\(name\)/);
 }
});

test('R6 annotation and eyebrow retain exact original text around short reading units',()=>{
 const page=readFileSync(new URL('../src/pages/ja/index.astro',import.meta.url),'utf8');
 const eyebrow=page.match(/<div class="eyebrow reveal">([\s\S]*?)<\/div>/)[1];
 assert.equal(eyebrow.replace(/<[^>]+>/g,''),'人ひとり、オウム一羽のFlutterスタジオ · 2026年就航');
 const annotation=page.match(/<div class="annotation-strip">([\s\S]*?)<\/div>/)[1];
 assert.equal(annotation.replace(/<[^>]+>/g,'').trim(),'オウムが十二羽、ではありません。 オウム一羽に、締め切りが十二。');
});


test('R7 reading units preserve unknown text, emoji, punctuation and every role source',async()=>{
 const {japaneseReadingParts,japaneseAppNameParts}=await import('../src/components/app-name-parts.mjs');
 for(const text of ['ピピ ことばの航海','学校の準備 · 気分日記','自分と向き合う','未知の文章です。🏴‍☠️','名前：：補足','']){
  for(const role of ['name','category','tagline','unknown'])assert.equal(japaneseReadingParts(text,role).map(x=>x.text).join(''),text);
  assert.equal(japaneseAppNameParts(text).map(x=>x.text).join(''),text);
 }
 assert.deepEqual(japaneseAppNameParts('ピピ ことばの航海').map(x=>[x.text,x.keepWhole]),[['ピピ ',false],['ことばの航海',true]]);
 for(const [text,role,unit] of [['学校の準備','category','学校の準備'],['気分日記','category','気分日記'],['静かに向き合う','tagline','向き合う']])
  assert.ok(japaneseReadingParts(text,role).some(x=>x.keepWhole&&x.text===unit));
});

test('R7 known missing callsites share noun rendering and normal prose fallback',()=>{
 const fleet=readFileSync(new URL('../src/components/FleetLog.astro',import.meta.url),'utf8');
 assert.match(fleet,/japaneseAppNameParts\(appName\(app, lang\)\)/);
 assert.match(fleet,/japaneseReadingParts\(app.category\[lang\], 'category'\)/);
 assert.ok(css.includes('html[lang^="ko"] .join-cta .hint { word-break: keep-all; text-wrap: pretty; }'));
 assert.ok(css.includes('html[lang^="ja"] .currently-text,'));
 const ja=readFileSync(new URL('../src/pages/ja/index.astro',import.meta.url),'utf8');
 assert.match(ja,/<span class="ja-reading-unit">コーヒー。<\/span>/);
 assert.match(ja,/<span class="ja-reading-unit">続けます。<\/span>/);
});


test('R8 name callsites keep unmatched prefix and spaces in the raw inline flow',()=>{
 for(const file of ['AppCatalog','AppLanding','FleetLog']){
  const component=readFileSync(new URL(`../src/components/${file}.astro`,import.meta.url),'utf8');
  assert.match(component,/japaneseAppNameParts\([^\n]+part.keepWhole\s*\?\s*<span class="app-name-part ja-reading-unit">\{part.text\}<\/span>\s*:\s*part.text/);
 }
});

test('R8 coffee keeps its existing closing punctuation with the short reading unit',()=>{
 const ja=readFileSync(new URL('../src/pages/ja/index.astro',import.meta.url),'utf8');
 assert.match(ja,/<span class="ja-reading-unit">コーヒー。<\/span>/);
});

test('R9 bounded Japanese closing phrases preserve source and leave unknown text raw',async()=>{
 const {japaneseReadingParts}=await import('../src/components/app-name-parts.mjs');
 for(const [text,role,unit] of [['島を開拓しよう','title','しよう'],['毎日確認できます。','lede','確認できます。'],['一つのアプリで。','lede','アプリで。'],['100%端末の中で。','lede','端末の中で。'],['Google Playで入手','storeLabel','で入手']]){
  const parts=japaneseReadingParts(text,role);assert.equal(parts.map(p=>p.text).join(''),text);assert.ok(parts.some(p=>p.keepWhole&&p.text===unit));
 }
 for(const role of ['title','lede','storeLabel'])assert.deepEqual(japaneseReadingParts('未知の文 🏴‍☠️：空白  を残す。',role),[{text:'未知の文 🏴‍☠️：空白  を残す。',keepWhole:false}]);
});

test('R9 detail reading spans are role limited and all store action destinations remain',()=>{
 const page=readFileSync(new URL('../src/components/AppLanding.astro',import.meta.url),'utf8');
 for(const role of ['title','lede','storeLabel'])assert.ok(page.includes(`'${role}'`));
 assert.match(page,/c.tagline.split\('\\n'\)/);
 assert.match(page,/href=\{storeUrl\(app.stores.ios, campaign\)\}/);
 assert.match(page,/href=\{storeUrl\(app.stores.android, campaign\)\}/);
 assert.match(page,/target="_blank" rel="noopener"/);
});


test('R10 Draw Japanese lower CTA retains photo, daily free AI quota and no-signup facts',()=>{
 const data=readFileSync(new URL('../src/data/apps.ts',import.meta.url),'utf8');
 const copy='写真1枚で塗り絵に。AI変換は1日2回無料。会員登録不要。';
 assert.equal(data.split(`ctaSub: '${copy}'`).length-1,1);
 for(const fact of ['写真1枚','AI変換は1日2回無料','会員登録不要'])assert.ok(copy.includes(fact));
 assert.doesNotMatch(copy,/<|>|\u00ad|\u200b|\u2060/);
 const landing=readFileSync(new URL('../src/components/AppLanding.astro',import.meta.url),'utf8');
 assert.match(landing,/<p class="app-cta-sub">\{c.ctaSub\}<\/p>/);
});
