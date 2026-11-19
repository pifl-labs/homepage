import {currentIOS,currentAndroid,androidDay,syncReceipt,beforeReleaseSync,expectedRelease} from './helpers/release-sync-20261116.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { apps, appList, displayVersion, releaseVersionLabel } from '../src/data/apps.ts';
import { createHash } from 'node:crypto';
const read = p => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const receipt = read('../docs/release/log-ios-public-20261106.json');
const log = apps['pipi-log'];

test('later Log iOS receipt identifies the same public app in all three markets', () => {
  assert.equal(receipt.observedAt, '2026-11-06');
  assert.deepEqual(receipt.apps.map(r=>r.country).sort(), ['jp','kr','us']);
  for (const row of receipt.apps) {
    assert.equal(row.HTTP, 200);
    assert.equal(row.app.trackId, 6770272665);
    assert.equal(row.app.bundleId, 'com.pifl.pipi.log');
    assert.equal(row.app.sellerName, 'PiFl Labs Co., Ltd.');
    assert.equal(row.app.version, '1.0.14');
    assert.equal(row.app.price, 0);
    assert.equal(row.app.currentVersionReleaseDate, '2026-11-04T17:21:03Z');
    const source = new URL(row.url);
    assert.equal(source.hostname, 'itunes.apple.com');
    assert.equal(source.searchParams.get('country'), row.country);
    assert.ok(source.searchParams.get('id').split(',').includes('6770272665'));
    assert.match(row.observedAt, /^2026-11-06T/);
  }
});

test('Log follows current platform receipts without rewriting shared history', () => {
  assert.deepEqual(log.release.ios, expectedRelease('pipi-log','ios'));
  assert.deepEqual(log.release.android, expectedRelease('pipi-log','android'));
  assert.equal(log.release.checkedAt, receipt.originalSharedObservation);
  assert.equal(log.release.since, receipt.originalSince);
  const old = read('../docs/release/homepage-app-audit-20261102.json').apps.find(a=>a.slug==='pipi-log');
  assert.ok(Object.values(old.ios).every(a=>a.version==='1.0.13'));
});

test('different public platform versions are labeled separately, never combined', () => {
  assert.equal(displayVersion(log), currentIOS('pipi-log').version);
  assert.equal(releaseVersionLabel(log), `v${currentIOS('pipi-log').version}`);
});

for (const lang of ['ko','ja','en']) test(`${lang}: built Log entry has current platform labels and retains archival screen scope`, () => {
  const html = readFileSync(new URL(`../dist/${lang}/apps/pipi-log/index.html`, import.meta.url), 'utf8');
  assert.ok(html.includes(`v${currentIOS('pipi-log').version}`));
  assert.ok(html.includes('iOS 1.0.13 (27)'), 'old submitted screenshot label is not upgraded');
  assert.ok(html.includes(`datetime="${expectedRelease('pipi-log','ios').updated}"`));
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
  const software = schemas.find(s=>s['@type']==='SoftwareApplication');
  assert.ok(software);
  assert.equal(software.softwareVersion, currentIOS('pipi-log').version, 'verified common version across platforms');
});

test('Log small release text uses the existing legible light token without changing size or overflow', () => {
  const css = readFileSync(new URL('../public/styles-log-release-version.css', import.meta.url), 'utf8');
  assert.match(css, /html\[data-theme="light"\] \.app-page--log \.app-rel-ver/);
  assert.match(css, /color: var\(--text-primary\)/);
  assert.doesNotMatch(css, /font-size|overflow|white-space|display: *none|transform|width/);
});

test('the content-versioned contrast CSS loads only on Log, not the other app landings', () => {
  const bytes = readFileSync(new URL('../public/styles-log-release-version.css', import.meta.url));
  const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 12);
  const url = `/styles-log-release-version.css?v=${hash}`;
  for (const lang of ['ko','ja','en']) for (const app of appList) {
    const html = readFileSync(new URL(`../dist/${lang}/apps/${app.slug}/index.html`, import.meta.url), 'utf8');
    assert.equal(html.includes(url), app.slug==='pipi-log', `${lang}/${app.slug}`);
  }
});

test('home links name the platform rather than relying on hidden decorative glyphs', () => {
  for (const lang of ['ko','ja','en']) {
    const html = readFileSync(new URL(`../dist/${lang}/index.html`, import.meta.url), 'utf8');
    const row = [...html.matchAll(/<article\b[^>]*class="fleet-card"[^>]*>(.*?)<\/article>/gs)].map(m=>m[1]).find(r=>r.includes(`href="/${lang}/apps/pipi-log/"`));
    assert.ok(row);
    assert.ok(row.includes(`v${currentIOS('pipi-log').version}`));
    assert.doesNotMatch(row, /Android v1\.0\.13/);
    assert.equal((row.match(/class="fleet-chip"/g)??[]).length, 2);
    assert.match(row,/iOS v1\.0\.15.*datetime="2026-11-17".*Android v1\.0\.15.*datetime="2026-11-16"/s);
  }
});

test('every changed non-common platform chip uses the existing readable foreground token', () => {
  // 2026-11-19: the release list moved into the home cards; the chip foreground is one CSS rule there.
  const css = readFileSync(new URL('../src/components/app-catalog.css', import.meta.url), 'utf8');
  assert.match(css, /\.fleet-card-platform \.fleet-chip \{ color: var\(--text-primary\);/);
  for (const lang of ['ko','ja','en']) {
    const html = readFileSync(new URL(`../dist/${lang}/index.html`, import.meta.url), 'utf8');
    const rows = [...html.matchAll(/<article\b[^>]*class="fleet-card"[^>]*>(.*?)<\/article>/gs)].map(m => m[1]);
    let count = 0;
    for (const row of rows) {
      if (!/class="fleet-chip"[^>]*>.*?(?:iOS|Android) v/.test(row)) continue;
      const chips = [...row.matchAll(/<span class="fleet-chip"([^>]*)>(.*?)<\/span>/gs)];
      assert.ok(chips.length > 0);
      for (const chip of chips) {
        assert.doesNotMatch(chip[1], /style=/);
        assert.match(chip[2], /(?:iOS|Android) v/);
        count++;
      }
    }
    assert.ok(count >= 2, lang);
  }
});
