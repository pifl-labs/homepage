#!/usr/bin/env node
/** Validate rendered Draw disclosures and keep them scoped to Draw. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { appSlugs, builtAppLandingFiles } from './built-app-pages.mjs';
import { focusWebTrialFor } from '../src/data/focus-web-trial.mjs';
import { wordsWebTrialFor } from '../src/data/words-web-trial.mjs';
import { voyageWebTrialFor } from '../src/data/voyage-web-trial.mjs';
import { createHash } from 'node:crypto';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const focusCss = readFileSync(new URL('../public/styles-focus-web-trial.css', import.meta.url));
const focusCssUrl = `/styles-focus-web-trial.css?v=${createHash('sha256').update(focusCss).digest('hex').slice(0, 12)}`;
assert.deepEqual(readFileSync(join(dist, 'styles-focus-web-trial.css')), focusCss, 'Focus stylesheet built bytes match source');
const wordsCss = readFileSync(new URL('../public/styles-words-web-trial.css', import.meta.url));
const wordsCssUrl = `/styles-words-web-trial.css?v=${createHash('sha256').update(wordsCss).digest('hex').slice(0, 12)}`;
assert.deepEqual(readFileSync(join(dist, 'styles-words-web-trial.css')), wordsCss, 'Words stylesheet built bytes match source');
const voyageCss = readFileSync(new URL('../public/styles-voyage-web-trial.css', import.meta.url));
const voyageCssUrl = `/styles-voyage-web-trial.css?v=${createHash('sha256').update(voyageCss).digest('hex').slice(0, 12)}`;
assert.deepEqual(readFileSync(join(dist, 'styles-voyage-web-trial.css')), voyageCss, 'Voyage stylesheet built bytes match source');
const expected = {
  ko: { note: ['하루 2회 무료', '인터넷', '광고', '선택형 변환권 구매'], styles: ['원본 느낌', '동화풍', '꼬마 캐릭터', '만화풍'], sample: '예시 도안', direct: 'AI 변환 횟수를 쓰지 않는 무료 기능' },
  ja: { note: ['1日2回無料', 'インターネット', '広告', '任意の変換チケット購入'], styles: ['写真らしく', '絵本風', 'ちびキャラ', 'マンガ風'], sample: 'サンプル図案', direct: 'AI変換の回数を使わない無料機能' },
  en: { note: ['2 free AI conversions a day', 'internet required', 'ads', 'optional conversion-ticket purchases'], styles: ['True to Photo', 'Storybook', 'Chibi', 'Digital Comic'], sample: 'Sample page shown', direct: 'This uses no AI conversion credits' },
};
let checked = 0;
for (const [lang, checks] of Object.entries(expected)) {
  const html = readFileSync(join(dist, lang, 'apps/pipi-draw/index.html'), 'utf8');
  assert.ok(!html.includes('styles-focus-web-trial.css'), `${lang}: Focus-only CSS does not leak to Draw`);
  assert.ok(!html.includes('styles-words-web-trial.css'), `${lang}: Words-only CSS does not leak to Draw`);
  assert.ok(!html.includes('styles-voyage-web-trial.css'), `${lang}: Voyage-only CSS does not leak to Draw`);
  const photoGuides = [...html.matchAll(/<section\b[^>]*id="draw-ja-photo-guide"[^>]*>(.*?)<\/section>/gs)];
  assert.equal(photoGuides.length, lang === 'ja' ? 1 : 0, `${lang}: photo guide is Japanese Draw only`);
  if (lang === 'ja') {
    const guide = photoGuides[0][0];
    assert.match(guide, /aria-labelledby="draw-ja-photo-guide-title"/, 'JA photo guide heading association');
    assert.match(guide, /<h2\b[^>]*id="draw-ja-photo-guide-title"[^>]*>写真選び<\/h2>/, 'JA photo guide exact heading');
    const paragraphs = [...guide.matchAll(/<p\b[^>]*>(.*?)<\/p>/gs)];
    assert.match(guide, /<p\b[^>]*style="text-wrap: balance"[^>]*>/, 'JA guide paragraph uses only local balanced wrapping');
    assert.deepEqual([...guide.matchAll(/style="([^"]*)"/g)].map(match => match[1]), ['text-wrap: balance'], 'JA guide has exactly one local typography declaration');
    assert.deepEqual(paragraphs.map(match => match[1]), ['主役・背景・写真の端を見比べる無料ガイドです。写真は手元に置いたまま読めます。写真の変換機能ではありません。'], 'JA photo guide exact read-only boundary');
    const links = [...guide.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*hreflang="([^"]+)"[^>]*>(.*?)<\/a>/gs)];
    assert.equal((guide.match(/<a\b/g) ?? []).length, 1, 'JA photo guide has only one action');
    assert.equal(links.length, 1, 'JA photo guide has one language-marked link');
    assert.equal(links[0][1], 'https://pipi-worlds.com/ja/guides/photo-to-coloring-outline/', 'JA photo guide exact destination');
    assert.equal(links[0][2], 'ja', 'JA photo guide matching language');
    assert.equal(links[0][3].replace(/<[^>]+>/g, '').trim(), 'ガイドを読む', 'JA photo guide action label');
    assert.doesNotMatch(guide, /<form|<input|<button|<script|<img|<iframe|download=|target=|onclick|type="file"|app-download-note/, 'JA photo guide is a read-only resource, not a conversion/upload demo');
  }
  const notes = [...html.matchAll(/<p\b[^>]*class="app-download-note"[^>]*>(.*?)<\/p>/gs)];
  assert.equal(notes.length, 1, `${lang}: one disclosure near the hero downloads`);
  for (const text of checks.note) assert.ok(notes[0][1].includes(text), `${lang}: missing ${text}`);
  for (const text of [...checks.styles, checks.sample, checks.direct]) assert.ok(html.includes(text), `${lang}: missing ${text}`);
  assert.doesNotMatch(html, /ai_styles\.webp|iPad급|iPad級|iPad-grade|Default · Ink|基本 · インク|웹툰풍|ウェブトゥーン風|Webtoon/);
  assert.equal([...html.matchAll(/class="app-shot"/g)].length, 3);
  assert.ok(html.includes('submission/20261023-1.webp'));
  assert.ok(html.includes('1.2.3 (54)'));
  assert.ok(html.includes('app-media-note'));
  const jsonLd = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)]
    .map((match) => JSON.parse(match[1])).find((value) => value['@type'] === 'SoftwareApplication');
  // 2026-11-02: both stores publish 1.2.3, so one shared version is shown.
  assert.equal(jsonLd.softwareVersion, '1.2.3');
  assert.ok(html.includes('v1.2.3'));
  assert.ok(!html.includes('iOS v') && !html.includes('Android v'));
  assert.equal(jsonLd.dateModified, '2026-10-31');
  assert.equal(jsonLd.datePublished, undefined);
  for (const file of builtAppLandingFiles(dist, lang, appSlugs)) {
    if (file === join(dist, lang, 'apps', 'pipi-draw', 'index.html')) continue;
    const other = readFileSync(file, 'utf8');
    assert.ok(!other.includes('draw-ja-photo-guide'), `${file}: Japanese Draw guide does not leak`);
    if (!file.includes('/pipi-focus/')) assert.ok(!other.includes('styles-focus-web-trial.css'), `${file}: Focus-only CSS does not leak`);
    if (!file.includes('/pipi-words/')) assert.ok(!other.includes('styles-words-web-trial.css'), `${file}: Words-only CSS does not leak`);
    if (!file.includes('/pipi-word-voyage/') || lang === 'ja') assert.ok(!other.includes('styles-voyage-web-trial.css'), `${file}: Voyage-only CSS does not leak`);
    if(file.includes('/pipi-spend/')) {
      const ownNote=other.match(/<p\b[^>]*class="app-download-note"[^>]*>(.*?)<\/p>/s)?.[1];
      assert.ok(ownNote, `${file}: Spend must disclose its own cost`);
      assert.match(ownNote,/Pro/);
      for(const text of [checks.note[0],checks.note[3]]) assert.ok(!ownNote.includes(text), `${file}: Draw-specific conversion claim leaked`);
    } else if (file.includes('/pipi-focus/')) {
      // Focus uses the same text-group style, but only for its separate web trial.
      // Keep every other app's no-disclosure guard and all Draw checks unchanged.
      const notes = [...other.matchAll(/<div\b[^>]*class="app-download-note"[^>]*>(.*?)<\/div>/gs)];
      const trial = focusWebTrialFor({ slug: 'pipi-focus', status: 'live', lang });
      assert.equal(notes.length, 1, `${file}: one Focus web trial note`);
      assert.match(notes[0][0], /data-web-trial="focus"/, `${file}: explicit Focus trial marker`);
      assert.equal((other.match(/class="app-download-note"/g) ?? []).length, 1, `${file}: no extra legacy paragraph disclosure`);
      const links = [...notes[0][1].matchAll(/<a\b[^>]*href="([^"]+)"[^>]*hreflang="([^"]+)"[^>]*>(.*?)<\/a>/gs)];
      assert.equal(links.length, 1, `${file}: one Focus trial destination`);
      assert.equal(links[0][1], trial.href, `${file}: matching-locale web timer`);
      assert.equal(links[0][2], lang, `${file}: matching link language`);
      assert.equal(links[0][3], trial.label, `${file}: web trial link label`);
      const paragraphs = [...notes[0][1].matchAll(/<p\b[^>]*>(.*?)<\/p>/gs)];
      assert.equal(paragraphs.length, 1, `${file}: boundary note has its own paragraph`);
      assert.equal(paragraphs[0][1], trial.note, `${file}: exact separate-web and no-transfer disclosure`);
      assert.equal(notes[0][1].replace(links[0][0], '').replace(paragraphs[0][0], '').trim(), '', `${file}: no inline boundary text or other content`);
      const styleLinks = [...other.matchAll(/<link\b[^>]*href="(\/styles-focus-web-trial\.css[^\"]*)"[^>]*>/g)];
      assert.deepEqual(styleLinks.map(match => match[1]), [focusCssUrl], `${file}: exact content-versioned Focus stylesheet`);
      for (const text of [checks.note[0], checks.note[3]]) assert.ok(!notes[0][1].includes(text), `${file}: Draw-specific conversion claim leaked`);
    } else if (file.includes('/pipi-words/')) {
      const notes = [...other.matchAll(/<div\b[^>]*class="app-download-note"[^>]*>(.*?)<\/div>/gs)];
      const trial = wordsWebTrialFor({ slug: 'pipi-words', status: 'live', lang });
      assert.equal(notes.length, 1, `${file}: one Words web sample note`);
      assert.match(notes[0][0], /data-web-trial="words"/, `${file}: explicit Words sample marker`);
      assert.equal((other.match(/class="app-download-note"/g) ?? []).length, 1, `${file}: no extra legacy paragraph disclosure`);
      const links = [...notes[0][1].matchAll(/<a\b[^>]*href="([^"]+)"[^>]*hreflang="([^"]+)"[^>]*>(.*?)<\/a>/gs)];
      assert.equal(links.length, 1, `${file}: one Words sample destination`);
      assert.equal(links[0][1], trial.href, `${file}: matching-locale vocabulary sample`);
      assert.equal(links[0][2], lang, `${file}: matching link language`);
      assert.equal(links[0][3], trial.label, `${file}: web sample link label`);
      const paragraphs = [...notes[0][1].matchAll(/<p\b[^>]*>(.*?)<\/p>/gs)];
      assert.equal(paragraphs.length, 1, `${file}: boundary note has its own paragraph`);
      assert.equal(paragraphs[0][1], trial.note, `${file}: exact separate-web and no-transfer disclosure`);
      assert.equal(notes[0][1].replace(links[0][0], '').replace(paragraphs[0][0], '').trim(), '', `${file}: no inline boundary text or other content`);
      const styleLinks = [...other.matchAll(/<link\b[^>]*href="(\/styles-words-web-trial\.css[^\"]*)"[^>]*>/g)];
      assert.deepEqual(styleLinks.map(match => match[1]), [wordsCssUrl], `${file}: exact content-versioned Words stylesheet`);
      for (const text of [checks.note[0], checks.note[3]]) assert.ok(!notes[0][1].includes(text), `${file}: Draw-specific conversion claim leaked`);
    } else if (file.includes('/pipi-word-voyage/') && lang !== 'ja') {
      const notes = [...other.matchAll(/<div\b[^>]*class="app-download-note"[^>]*>(.*?)<\/div>/gs)];
      const trial = voyageWebTrialFor({ slug: 'pipi-word-voyage', status: 'live', lang });
      assert.equal(notes.length, 1, `${file}: one Voyage web sample note`);
      assert.match(notes[0][0], /data-web-trial="voyage"/, `${file}: explicit Voyage sample marker`);
      assert.equal((other.match(/class="app-download-note"/g) ?? []).length, 1, `${file}: no extra legacy paragraph disclosure`);
      const links = [...notes[0][1].matchAll(/<a\b[^>]*href="([^"]+)"[^>]*hreflang="([^"]+)"[^>]*>(.*?)<\/a>/gs)];
      assert.equal(links.length, 1, `${file}: one Voyage sample destination`);
      assert.equal(links[0][1], trial.href, `${file}: matching-locale Korean word-link examples`);
      assert.equal(links[0][2], lang, `${file}: matching link language`);
      assert.equal(links[0][3], trial.label, `${file}: web sample link label`);
      const paragraphs = [...notes[0][1].matchAll(/<p\b[^>]*>(.*?)<\/p>/gs)];
      assert.equal(paragraphs.length, 1, `${file}: boundary note has its own paragraph`);
      assert.equal(paragraphs[0][1], trial.note, `${file}: exact separate-web and no-transfer disclosure`);
      assert.equal(notes[0][1].replace(links[0][0], '').replace(paragraphs[0][0], '').trim(), '', `${file}: no inline boundary text or other content`);
      const styleLinks = [...other.matchAll(/<link\b[^>]*href="(\/styles-voyage-web-trial\.css[^\"]*)"[^>]*>/g)];
      assert.deepEqual(styleLinks.map(match => match[1]), [voyageCssUrl], `${file}: exact content-versioned Voyage stylesheet`);
      for (const text of [checks.note[0], checks.note[3]]) assert.ok(!notes[0][1].includes(text), `${file}: Draw-specific conversion claim leaked`);
    } else assert.doesNotMatch(other, /class="app-download-note"/, `${file}: Draw disclosure leaked`);
  }
  checked++;
}
console.log(`PASS: ${checked} Draw locales — limits, connectivity, optional purchases, current styles, sample provenance, release facts, no other-app leakage.`);
