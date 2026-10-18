import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {onRequest} from '../functions/_middleware.ts';
const ORIGIN='https://pifl-labs.com';
const cases=[
 ['/kana/en/a4','/assets/printables/first-kana-shape-match-en-a4.pdf'],
 ['/kana/en/a4/','/assets/printables/first-kana-shape-match-en-a4.pdf'],
 ['/kana/en/letter','/assets/printables/first-kana-shape-match-en-letter.pdf'],
 ['/kana/en/letter/','/assets/printables/first-kana-shape-match-en-letter.pdf'],
];
async function route(path,method='GET',headers={},origin=ORIGIN){let nextCalls=0;const r=await onRequest({request:new Request(origin+path,{method,headers}),next:async()=>{nextCalls++;return new Response('original',{status:200,headers:{'x-original':'yes'}})}});return{r,nextCalls};}
for(const[path,target]of cases)for(const method of['GET','HEAD']){
 test(`fixed English printable: ${method} ${path}`,async()=>{
  const{r,nextCalls}=await route(path,method,{'Accept-Language':'ja-JP,ko;q=0.9','Cookie':'pref-lang=ko'});
  assert.equal(r.status,302);assert.equal(r.headers.get('Location'),ORIGIN+target);assert.equal(nextCalls,0);
  assert.equal(r.headers.get('Cache-Control'),'no-store');assert.equal(r.headers.get('X-Robots-Tag'),'noindex, follow');assert.equal(r.headers.get('Set-Cookie'),null);assert.equal(await r.text(),'');
 });
 test(`drops input query, does not echo or redirect to caller URL: ${method} ${path}`,async()=>{
  const{r}=await route(path+'?target=https://example.invalid/&utm_source=qa',method,{'Cookie':'pref-lang=%E0%A4%A'});
  assert.equal(r.headers.get('Location'),ORIGIN+target);assert.equal(r.headers.get('Set-Cookie'),null);
 });
}
for(const[path]of cases)for(const method of['POST','PUT','DELETE']){
 test(`does not redirect a write request: ${method} ${path}`,async()=>{
  const{r,nextCalls}=await route(path,method);assert.equal(r.status,405);assert.equal(r.headers.get('Allow'),'GET, HEAD');assert.equal(r.headers.get('Location'),null);assert.equal(r.headers.get('Set-Cookie'),null);assert.equal(nextCalls,0);assert.equal(await r.text(),'');
 });
}
for(const[path,target]of cases){test(`same-origin preview delivery: ${path}`,async()=>{const{r}=await route(path,'GET',{},'https://preview.example.pages.dev');assert.equal(r.headers.get('Location'),'https://preview.example.pages.dev'+target);});}
for(const path of['/assets/printables/first-kana-shape-match-en-a4.pdf','/en/apps/pipi-hello/','/ko/','/.well-known/apple-app-site-association','/go/tiktok/']){
 test(`existing explicit/static route passes through: ${path}`,async()=>{const{r,nextCalls}=await route(path);assert.equal(r.status,200);assert.equal(await r.text(),'original');assert.equal(nextCalls,1);});
}
for(const path of['/kana/en/text','/kana/en/a3','/kana/ko/a4','/kana/en/a4/extra','/kana/en/A4']){
 test(`unowned path retains previous locale routing: ${path}`,async()=>{const{r}=await route(path,'GET',{'Accept-Language':'en'});assert.equal(r.status,302);assert.equal(r.headers.get('Location'),ORIGIN+'/en'+path);assert.match(r.headers.get('Set-Cookie'),/^pref-lang=en;/);});
}
for(const[file,hash]of[
 ['first-kana-shape-match-en-a4.pdf','e33ed3c430ade6bf8a97c815e9bcc731dc0da7e2966b0cd76dd320ba44b8b961'],
 ['first-kana-shape-match-en-letter.pdf','2412b3a0bc4ca3209ffeba05a7785d72c6b2f98f730977848d126c6b1e635f06'],
])test(`does not modify the existing published ${file}`,()=>{const b=readFileSync(new URL('../public/assets/printables/'+file,import.meta.url));assert.equal(createHash('sha256').update(b).digest('hex'),hash);});
