import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const policy = read('src/components/pipi-bridge/PrivacyPolicy.astro');
const topics = JSON.parse(read('src/data/bridge-library-cards.json'));

const POLICY = {
  ko: ['시행일: 2026년 11월 18일 · 버전 1.3', '<h3>3. 이용 목적과 보관</h3>', '<h3>4. 제3자 제공과 국외 이전</h3>', '<strong>도서관·교실 공용 활동:</strong> 어른이 공용 활동을 시작하면'],
  en: ['Effective: November 18, 2026 · Version 1.3', '<h3>3. Purpose and retention</h3>', '<h3>4. Sharing and international transfer</h3>', '<strong>Library and classroom sessions:</strong> when a grown-up starts a shared session'],
  ja: ['施行日: 2026年11月18日 · バージョン 1.3', '<h3>3. 利用目的と保有期間</h3>', '<h3>4. 第三者提供と国外移転</h3>', '<strong>図書館・教室の共有セッション：</strong>大人が共有セッションを始めると'],
  zh: ['生效日期：2026年11月18日 · 版本 1.3', '<h3>3. 用途与保留</h3>', '<h3>4. 共享与跨境传输</h3>', '<strong>图书馆与课堂共用活动：</strong>成人开始共用活动后'],
  vi: ['Hiệu lực: 18 tháng 11, 2026 · Phiên bản 1.3', '<h3>3. Mục đích và thời gian lưu</h3>', '<h3>4. Chia sẻ và chuyển dữ liệu quốc tế</h3>', '<strong>Lượt dùng chung ở thư viện và lớp học:</strong> khi người lớn bắt đầu'],
};

for (const [lang, [date, section3, section4, paragraph]] of Object.entries(POLICY)) {
  test(`${lang} policy: version 1.3 adds the shared-session paragraph inside section 3`, () => {
    assert.equal(policy.split(date).length - 1, 1, date);
    assert.equal(policy.split(paragraph).length - 1, 1, paragraph);
    const at = policy.indexOf(paragraph);
    assert.ok(policy.indexOf(section3) < at && at < policy.indexOf(section4), `${lang} paragraph sits in section 3`);
  });
}

test('no policy version 1.2 date remains', () => {
  assert.doesNotMatch(policy, /1\.2'|August 14, 2026|8월 14일|8月14日|14 tháng 8/);
});

test('only the English Bridge route adds the library entry, through the existing slot', () => {
  assert.match(read('src/pages/en/apps/pipi-bridge/index.astro'), /<LibraryEntry slot="before-showcase" \/>/);
  for (const lang of ['ko', 'ja']) assert.doesNotMatch(read(`src/pages/${lang}/apps/pipi-bridge/index.astro`), /LibraryEntry|library/);
  assert.doesNotMatch(read('src/components/AppLanding.astro'), /pipi-bridge\/library/);
});

test('card data keeps the 60-topic, 300-item extraction', () => {
  assert.equal(topics.length, 60);
  assert.equal(new Set(topics.map((t) => t.id)).size, 60);
  assert.equal(topics.flatMap((t) => t.lessons).length, 300);
  assert.ok(topics.some((t) => t.id === 'school_greetings_help'));
});

const guide = read('dist/en/apps/pipi-bridge/library/index.html');
const cards = read('dist/en/apps/pipi-bridge/library/cards/index.html');

for (const [path, html] of [['library/', guide], ['library/cards/', cards]]) {
  test(`built ${path}: indexable English page with only its own alternate`, () => {
    const url = `https://pifl-labs.com/en/apps/pipi-bridge/${path}`;
    assert.match(html, /<html lang="en"/);
    assert.ok(html.includes(`<link rel="canonical" href="${url}">`));
    assert.deepEqual([...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g)].map((m) => [m[1], m[2]]), [['en', url]]);
    assert.doesNotMatch(html, /name="robots"/);
    assert.doesNotMatch(html, /mailto:/);
    assert.ok(read('dist/sitemap-0.xml').includes(`<loc>${url}</loc>`));
  });
  test(`built ${path}: no unsupported claims`, () => {
    const text = html.replace(/<[^>]+>/g, ' ');
    assert.doesNotMatch(text, /research-based|proven|fully offline|WCAG|AASL|collaborative|recommended by|award/i);
  });
}

test('built cards: quick-start set plus every topic and item, practice classes summarized', () => {
  assert.equal(cards.split('class="bl-phrase-card"').length - 1, 5);
  assert.equal(cards.split('class="bl-card"').length - 1, 60);
  assert.equal(cards.split('class="bl-item"').length - 1, 300);
  assert.equal(cards.split('<li>Includes letter tracing</li>').length - 1, 4);
  // Only topics that actually lose practice with sound off carry the sound tag.
  const fewer = topics.filter((t) => t.practiceWithoutSound.length < t.practiceWithSound.length);
  assert.equal(fewer.length, 12);
  assert.equal(cards.split('<li>Fewer practice activities with sound off</li>').length - 1, fewer.length);
  for (const t of fewer) {
    const card = cards.match(new RegExp(`<article class="bl-card" id="${t.id}"[\\s\\S]*?</article>`))?.[0] ?? '';
    assert.ok(card.includes('<li>Fewer practice activities with sound off</li>'), t.id);
  }
  assert.doesNotMatch(cards, /Needs sound for some practice/);
  assert.doesNotMatch(cards.replace(/<style[\s\S]*?<\/style>/g, ''), /\b[A-Z]\w+Practice\b/);
});

test('built guide: store links keep original destinations and the privacy policy is linked', () => {
  assert.match(guide, /data-store-link="https:\/\/apps\.apple\.com\/app\/id6801205183"/);
  assert.match(guide, /data-store-link="https:\/\/play\.google\.com\/store\/apps\/details\?id=com\.pifl\.pipi\.bridge"/);
  assert.match(guide, /href="\/en\/apps\/pipi-bridge\/privacy\/"/);
  assert.match(guide, /href="\/en\/apps\/pipi-bridge\/library\/cards\/"/);
  assert.match(read('dist/en/apps/pipi-bridge/index.html'), /id="bridge-library"[\s\S]*?href="\/en\/apps\/pipi-bridge\/library\/"/);
  for (const lang of ['ko', 'ja']) assert.doesNotMatch(read(`dist/${lang}/apps/pipi-bridge/index.html`), /bridge-library/);
});
