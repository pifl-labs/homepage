import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { voyageWebTrialFor } from '../src/data/voyage-web-trial.mjs';

const landing = readFileSync(new URL('../src/components/AppLanding.astro', import.meta.url), 'utf8');
const css = readFileSync(new URL('../public/styles-app-landing.css', import.meta.url), 'utf8');

for (const lang of ['ko', 'en']) {
  test(`${lang} Voyage trial links directly to the matching Korean word-link examples`, () => {
    const trial = voyageWebTrialFor({ slug: 'pipi-word-voyage', status: 'live', lang });
    assert.equal(trial.href, `https://pipi-worlds.com/${lang}/learn/korean-word-link/`);
    assert.equal(trial.label, { ko: '무료 글자 연결 해보기', en: 'Try free Korean word links' }[lang]);
    assert.equal(new URL(trial.href).search, '');
  });
}

test('the examples state the three-round scope, Hangul audience, no install and no transfer', () => {
  const notes = {
    ko: '한글을 읽는 분을 위한 별도 웹 예시 3판입니다. 설치·가입 없이 이용하며, 결과는 앱으로 옮겨지지 않습니다.',
    en: 'Three separate examples for Hangul readers, with English instructions. No install or sign-up; answers do not transfer to the app.',
  };
  for (const [lang, note] of Object.entries(notes)) {
    assert.equal(voyageWebTrialFor({ slug: 'pipi-word-voyage', status: 'live', lang }).note, note);
  }
});

test('Japanese has no trial or fallback to another language', () => {
  assert.equal(voyageWebTrialFor({ slug: 'pipi-word-voyage', status: 'live', lang: 'ja' }), null);
});

test('no Voyage trial is added to another app, an unreleased app or an unsupported locale', () => {
  for (const slug of ['pipi-focus', 'pipi-words', 'pipi-sudoku', 'pipi-sky', undefined]) {
    assert.equal(voyageWebTrialFor({ slug, status: 'live', lang: 'ko' }), null);
  }
  for (const status of ['soon', undefined]) {
    assert.equal(voyageWebTrialFor({ slug: 'pipi-word-voyage', status, lang: 'ko' }), null);
  }
  for (const lang of ['fr', 'constructor', '__proto__', undefined]) {
    assert.equal(voyageWebTrialFor({ slug: 'pipi-word-voyage', status: 'live', lang }), null);
  }
});

test('the secondary link follows store information and keeps the boundary in a separate paragraph', () => {
  const trial = landing.indexOf('{voyageWebTrial && <div');
  assert.ok(trial > landing.indexOf('<div class="app-stores"'));
  assert.ok(trial > landing.indexOf('{c.downloadNote &&'));
  assert.ok(trial < landing.indexOf('{rel && ('));
  assert.match(landing, /voyageWebTrialFor\(\{ slug: app\.slug, status: app\.status, lang \}\)/);
  assert.match(landing, /href=\{voyageWebTrial\.href\} hreflang=\{lang\}>\{voyageWebTrial\.label\}<\/a>\s*<p>\{voyageWebTrial\.note\}<\/p>/);
  assert.equal((landing.match(/data-web-trial="voyage"/g) ?? []).length, 1);
});

test('only the supported Voyage locales load the content-versioned focus-safe text group', () => {
  const source = readFileSync(new URL('../public/styles-voyage-web-trial.css', import.meta.url));
  const hash = createHash('sha256').update(source).digest('hex').slice(0, 12);
  assert.ok(landing.includes(`...(voyageWebTrial ? ['/styles-voyage-web-trial.css?v=${hash}'] : [])`));
  const style = source.toString();
  assert.match(style, /\.app-page \[data-web-trial="voyage"\] \{[^}]*box-sizing: border-box;[^}]*max-width: 100%;[^}]*padding-inline: \.25rem;/);
  assert.match(style, /\.app-page \[data-web-trial="voyage"\] p \{\s*margin: \.4em 0 0;/);
  assert.doesNotMatch(style, /overflow:\s*hidden|outline:\s*(?:none|0)|white-space:\s*nowrap|font-size/);
});

test('the existing secondary link style retains reflow and visible keyboard focus', () => {
  assert.match(css, /\.app-bridge-resource-link \{[^}]*max-width: 100%/);
  assert.match(css, /\.app-bridge-resource-link:focus-visible \{[^}]*outline: 2px solid/);
  assert.match(css, /:lang\(ko\) \.app-download-note \{ word-break: keep-all; \}/);
});
