/** Explicit, short reading units; not a general Japanese tokenizer.
 * Unknown text remains ordinary prose. Every source code point is retained.
 * ICU segmentation is deliberately not used as a linguistic authority.
 */
const readingUnits = {
  name: ['ポモドーロ', 'タイマー', 'ことばの航海'],
  category: ['気分日記', '学校の準備', 'クリエイティブ', 'カウントダウン', 'ライフスタイル'],
  tagline: ['向き合う'],
  title: ['しよう'],
  lede: ['確認できます。', 'アプリで。', '端末の中で。'],
  storeLabel: ['Google Play', 'App Store', 'で入手'],
};

export function japaneseReadingParts(text, kind) {
  const units = readingUnits[kind] || [];
  const parts = [];
  let cursor = 0;
  while (cursor < text.length) {
    const next = units.map(unit => ({ unit, index: text.indexOf(unit, cursor) }))
      .filter(match => match.index >= 0)
      .sort((a, b) => a.index - b.index || b.unit.length - a.unit.length)[0];
    if (!next) { parts.push({ text: text.slice(cursor), keepWhole: false }); break; }
    if (next.index > cursor) parts.push({ text: text.slice(cursor, next.index), keepWhole: false });
    parts.push({ text: next.unit, keepWhole: true });
    cursor = next.index + next.unit.length;
  }
  return parts;
}

export function japaneseAppNameParts(name) {
  return name.split('：').flatMap((part, i, parts) => {
    const result = japaneseReadingParts(part, 'name');
    const suffix = i < parts.length - 1 ? '：' : '';
    // Keep punctuation with its preceding segment, including empty colon fields.
    if (result.length) result[result.length - 1].text += suffix;
    else if (suffix) result.push({ text: suffix, keepWhole: false });
    return result;
  });
}
