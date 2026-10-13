import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

// 한칸씩 스도쿠 방침·지원 페이지의 빌드 결과(dist/)를 검사한다. npm run build 뒤에 실행해야 하며,
// 빌드 전이라 dist/ 가 없으면 이유를 남기고 건너뛴다.
const SITE = 'https://pifl-labs.com';
const PAGES = ['privacy', 'support'];
const LOCALES = ['ko', 'en', 'ja'];
const file = (prefix, page) => new URL(`../dist/${prefix ? `${prefix}/` : ''}apps/pipi-sudoku/${page}/index.html`, import.meta.url);
const skip = !existsSync(file('ko', 'privacy')) && 'dist/ 가 없습니다 — npm run build 뒤에 실행하세요';
const read = (prefix, page) => readFileSync(file(prefix, page), 'utf8');
const url = (locale, page) => `${SITE}/${locale}/apps/pipi-sudoku/${page}/`;
const canonical = html => html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
const alternates = html => Object.fromEntries(
  [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map(m => [m[1], m[2]]),
);

for (const page of PAGES) {
  for (const locale of LOCALES) {
    test(`${locale} ${page}: own canonical, ko/en/ja hreflang and x-default /ko/`, { skip }, () => {
      const html = read(locale, page);
      assert.match(html, new RegExp(`<html lang="${locale}"`));
      assert.equal(canonical(html), url(locale, page));
      assert.deepEqual(alternates(html), {
        en: url('en', page),
        ko: url('ko', page),
        ja: url('ja', page),
        'x-default': url('ko', page),
      });
    });
  }

  test(`unprefixed ${page} renders English with the /en/ canonical`, { skip }, () => {
    const html = read('', page);
    assert.match(html, /<html lang="en"/);
    assert.equal(canonical(html), url('en', page));
    assert.equal(alternates(html)['x-default'], url('ko', page));
  });

  test(`${page}: emails stay obfuscated, never a plain mailto`, { skip }, () => {
    for (const prefix of [...LOCALES, '']) {
      const html = read(prefix, page);
      assert.doesNotMatch(html, /mailto:/i);
      assert.match(html, /data-email-user="privacy" data-email-domain="pifl-labs\.com"/);
    }
  });
}

// 「数独」「SUDOKU」는 일본에서 니콜리의 등록상표다. 일본어판은 「ナンプレ」만 쓰고,
// 남는 "sudoku" 는 URL slug(pipi-sudoku)뿐이어야 한다.
test('Japanese pages never use 数独 or SUDOKU, and sudoku survives only in the slug', { skip }, () => {
  for (const page of PAGES) {
    const html = read('ja', page);
    assert.doesNotMatch(html, /数独|SUDOKU/);
    assert.doesNotMatch(html.replaceAll('pipi-sudoku', ''), /sudoku/i);
    assert.match(html, /ひとマスずつナンプレ/);
  }
});
