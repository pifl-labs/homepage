import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const evidence=JSON.parse(read('docs/release/words-eps-public-platforms-20261117.json'));
test('new iOS scope has current exact public country/version and EPS descriptions',()=>{
  assert.equal(evidence.appID,'6770267735');
  assert.equal(evidence.bundleID,'com.pifl.pipi.words');
  assert.deepEqual(evidence.iosPublicEvidence.map(x=>x.country),['KR','JP','US']);
  for(const r of evidence.iosPublicEvidence){
    assert.equal(r.version,'1.1.1');assert.match(r.observedAt,/^2026-11-17/);
    assert.match(r.currentDescriptionSHA256,/^[a-f0-9]{64}$/);
    assert.match(r.publicEPSParagraphs.join('\n'),/EPS-1/);
    assert.match(r.publicEPSParagraphs.join('\n'),/EPS-3/);
  }
});
for(const [lang,id]of [['ko','android-eps-topik'],['en','android-eps-topik-en']]){
  test(`${lang}: one actual EPS section, both platforms, no new link or data-collection interface`,()=>{
    const html=read(`dist/${lang}/apps/pipi-words/index.html`),start=html.indexOf(`id="${id}"`);
    assert(start>0);assert.equal(html.split(`id="${id}"`).length,2);
    const section=html.slice(start,html.indexOf('</section>',start));
    assert(section.includes('iOS · Android · EPS-TOPIK'));
    assert.doesNotMatch(section,/<a\b|<form|<input|<script|<img|<iframe|utm_/);
    assert(start<html.indexOf('class="app-shots-scroll"'));
  });
}
test('English short pack codes are atomic without making whole prose non-wrapping',()=>{
 const s=read('src/components/WordsAndroidEpsEnglish.astro');
 assert.deepEqual([...s.matchAll(/<span class="words-eps-en-code">([^<]+)<\/span>/g)].map(x=>x[1]),['EPS-TOPIK','EPS-1','EPS-2','EPS-3–7']);
 assert(s.includes('.words-eps-en-code { display: inline-block; }'));
 assert.doesNotMatch(s,/white-space|line-clamp|text-overflow|max-width|overflow:\s*hidden/);
});
