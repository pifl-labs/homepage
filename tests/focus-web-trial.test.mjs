import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { focusWebTrialFor } from '../src/data/focus-web-trial.mjs';

const landing = readFileSync(new URL('../src/components/AppLanding.astro', import.meta.url), 'utf8');
const css = readFileSync(new URL('../public/styles-app-landing.css', import.meta.url), 'utf8');

for (const lang of ['ko', 'ja', 'en']) {
  test(`${lang} Focus trial links directly to the matching existing web timer`, () => {
    const trial = focusWebTrialFor({ slug: 'pipi-focus', status: 'live', lang });
    assert.equal(trial.href, `https://pipi-worlds.com/${lang}/pomodoro/`);
    assert.ok(trial.label.length > 0);
    assert.ok(trial.note.length > 0);
    assert.equal(new URL(trial.href).search, '');
  });
}

test('the trial remains separate from the app and states the transfer boundary in every locale', () => {
  const texts = {
    ko: ['별도 웹 체험', '설치·가입 없이', '기록과 보물은 앱으로 옮겨지지 않습니다.'],
    ja: ['別のWeb体験', 'インストール・登録不要', '記録や宝物はアプリへ引き継がれません。'],
    en: ['separate web preview', 'no install or sign-up', 'Sessions and treasures do not transfer to the app.'],
  };
  for (const [lang, facts] of Object.entries(texts)) {
    const { note } = focusWebTrialFor({ slug: 'pipi-focus', status: 'live', lang });
    for (const fact of facts) assert.ok(note.includes(fact), `${lang}: ${fact}`);
  }
});

test('no trial is added to another app, an unreleased app or an unsupported locale', () => {
  for (const slug of ['pipi-words', 'pipi-word-voyage', 'pipi-sudoku', 'pipi-sky', undefined]) {
    assert.equal(focusWebTrialFor({ slug, status: 'live', lang: 'ko' }), null);
  }
  for (const status of ['soon', undefined]) {
    assert.equal(focusWebTrialFor({ slug: 'pipi-focus', status, lang: 'ko' }), null);
  }
  for (const lang of ['fr', 'constructor', '__proto__', undefined]) {
    assert.equal(focusWebTrialFor({ slug: 'pipi-focus', status: 'live', lang }), null);
  }
});

test('the optional link follows existing store and price information without replacing it', () => {
  const trial = landing.indexOf('{focusWebTrial && <div');
  assert.ok(trial > landing.indexOf('<div class="app-stores"'));
  assert.ok(trial > landing.indexOf('{c.downloadNote &&'));
  assert.ok(trial < landing.indexOf('{rel && ('));
  assert.match(landing, /focusWebTrialFor\(\{ slug: app\.slug, status: app\.status, lang \}\)/);
  assert.match(landing, /href=\{focusWebTrial\.href\} hreflang=\{lang\}>\{focusWebTrial\.label\}<\/a>\s*<p>\{focusWebTrial\.note\}<\/p>/);
  assert.equal((landing.match(/data-web-trial="focus"/g) ?? []).length, 1);
});

test('only Focus loads its content-versioned focus-safe text-group stylesheet', () => {
  const source = readFileSync(new URL('../public/styles-focus-web-trial.css', import.meta.url));
  const hash = createHash('sha256').update(source).digest('hex').slice(0, 12);
  assert.ok(landing.includes(`...(focusWebTrial ? ['/styles-focus-web-trial.css?v=${hash}'] : [])`));
  const style = source.toString();
  assert.match(style, /\.app-page \[data-web-trial="focus"\] \{[^}]*box-sizing: border-box;[^}]*max-width: 100%;[^}]*padding-inline: \.25rem;/);
  assert.match(style, /\.app-page \[data-web-trial="focus"\] p \{\s*margin: \.4em 0 0;/);
  assert.match(style, /\.app-page:lang\(ja\) \[data-web-trial="focus"\] p \{\s*text-wrap: balance;/);
  assert.doesNotMatch(style, /overflow:\s*hidden|outline:\s*(?:none|0)|white-space:\s*nowrap|font-size/);
});

test('the existing secondary link style retains reflow and visible keyboard focus', () => {
  assert.match(css, /\.app-bridge-resource-link \{[^}]*max-width: 100%/);
  assert.match(css, /\.app-bridge-resource-link:focus-visible \{[^}]*outline: 2px solid/);
  assert.match(css, /:lang\(ko\) \.app-download-note \{ word-break: keep-all; \}/);
});
