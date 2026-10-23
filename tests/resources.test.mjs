import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,existsSync} from 'node:fs';import {createHash} from 'node:crypto';import {resources} from '../src/data/resources.mjs';import {resourceCopy} from '../src/data/resource-copy.mjs';
test('Resource catalog has original local assets, truthful variants and all three UI languages',()=>{
 assert.equal(resources.length,8);assert.equal(new Set(resources.map(r=>r.id)).size,8);
 for(const r of resources){for(const l of ['ko','en','ja'])assert.ok(r.title[l]&&r.description[l]&&resourceCopy[l]);for(const v of r.variants){assert.ok(existsSync('public'+v.preview));assert.ok(['PDF','PNG'].includes(v.format));if(!v.external){const b=readFileSync('public'+v.url);assert.equal(createHash('sha256').update(b).digest('hex'),v.sha256);if(v.textUrl)assert.ok(existsSync('public'+v.textUrl));}else assert.equal(new URL(v.url).hostname,'pipi-worlds.com');if(v.format==='PDF')assert.ok(v.pages>=1);}}
});
test('Built resource and related-app links resolve; all locales expose 8 cards and home exposes only 3',()=>{
 for(const l of ['ko','en','ja']){const html=readFileSync(`dist/${l}/resources/index.html`,'utf8');assert.equal((html.match(/data-resource data-category/g)||[]).length,8);const home=readFileSync(`dist/${l}/index.html`,'utf8');assert.equal((home.match(/data-resource data-category/g)||[]).length,3);for(const path of [...html.matchAll(/href="(\/[^"?#]*)/g)].map(m=>m[1]))assert.ok(existsSync('dist'+path)||existsSync('dist'+path+'index.html'),path);}
});
