import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import icons from '../src/data/app-icons.json' with { type: 'json' };
import { appIconSrc } from '../src/data/app-icons.mjs';

test('seven approved icons have source-versioned URLs and exact asset hashes', () => {
  assert.equal(Object.keys(icons).length, 7);
  for (const [slug, icon] of Object.entries(icons)) {
    assert.equal(icon.file, `icon-${icon.sourceSha256.slice(0, 12)}.webp`);
    assert.equal(appIconSrc(slug), `/assets/apps/${slug}/${icon.file}`);
    const bytes = readFileSync(new URL(`../public${appIconSrc(slug)}`, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), icon.webpSha256);
    assert.equal(bytes.subarray(8, 12).toString(), 'WEBP');
  }
});
test('unchanged icons retain their existing asset URLs', () => {
  for (const slug of ['pipi-hello', 'dialogos'])
    assert.equal(appIconSrc(slug), `/assets/apps/${slug}/icon.webp`);
});
test('Korean Bridge uses the mascot-free store icon, not the retired parrot artwork', () => {
  assert.equal(appIconSrc('pipi-bridge'), '/assets/apps/pipi-bridge/icon-049149375a2e.webp');
  const retired = readFileSync(new URL('../public/assets/apps/pipi-bridge/icon.webp', import.meta.url));
  assert.notEqual(createHash('sha256').update(retired).digest('hex'), icons['pipi-bridge'].webpSha256);
});
test('every icon surface uses the shared resolver', () => {
  for (const path of ['components/AppCatalog.astro', 'components/FleetLog.astro', 'components/AppLanding.astro', 'pages/go/tiktok.astro']) {
    const source = readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf8');
    assert.ok(source.includes('appIconSrc('), path);
    assert.ok(!source.includes('/icon.webp'), path);
  }
});
