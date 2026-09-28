import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const claims = {
  ko: ['무료 설치', '<span class="pricing-paid-phrase">일부 앱에서 인앱 결제</span>'],
  en: ['Free install', 'paid&nbsp;options in&nbsp;some&nbsp;apps'],
  ja: ['インストール無料', '<span class="pricing-paid-phrase">一部アプリ内課金</span>'],
};

for (const [lang, [freeInstall, paidOption]] of Object.entries(claims)) {
  test(`${lang} homepage says installation is free but some apps have paid options`, () => {
    const source = readFileSync(new URL(`../src/pages/${lang}/index.astro`, import.meta.url), 'utf8');
    const hero = source.match(/<div class="hero-meta reveal d4">([\s\S]*?)<\/div>/)?.[1];
    assert.ok(hero, 'homepage hero metadata exists');
    assert.ok(hero.includes(`<span class="hero-pricing"><b>${freeInstall}</b> · ${paidOption}</span>`));
    assert.doesNotMatch(hero, /계정 없이|no account|アカウント不要/);
  });
}

test('the paid-option disclosure uses the readable secondary text token', () => {
  const css = readFileSync(new URL('../public/styles-stickerbook.css', import.meta.url), 'utf8');
  assert.match(css, /\.hero-meta \.hero-pricing\s*\{\s*color:\s*var\(--text-secondary\)/);
  assert.match(css, /\.hero-meta \.pricing-paid-phrase\s*\{\s*white-space:\s*nowrap/);
  assert.match(css, /\.hero-meta \.hero-maintained-label\s*\{\s*white-space:\s*nowrap/);
});
