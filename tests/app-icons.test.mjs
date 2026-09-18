import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import icons from '../src/data/app-icons.json' with { type: 'json' };
import { appIconSrc } from '../src/data/app-icons.mjs';

test('six approved icons have source-versioned URLs and exact asset hashes', () => {
  assert.equal(Object.keys(icons).length, 6);
  for (const [slug, icon] of Object.entries(icons)) {
    assert.equal(icon.file, `icon-${icon.sourceSha256.slice(0, 12)}.webp`);
    assert.equal(appIconSrc(slug), `/assets/apps/${slug}/${icon.file}`);
    const bytes = readFileSync(new URL(`../public${appIconSrc(slug)}`, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), icon.webpSha256);
    assert.equal(bytes.subarray(8, 12).toString(), 'WEBP');
  }
});
test('unchanged icons retain their existing asset URLs', () => {
  for (const slug of ['pipi-hello', 'pipi-bridge', 'dialogos'])
    assert.equal(appIconSrc(slug), `/assets/apps/${slug}/icon.webp`);
});
test('every icon surface uses the shared resolver', () => {
  for (const path of ['components/AppCatalog.astro', 'components/FleetLog.astro', 'components/AppLanding.astro', 'pages/go/tiktok.astro']) {
    const source = readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf8');
    assert.ok(source.includes('appIconSrc('), path);
    assert.ok(!source.includes('/icon.webp'), path);
  }
});
