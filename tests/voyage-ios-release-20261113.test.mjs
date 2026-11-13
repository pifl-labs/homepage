import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { apps, displayVersion, releaseVersionLabel } from '../src/data/apps.ts';

const read = p => readFileSync(new URL(p, import.meta.url), 'utf8');
const sha = s => createHash('sha256').update(s).digest('hex');
const receipt = JSON.parse(read('../docs/release/voyage-ios-public-20261113.json'));
const voyage = apps['pipi-word-voyage'];

test('Voyage iOS update is established by distinct public KR/JP/US evidence, not Console readiness', () => {
  assert.equal(receipt.observedAt, '2026-11-13');
  assert.deepEqual(receipt.apps.map(r=>r.country).sort(), ['jp','kr','us']);
  for (const row of receipt.apps) {
    const u = new URL(row.url);
    assert.equal(u.hostname, 'itunes.apple.com');
    assert.equal(u.searchParams.get('country'), row.country);
    assert.equal(row.HTTP, 200);
    assert.equal(new Date(Date.parse(row.measuredAt)+9*60*60*1000).toISOString().slice(0,10), receipt.observedAt, 'same KST observation day; UTC date is not relabelled');
    assert.match(row.rawSourceSHA256, /^[a-f0-9]{64}$/);
    assert.equal(row.app.trackId, 6788949612);
    assert.equal(row.app.bundleId, 'com.pifl.pipi.wordvoyage');
    assert.equal(row.app.sellerName, 'PiFl Labs Co., Ltd.');
    assert.equal(row.app.version, '1.4.1');
    assert.equal(row.app.currentVersionReleaseDate, '2026-11-04T17:28:31Z');
  }
  assert.equal(receipt.apps.find(r=>r.country==='us').reuseSameDayPublicObservation, true);
});

test('only the verified iOS observation changes, not Android, shared baseline or old screenshot provenance', () => {
  assert.deepEqual(voyage.release.ios, {version:'1.4.1',updated:'2026-11-04',checkedAt:'2026-11-13'});
  assert.deepEqual(voyage.release.android, receipt.unchangedAndroidObservation);
  assert.equal(voyage.release.since, receipt.firstLaunchRetained);
  assert.equal(voyage.release.checkedAt, receipt.originalSharedObservation);
  assert.equal(displayVersion(voyage), '1.4.1');
  assert.equal(releaseVersionLabel(voyage), 'v1.4.1');
  assert.equal(sha(read('../docs/release/voyage-android-public-20261113.json')), receipt.priorAndroidReceiptSHA256);
});

test('reversing the exact dated delta restores the whole baseline and every other app stays byte-identical', () => {
  let projected = read('../src/data/apps.ts');
  assert.equal(sha(projected), receipt.expectedAppsFileSHA256);
  assert.equal(sha(projected.match(/const wordVoyage: AppMeta = \{[\s\S]*?\n\};/)[0]), receipt.expectedBlockSHA256);
  for (const [name, hash] of Object.entries(receipt.unchangedOtherAppBlocksSHA256)) {
    assert.equal(sha(projected.match(new RegExp(`const ${name}: AppMeta = \\{[\\s\\S]*?\\n\\};`))[0]), hash, name);
  }
  for (const delta of receipt.sourceDeltas) {
    assert.equal(projected.split(delta.new).length-1, 1);
    projected = projected.replace(delta.new, delta.old);
  }
  assert.equal(sha(projected), receipt.originalAppsFileSHA256);
});

for (const lang of ['ko','ja','en']) test(`${lang}: exact app and home show current common version without relabelling historical screenshots`, () => {
  const html = read(`../dist/${lang}/apps/pipi-word-voyage/index.html`);
  const release = html.match(/class="app-rel-line"[^>]*>(.*?)<\/p>/s)?.[1];
  assert.ok(release);
  assert.match(release, />v1\.4\.1<\/span>/);
  assert.doesNotMatch(release, /iOS v1\.3\.1|Android v/);
  assert.match(release, /datetime="2026-11-04"/);
  assert.ok(html.includes('iOS 1.3.1 (34)'), 'historical submitted media label is retained');
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(m=>JSON.parse(m[1]));
  const app = schemas.find(s=>s['@type']==='SoftwareApplication');
  assert.equal(app.softwareVersion, '1.4.1');
  assert.equal(app.operatingSystem, 'iOS, Android');
  const home = read(`../dist/${lang}/index.html`);
  const row = [...home.matchAll(/<li class="fleet-row">(.*?)<\/li>/gs)].map(m=>m[1]).find(s=>s.includes(`href="/${lang}/apps/pipi-word-voyage/"`));
  assert.ok(row);
  assert.match(row, /v1\.4\.1/);
  assert.doesNotMatch(row, /iOS v1\.3\.1|Android v/);
  assert.match(row, /class="fleet-chip fleet-chip--solo"[^>]*style="color: var\(--text-primary\)"/, 'new shared-version text keeps the established readable foreground');
});

test('the small shared-version foreground correction is confined to Voyage, not global CSS', () => {
  const source = read('../src/components/FleetLog.astro');
  assert.match(source, /class="fleet-chip fleet-chip--solo" style=\{app\.slug === 'pipi-word-voyage' \? 'color: var\(--text-primary\)' : undefined\}/);
  for (const lang of ['ko','ja','en']) {
    const home = read(`../dist/${lang}/index.html`);
    const rows = [...home.matchAll(/<li class="fleet-row">(.*?)<\/li>/gs)].map(m=>m[1]);
    for (const row of rows.filter(s=>!s.includes(`/apps/pipi-word-voyage/`))) {
      assert.doesNotMatch(row, /class="fleet-chip fleet-chip--solo"[^>]*style="color: var\(--text-primary\)"/);
    }
  }
});
