import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../public/styles-stickerbook.css', import.meta.url), 'utf8');

// Real 375px browser regression: the about card previously forced a 509px page.
test('about grid children can shrink below Japanese keep-all min-content width', () => {
  assert.match(css, /\.about-wrap\s*>\s*\*\s*\{[^}]*min-width:\s*0\s*;/);
});

// Real Words JA heading previously painted 428px wide on a 375px page.
test('Japanese headings have a normal fallback, phrase wrapping, and a narrow-width escape', () => {
  const rules = [...css.matchAll(/html\[lang\^="ja"\]\s+h2\.section-title\s*\{([^}]+)\}/g)];
  assert.ok(rules.length > 0);
  assert.match(rules.at(-1)[1], /word-break:\s*normal\s*;\s*word-break:\s*auto-phrase\s*;\s*overflow-wrap:\s*anywhere\s*;/);
  assert.doesNotMatch(rules.at(-1)[1], /overflow(?:-x)?:\s*(?:hidden|clip)/);
});
