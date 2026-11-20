import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, existsSync} from 'node:fs';
const read = path => readFileSync(path, 'utf8');
const html = read('dist/ko/apps/pipi-words/index.html');
const start = html.indexOf('id="android-eps-topik"');
const section = html.slice(start, html.indexOf('</section>', start));
const visible = section.replace(/<[^>]*>/g,'');
test('KO Words has an explicitly Android-only EPS entry before the iOS screenshots', () => {
  assert.ok(start > 0 && start < html.indexOf('class="app-shots-scroll"'));
  assert.match(section, /Android · EPS-TOPIK/);
  assert.match(visible, /고용허가제 한국어용 EPS-TOPIK 단어팩 7개/);
  assert.doesNotMatch(section, /iOS|App Store|합격|보장|출시|9개 언어/);
});
test('free packs, paid packs, daily limits, ads and recurring vs lifetime costs stay distinct', () => {
  for (const required of ['EPS-1·2는 무료','EPS-3~7은 묶음이나 평생 이용권','이용할 수 있는 팩의 새 단어 학습·복습·퀴즈에 하루 횟수 제한이 없어요','기본 하루 20개이며 설정에서 바꿀 수 있어요','10개씩 더 공부할 수 있어요','광고가 있으며','한 번 결제하는 평생 이용권','유료 팩 전체를 열고 광고를 제거해요','기존 월 구독은 유지돼요'])
    assert.ok(visible.includes(required), required);
  assert.match(html, /data-store-link="https:\/\/play\.google\.com\/store\/apps\/details\?id=com\.pifl\.pipi\.words"/);
  assert.doesNotMatch(visible, /퀴즈 하루 10회|기본 무료 한도|월 자동갱신 구독 또는/);
  assert.doesNotMatch(section, /<a\b|<form|<input|<script|<img|<iframe|utm_|referrer=/);
});
test('no other locale or app receives the Korean Android-only section', () => {
  let seen=0;
  for (const lang of ['ko','ja','en']) for (const slug of readdirSync(`dist/${lang}/apps`)) {
    // Privacy-only routes are not registered product landings.
    if (!existsSync(`dist/${lang}/apps/${slug}/index.html`)) continue;
    if (slug==='pipi-words' && lang==='ko') continue;
    assert.doesNotMatch(read(`dist/${lang}/apps/${slug}/index.html`), /id="android-eps-topik"/); seen++;
  }
  assert.equal(seen,50);
});
test('new copy uses available width and existing tokens, not a fake preview or truncated text', () => {
  const source=read('src/components/WordsAndroidEps.astro');
  assert.match(source, /var\(--bg-card\)/);
  assert.match(source, /word-break: keep-all/);
  assert.doesNotMatch(source, /grid-template-columns|line-clamp|text-overflow|<br|<script|<img/);
  assert.match(source, /\.words-eps-code \{ white-space: nowrap; \}/);
  assert.deepEqual([...source.matchAll(/<span class="words-eps-code">([^<]+)<\/span>/g)].map(x=>x[1]),['EPS-TOPIK','EPS-1·2','EPS-3~7']);
  assert.match(read('src/pages/ko/apps/pipi-words/index.astro'), /slot="before-showcase"/);
});
