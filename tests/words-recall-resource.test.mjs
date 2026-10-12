import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
const source=readFileSync(new URL('../src/components/AppLanding.astro',import.meta.url),'utf8');
const block=source.slice(source.indexOf("    {app.slug === 'pipi-words' && lang === 'en' && ("),source.indexOf('<!-- FINAL CTA -->'));
test('Standalone resource is English Words only and secondary to the product',()=>{
 assert.ok(block.startsWith("    {app.slug === 'pipi-words' && lang === 'en' && ("));
 assert.ok(source.indexOf('<!-- FEATURE GRID -->')<source.indexOf('id="words-recall-resource"'));
 assert.ok(source.indexOf('id="words-recall-resource"')<source.indexOf('<!-- FINAL CTA -->'));
 assert.match(block,/aria-labelledby="words-recall-resource-title"/);assert.match(block,/<h2[^>]+id="words-recall-resource-title"/);
});
test('No signup, automatic grading or product outcome claim in the original blank sheet entry',()=>{
 for(const s of ['already studied','without looking','your own reference','Free A5 sheet','No app or sign-up needed.','Check it yourself. No automatic grading.','Original PiFl Labs resource. Copy prepared with AI assistance.'])assert.ok(block.includes(s));
 assert.doesNotMatch(block,/proven|guaranteed|improves|boosts|customer|subscription-free|all apps free/i);
});
test('Supplementary stylesheet is scoped and only loaded on the English Words route',()=>{
 assert.match(source,/app\.slug === 'pipi-words' && lang === 'en' \? \['\/styles-words-recall-resource\.css\?v=/);
 const css=readFileSync(new URL('../public/styles-words-recall-resource.css',import.meta.url),'utf8');
 const hash=createHash('sha256').update(css).digest('hex').slice(0,12);assert.ok(source.includes('/styles-words-recall-resource.css?v='+hash));
 const rules=[...css.matchAll(/([^{}]+)\{/g)].map(x=>x[1].replace(/\/\*[\s\S]*?\*\//g,'').trim());
 assert.equal(rules.length,6);assert.ok(rules.every(x=>x.startsWith('.app-page .words-recall-resource ')));assert.doesNotMatch(css,/overflow:\s*hidden|nowrap|!important|@import/);
});
test('Only same-site original PDF and text links; no app CTA substitution or submitted answers',()=>{
 assert.deepEqual([...block.matchAll(/href="([^"]+)"/g)].map(x=>x[1]),['/assets/printables/one-word-recall-card-en.pdf','/assets/printables/one-word-recall-card-en.txt']);
 assert.doesNotMatch(block,/<form|<input|<script|<style|data-store-link|target=|download=/);
 assert.ok(block.includes('class="btn btn-primary"'));assert.ok(block.includes('class="btn btn-ghost"'));
});
test('Exact canonical approved PDF and text bytes are not regenerated',()=>{
 const specs=[['pdf','3797398d187a4d01f203e4562f80c28018fb198ee36aa31f1acf7462177d7b81'],['txt','fb7f9da760a06573ce2c665484c05e95bad0c1183caab397dfa12cd1bcbd13b3']];
 for(const [ext,sha]of specs){const b=readFileSync(new URL('../public/assets/printables/one-word-recall-card-en.'+ext,import.meta.url));assert.equal(createHash('sha256').update(b).digest('hex'),sha);}
});
