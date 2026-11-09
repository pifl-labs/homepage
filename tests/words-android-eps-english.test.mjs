import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, existsSync} from 'node:fs';
const read = p => readFileSync(p, 'utf8');
const html = read('dist/en/apps/pipi-words/index.html');
const start = html.indexOf('id="android-eps-topik-en"');
const section = html.slice(start, html.indexOf('</section>', start));
const visible = section.replace(/<[^>]*>/g, '');
test('English Android entry precedes explicitly iOS screenshots without parity or outcome claims', () => {
  assert.ok(start > 0 && start < html.indexOf('class="app-shots-scroll"'));
  for (const s of ['Android · EPS-TOPIK', 'Try the first two decks free', 'seven EPS-TOPIK (Employment Permit Korean) vocabulary decks']) assert(visible.includes(s), s);
  assert.doesNotMatch(section, /iOS|App Store|pass the exam|guarantee|new release|official exam/i);
});
test('current US Android free, paid, review, ad and renewal boundaries remain explicit', () => {
  for (const s of ['EPS-1 and EPS-2 are free.', 'EPS-3–7 need the optional bundle or Premium access.', '20 new words and 10 quizzes a day', 'Reviews of learned words are unlimited.', 'Optional rewarded ads', 'ads and optional in-app purchases', 'monthly auto-renewing subscription', 'one-time lifetime purchase']) assert(visible.includes(s), s);
  assert.doesNotMatch(section, /<a\b|<form|<input|<script|<img|<iframe|utm_|referrer=/);
  const play = [...html.matchAll(/data-store-link="([^"]+)"/g)].map(x=>x[1]).filter(x=>x.includes('play.google.com'));
  assert.deepEqual(play, Array(2).fill('https://play.google.com/store/apps/details?id=com.pifl.pipi.words'));
});
test('English addition never appears on another locale, app or legacy route', () => {
  let seen = 0;
  for (const lang of ['ko','ja','en']) for (const slug of readdirSync(`dist/${lang}/apps`)) {
    const p = `dist/${lang}/apps/${slug}/index.html`;
    if (!existsSync(p) || (slug==='pipi-words' && lang==='en')) continue;
    assert.doesNotMatch(read(p), /id="android-eps-topik-en"/); seen++;
  }
  assert.equal(seen, 44);
  // Legacy /apps/pipi-words is privacy-only, not a product landing.
  for (const relative of readdirSync('dist', {recursive: true})) {
    if (!relative.endsWith('.html') || relative==='en/apps/pipi-words/index.html') continue;
    assert.doesNotMatch(read(`dist/${relative}`), /id="android-eps-topik-en"/);
  }
});
test('copy fills available card width with existing tokens and no truncated or fixed-width prose', () => {
  const src = read('src/components/WordsAndroidEpsEnglish.astro');
  for (const s of ['var(--bg-card)', 'var(--text-secondary)', 'min-width: 0', 'text-wrap: pretty']) assert(src.includes(s));
  assert.doesNotMatch(src, /grid-template-columns|line-clamp|text-overflow|max-width|white-space|<br|overflow:\s*hidden|font-size:\s*\d+px/);
  assert.match(read('src/pages/en/apps/pipi-words/index.astro'), /WordsAndroidEpsEnglish slot="before-showcase"/);
});
