import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { appList, appName, storeAppName } from '../src/data/apps.ts';

// Every app on the homepage against the 2026-11-02 public observation (docs/release/homepage-app-audit-20261102.json).
// Public store responses decide availability, names and versions; console state never makes an app "live".
const receipt = JSON.parse(readFileSync(new URL('../docs/release/homepage-app-audit-20261102.json', import.meta.url), 'utf8'));
const current = receipt.apps;
// Later evidence updates only this platform; the dated baseline receipt remains immutable.
const laterLogIOS = JSON.parse(readFileSync(new URL('../docs/release/log-ios-public-20261106.json', import.meta.url), 'utf8'));
const laterBridgeIOS = JSON.parse(readFileSync(new URL('../docs/release/bridge-ios-public-20261111.json', import.meta.url), 'utf8'));
const laterVoyageAndroid = JSON.parse(readFileSync(new URL('../docs/release/voyage-android-public-20261113.json', import.meta.url), 'utf8'));
const laterVoyageIOS = JSON.parse(readFileSync(new URL('../docs/release/voyage-ios-public-20261113.json', import.meta.url), 'utf8'));

const langs = ['ko', 'ja', 'en'];
const country = { ko: 'kr', ja: 'jp', en: 'us' };
const packages = { 'pipi-focus': 'focus', 'pipi-draw': 'draw', 'pipi-word-voyage': 'wordvoyage', 'pipi-hello': 'hello', 'pipi-words': 'words', 'pipi-dday': 'dday', 'pipi-log': 'log', dialogos: 'thus', 'pipi-bridge': 'bridge', 'pipi-tide': 'tide', 'pipi-sudoku': 'sudoku', kkachi: 'kkachi', 'pipi-sky': 'sky', 'pipi-legion': 'spike' };

test('the dated receipt preserves fourteen observed products; the later Spend entry has separate evidence', () => {
  assert.equal(current.length, 14);
  assert.deepEqual(new Set([...current.map(a=>a.slug),'pipi-spend']), new Set(appList.map(a=>a.slug)));
  assert.equal(appList.length,15);
  for (const seen of current) {
    assert.equal(seen.observedAt, receipt.observedAt);
    assert.deepEqual(Object.keys(seen.android).sort(), [...langs].sort(), `${seen.slug}: three Play locales`);
    for (const lang of langs) {
      assert.equal(seen.iosLookup[lang].country, country[lang]);
      assert.ok(seen.iosLookup[lang].resultCount > 0, `${seen.slug}/${lang}: the batch lookup returned results`);
      assert.equal(seen.iosLookup[lang].found, Boolean(seen.ios), `${seen.slug}/${lang}: presence is recorded, not inferred`);
      if (seen.ios) {
        const r = seen.ios[lang];
        assert.match(r.trackViewUrl, new RegExp(`^https://apps\\.apple\\.com/${country[lang]}/app/.+/id${r.trackId}\\?`));
        assert.equal(r.sellerName, 'PiFl Labs Co., Ltd.');
        assert.equal(r.bundleId, `com.pifl.pipi.${packages[seen.slug]}`);
      }
      const ld = seen.android[lang].jsonLd;
      if (ld) {
        const url = new URL(ld.url);
        assert.equal(url.searchParams.get('id'), `com.pifl.pipi.${packages[seen.slug]}`);
        assert.equal(url.searchParams.get('hl'), lang);
        assert.equal(ld.author.name, 'PiFl Labs');
      }
    }
  }
});
const playDay = (text) => new Date(`${text} UTC`).toISOString().slice(0, 10);

