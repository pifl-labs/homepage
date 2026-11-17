import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const get = p => readFileSync(new URL('../' + p, import.meta.url));
const base = 'public/assets/printables/first-hangul-shape-match-ja';
const pdf = get(base + '-a4.pdf');
const txt = get(base + '.txt').toString('utf8');
const license = get(base + '-OFL.txt').toString('utf8');
const readme = get('README.md').toString('utf8');

test('Japanese Hangul paper retains the exact visually reviewed A4 artifact', () => {
  assert.equal(pdf.length, 67211);
  assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
  assert.equal(createHash('sha256').update(pdf).digest('hex'), 'af5c3348ba1bf7ae91c12c987550da866d8a6ffa78c12148d468bc14ddfb3065');
});
test('Japanese companion has four original visual match rows and exact positions', () => {
  for (const row of ['가           나  라  가  다', '나           다  나  라  가', '다           다  가  나  라', '라           나  다  가  라']) assert.ok(txt.includes(row), row);
  assert.ok(txt.includes('答えは上から 3・2・1・4 番目'));
  for (const boundary of ['発音・書き順・書く練習・採点は扱いません', '印刷の字と手書きの形は異なります', '別の原本']) assert.ok(txt.includes(boundary));
});
test('free paper is not confused with the optional Japanese-market Korean app', () => {
  for (const s of ['ハングルの芽：子どもの韓国語', '最初の3島が無料', '年額の自動更新サブスクリプション', 'アプリ・登録・購入は必要ありません', 'https://play.google.com/store/apps/details?id=com.pifl.pipi.hello&hl=ja&gl=JP', '2026-11-13', 'Android1.1.0/更新2026-10-25']) assert.ok(txt.includes(s), s);
  for (const s of ['完全無料アプリ', '発音が身につく', '教師推奨', '広告なしだから通信しません']) assert.ok(!txt.includes(s), s);
});
test('rights and unverified educator, printing and outcome boundaries remain visible', () => {
  for (const s of ['PiFl Labsのオリジナル', 'AIによる文章・配置補助', '教育専門家の確認・実際の印刷確認は未実施', '学習効果は保証しません', '家庭・教室で無料印刷', '販売・他サイトへの転載はできません']) assert.ok(txt.includes(s), s);
  assert.equal((license.match(/SIL OPEN FONT LICENSE Version 1.1/g) || []).length, 2);
  for (const s of ['Noto', 'Nanum']) assert.ok(license.includes(s));
});
test('README exposes the exact free PDF, plain text and font license without a new UI route', () => {
  for (const ext of ['-a4.pdf', '.txt', '-OFL.txt']) assert.ok(readme.includes('https://pifl-labs.com/assets/printables/first-hangul-shape-match-ja' + ext));
  assert.ok(readme.includes('四つの形を見比べて指さす'));
  assert.ok(readme.includes('アプリ・登録・購入は不要'));
  assert.ok(readme.includes('教育専門家・実際の印刷での確認は未実施'));
});
