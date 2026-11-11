import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { verifiedPublicAppCount, publicPortfolioEvidence } from '../src/data/public-portfolio.ts';

const copy = {
  ko: {
    title: 'PiFl Labs — 스도쿠·민화·가계부와 일상 앱',
    description: `스도쿠·한국 민화·가계부부터 언어 공부와 일상 기록까지. PiFl Labs의 공개 앱 ${verifiedPublicAppCount}개를 살펴보세요. 무료 설치이며 지원 플랫폼·광고·결제는 앱마다 다릅니다.`,
  },
  ja: {
    title: 'PiFl Labs — 数独・民画・家計簿と毎日のアプリ',
    description: `数独、韓国の民画、家計簿から語学や日々の記録まで。PiFl Labsが公開中の${verifiedPublicAppCount}本のアプリをご紹介。無料でインストールできます。対応プラットフォーム・広告・アプリ内課金はアプリごとに異なります。`,
  },
  en: {
    title: 'PiFl Labs — Sudoku, folk art & everyday apps',
    description: `Explore ${verifiedPublicAppCount} PiFl Labs apps: Sudoku, Korean folk art, spending logs and more. Free to install; platforms, ads and purchases vary by app.`,
  },
};
const decode = s => s.replace(/&(?:amp|#38);/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

for (const [lang, expected] of Object.entries(copy)) {
  test(`${lang}: search and social metadata explain current app genres and offer boundaries`, () => {
    const html = readFileSync(new URL(`../dist/${lang}/index.html`, import.meta.url), 'utf8');
    const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1];
    assert.ok(head);
    const titles = [...head.matchAll(/<title>([\s\S]*?)<\/title>/g)];
    assert.equal(titles.length, 1);
    assert.equal(decode(titles[0][1]), expected.title);
    for (const [attribute, key, value] of [
      ['name', 'description', expected.description],
      ['property', 'og:title', expected.title],
      ['property', 'og:description', expected.description],
      ['name', 'twitter:title', expected.title],
      ['name', 'twitter:description', expected.description],
    ]) {
      const rows = [...head.matchAll(new RegExp(`<meta ${attribute}="${key}" content="([^"]*)"`, 'g'))];
      assert.equal(rows.length, 1, key);
      assert.equal(decode(rows[0][1]), value, key);
    }
    assert.ok(expected.title.length < 60);
    assert.ok(expected.description.length < 180);
    assert.match(head, new RegExp(`<link rel="canonical" href="https://pifl-labs\\.com/${lang}/"`));
    assert.match(head, /content="https:\/\/pifl-labs\.com\/pifl-ship-og\.jpg"/);
    assert.doesNotMatch(expected.description, /all features free|all apps.*(?:iOS|Android)|広告なし|모든 앱.*무료|install growth/i);
  });
}

test('featured metadata genres refer to current public products, without changing the roster', () => {
  for (const suffix of ['sudoku', 'kkachi', 'spend']) {
    assert.ok(publicPortfolioEvidence.packages.includes(`com.pifl.pipi.${suffix}`));
  }
  assert.equal(publicPortfolioEvidence.platform, 'Android');
  assert.equal(publicPortfolioEvidence.market, 'KR');
});
