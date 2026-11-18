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

// A shared session copies only the grown-up language and sound setting (library_session.dart).
const SETTINGS = {
  ko: '공용 활동은 기기의 보호자 언어와 소리 설정으로 시작하며, 기기에 저장된 학습 진도를 읽거나 바꾸지 않습니다.',
  en: "A shared session starts with the device's grown-up language and sound setting, and does not read or change the progress saved on the device.",
  ja: '共有セッションは端末の保護者向け言語と音の設定で始まり、端末に保存された学習の進捗を読み取ったり変更したりしません。',
  zh: '共用活动沿用设备的家长语言和声音设置，不会读取或更改设备上保存的学习进度。',
  vi: 'Lượt dùng chung bắt đầu với ngôn ngữ cho người lớn và cài đặt âm thanh của thiết bị, và không đọc hay thay đổi tiến độ học đã lưu trên thiết bị.',
};

for (const [lang, [date, section3, section4, paragraph]] of Object.entries(POLICY)) {
  test(`${lang} policy: version 1.3 adds the shared-session paragraph inside section 3`, () => {
    assert.equal(policy.split(date).length - 1, 1, date);
    assert.equal(policy.split(paragraph).length - 1, 1, paragraph);
    const at = policy.indexOf(paragraph);
    assert.ok(policy.indexOf(section3) < at && at < policy.indexOf(section4), `${lang} paragraph sits in section 3`);
    const settings = policy.indexOf(SETTINGS[lang]);
    assert.ok(at < settings && settings < policy.indexOf(section4), `${lang} settings sentence sits in the same paragraph`);
  });
}

test('policy no longer says a shared session reads nothing from the device', () => {
  assert.doesNotMatch(policy, /학습 기록을 읽거나 바꾸지 않습니다|does not read or change the learning record|学習記録を読み取ったり|不会读取或更改设备上已保存的学习记录|không đọc hay thay đổi hồ sơ học tập/);
});

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

