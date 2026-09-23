import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/data/apps.ts', import.meta.url), 'utf8');
const bridge = source.split('const bridge: AppMeta = {')[1].split('\n};')[0];

test('Bridge exposes both verified public store destinations', () => {
  assert.match(bridge, /status: 'live'/);
  assert.match(bridge, /https:\/\/apps.apple.com\/app\/id6801205183/);
  assert.match(bridge, /https:\/\/play.google.com\/store\/apps\/details\?id=com.pifl.pipi.bridge/);
});

test('Bridge locale CTAs no longer promise a future release', () => {
  assert.doesNotMatch(bridge, /출항 준비|준비가 끝나면|出航の準備|仕上がったら|Still fitting out|When it is ready/);
  for (const locale of ['ko', 'ja', 'en']) assert.match(bridge, new RegExp(`${locale}: \\{`));
});

test('live Bridge appears before upcoming products in the home catalog', () => {
  const list = source.match(/export const appList: AppMeta\[\] = \[([^\]]+)\]/)?.[1];
  assert.ok(list);
  assert.ok(list.indexOf('bridge') >= 0 && list.indexOf('dialogos') >= 0);
  assert.ok(list.indexOf('bridge') < list.indexOf('dialogos'));
});
