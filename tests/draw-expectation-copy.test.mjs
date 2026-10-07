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

test('Korean Draw lead qualifies results and gives a concrete photo-selection starting point', () => {
  assert.equal(draw.content.ko.lede, '사진을 AI 색칠 도안으로 바꾸고 내 손으로 색을 채워 보세요. 결과는 사진과 설정에 따라 달라집니다. 주제가 뚜렷하고 배경이 단순한 사진부터 시작하세요.');
  assert.doesNotMatch(draw.content.ko.lede, /깔끔한 라인아트|완벽|보장|회색.*해결|그림 실력은 필요/);
});

test('Japanese Draw lead preserves the task without guaranteeing a clean conversion', () => {
  assert.equal(draw.content.ja.lede, '写真をAIでぬりえ図案にして、自分の手で色を塗りましょう。仕上がりは写真や設定によって異なります。主役がはっきりし、背景がシンプルな写真で始めましょう。');
  assert.doesNotMatch(draw.content.ja.lede, /きれいなラインアート|完璧|保証|解決|才能は不要/);
});

test('localized copy changes do not weaken limits, costs, network disclosures or screenshot provenance', () => {
  assert.equal(draw.content.ko.downloadNote, 'AI 변환은 하루 2회 무료 · 인터넷 연결 필요. 앱 내 광고와 선택형 변환권 구매가 있으며, 색칠 화면 안에는 광고가 없습니다.');
  assert.equal(draw.content.ja.downloadNote, 'AI変換は1日2回無料・インターネット接続が必要です。広告と任意の変換チケット購入があります。色塗り画面内には広告を表示しません。');
  assert.equal(draw.content.ko.shots[0].desc, '예시 도안 화면입니다. 내 사진을 AI로 변환한 뒤 색칠을 시작할 수 있어요.');
  assert.equal(draw.content.ja.shots[0].desc, 'サンプル図案の画面です。自分の写真をAIで変換してから色塗りを始められます。');
  for (const lang of ['ko', 'ja', 'en']) {
    assert.equal(draw.content[lang].shots.length, 4);
    assert.equal(draw.content[lang].features.length, 4);
    assert.ok(draw.content[lang].metaDesc);
  }
});

test('visible lead and structured description share the same source without adding tracking', () => {
  const component = readFileSync(new URL('../src/components/AppLanding.astro', import.meta.url), 'utf8');
  assert.match(component, /description: c\.lede,/);
  assert.match(component, /class="app-hero-lede"/);
  assert.match(component, /: c\.lede\}/);
  assert.equal(draw.stores.ios, 'https://apps.apple.com/app/id6779071131');
  assert.equal(draw.stores.android, 'https://play.google.com/store/apps/details?id=com.pifl.pipi.draw');
});


test('Draw-only short Japanese reading units keep all source text and never nowrap the entire paragraph', async () => {
  const { japaneseReadingParts } = await import('../src/components/app-name-parts.mjs');
  for (const [kind, text, expected] of [
    ['drawLede', draw.content.ja.lede, ['ぬりえ図案', '仕上がり', '主役', '始めましょう。']],
    ['drawDownloadNote', draw.content.ja.downloadNote, ['インターネット']],
  ]) {
    const parts = japaneseReadingParts(text, kind);
    assert.equal(parts.map(part => part.text).join(''), text);
    assert.deepEqual(parts.filter(part => part.keepWhole).map(part => part.text), expected);
    assert.ok(parts.filter(part => part.keepWhole).every(part => [...part.text].length <= 7));
    assert.ok(parts.some(part => !part.keepWhole));
  }
  const component = readFileSync(new URL('../src/components/AppLanding.astro', import.meta.url), 'utf8');
  assert.match(component, /app.slug === 'pipi-draw' \? 'drawLede' : 'lede'/);
  assert.match(component, /lang === 'ja' && app.slug === 'pipi-draw' \? japaneseReadingParts\(c.downloadNote, 'drawDownloadNote'\)/);
  assert.deepEqual(japaneseReadingParts('他のアプリの未知の文。', 'drawLede'), [{ text: '他のアプリの未知の文。', keepWhole: false }]);
});


test('Korean Draw store labels retain whole words at enlarged narrow widths, without changing labels or URLs', () => {
  const component = readFileSync(new URL('../src/components/AppLanding.astro', import.meta.url), 'utf8');
  assert.equal((component.match(/\(app.slug === 'pipi-bridge' \|\| app.slug === 'pipi-draw' \|\| app.slug === 'pipi-words' \|\| app.slug === 'pipi-hello'\) && lang === 'ko' \? 'word-break: keep-all; overflow-wrap: normal' : undefined/g) || []).length, 4);
});
