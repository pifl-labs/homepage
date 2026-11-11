import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { wordsWebTrialFor } from '../src/data/words-web-trial.mjs';

const landing = readFileSync(new URL('../src/components/AppLanding.astro', import.meta.url), 'utf8');
const css = readFileSync(new URL('../public/styles-app-landing.css', import.meta.url), 'utf8');

for (const lang of ['ko', 'ja', 'en']) {
  test(`${lang} Words trial links directly to the matching existing vocabulary sample`, () => {
    const trial = wordsWebTrialFor({ slug: 'pipi-words', status: 'live', lang });
    assert.equal(trial.href, `https://pipi-worlds.com/${lang}/vocab/`);
    assert.equal(trial.label, { ko: '무료 단어 카드·퀴즈 열기', ja: '無料カード・クイズ', en: 'Try free vocabulary cards and quiz' }[lang]);
    assert.ok(trial.note.length > 0);
    assert.equal(new URL(trial.href).search, '');
  });
}

test('the free web sample is separate from the app and does not transfer answers or progress', () => {
  const texts = {
    ko: ['별도 웹 샘플', '설치·가입 없는', '답안·진도는 앱으로 옮겨지지 않습니다.'],
    ja: ['Webサンプル', 'インストール・登録不要', '回答や進み具合はアプリに引き継がれません。'],
    en: ['separate web sample', 'no install or sign-up', 'Answers and progress do not transfer to the app.'],
  };
  for (const [lang, facts] of Object.entries(texts)) {
    const { note } = wordsWebTrialFor({ slug: 'pipi-words', status: 'live', lang });
    for (const fact of facts) assert.ok(note.includes(fact), `${lang}: ${fact}`);
  }
});

test('no Words trial is added to another app, an unreleased app or an unsupported locale', () => {
  for (const slug of ['pipi-focus', 'pipi-word-voyage', 'pipi-sudoku', 'pipi-sky', undefined]) {
    assert.equal(wordsWebTrialFor({ slug, status: 'live', lang: 'ko' }), null);
  }
  for (const status of ['soon', undefined]) {
    assert.equal(wordsWebTrialFor({ slug: 'pipi-words', status, lang: 'ko' }), null);
  }
  for (const lang of ['fr', 'constructor', '__proto__', undefined]) {
    assert.equal(wordsWebTrialFor({ slug: 'pipi-words', status: 'live', lang }), null);
  }
});

test('the secondary link follows store information and keeps the boundary in a separate paragraph', () => {
  const trial = landing.indexOf('{wordsWebTrial && <div');
  assert.ok(trial > landing.indexOf('<div class="app-stores"'));
  assert.ok(trial > landing.indexOf('{c.downloadNote &&'));
  assert.ok(trial < landing.indexOf('{rel && ('));
  assert.match(landing, /wordsWebTrialFor\(\{ slug: app\.slug, status: app\.status, lang \}\)/);
  assert.match(landing, /href=\{wordsWebTrial\.href\} hreflang=\{lang\}>\{wordsWebTrial\.label\}<\/a>\s*<p>\{wordsWebTrial\.note\}<\/p>/);
  assert.equal((landing.match(/data-web-trial="words"/g) ?? []).length, 1);
});

test('only Words loads its content-versioned focus-safe text-group stylesheet', () => {
  const source = readFileSync(new URL('../public/styles-words-web-trial.css', import.meta.url));
  const hash = createHash('sha256').update(source).digest('hex').slice(0, 12);
  assert.ok(landing.includes(`...(wordsWebTrial ? ['/styles-words-web-trial.css?v=${hash}'] : [])`));
  const style = source.toString();
  assert.match(style, /\.app-page \[data-web-trial="words"\] \{[^}]*box-sizing: border-box;[^}]*max-width: 100%;[^}]*padding-inline: \.25rem;/);
  assert.match(style, /\.app-page \[data-web-trial="words"\] p \{\s*margin: \.4em 0 0;/);
  assert.match(style, /\.app-page:lang\(ja\) \[data-web-trial="words"\] p,\s*\.app-page:lang\(ja\) \[data-web-trial="words"\] a \{\s*text-wrap: balance;/);
  assert.doesNotMatch(style, /overflow:\s*hidden|outline:\s*(?:none|0)|white-space:\s*nowrap|font-size/);
});

test('the existing secondary link style retains reflow and visible keyboard focus', () => {
  assert.match(css, /\.app-bridge-resource-link \{[^}]*max-width: 100%/);
  assert.match(css, /\.app-bridge-resource-link:focus-visible \{[^}]*outline: 2px solid/);
  assert.match(css, /:lang\(ko\) \.app-download-note \{ word-break: keep-all; \}/);
});
