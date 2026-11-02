import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../src/data/apps.ts', import.meta.url), 'utf8');
const block = source.slice(source.indexOf('const log: AppMeta = '), source.indexOf('\n// Dialogos'));
const log = runInNewContext(block.replace('const log: AppMeta = ', 'const log = ') + '\nlog');

test('EN Mood landing gives a mood-first action, optional context and calendar revisit', () => {
  const c = log.content.en;
  for (const term of ['nine sea-weather moods', 'PiPi responds', 'note, photo or tag if', 'calendar', 'No account needed', 'Entries and photos stay on your device']) {
    assert.ok(c.lede.includes(term), term);
  }
  // 2026-11-02 listings: "No ads or tracking", every journaling feature (lock, backup) is free.
  for (const term of ['optional notes, photos or tags', 'calendar', 'No ads or tracking', 'every journaling feature is free']) assert.ok(c.metaDesc.includes(term), term);
});

test('optional-context feature retains the four-card grid and the other feature roles', () => {
  const cards = log.content.en.features;
  assert.equal(cards.length, 4);
  assert.equal(cards.map(c => c.icon).join(','), 'fa-cloud-sun,fa-tags,fa-pen-nib,fa-lock');
  assert.equal(cards[1].title, 'Optional context');
  for (const term of ['mood-only entry', 'note, photo or tag', 'calendar']) assert.ok(cards[1].desc.includes(term), term);
  assert.ok(cards[3].desc.includes('Lock, backup and every other journaling feature are free'));
  assert.ok(cards[3].desc.includes('store payments use the network'));
  assert.doesNotMatch(cards[3].desc, /only store payments/);
  assert.doesNotMatch(JSON.stringify(log.content), /Premium adds biometric|프리미엄에서는 생체인증|プレミアム購入後は生体認証|프리미엄 생체인증|プレミアムの生体認証/);
});

test('download CTA states no ads and the optional one-time supporter purchase', () => {
  assert.equal(log.content.en.ctaSub, 'Free on iOS & Android. No ads; optional one-time Lifetime Supporter purchase, no subscription.');
  const english = JSON.stringify(log.content.en);
  assert.doesNotMatch(english, /guaranteed|clinically proven|cure|improves mental|no data collection|fully offline|everything is free/i);
});

test('the factual-copy change keeps the actual release, store destinations and screenshots', () => {
  const current = JSON.parse(readFileSync(new URL('../docs/release/homepage-app-audit-20261102.json', import.meta.url), 'utf8')).apps.find(a => a.slug === 'pipi-log');
  assert.equal(log.release.ios.version, current.ios.en.version);
  assert.equal(log.release.android.version, current.android.en.version);
  assert.equal(log.stores.ios, 'https://apps.apple.com/app/pipi-log/id6770272665');
  assert.equal(new URL(log.stores.android).searchParams.get('id'), 'com.pifl.pipi.log');
  assert.equal(log.content.en.shots.map(s => s.file).join(','), 'home,calendar,analytics,monthly-map,collection');
});

test('KO/JA context cards remain unchanged in role and store-payment boundaries', () => {
  for (const lang of ['ko', 'ja']) {
    assert.equal(log.content[lang].features.length, 4);
    assert.equal(log.content[lang].features[1].icon, 'fa-feather');
    assert.equal(log.content[lang].features[3].icon, 'fa-lock');
  }
  assert.equal(log.content.ko.ctaSub, 'iOS · Android에서 무료로 시작.');
  assert.equal(log.content.ja.ctaSub, 'iOS · Android で無料ではじめる。');
});

test('English Mood card and pricing wrap protection is scoped, without shrinking text', () => {
  const css = readFileSync(new URL('../public/styles-app-landing.css', import.meta.url), 'utf8');
  assert.match(css, /:lang\(en\) \.app-page--log \.app-feature p,\s*:lang\(en\) \.app-page--log \.app-cta-sub\s*\{ text-wrap: pretty; \}/);
});
