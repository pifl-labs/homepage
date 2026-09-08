#!/usr/bin/env node
/** Validate rendered Draw disclosures and keep them scoped to Draw. */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const expected = {
  ko: { note: ['하루 2회 무료', '인터넷', '광고', '선택형 변환권 구매'], styles: ['원본 느낌', '동화풍', '꼬마 캐릭터', '웹툰풍'], sample: '예시 도안', direct: 'AI 변환 횟수를 쓰지 않는 무료 기능' },
  ja: { note: ['1日2回無料', 'インターネット', '広告', '任意の変換チケット購入'], styles: ['写真らしく', '絵本風', 'ちびキャラ', 'ウェブトゥーン風'], sample: 'サンプル図案', direct: 'AI変換の回数を使わない無料機能' },
  en: { note: ['2 free AI conversions a day', 'internet required', 'ads', 'optional conversion-ticket purchases'], styles: ['True to Photo', 'Storybook', 'Chibi', 'Webtoon'], sample: 'Sample page shown', direct: 'This uses no AI conversion credits' },
};
let checked = 0;
for (const [lang, checks] of Object.entries(expected)) {
  const html = readFileSync(join(dist, lang, 'apps/pipi-draw/index.html'), 'utf8');
  const notes = [...html.matchAll(/<p\b[^>]*class="app-download-note"[^>]*>(.*?)<\/p>/gs)];
  assert.equal(notes.length, 1, `${lang}: one disclosure near the hero downloads`);
  for (const text of checks.note) assert.ok(notes[0][1].includes(text), `${lang}: missing ${text}`);
  for (const text of [...checks.styles, checks.sample, checks.direct]) assert.ok(html.includes(text), `${lang}: missing ${text}`);
  assert.doesNotMatch(html, /ai_styles\.webp|iPad급|iPad級|iPad-grade|Default · Ink|基本 · インク/);
  assert.equal([...html.matchAll(/class="app-shot"/g)].length, 4);
  const jsonLd = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)]
    .map((match) => JSON.parse(match[1])).find((value) => value['@type'] === 'SoftwareApplication');
  assert.equal(jsonLd.softwareVersion, '1.0.8');
  assert.equal(jsonLd.dateModified, '2026-08-31');
  assert.equal(jsonLd.datePublished, '2026-07-14');
  for (const entry of readdirSync(join(dist, lang, 'apps'), {withFileTypes: true})) {
    if (!entry.isDirectory() || entry.name === 'pipi-draw') continue;
    const other = readFileSync(join(dist, lang, 'apps', entry.name, 'index.html'), 'utf8');
    assert.doesNotMatch(other, /class="app-download-note"/, `${lang}/${entry.name}: Draw disclosure leaked`);
  }
  checked++;
}
console.log(`PASS: ${checked} Draw locales — limits, connectivity, optional purchases, current styles, sample provenance, release facts, no other-app leakage.`);
