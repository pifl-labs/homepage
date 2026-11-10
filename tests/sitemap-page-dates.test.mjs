import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

// Capture the actual integration options without running an Astro build in unit tests.
const source = readFileSync(new URL('../astro.config.mjs', import.meta.url), 'utf8');
let options;
runInNewContext(source.replace(/^import .*;\n/gm, '').replace('export default', 'globalThis.config ='), {
  defineConfig: value => value,
  sitemap: value => { options = value; return value; },
  URL,
});

test('page sitemap does not substitute store-release dates or build time for page modification time', () => {
  assert.equal(options.lastmod, undefined);
  assert.equal(options.serialize, undefined);
  assert.doesNotMatch(source, /latestUpdate|\bnew Date\s*\(|Date\.now\s*\(/);
});

test('omitting unverified page dates preserves all three locale alternates', () => {
  assert.deepEqual(JSON.parse(JSON.stringify(options.i18n)), {
    defaultLocale: 'ko',
    locales: { ko: 'ko-KR', en: 'en-US', ja: 'ja-JP' },
  });
});

for (const locale of ['ko', 'en', 'ja']) {
  for (const path of [`/${locale}/`, `/${locale}/apps/pipi-draw/`, `/${locale}/apps/pipi-spend/`, `/${locale}/apps/kkachi/`, `/${locale}/apps/pipi-sudoku/`]) {
    test(`canonical page remains eligible: ${path}`, () => {
      assert.equal(options.filter(`https://pifl-labs.com${path}`), true);
    });
  }
  for (const path of [`/${locale}/apps/pipi-dday/import/`, `/${locale}/apps/pipi-bridge/privacy/zh/`, `/${locale}/apps/pipi-bridge/privacy/vi/`]) {
    test(`existing noindex exclusion remains: ${path}`, () => {
      assert.equal(options.filter(`https://pifl-labs.com${path}`), false);
    });
  }
}

for (const path of ['/', '/apps/pipi-draw/', '/terms/', '/go/tiktok/', '/zh/apps/pipi-bridge/', '/vi/']) {
  test(`noncanonical route stays excluded: ${path}`, () => {
    assert.equal(options.filter(`https://pifl-labs.com${path}`), false);
  });
}
