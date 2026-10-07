import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../src/data/apps.ts', import.meta.url), 'utf8');
const drawText = source.slice(source.indexOf('const draw: AppMeta = '), source.indexOf('\n// 낱말항해'));
const draw = runInNewContext(drawText.replace('const draw: AppMeta = ', 'const draw = ') + '\ndraw');

test('English Draw lead explains the actual task and qualifies AI results', () => {
  assert.equal(draw.content.en.lede, 'Use AI to turn a photo into a coloring outline, then color it by hand. Results vary with the photo; start with one clear subject and a simple background.');
  assert.doesNotMatch(draw.content.en.lede, /clean line art|perfect|guarantee|fixed|no drawing skill/i);
});

test('Draw iOS follows current KR/JP/US public 1.1.0, without inferring Android or changing limits', () => {
  assert.equal(draw.release.ios.version, '1.1.0');
  assert.equal(draw.release.ios.updated, '2026-10-01');
  assert.equal(draw.release.since, '2026-07-14');
  assert.equal(draw.release.checkedAt, '2026-09-30');
  assert.equal(draw.release.android, undefined);
  assert.equal(draw.content.en.downloadNote, '2 free AI conversions a day; internet required. Contains ads and optional conversion-ticket purchases. No ads inside the coloring screen.');
  assert.equal(draw.content.en.shots.length, 4);
  assert.equal(draw.content.en.features.length, 4);
});

test('other locales are not silently translated or changed', () => {
  assert.equal(draw.content.ko.lede, '찍은 사진 한 장을 AI가 깔끔한 라인아트로 바꿔 줍니다. 변환된 스케치를 내 손으로 색칠해 나만의 작품으로 완성하세요. 그림 실력은 필요 없어요 — 색칠의 즐거움만 있으면 됩니다.');
  assert.equal(draw.content.ja.lede, '撮った写真をAIがきれいなラインアートに変換。変換されたスケッチを自分の手で塗って、自分だけの作品に仕上げましょう。絵の才能は不要 — 塗る楽しさだけあればいい。');
});

test('visible lead and structured description share the same source without adding tracking', () => {
  const component = readFileSync(new URL('../src/components/AppLanding.astro', import.meta.url), 'utf8');
  assert.match(component, /description: c\.lede,/);
  assert.match(component, /class="app-hero-lede"/);
  assert.match(component, /: c\.lede\}/);
  assert.equal(draw.stores.ios, 'https://apps.apple.com/app/id6779071131');
  assert.equal(draw.stores.android, 'https://play.google.com/store/apps/details?id=com.pifl.pipi.draw');
});
