#!/usr/bin/env node
/** Assert built store-transition copy and cross-platform release/identity contracts. No network. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const names = {
  ko: ['집중항해: 포모도로 타이머', 'PiPi Focus: 해적 포모도로', '기존 PiPi Focus'],
  ja: ['集中航海：ポモドーロタイマー', 'PiPi Focus: 海賊ポモドーロ', '旧名 PiPi Focus'],
  en: ['Pomodoro at Sea: Focus Timer', 'PiPi Focus: Pirate Pomodoro', 'Previously PiPi Focus'],
};
const unchanged = {
  'pipi-draw': ['PiPi Draw', 'PiPi Draw', 'PiPi Draw'],
  'pipi-words': ['PiPi Words', 'PiPi Words', 'PiPi Words'],
  'pipi-log': ['PiPi Log', 'PiPi Log', 'PiPi Log'],
  'pipi-dday': ['PiPi D-Day', 'PiPi D-Day', 'PiPi D-Day'],
  'pipi-hello': ['PiPi Hello', 'PiPi Hello', 'PiPi Hello'],
  'pipi-word-voyage': ['피피 낱말항해', 'ピピ ことばの航海', 'PiPi Word Voyage'],
};
function read(lang, page = '') { return readFileSync(join(dist, lang, page, 'index.html'), 'utf8'); }
function schemas(html) {
  return [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)].map(m => JSON.parse(m[1]));
}
function appSchema(html) { return schemas(html).find(s => s['@type'] === 'SoftwareApplication'); }
function notices(html) { return [...html.matchAll(/<p\b[^>]*class="app-store-name-note[^>]*>(.*?)<\/p>/gs)].map(m => m[1]); }
let checked = 0;
for (const [index, [lang, [name, appleName, alias]]] of Object.entries(names).entries()) {
  const home = read(lang);
  const detail = read(lang, 'apps/pipi-focus');
  const fleetNote = home.match(/class="fleet-note"[^>]*>(.*?)<\/p>/s)?.[1];
  assert.ok(fleetNote.includes(lang === 'en' ? 'Aug 23, 2026 – Sep 9, 2026' : '2026.08.23 – 2026.09.09'), `${lang}: mixed observation dates must not look all freshly verified`);
  const detailSchema = appSchema(detail);
  const homeItems = schemas(home).find(s => s['@type'] === 'ItemList').itemListElement.map(e => e.item);
  const focusItem = homeItems.find(a => a.url.endsWith('/pipi-focus/'));
  for (const item of [detailSchema, focusItem]) {
    assert.equal(item.name, name);
    assert.equal(item.alternateName, 'PiPi Focus');
    assert.ok(!Object.hasOwn(item, 'softwareVersion'), `${lang}: split versions must not pretend to be common`);
    assert.equal(item.dateModified, '2026-09-09');
    assert.equal(item.datePublished, '2026-05-15');
  }
  assert.ok(detail.includes(`<title>${name} —`), `${lang}: title`);
  assert.ok(detail.includes(alias) && home.includes(alias), `${lang}: discoverable old name`);
  assert.equal(notices(home).length, 1, `${lang}: only Focus has a home transition notice`);
  assert.equal(notices(detail).length, 2, `${lang}: both hero and final CTA disclose platform names`);
  for (const notice of [...notices(home), ...notices(detail)]) {
    assert.ok(notice.includes(`App Store: ${appleName}`));
    assert.ok(notice.includes(`Google Play: ${name}`));
    assert.ok(notice.includes('datetime="2026-09-09"'), `${lang}: frozen observation date`);
  }
  const release = detail.match(/class="app-rel-line"[^>]*>(.*?)<\/p>/s)?.[1];
  assert.ok(release.includes('iOS v1.0.13 · Android v1.0.14'), `${lang}: visible split versions`);
  assert.doesNotMatch(detail, /v1\.0\.11|<span class="app-rel-ver">v1\.0\.14/);
  const links = [...detail.matchAll(/<a\b[^>]*data-store-link="([^"]+)"[^>]*>/gs)];
  assert.equal(links.length, 4);
  for (const [i, match] of links.entries()) {
    assert.equal(match[1], i % 2 === 0 ? 'https://apps.apple.com/app/pipi-focus-pirate-pomodoro/id6762258878' : 'https://play.google.com/store/apps/details?id=com.pifl.pipi.focus');
    assert.ok(match[0].includes(i % 2 === 0 ? appleName : name), `${lang}: accessible destination name`);
  }
  assert.ok(detail.includes(`href="https://pifl-labs.com/${lang}/apps/pipi-focus/"`), `${lang}: canonical retained`);
  assert.ok(detail.includes('src="/assets/apps/pipi-focus/icon.webp"'), `${lang}: existing icon path retained`);
  for (const [slug, expectedNames] of Object.entries(unchanged)) {
    const html = read(lang, `apps/${slug}`);
    assert.equal(appSchema(html).name, expectedNames[index], `${lang}/${slug}: no premature rename`);
    assert.equal(notices(html).length, 0, `${lang}/${slug}: transition must not leak`);
  }
  // Existing split-version app: preserve the source snapshot without collapsing it to one version.
  const hello = read(lang, 'apps/pipi-hello');
  assert.ok(hello.includes('iOS v1.0.4 · Android v1.0.5'));
  assert.ok(!Object.hasOwn(appSchema(hello), 'softwareVersion'));
  assert.ok(!Object.hasOwn(homeItems.find(a => a.url.endsWith('/pipi-hello/')), 'softwareVersion'));
  // Equal-platform versions still carry their existing shared version.
  assert.equal(appSchema(read(lang, 'apps/pipi-draw')).softwareVersion, '1.0.8');
  checked++;
}
console.log(`PASS: ${checked} locales — Focus names/alias/dated notices, split/common versions, JSON-LD, immutable IDs/routes/icons, 6 other names preserved.`);
