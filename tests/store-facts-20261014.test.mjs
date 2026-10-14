import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const source = readFileSync(new URL('../src/data/apps.ts', import.meta.url), 'utf8');
const receipt = JSON.parse(readFileSync(new URL('../docs/release/public-facts-20261014.json', import.meta.url), 'utf8'));
const variables = { 'com.pifl.pipi.dday': 'dday', 'com.pifl.pipi.draw': 'draw', 'com.pifl.pipi.bridge': 'bridge' };
const block = (v) => source.match(new RegExp(`const ${v}: AppMeta = \\{([\\s\\S]*?)\\n\\};`))?.[1];

for (const [bundle, v] of Object.entries(variables)) {
  test(`${bundle}: iOS version, UTC release day and observation day come from the 2026-10-14 receipt`, () => {
    const r = receipt.ios[bundle];
    assert.ok(block(v), `${v} block exists`);
    assert.ok(block(v).includes(`ios: { version: '${r.version}', updated: '${r.updatedUTC}', checkedAt: '${r.observedKSTDay}' }`));
    for (const bound of r.releaseBoundsUTC) assert.ok(bound.startsWith(r.updatedUTC), `${bundle}: every release bound stays on ${r.updatedUTC} UTC`);
  });
}

test('Until That Day: site names and both store names match the renamed public listings', () => {
  const b = block('dday');
  const ios = receipt.ios['com.pifl.pipi.dday'].iosNames;
  const android = receipt.android['com.pifl.pipi.dday'].androidNames;
  assert.match(b, new RegExp(`name: '${ios.en}'`));
  assert.ok(b.includes(`nameByLang: { ko: '${ios.ko}', ja: '${ios.ja}' }`));
  assert.ok(b.includes(`ios: { ko: '${ios.ko}', ja: '${ios.ja}', en: '${ios.en}' }`));
  assert.ok(b.includes(`android: { ko: '${android.ko}', ja: '${android.ja}', en: '${android.en}' }`));
  assert.match(b, /previousName: 'PiPi D-Day'/, 'former name stays searchable');
  assert.doesNotMatch(b, /D-Day Widget - Until That Day|디데이 카운트다운 위젯 - 그날까지|Dデイ カウントダウン ウィジェット/);
  assert.doesNotMatch(b, /featuresTitle: '[^']*PiPi D-Day/);
});

test('Observations that did not show an Android version do not fabricate one', () => {
  assert.equal(receipt.android['com.pifl.pipi.dday'].version, 'UNVERIFIED');
  for (const v of Object.values(variables)) assert.doesNotMatch(block(v), /android: \{ version:/);
});

test('Footer links every locale to the matching PiPi Worlds home in a new tab', () => {
  const footer = readFileSync(new URL('../src/components/Footer.astro', import.meta.url), 'utf8');
  assert.ok(footer.includes('<a href={`https://pipi-worlds.com/${lang}/`} target="_blank" rel="noopener">{t.footWorlds} ↗</a>'));
  const ui = readFileSync(new URL('../src/i18n/ui.ts', import.meta.url), 'utf8');
  assert.equal((ui.match(/footWorlds: 'PiPi Worlds'/g) ?? []).length, 3);
});