// 1.1.2 draws each visit's practice from the whole pool (library_session.dart pickPractices),
// so the data holds every eligible practice, not the first five that 1.1.0 used.
test('card data holds the 1.1.2 practice pools: 736 with sound, 307 without', () => {
  for (const t of topics) {
    assert.equal(t.practiceWithSound, undefined, t.id);
    assert.equal(t.practiceWithoutSound, undefined, t.id);
    assert.ok(t.practicePoolWithSound.length >= 1, t.id);
    for (const p of t.practicePoolWithoutSound) assert.ok(t.practicePoolWithSound.includes(p), `${t.id} ${p}`);
  }
  assert.equal(topics.flatMap((t) => t.practicePoolWithSound).length, 736);
  assert.equal(topics.flatMap((t) => t.practicePoolWithoutSound).length, 307);
  assert.equal(new Set(topics.flatMap((t) => t.practicePoolWithSound)).size, 31);
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

const practiceCount = (pool) => Math.min(5, pool.length); // LibrarySessionPlan.practiceCount
const cardOf = (t) => cards.match(new RegExp(`<article class="bl-card" id="${t.id}"[\\s\\S]*?</article>`))?.[0] ?? '';

test('built cards: quick-start set plus every topic and item, practice classes summarized', () => {
  assert.equal(cards.split('class="bl-phrase-card"').length - 1, 5);
  assert.equal(cards.split('class="bl-card"').length - 1, 60);
  assert.equal(cards.split('class="bl-item"').length - 1, 300);
  const tracing = topics.filter((t) => t.practicePoolWithSound.includes('LetterTracePractice'));
  assert.equal(tracing.length, 4);
  assert.equal(cards.split('<li>Includes letter tracing</li>').length - 1, tracing.length);
  for (const t of tracing) assert.ok(cardOf(t).includes('<li>Includes letter tracing</li>'), t.id);
  // Only topics that actually lose practice with sound off carry the sound tag.
  const fewer = topics.filter((t) => practiceCount(t.practicePoolWithoutSound) < practiceCount(t.practicePoolWithSound));
  assert.equal(fewer.length, 12);
  assert.equal(cards.split('<li>Fewer practice activities with sound off</li>').length - 1, fewer.length);
  for (const t of fewer) assert.ok(cardOf(t).includes('<li>Fewer practice activities with sound off</li>'), t.id);
  assert.doesNotMatch(cards, /Needs sound for some practice/);
  assert.doesNotMatch(cards.replace(/<style[\s\S]*?<\/style>/g, ''), /\b[A-Z]\w+Practice\b/);
});

test('built cards: the first tag is the app topic summary (packMeta, sound on)', () => {
  for (const t of topics) {
    const tag = `<li>${t.lessons.length} new items · up to ${practiceCount(t.practicePoolWithSound)} practice</li>`;
    assert.ok(cardOf(t).includes(tag), `${t.id}: ${tag}`);
  }
  assert.doesNotMatch(cards, /new items \+ up to \d+ practice activit/);
});

test('built cards: notes describe 1.1.2 practice and Skip tracing by version', () => {
  assert.ok(cards.includes('In version 1.1.2 and later, practice is chosen again on every visit'));
  assert.ok(cards.includes('<span class="bl-ui">Skip tracing</span> button lets a child move on without tracing'));
  assert.ok(cards.includes('Topic content is the same from version 1.1.0 through 1.1.2'));
  assert.doesNotMatch(cards, /Korean Bridge 1\.1\.0 curriculum/);
});

const plain = (html) => html.replace(/<[^>]+>/g, ' ').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ');
const guideText = plain(guide);

// Button and screen names quoted exactly as the app's en strings (library_strings.dart, app_strings.dart).
const APP_EN = [
  'Open the app on this activity', 'Who is playing', 'One learner', 'A pair, taking turns',
  "A's turn · B helps", "B's turn · A helps", 'Together', 'End', 'Done! Show a grown-up',
  'Skip tracing', 'Turn sound on', 'Grown-ups', 'Stop opening on this activity',
  'Shared session · not saved', 'Prepare this activity', 'Start a fresh shared session',
  'Session closed. Temporary progress cleared.', 'Hear Korean', 'Explore together',
  'Try the whole conversation', 'Swap roles', '5 new items · up to 5 practice · includes letter tracing',
];

test('built guide: 1.1.1 and 1.1.2 screens are named with the app wording', () => {
  for (const name of APP_EN) assert.ok(guideText.includes(name), name);
});

test('built guide: 1.1.0-only steps are gone', () => {
  assert.doesNotMatch(guide, /Tap the <span class="bl-ui">X<\/span>/);
  assert.doesNotMatch(guide, /<span class="bl-ui">Close<\/span> on the final screen/);
  assert.doesNotMatch(guideText, /Install Korean Bridge \(version|mode is in version 1\.1\.0 and later|Children working in pairs take turns/);
});

test('built pages: versions appear only as "version X or later", "and later" or a range', () => {
  for (const html of [guide, cards]) {
    const mentions = [...plain(html).matchAll(/version (\d+\.\d+\.\d+)( or later| and later| through \d+\.\d+\.\d+)?/gi)];
    assert.ok(mentions.length > 0);
    for (const m of mentions) assert.ok(m[2], `bare version mention: ${m[0]}`);
  }
});

test('built guide: timings are a suggested plan, with no simulated set-up estimates', () => {
  assert.ok(guideText.includes('The times are a suggested plan, not measurements'));
  assert.doesNotMatch(guideText, /40 seconds|12–16 seconds|8–9 minutes|5 minutes for the first tablet|simulated/i);
});

test('built guide: device mode is described as device-only and not a lock', () => {
  assert.ok(guideText.includes('The setting is stored only on this device.'));
  assert.ok(guideText.includes('it does not keep a child inside the app'));
});

test('built guide: audio and recording wording match the app', () => {
  assert.ok(guide.includes('<li>No voice recording</li>'));
  assert.ok(guide.includes('Lessons play Korean audio generated before release and included in the app.'));
  assert.ok(guide.includes(SETTINGS.en.replace("'", '&#39;')) || guide.includes(SETTINGS.en));
  assert.doesNotMatch(guide, /recorded Korean audio|No recordings<|still being reviewed/);
  for (const html of [guide, cards]) {
    assert.ok(html.includes('A small bow.'));
    assert.doesNotMatch(html, /Bow from the waist/);
  }
  assert.match(read('src/components/pipi-bridge/library.css'), /\.bl-btn--primary \{[^}]*color: #020617;/);
});

test('English-only library pages send KO/JA switches to the Bridge landings; other pages keep path mirroring', () => {
  const switches = (html) => Object.fromEntries([...html.matchAll(/<a\b[^>]*href="([^"]+)" hreflang="(en|ko|ja)">(?:EN|KO|JA)<\/a>/g)].map((m) => [m[2], m[1]]));
  assert.deepEqual(switches(guide), { en: '/en/apps/pipi-bridge/library/', ko: '/ko/apps/pipi-bridge/', ja: '/ja/apps/pipi-bridge/' });
  assert.deepEqual(switches(cards), { en: '/en/apps/pipi-bridge/library/cards/', ko: '/ko/apps/pipi-bridge/', ja: '/ja/apps/pipi-bridge/' });
  assert.deepEqual(switches(read('dist/en/apps/pipi-bridge/privacy/zh/index.html')), { en: '/en/apps/pipi-bridge/privacy/zh/', ko: '/ko/apps/pipi-bridge/privacy/zh/', ja: '/ja/apps/pipi-bridge/privacy/zh/' });
  assert.deepEqual(switches(read('dist/ko/apps/pipi-bridge/index.html')), { en: '/en/apps/pipi-bridge/', ko: '/ko/apps/pipi-bridge/', ja: '/ja/apps/pipi-bridge/' });
});

test('built guide: store links keep original destinations and the privacy policy is linked', () => {
  assert.match(guide, /data-store-link="https:\/\/apps\.apple\.com\/app\/id6801205183"/);
  assert.match(guide, /data-store-link="https:\/\/play\.google\.com\/store\/apps\/details\?id=com\.pifl\.pipi\.bridge"/);
  assert.match(guide, /href="\/en\/apps\/pipi-bridge\/privacy\/"/);
  assert.match(guide, /href="\/en\/apps\/pipi-bridge\/library\/cards\/"/);
  assert.match(read('dist/en/apps/pipi-bridge/index.html'), /id="bridge-library"[\s\S]*?href="\/en\/apps\/pipi-bridge\/library\/"/);
  assert.ok(read('dist/en/apps/pipi-bridge/index.html').includes('Set a tablet to open on one topic, let pairs take turns'));
  for (const lang of ['ko', 'ja']) assert.doesNotMatch(read(`dist/${lang}/apps/pipi-bridge/index.html`), /bridge-library/);
});
