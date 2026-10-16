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
const expected = receipt.lookup.us;

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
  assert.equal(focus.release.ios.updated, receipt.updatedUTC);
  assert.notEqual(receipt.updatedUTC, receipt.observedKSTDay);
});

test('only the freshly checked iOS platform gets the new dated observation', () => {
  assert.equal(focus.release.ios.checkedAt, receipt.observedKSTDay);
  assert.equal(focus.release.checkedAt, receipt.previousCommonObservationPreserved);
});

test('an iOS update neither fabricates Android parity nor changes the first launch or destinations', () => {
  assert.equal(focus.release.android, undefined);
  assert.equal(focus.release.since, '2026-05-15');
  assert.equal(focus.stores.ios, 'https://apps.apple.com/app/pipi-focus-pirate-pomodoro/id6762258878');
  assert.equal(focus.stores.android, 'https://play.google.com/store/apps/details?id=com.pifl.pipi.focus');
});

for (const lang of ['ko', 'ja', 'en']) {
  const detail = new URL(`../dist/${lang}/apps/pipi-focus/index.html`, import.meta.url);
  const home = new URL(`../dist/${lang}/index.html`, import.meta.url);
  test(`${lang}: built landing, catalog and fleet use the verified iOS-only version and date`, { skip: !existsSync(detail) || !existsSync(home) }, () => {
    const html = readFileSync(detail, 'utf8');
    const catalog = readFileSync(home, 'utf8');
    const release = html.match(/class="app-rel-line"[^>]*>(.*?)<\/p>/s)?.[1];
    assert.ok(release?.includes('iOS v1.1.0'));
    assert.ok(release.includes('datetime="2026-10-15"'));
    assert.doesNotMatch(release, /Android v|v1\.0\.16/);
    const schemas = value => [...value.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)].map(m => JSON.parse(m[1]));
    const app = schemas(html).find(s => s['@type'] === 'SoftwareApplication');
    const item = schemas(catalog).find(s => s['@type'] === 'ItemList').itemListElement.map(e => e.item).find(i => i.url.endsWith('/pipi-focus/'));
    for (const data of [app, item]) {
      assert.equal(data.dateModified, '2026-10-15');
      assert.equal(data.softwareVersion, undefined, 'no unverified shared iOS/Android version');
    }
    const rows = [...catalog.matchAll(/<li class="fleet-row">(.*?)<\/li>/gs)].map(m => m[1]);
    assert.ok(rows[0].includes(`href="/${lang}/apps/pipi-focus/"`), 'latest verified update sorts first');
    assert.ok(rows[0].includes('v1.1.0') && rows[0].includes('datetime="2026-10-15"'));
    const observation = catalog.match(/class="fleet-note"[^>]*>(.*?)<\/p>/s)?.[1];
    assert.ok(observation?.includes('datetime="2026-09-21"') && observation.includes('datetime="2026-10-16"'));
  });
}

for (const lang of ['ko', 'ja', 'en']) {
  const detail = new URL(`../dist/${lang}/apps/pipi-focus/index.html`, import.meta.url);
  test(`${lang}: Focus keeps the first-launch separator with its text without changing other apps`, { skip: !existsSync(detail) }, () => {
    const html = readFileSync(detail, 'utf8');
    const release = html.match(/class="app-rel-line"[^>]*>(.*?)<\/p>/s)?.[1];
    const group = release?.match(/<span class="app-rel-since-group"[^>]*>(.*?)<\/span>\s*<\/span>/s)?.[1];
    assert.ok(group, 'the separator and first-launch text share one flex item');
    assert.match(group, /class="app-rel-sep"[^>]*aria-hidden="true"[^>]*>·<\/span>\s+<span/);
    assert.match(group, /2026(?:\.05\.15|年|.*May 15)|May 15, 2026/);
    assert.match(group, /class="app-rel-since-date" style="white-space:\s*nowrap;?"/, 'only the short fixed date is atomic, not the label or release line');
    const otherRoot = new URL(`../dist/${lang}/apps/`, import.meta.url);
    for (const entry of readdirSync(otherRoot, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name === 'pipi-focus') continue;
      const file = new URL(`${entry.name}/index.html`, otherRoot);
      if (!existsSync(file)) continue;
      assert.doesNotMatch(readFileSync(file, 'utf8'), /app-rel-since-group/, `${entry.name} retains its existing release markup`);
    }
  });
}
