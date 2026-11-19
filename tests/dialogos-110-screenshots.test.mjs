import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { archiveMedia } from '../src/data/archive.mjs';

// Dialogos 1.1.0 (20) was submitted on 2026-11-16 (public since 2026-11-17 KST).
// The receipt is a read-only App Store Connect listing: the committed pipi-thus store set has the
// checksums App Store Connect reports, and every WebP here is derived from those exact files.
// The current record (1.1.1 (21), submitted 2026-11-19) is checked in dialogos-111-screenshots.test.mjs;
// this file keeps the 2026-11-16 receipt and the WebP files from it that are still in use.
const root = new URL('../', import.meta.url);
const bytes = p => readFileSync(new URL(p, root));
const json = p => JSON.parse(bytes(p).toString('utf8'));
const sha = b => createHash('sha256').update(b).digest('hex');
const receipt = json('docs/release/dialogos-110-listing-media-20261116.json');
// The symposium images from this set were replaced by the 2026-11-19 set and deleted (no page refers to them).
const retired = json('docs/release/dialogos-111-listing-media-20261119.json').retired;
const asset = p => bytes(`public${p}`);
// Lossy WebP (VP8): the frame header carries the pixel size.
const dims = b => {
  assert.equal(b.toString('ascii', 0, 4), 'RIFF');
  assert.equal(b.toString('ascii', 8, 16), 'WEBPVP8 ');
  assert.equal(b.readUIntBE(23, 3), 0x9d012a);
  return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
};

test('receipt (2026-11-16): 1.1.0 (20) was in review, listing images are the committed store set', () => {
  assert.deepEqual(
    { version: receipt.listingMedia.version, build: receipt.listingMedia.build, state: receipt.listingMedia.state },
    { version: '1.1.0', build: '20', state: 'WAITING_FOR_REVIEW' },
  );
  for (const locale of ['ko', 'ja', 'en-US']) {
    const rows = receipt.screenshots[locale];
    assert.deepEqual(rows.map(r => r.fileName), ['iphone_0_home.png', 'iphone_1_chat_marcus.png', 'iphone_2_symposium.png', 'iphone_3_mentor_sheet.png']);
    for (const r of rows) {
      assert.equal(r.localMd5, r.sourceFileChecksum, `${locale} ${r.fileName}`);
      assert.deepEqual([r.width, r.height], [1320, 2868]);
      assert.match(r.templateUrl, /^https:\/\/is\d-ssl\.mzstatic\.com\/image\/thumb\/[^/]+\/\{w\}x\{h\}bb\.\{f\}$/);
    }
  }
  assert.deepEqual(receipt.listingMedia.firstThree, receipt.screenshots['en-US'].slice(0, 3).map(r => r.templateUrl));
});

test('every derived WebP still in use is the recorded bytes at the recorded size; replaced ones are gone', () => {
  assert.equal(Object.keys(receipt.derived).length, 15);
  assert.equal(Object.keys(retired).length, 4);
  for (const [path, row] of Object.entries(receipt.derived)) {
    if (retired[path]) {
      assert.equal(retired[path], row.sha256, `retired record matches the 2026-11-16 bytes: ${path}`);
      assert.equal(existsSync(new URL(`public${path}`, root)), false, `replaced image deleted: ${path}`);
      continue;
    }
    const b = asset(path);
    assert.equal(sha(b), row.sha256, path);
    assert.deepEqual(dims(b), row.size, path);
    assert.deepEqual(row.size, path.includes('/submission/') ? [331, 719] : [540, 1169], path);
  }
});

test('dated archive images and the 2026-10-23 store previews keep their recorded bytes', () => {
  const recorded = Object.fromEntries(json('docs/verification/2026-10-23-archive/asset-hashes.json').map(a => [a.path, a.sha256]));
  const { oldShot, newShot } = archiveMedia.dialogos;
  assert.equal(newShot, '/assets/apps/dialogos/submission/20261116-1.webp');
  assert.equal(archiveMedia.dialogos.screenObservedAt, '2026-11-16');
  assert.equal(oldShot, '/assets/apps/dialogos/en/home.webp');
  for (const p of [oldShot, '/assets/apps/dialogos/submission/20261023-1.webp']) assert.equal(sha(asset(p)), recorded[p], p);
  const preview = json('docs/release/homepage-app-audit-20261023.json').find(a => a.slug === 'dialogos').previewSha256;
  for (const lang of ['ko', 'ja', 'en']) assert.equal(sha(asset(`/assets/apps/dialogos/${lang}/store-preview.webp`)), preview[lang], lang);
});

test('no built page points at a missing Dialogos image', () => {
  const pages = [];
  const walk = dir => { for (const n of readdirSync(dir)) { const p = `${dir}/${n}`; statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') && pages.push(p); } };
  walk(new URL('dist', root).pathname);
  let seen = 0;
  for (const p of pages) for (const [m] of readFileSync(p, 'utf8').matchAll(/\/assets\/apps\/dialogos\/[^"'\s)]+\.webp/g)) {
    seen += 1;
    assert.ok(existsSync(new URL(`public${m}`, root)), `${p}: ${m}`);
  }
  assert.ok(seen > 0);
});
