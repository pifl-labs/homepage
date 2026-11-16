import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { apps } from '../src/data/apps.ts';

// Dialogos 1.1.0 (owner's decision 2026-11-15): Epicurus and Nietzsche join, so the landing names the philosophers
// in chronological order instead of counting them, and drops "ancient"/"Stoic" wording that is no longer true.
// The English store name "Dialogos: Stoic Dialogues" (app.name) is the store listing and is not part of this copy.
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const names = {
  ko: ['소크라테스', '에피쿠로스', '세네카', '에픽테토스', '마르쿠스 아우렐리우스', '니체'],
  ja: ['ソクラテス', 'エピクロス', 'セネカ', 'エピクテトス', 'マルクス・アウレリウス', 'ニーチェ'],
  en: ['Socrates', 'Epicurus', 'Seneca', 'Epictetus', 'Marcus Aurelius', 'Nietzsche'],
};
const zarathustra = { ko: '차라투스트라는 이렇게 말했다', ja: 'ツァラトゥストラはこう言った', en: 'Thus Spoke Zarathustra' };
const stale = /고대|古代|ancient|네 명|네 현자|四人|four sages|Stoic|스토아|ストア/i;

const inOrder = (text, list) => {
  let from = 0;
  for (const n of list) {
    const i = text.indexOf(n, from);
    if (i < 0) return false;
    from = i + n.length;
  }
  return true;
};

for (const lang of ['ko', 'ja', 'en']) {
  const c = apps.dialogos.content[lang];

  test(`Dialogos ${lang} landing copy has no count, "ancient" or Stoic-only wording`, () => {
    assert.doesNotMatch(JSON.stringify(c), stale);
  });

  test(`Dialogos ${lang} landing names the philosophers in chronological order`, () => {
    assert.ok(inOrder(c.lede, names[lang]), `${lang}: lede`);
    assert.ok(inOrder(c.metaDesc, names[lang]), `${lang}: metaDesc`);
    assert.ok(c.features[0].desc.includes(zarathustra[lang]), `${lang}: Nietzsche's work`);
  });

  test(`Dialogos ${lang} built landing page carries the new copy`, () => {
    const html = read(`dist/${lang}/apps/dialogos/index.html`);
    assert.ok(html.includes(c.lede), `${lang}: lede not rendered`);
    assert.doesNotMatch(html, /고대의 현자|古代の賢者|ancient sages|Four sages|네 명의 현자|四人の賢者/);
  });
}

// The home catalog card (src/data/app-catalog.ts) follows the same rule: the philosophers by name, in order, no count.
const catalogSrc = read('src/data/app-catalog.ts');
const catalog = runInNewContext(catalogSrc.slice(catalogSrc.indexOf('export const catalogCopy')).replace(/export const catalogCopy: [^=]+=/, 'const copy =') + '\ncopy');
const count = /네 철학자|여섯 철학자|네 명|여섯 명|[0-9]人の|四人|六人|\b(four|six|[0-9]) (philosophers|sages)/i;

for (const lang of ['ko', 'ja', 'en']) {
  const card = catalog.dialogos[lang];

  test(`Dialogos ${lang} catalog card names the philosophers in order, with no count or "ancient"`, () => {
    assert.doesNotMatch(card, stale);
    assert.doesNotMatch(card, count);
    assert.ok(inOrder(card, names[lang]), `${lang}: card`);
  });

  test(`Dialogos ${lang} built home catalog shows the new card and none of the old`, () => {
    const html = read(`dist/${lang}/index.html`);
    assert.ok(html.includes(card), `${lang}: card not rendered`);
    assert.doesNotMatch(html, /네 철학자의 관점|4人の哲学者の視点|with four philosophers/);
  });
}
