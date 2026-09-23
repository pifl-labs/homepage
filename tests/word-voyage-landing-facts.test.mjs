import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const apps = readFileSync(new URL('../src/data/apps.ts', import.meta.url), 'utf8');
const wordVoyage = apps.match(/const wordVoyage: AppMeta = \{([\s\S]*?)\n\};\n\n\n\/\/ Korean Bridge/)?.[1];

test('Word Voyage landing is present and names match both public stores in all locales', () => {
  assert.ok(wordVoyage, 'Word Voyage app metadata must exist');
  assert.match(wordVoyage, /name: 'Hangul Voyage: Korean Puzzle'/);
  assert.match(wordVoyage, /nameByLang: \{ ko: '낱말항해: 한글 단어 퍼즐', ja: 'ハングル航海：韓国語の単語パズル' \}/);
  assert.match(wordVoyage, /ios: \{ version: '1\.0\.7', updated: '2026-09-23' \}/);
  assert.match(wordVoyage, /android: \{ version: '1\.0\.7', updated: '2026-09-23' \}/);
  assert.match(wordVoyage, /checkedAt: '2026-09-24'/);
});

test('Word Voyage landing promises only evidenced bonus-word logbook and network uses', () => {
  assert.ok(wordVoyage);
  for (const wrongClaim of [
    '표준국어대사전을 바탕으로 검증한 낱말만',
    '발견한 모든 낱말',
    '통신은 광고 표시에만',
    '標準国語大辞典で検証した単語だけ',
    '発見したすべての単語',
    '通信は広告表示にのみ使用',
    'Every word is validated',
    'Every word you discover',
    'network is only used to show ads',
  ]) {
    assert.doesNotMatch(wordVoyage, new RegExp(wrongClaim), wrongClaim);
  }
  assert.equal((wordVoyage.match(/보너스 낱말/g) ?? []).length >= 2, true);
  assert.equal((wordVoyage.match(/ボーナス単語/g) ?? []).length >= 2, true);
  assert.equal((wordVoyage.match(/bonus words/g) ?? []).length >= 2, true);
  assert.match(wordVoyage, /앱 개선용 사용 통계/);
  assert.match(wordVoyage, /利用統計/);
  assert.match(wordVoyage, /usage analytics/);
  for (const staleShot of ["file: 'home'", "file: 'logbook'"]) {
    assert.ok(!wordVoyage.includes(staleShot), `stale marketing screenshot must not be shown: ${staleShot}`);
  }
});