for (const app of appList.filter(a=>current.some(s=>s.slug===a.slug))) {
  const seen = current.find((a) => a.slug === app.slug);
  const iosLive = Boolean(seen.ios);
  const androidLive = langs.every((l) => seen.android[l]?.jsonLd);

  test(`${app.slug}: availability and store links follow the public listings`, () => {
    assert.equal(app.status, iosLive || androidLive ? 'live' : 'soon');
    assert.equal(Boolean(app.stores.ios), iosLive);
    assert.equal(Boolean(app.stores.android), androidLive);
    if (iosLive) assert.equal(app.stores.ios.match(/\/id(\d+)$/)?.[1], String(seen.ios.en.trackId));
    if (androidLive) assert.equal(new URL(app.stores.android).searchParams.get('id'), new URL(seen.android.en.jsonLd.url).searchParams.get('id'));
  });

  test(`${app.slug}: names in every language match the store that is live`, () => {
    for (const lang of langs) {
      if (iosLive) assert.equal(storeAppName(app, 'ios', lang), seen.ios[lang].trackName, `${lang} iOS`);
      if (androidLive) assert.equal(storeAppName(app, 'android', lang), seen.android[lang].jsonLd.name, `${lang} Android`);
      const primary = iosLive ? seen.ios[lang].trackName : androidLive ? seen.android[lang].jsonLd.name : null;
      if (primary) assert.equal(appName(app, lang), primary, `${lang} display name`);
    }
  });

  test(`${app.slug}: release versions and dates come from each platform's own observation`, () => {
    if (iosLive) {
      const versions = new Set(langs.map((l) => seen.ios[l].version));
      assert.equal(versions.size, 1, 'KR/JP/US agree');
      const laterReceipt = app.slug === 'pipi-log' ? laterLogIOS : app.slug === 'pipi-bridge' ? laterBridgeIOS : app.slug === 'pipi-word-voyage' ? laterVoyageIOS : null;
      const later = laterReceipt?.apps.find(r=>r.lang==='en').app ?? null;
      const observed = later ?? seen.ios.en;
      assert.equal(app.release.ios.version, observed.version);
      assert.equal(app.release.ios.updated, observed.currentVersionReleaseDate.slice(0, 10));
      assert.equal(app.release.ios.checkedAt, later ? laterReceipt.observedAt : '2026-11-02');
    } else {
      assert.equal(app.release?.ios, undefined);
    }
    if (androidLive) {
      for (const lang of langs) {
        assert.equal(seen.android[lang].version, seen.android.en.version, `${lang} Play version agrees`);
        assert.equal(playDay(seen.android[lang].updatedDisplay.replace(/^(\d{4})\D+(\d{1,2})\D+(\d{1,2})\D*$/, (_, y, m, d) => `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m - 1]} ${d}, ${y}`)), playDay(seen.android.en.updatedDisplay), `${lang} Play date agrees`);
      }
      assert.deepEqual(seen.playProduction.map((r) => r.name), [seen.android.en.version], 'public listing matches production');
      // New public listing evidence does not invent a fresh private production-track observation.
      const newer = app.slug === 'pipi-word-voyage' ? laterVoyageAndroid : null;
      const observed = newer?.apps.find(r=>r.lang==='en').app ?? seen.android.en;
      assert.equal(app.release.android.version, observed.version);
      assert.equal(app.release.android.updated, playDay(observed.updatedDisplay));
      assert.equal(app.release.android.checkedAt, newer?.observedAt ?? '2026-11-02');
    } else {
      assert.equal(app.release?.android, undefined);
    }
    assert.equal(app.release?.checkedAt, iosLive || androidLive ? seen.observedAt : undefined, 'shared observation day');
  });
}

test('apps without a public listing use their App Store Connect registered name in each language', () => {
  const locale = { ko: 'ko', ja: 'ja', en: 'en-US' };
  // Legion registers only en-US, and that slot holds the Korean name: ja/en have no registered name to compare.
  const exceptions = { 'pipi-legion': ['ja', 'en'] };
  for (const app of appList.filter((a) => a.status === 'soon')) {
    const registered = current.find((a) => a.slug === app.slug).appStoreConnectNames?.[0]?.names;
    assert.ok(registered, `${app.slug}: registered names recorded`);
    for (const lang of langs) {
      const name = registered[locale[lang]] ?? registered['en-US'];
      if (exceptions[app.slug]?.includes(lang)) continue;
      assert.equal(appName(app, lang), name, `${app.slug}/${lang}`);
    }
  }
});

test('archive names over time are per language and end with that language\'s current name', async () => {
  const { archiveNames } = await import('../src/data/archive.mjs');
  for (const app of appList.filter(a=>current.some(s=>s.slug===a.slug))) {
    for (const lang of langs) {
      const list = archiveNames[app.slug][lang];
      assert.ok(Array.isArray(list) && list.length, `${app.slug}/${lang}: list`);
      assert.equal(list.at(-1), appName(app, lang), `${app.slug}/${lang}: ends with the current name`);
      assert.equal(new Set(list).size, list.length, `${app.slug}/${lang}: no repeats`);
    }
  }
  const html = readFileSync(new URL('../dist/ko/archive/index.html', import.meta.url), 'utf8');
  assert.ok(html.includes('<li>PiPi Focus: 해적 포모도로</li><li>집중항해: 포모도로 타이머</li>'), 'ko archive shows Korean store names');
  assert.ok(!html.includes('<li>Pomodoro at Sea: Focus Timer</li>'), 'ko archive does not list the English-only name');
});

test('dated unlisted accounts remain unpublished unless separate later public evidence exists', () => {
  assert.deepEqual(receipt.accountAppsWithoutPublicListing.map((e) => e.bundleId).sort(), ['com.pifl.pipi.bp', 'com.pifl.pipi.drill', 'com.pifl.pipi.habit', 'com.pifl.pipi.spend']);
  for (const extra of receipt.accountAppsWithoutPublicListing) {
    assert.equal(extra.iosPublic, false, extra.bundleId);
    assert.deepEqual(Object.values(extra.playPublicStatus), [404, 404, 404], extra.bundleId);
    if(extra.bundleId==='com.pifl.pipi.spend'){
      const later=JSON.parse(readFileSync(new URL('../docs/release/spend-android-public-20261105.json',import.meta.url),'utf8'));
      assert.equal(later.apps.length,3);assert.ok(later.apps.every(x=>x.status===200&&new URL(x.url).searchParams.get('id')===extra.bundleId));
      assert.equal(appList.find(a=>a.slug==='pipi-spend').stores.ios,undefined);
      assert.equal(new URL(appList.find(a=>a.slug==='pipi-spend').stores.android).searchParams.get('id'),extra.bundleId);
    }else assert.equal(appList.some((a) => a.stores.android?.endsWith(`id=${extra.bundleId}`)), false);
  }
});
