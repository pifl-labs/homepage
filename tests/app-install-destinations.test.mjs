import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { appList } from '../src/data/apps.ts';

function schema(html) {
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)]
    .filter(([, attrs]) => /type="application\/ld\+json"/.test(attrs))
    .map(([, , body]) => JSON.parse(body));
  const matches = scripts.filter((value) => value['@type'] === 'SoftwareApplication');
  assert.equal(matches.length, 1);
  return matches[0];
}

for (const locale of ['ko', 'ja', 'en']) {
  test(`${locale}: every live app exposes exactly its existing platform installation URLs`, () => {
    for (const app of appList.filter((app) => app.status === 'live')) {
      const html = readFileSync(new URL(`../dist/${locale}/apps/${app.slug}/index.html`, import.meta.url), 'utf8');
      const data = schema(html);
      assert.deepEqual(data.installUrl, [app.stores.ios, app.stores.android].filter(Boolean), app.slug);
      assert.equal(Object.hasOwn(data, 'downloadUrl'), false, 'store pages are not binary download URLs');
      for (const url of data.installUrl) {
        const host = new URL(url).hostname;
        assert.ok(['apps.apple.com', 'play.google.com'].includes(host));
        assert.ok(html.includes(`data-store-link="${url}"`), 'metadata destination must already be visible');
      }
    }
  });

  test(`${locale}: Android-only apps do not omit Play or invent iOS`, () => {
    for (const slug of ['pipi-tide', 'kkachi', 'pipi-spend']) {
      const app = appList.find((app) => app.slug === slug);
      const data = schema(readFileSync(new URL(`../dist/${locale}/apps/${slug}/index.html`, import.meta.url), 'utf8'));
      assert.deepEqual(data.installUrl, [app.stores.android]);
      assert.equal(data.operatingSystem, 'Android');
    }
  });

  test(`${locale}: unreleased pages cannot advertise any store installation or download`, () => {
    for (const app of appList.filter((app) => app.status === 'soon')) {
      const data = schema(readFileSync(new URL(`../dist/${locale}/apps/${app.slug}/index.html`, import.meta.url), 'utf8'));
      for (const key of ['installUrl', 'downloadUrl', 'offers', 'operatingSystem']) {
        assert.equal(Object.hasOwn(data, key), false, `${app.slug}: ${key}`);
      }
    }
  });
}
