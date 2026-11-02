import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const receipt = JSON.parse(readFileSync(new URL('../docs/release/public-facts-20261016-focus.json', import.meta.url), 'utf8'));
const source = readFileSync(new URL('../src/data/apps.ts', import.meta.url), 'utf8');
const start = source.indexOf('const focus: AppMeta = ');
const end = source.indexOf('\nconst hello: AppMeta', start);
assert.ok(start >= 0 && end > start);
const focus = runInNewContext(source.slice(start, end).replace('const focus: AppMeta = ', 'const focus = ') + '\nfocus');
const current = JSON.parse(readFileSync(new URL('../docs/release/homepage-app-audit-20261102.json', import.meta.url), 'utf8')).apps.find(a => a.slug === 'pipi-focus');
const expected = current.ios.ko;

test('the public receipt identifies the same current Focus iOS release in KR, JP and US', () => {
  assert.deepEqual(Object.keys(receipt.lookup).sort(), ['jp', 'kr', 'us']);
  for (const [country, r] of Object.entries(receipt.lookup)) {
    assert.equal(new URL(r.source).hostname, 'itunes.apple.com');
    assert.equal(new URL(r.source).searchParams.get('country'), country);
    assert.equal(new URL(r.source).searchParams.get('id'), '6762258878');
    assert.equal(r.trackId, 6762258878);
    assert.equal(r.bundleId, 'com.pifl.pipi.focus');
    assert.equal(r.sellerName, 'PiFl Labs Co., Ltd.');
    assert.equal(r.version, '1.1.0');
    assert.equal(r.currentVersionReleaseDate, '2026-10-15T19:05:28Z');
  }
});

test('Focus displays the actually available iOS version, not the previous release', () => {
  assert.equal(focus.release.ios.version, expected.version);
});

test('the update day remains the official UTC release day, not the KST observation day', () => {
  assert.equal(focus.release.ios.updated, expected.currentVersionReleaseDate.slice(0, 10));
  assert.equal(focus.release.ios.updated, expected.currentVersionReleaseDate.slice(0, 10));
  assert.notEqual(receipt.updatedUTC, receipt.observedKSTDay);
});

test('both platforms carry the 2026-11-02 observation they were re-checked on', () => {
  for (const lang of ['ko', 'ja', 'en']) assert.equal(current.ios[lang].version, expected.version, `${lang} storefront agrees`);
  assert.equal(focus.release.ios.checkedAt, '2026-11-02');
  assert.equal(focus.release.android.checkedAt, '2026-11-02');
  assert.equal(focus.release.checkedAt, '2026-11-02');
});

test('Android parity comes from the public Play listing and production track, without changing the first launch or destinations', () => {
  assert.equal(focus.release.android.version, current.android.en.version);
  assert.deepEqual(current.playProduction.map(r => r.name), [focus.release.android.version]);
  assert.equal(focus.release.since, undefined, 'review/submission date must not masquerade as first release');
  assert.equal(focus.stores.ios, 'https://apps.apple.com/app/pipi-focus-pirate-pomodoro/id6762258878');
  assert.equal(focus.stores.android, 'https://play.google.com/store/apps/details?id=com.pifl.pipi.focus');
});

for (const lang of ['ko', 'ja', 'en']) {
  const detail = new URL(`../dist/${lang}/apps/pipi-focus/index.html`, import.meta.url);
  const home = new URL(`../dist/${lang}/index.html`, import.meta.url);
  test(`${lang}: built landing, catalog and fleet use the verified shared version and date`, { skip: !existsSync(detail) || !existsSync(home) }, () => {
    const html = readFileSync(detail, 'utf8');
    const catalog = readFileSync(home, 'utf8');
    const release = html.match(/class="app-rel-line"[^>]*>(.*?)<\/p>/s)?.[1];
    assert.ok(release?.includes('v1.2.3'));
    assert.ok(release.includes('datetime="2026-10-24"'));
    assert.doesNotMatch(release, /iOS v|Android v|v1\.2\.0|v1\.0\.16/);
    const schemas = value => [...value.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)].map(m => JSON.parse(m[1]));
    const app = schemas(html).find(s => s['@type'] === 'SoftwareApplication');
    const item = schemas(catalog).find(s => s['@type'] === 'ItemList').itemListElement.map(e => e.item).find(i => i.url.endsWith('/pipi-focus/'));
    for (const data of [app, item]) {
      assert.equal(data.dateModified, '2026-10-24');
      assert.equal(data.softwareVersion, '1.2.3', 'both stores verified at the same version');
    }
    const rows = [...catalog.matchAll(/<li class="fleet-row">(.*?)<\/li>/gs)].map(m => m[1]);
    const focusRow = rows.find(row => row.includes(`href="/${lang}/apps/pipi-focus/"`));
    assert.ok(rows[0].includes('2026-11-02'), 'latest verified update sorts first');
    assert.ok(focusRow.includes('v1.2.3') && focusRow.includes('datetime="2026-10-24"'));
    const observation = catalog.match(/class="fleet-note"[^>]*>(.*?)<\/p>/s)?.[1];
    assert.ok(observation?.includes('datetime="2026-11-02"'));
  });
}

for (const lang of ['ko', 'ja', 'en']) {
  const detail = new URL(`../dist/${lang}/apps/pipi-focus/index.html`, import.meta.url);
  test(`${lang}: Focus omits an unverified launch date without changing other apps`, { skip: !existsSync(detail) }, () => {
    const html = readFileSync(detail, 'utf8');
    const release = html.match(/class="app-rel-line"[^>]*>(.*?)<\/p>/s)?.[1];
    assert.doesNotMatch(release, /app-rel-since-group|2026-05-15/, 'unverified first launch is omitted');
    const otherRoot = new URL(`../dist/${lang}/apps/`, import.meta.url);
    for (const entry of readdirSync(otherRoot, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name === 'pipi-focus') continue;
      const file = new URL(`${entry.name}/index.html`, otherRoot);
      if (!existsSync(file)) continue;
      assert.doesNotMatch(readFileSync(file, 'utf8'), /app-rel-since-group/, `${entry.name} retains its existing release markup`);
    }
  });
}
