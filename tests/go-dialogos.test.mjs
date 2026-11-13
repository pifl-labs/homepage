import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const page = readFileSync(new URL('../src/pages/go/dialogos.astro', import.meta.url), 'utf8');
const script = readFileSync(new URL('../public/go-dialogos.js', import.meta.url), 'utf8');

// 앱(pipi_thus share_card_exporter.dart shareCardLink)이 가리키는 착지 페이지 — 캠페인 표시가 빠지면 카드로 온 설치를 셀 수 없다.
test('/go/dialogos marks both stores with the share_card campaign', () => {
  assert.match(page, /const APPLE_PT = '128720089'/);
  assert.match(page, /const CAMPAIGN = 'share_card'/);
  assert.match(page, /pt=\$\{APPLE_PT\}&ct=\$\{CAMPAIGN\}&mt=8/);
  assert.match(page, /utm_source=\$\{CAMPAIGN\}&utm_medium=social&utm_campaign=\$\{CAMPAIGN\}/);
  assert.match(page, /apps\['dialogos'\]/);
});

test('/go/dialogos is a noindex page with its scripts served from the site', () => {
  assert.match(page, /<meta name="robots" content="noindex, nofollow" \/>/);
  assert.match(page, /<script is:inline src="\/go-dialogos.js"><\/script>/);
});

function run(userAgent, languages, platform = 'iPhone', maxTouchPoints = 5) {
  const classes = new Set();
  const attrs = {};
  const context = {
    navigator: { userAgent, languages, language: languages[0], platform, maxTouchPoints },
    document: {
      documentElement: {
        classList: { add: (c) => classes.add(c) },
        setAttribute: (k, v) => { attrs[k] = v; },
      },
    },
  };
  vm.runInNewContext(script, context);
  return { classes, lang: attrs.lang };
}

test('picks the visitor\'s store and language', () => {
  const iphoneKo = run('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)', ['ko-KR', 'en-US']);
  assert.ok(iphoneKo.classes.has('os-ios'));
  assert.ok(iphoneKo.classes.has('lang-ko'));
  assert.equal(iphoneKo.lang, 'ko');

  const androidJa = run('Mozilla/5.0 (Linux; Android 15)', ['ja-JP'], 'Linux armv8l', 5);
  assert.ok(androidJa.classes.has('os-android'));
  assert.ok(androidJa.classes.has('lang-ja'));

  const desktopEn = run('Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0)', ['en-GB'], 'MacIntel', 0);
  assert.equal(desktopEn.classes.size, 0);
  assert.equal(desktopEn.lang, 'en');

  const desktopFr = run('Mozilla/5.0 (Windows NT 10.0)', ['fr-FR', 'ja'], 'Win32', 0);
  assert.ok(desktopFr.classes.has('lang-ja'));
});
