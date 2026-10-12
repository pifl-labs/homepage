import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
const source=readFileSync(new URL('../src/components/AppLanding.astro',import.meta.url),'utf8');
const block=source.slice(source.indexOf("{app.slug === 'pipi-focus' && lang === 'en' && ("),source.indexOf("    {app.slug === 'pipi-words' && lang === 'en' && ("));
test('Standalone resource is English Focus only and secondary to the product',()=>{
 assert.ok(block.startsWith("{app.slug === 'pipi-focus' && lang === 'en' && ("));
 assert.ok(source.indexOf('<!-- FEATURE GRID -->')<source.indexOf('id="focus-start-resource"'));
 assert.ok(source.indexOf('id="focus-start-resource"')<source.indexOf('<!-- FINAL CTA -->'));
 assert.match(block,/aria-labelledby="focus-start-resource-title"/);assert.match(block,/<h2[^>]+id="focus-start-resource-title"/);
});
test('No signup, automatic grading or product outcome claim in the original blank sheet entry',()=>{
 for(const s of ['Choose one task','first visible step','your own time box','Use any timer.','Free A4 sheet','No app or sign-up needed.','not a productivity promise','Original PiFl Labs resource. Copy prepared with AI assistance.'])assert.ok(block.includes(s));
 assert.doesNotMatch(block,/proven|guaranteed|improves|boosts|customer|subscription-free|all apps free/i);
});
test('Supplementary stylesheet is scoped and only loaded on the English Focus route',()=>{
 assert.match(source,/app\.slug === 'pipi-focus' && lang === 'en' \? \['\/styles-focus-start-resource\.css\?v=/);
 const css=readFileSync(new URL('../public/styles-focus-start-resource.css',import.meta.url),'utf8');
 const hash=createHash('sha256').update(css).digest('hex').slice(0,12);assert.ok(source.includes('/styles-focus-start-resource.css?v='+hash));
 const rules=[...css.matchAll(/([^{}]+)\{/g)].map(x=>x[1].replace(/\/\*[\s\S]*?\*\//g,'').trim());
 assert.equal(rules.length,6);assert.ok(rules.every(x=>x.startsWith('.app-page .focus-start-resource ')));assert.doesNotMatch(css,/overflow:\s*hidden|nowrap|!important|@import/);
});
test('Only same-site original PDF and text links; no app CTA substitution or submitted answers',()=>{
 assert.deepEqual([...block.matchAll(/href="([^"]+)"/g)].map(x=>x[1]),['/assets/printables/one-small-start-en.pdf','/assets/printables/one-small-start-en.txt']);
 assert.doesNotMatch(block,/<form|<input|<script|<style|data-store-link|target=|download=/);
 assert.ok(block.includes('class="btn btn-primary"'));assert.ok(block.includes('class="btn btn-ghost"'));
});
test('Exact canonical approved PDF and text bytes are not regenerated',()=>{
 const specs=[['pdf','074a394c292a52162dc5c62f132fe5e7bb1e22d40e36b0380a555aa7f846b5cb'],['txt','27435c298135c5aead34a831210ad50ae8502c128443f6b98bd41dcca063fb16']];
 for(const [ext,sha]of specs){const b=readFileSync(new URL('../public/assets/printables/one-small-start-en.'+ext,import.meta.url));assert.equal(createHash('sha256').update(b).digest('hex'),sha);}
});
