import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const apps = readFileSync(new URL('../src/data/apps.ts', import.meta.url), 'utf8');
const landing = readFileSync(new URL('../src/components/AppLanding.astro', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../public/styles-app-landing.css', import.meta.url), 'utf8');
const dday = apps.split('const dday: AppMeta = {')[1]?.split('\n};')[0];

test('D-Day explains free entries, free widget skin, paid unlocks, and ads in all three locales', () => {
  assert.ok(dday, 'D-Day landing data must exist');
  assert.match(dday, /downloadNote: 'D-Day 5개와 기본 위젯 스킨 1종은 무료예요\. PiPi Pro를 한 번 구매하면 등록 제한이 사라지고 스킨 5종이 더 열려요\. 무료 버전에는 광고가 표시됩니다\.'/);
  assert.match(dday, /downloadNote: 'D-Dayは5件、基本ウィジェットスキン1種まで無料。PiPi Proを一度購入すると登録数が無制限になり、追加の5種も使えます。無料版には広告が表示されます。'/);
  assert.match(dday, /downloadNote: 'Five D-Days and one widget skin are free\. A one-time PiPi Pro purchase unlocks unlimited D-Days and five more skins, and removes ads\.'/);
  assert.equal((dday.match(/downloadNote:/g) ?? []).length, 3);
  assert.match(landing, /\{c\.downloadNote && <p class="app-download-note">\{c\.downloadNote\}<\/p>\}/);
});

test('D-Day screenshots and search excerpts do not imply all six skins are free', () => {
  assert.ok(dday);
  assert.match(dday, /기본 1종은 무료, 추가 5종은 PiPi Pro 구매 후 이용해요/);
  assert.match(dday, /基本1種は無料。ほかの5種はPiPi Proで利用できます/);
  assert.match(dday, /One free skin; five more with PiPi Pro/);
  assert.doesNotMatch(dday, /iOS · Android 무료\.|iOS · Android 無料。|Free on iOS & Android\./);
  assert.doesNotMatch(dday, /통신은 광고 표시에만|通信は広告表示にのみ使用|network is only used to show ads/);
  assert.match(styles, /:lang\(ja\) \.app-download-note \{ word-break: auto-phrase; \}/);
});
