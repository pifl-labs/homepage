import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/data/apps.ts', import.meta.url), 'utf8');
const draw = source.split('const draw: AppMeta = {')[1]?.split('// 낱말항해')[0];
const ko = draw?.split('    ko: {')[1]?.split('    ja: {')[0];
const expected = '사진 위 그리기는 AI 변환 횟수를 쓰지 않는 무료 기능입니다. Android의 23종 무료 필터는 기기 안에서 처리해요. 필터 사진 저장 후 광고가 표시될 수 있고, AI 변환은 별도로 사진을 서버로 보냅니다.';

test('Korean Draw free-start card preserves four-card hierarchy and exact scope', () => {
  assert.ok(ko);
  assert.ok(ko.includes(`title: 'AI 없이 사진에 바로 색칠', desc: '${expected}'`));
  const features = ko.split('      features: [')[1].split('      ],')[0];
  assert.equal((features.match(/icon:/g) ?? []).length, 4);
  assert.ok(features.includes('드로잉 중 광고 없음'));
  assert.equal(source.split(expected).length - 1, 1);
});

test('Android filter is not advertised as a new release, no ads, or wholly local AI', () => {
  assert.match(expected, /Android의 23종 무료 필터는 기기 안에서 처리/);
  assert.match(expected, /사진 저장 후 광고가 표시될 수/);
  assert.match(expected, /AI 변환은 별도로 사진을 서버로/);
  assert.doesNotMatch(expected, /신규|새 기능|완전 무료|광고 없음|정보 수집 없음|프롬프트|4장 인쇄/);
  assert.match(draw, /android: 'https:\/\/play.google.com\/store\/apps\/details\?id=com\.pifl\.pipi\.draw'/);
  assert.match(ko, /AI 변환은 하루 2회 무료/);
});
