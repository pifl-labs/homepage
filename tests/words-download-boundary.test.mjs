import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { runInNewContext } from 'node:vm';

const read = p => readFileSync(new URL(p, import.meta.url), 'utf8');
const source = read('../src/data/apps.ts');
const block = source.match(/const words: AppMeta = \{[\s\S]*?\n\};/)[0];
const words = runInNewContext(block.replace('const words: AppMeta = ', 'const words = ') + '\nwords');

test('EN download explains ads, free study limits and optional pack/subscription before choosing a store', () => {
  assert.equal(words.content.en.ctaSub, 'Free download with ads and study limits. Optional word packs or a subscription.');
  assert.doesNotMatch(words.content.en.ctaSub, /all.*free|unlimited.*free|no subscription|\$|free trial|daily \d+/i);
});
test('feature section uses the current product name, while previous-name notice remains available', () => {
  assert.equal(words.content.en.featuresTitle, 'Why Vocab Routine');
  assert.equal(words.name, 'Vocab Routine: JLPT & TOPIK');
  assert.equal(words.previousName, 'PiPi Words');
});
test('iOS-qualified manual comparison is not recast as cross-platform handwriting or automatic grading', () => {
  assert.ok(words.content.en.lede.includes('On iOS'));
  assert.ok(words.content.en.lede.includes('compare your answer'));
  assert.ok(words.content.en.lede.includes('No automatic grading'));
  assert.ok(words.content.en.features[0].desc.includes('No automatic grading or stroke-order checks'));
  assert.ok(words.content.en.features[3].desc.includes('Ads, stores and purchase restoration use the network'));
});
test('real destinations, release and screenshots remain the current verified product rather than a new app build', () => {
  assert.equal(words.release.ios.version, '1.0.12');
  assert.ok(words.stores.ios.endsWith('/id6770267735'));
  assert.equal(new URL(words.stores.android).searchParams.get('id'), 'com.pifl.pipi.words');
  assert.equal(words.content.en.shots.map(s => s.file).join(','), 'home,study,flashcard,voyage,achievements');
});
test('wrap protection affects only the EN Words price sentence and CSS cache key matches exact asset bytes', () => {
  const css = read('../public/styles-app-landing.css');
  assert.ok(css.includes(':lang(en) .app-page--words .app-cta-sub { color: var(--text-secondary); text-wrap: pretty; }'));
  const hash = createHash('sha256').update(css).digest('hex').slice(0, 12);
  assert.ok(read('../src/components/AppLanding.astro').includes('/styles-app-landing.css?v=' + hash));
});
test('source receipt distinguishes public claims from independent native/payment or growth verification', () => {
  const receipt = JSON.parse(read('../docs/release/words-download-facts-20261010.json'));
  assert.equal(receipt.checkedAt, '2026-10-10');
  assert.equal(receipt.publicIosVersion, '1.0.12');
  assert.equal(receipt.nativeAppQA, false);
  assert.equal(receipt.appStoreSubmission, false);
  assert.equal(receipt.downloadLiftVerified, false);
  assert.equal(receipt.sources.length, 3);
});
