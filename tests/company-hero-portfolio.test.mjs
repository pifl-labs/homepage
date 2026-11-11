import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {publicPortfolioEvidence} from '../src/data/public-portfolio.ts';

const copy = {
  ko: '스도쿠와 민화, 가계부부터 언어 공부와 집중, 일상 기록까지. 지금 필요한 작은 앱을 골라 보세요.',
  ja: '数独・<wbr>韓国の民画・<wbr>家計簿から、<wbr>語学・集中・<wbr>日々の<wbr>記録まで。<wbr>いま使いたい<wbr>小さなアプリを<wbr>見つけて<wbr>ください。',
  en: 'Apps for Sudoku, Korean folk art, spending logs, language practice, focus and journaling. Find one for what you need today.',
};
const plain = s => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

for (const lang of ['ko', 'ja', 'en']) {
  test(`${lang}: first homepage paragraph reflects current public newcomers without platform or pricing promises`, () => {
    const source = readFileSync(new URL(`../src/pages/${lang}/index.astro`, import.meta.url), 'utf8');
    const built = readFileSync(new URL(`../dist/${lang}/index.html`, import.meta.url), 'utf8');
    const sourceLede = source.match(/<p class="hero-lede reveal d2" style="text-wrap: pretty">([\s\S]*?)<\/p>/)?.[1];
    const builtLede = built.match(/<p\b[^>]*class="hero-lede reveal d2"[^>]*>([\s\S]*?)<\/p>/)?.[1];
    assert.equal(sourceLede?.trim(), copy[lang]);
    assert.equal(plain(builtLede ?? ''), plain(copy[lang]));
    assert.equal(source.split(copy[lang]).length - 1, 1);
    assert.match(source, /<p class="hero-lede reveal d2" style="text-wrap: pretty">/);
    assert.doesNotMatch(copy[lang], /https?:|<a\b|<script|all.*(?:iOS|Android)|all features free|AI生成|학습 효과|치료/i);
    assert.match(source, /href="#apps"/);
  });
}

test('newcomer genres refer to verified public Android products, not internal tests', () => {
  for (const suffix of ['sudoku', 'kkachi', 'spend']) {
    assert.ok(publicPortfolioEvidence.packages.includes(`com.pifl.pipi.${suffix}`));
  }
  assert.equal(publicPortfolioEvidence.platform, 'Android');
  assert.ok(!publicPortfolioEvidence.packages.some(p => /sky|legion/.test(p)));
});

test('Korean in-app term stays together without changing or hiding the pricing statement', () => {
  const source = readFileSync(new URL('../src/pages/ko/index.astro', import.meta.url), 'utf8');
  const metadata = source.match(/<div class="hero-meta reveal d4">([\s\S]*?)<\/div>/)[1];
  assert.match(metadata, /<span><b>무료 설치<\/b> · 일부 앱에서 <span style="white-space: nowrap">인앱<\/span> 결제<\/span>/);
  assert.doesNotMatch(metadata, /font-size|scale\(|overflow|text-overflow/);
});
