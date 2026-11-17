import {currentIOS,currentAndroid,androidDay,syncReceipt,beforeReleaseSync,expectedRelease,refreshReceipt} from './helpers/release-sync-20261116.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { apps, displayVersion, releaseVersionLabel, releaseObservationDates } from '../src/data/apps.ts';

const read = p => readFileSync(new URL(p, import.meta.url), 'utf8');
const receipt = JSON.parse(read('../docs/release/voyage-android-public-20261113.json'));
const voyage = apps['pipi-word-voyage'];
const sha = text => createHash('sha256').update(text).digest('hex');

test('Voyage Android receipt comes from the actual public KO/KR JA/JP EN/US About dialogs', () => {
  assert.equal(receipt.observedAt, '2026-11-13');
  assert.equal(receipt.package, 'com.pifl.pipi.wordvoyage');
  assert.deepEqual(receipt.apps.map(r => r.country).sort(), ['JP','KR','US']);
  for (const row of receipt.apps) {
    const u = new URL(row.url);
    assert.equal(u.origin, 'https://play.google.com');
    assert.equal(u.searchParams.get('id'), receipt.package);
    assert.equal(u.searchParams.get('gl'), row.country);
    assert.equal(row.app.version, '1.4.1');
    assert.equal(row.app.updatedCalendar, '2026-11-04');
    assert.match(row.measuredAt, /^2026-11-13T/);
  }
});

test('Voyage uses current independent platform receipts and preserves shared history', () => {
  assert.deepEqual(voyage.release.android, expectedRelease('pipi-word-voyage','android'));
  assert.deepEqual(voyage.release.ios, expectedRelease('pipi-word-voyage','ios'));
  assert.equal(voyage.release.checkedAt, receipt.originalSharedObservation);
  assert.equal(voyage.release.since, '2026-07-13');
  assert.equal(displayVersion(voyage), currentIOS('pipi-word-voyage').version);
  assert.equal(releaseVersionLabel(voyage), `v${currentIOS('pipi-word-voyage').version}`);
  assert.deepEqual(releaseObservationDates(voyage), ['2026-11-02',refreshReceipt.observedAt]);
});

test('reversing the exact dated Android-field delta restores all original app data bytes', () => {
  const source = beforeReleaseSync('src/data/apps.ts',read('../src/data/apps.ts'));
  const block = source.match(/const wordVoyage: AppMeta = \{[\s\S]*?\n\};/)?.[0];
  assert.ok(block);
  assert.equal(sha(block), receipt.expectedBlockSHA256);
  const reverted = source
    .replace('    // 2026-11-13: visible Google Play About dialogs agree in KR/JP/US; iOS observation is unchanged.\n', '')
    .replace("android: { version: '1.4.1', updated: '2026-11-04', checkedAt: '2026-11-13' }", "android: { version: '1.3.1', updated: '2026-11-01', checkedAt: '2026-11-02' }");
  assert.equal(sha(reverted), receipt.originalAppsFileSHA256);
});

test('Voyage metadata readability is scoped, content-versioned and does not shrink or hide text', () => {
  const css = read('../public/styles-voyage-release-version.css');
  assert.equal(sha(css), receipt.cssSHA256);
  assert.match(css, /\.app-page--word-voyage \.app-rel-line\s*\{\s*color: var\(--text-secondary\)/);
  assert.match(css, /html\[data-theme="light"\] \.app-page--word-voyage \.app-rel-ver/);
  assert.match(css, /\.voyage-release-since-date\s*\{\s*display: inline-block;\s*white-space: nowrap/);
  assert.doesNotMatch(css, /font-size|overflow|scale|display:\s*none/);
  let landing = beforeReleaseSync('src/components/AppLanding.astro',read('../src/components/AppLanding.astro'));
  for (const delta of receipt.landingSourceDeltas) {
    assert.equal(landing.split(delta.new).length - 1, 1);
    landing = landing.replace(delta.new, delta.old);
  }
  assert.equal(sha(landing), receipt.originalLandingSHA256);
});

test('only Voyage receives its dated release stylesheet in every site language', () => {
  const url = `/styles-voyage-release-version.css?v=${receipt.cssSHA256.slice(0,12)}`;
  for (const lang of ['en','ko','ja']) for (const app of Object.values(apps)) {
    const html = read(`../dist/${lang}/apps/${app.slug}/index.html`);
    assert.equal(html.includes(url), app.slug === 'pipi-word-voyage', `${lang}/${app.slug}`);
  }
});

for (const lang of ['en','ko','ja']) test(`${lang}: current Android and prior iOS labels stay separate; old submitted images are not relabeled`, () => {
  const html = read(`../dist/${lang}/apps/pipi-word-voyage/index.html`);
  assert.ok(html.includes(`v${currentIOS('pipi-word-voyage').version}`));
  assert.doesNotMatch(html, /iOS v1\.3\.1/);
  assert.ok(html.includes(`datetime="${expectedRelease('pipi-word-voyage','ios').updated}"`));
  assert.ok(html.includes('iOS 1.3.1 (34)'));
  assert.match(html, /datetime="2026-07-13" class="voyage-release-since-date"/);
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(m => JSON.parse(m[1]));
  const app = schemas.find(s => s['@type'] === 'SoftwareApplication');
  assert.ok(app);
  assert.equal(app.softwareVersion, currentIOS('pipi-word-voyage').version);
  assert.equal(app.dateModified, expectedRelease('pipi-word-voyage','ios').updated);
  const home = read(`../dist/${lang}/index.html`);
  assert.ok(home.includes(`v${currentIOS('pipi-word-voyage').version}`));
  assert.match(home, /datetime="2026-11-16"/);
});
