import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const policy = read('src/components/pipi-bridge/PrivacyPolicy.astro');
const topics = JSON.parse(read('src/data/bridge-library-cards.json'));

const POLICY = {
  ko: ['시행일: 2026년 11월 18일 · 버전 1.4', '<h3>3. 이용 목적과 보관</h3>', '<h3>4. 제3자 제공과 국외 이전</h3>', '<strong>도서관·교실 공용 활동:</strong> 어른이 공용 활동을 시작하면'],
  en: ['Effective: November 18, 2026 · Version 1.4', '<h3>3. Purpose and retention</h3>', '<h3>4. Sharing and international transfer</h3>', '<strong>Library and classroom sessions:</strong> when a grown-up starts a shared session'],
  ja: ['施行日: 2026年11月18日 · バージョン 1.4', '<h3>3. 利用目的と保有期間</h3>', '<h3>4. 第三者提供と国外移転</h3>', '<strong>図書館・教室の共有セッション：</strong>大人が共有セッションを始めると'],
  zh: ['生效日期：2026年11月18日 · 版本 1.4', '<h3>3. 用途与保留</h3>', '<h3>4. 共享与跨境传输</h3>', '<strong>图书馆与课堂共用活动：</strong>成人开始共用活动后'],
  vi: ['Hiệu lực: 18 tháng 11, 2026 · Phiên bản 1.4', '<h3>3. Mục đích và thời gian lưu</h3>', '<h3>4. Chia sẻ và chuyển dữ liệu quốc tế</h3>', '<strong>Lượt dùng chung ở thư viện và lớp học:</strong> khi người lớn bắt đầu'],
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
  test(`${lang} policy: version 1.4 keeps the shared-session paragraph inside section 3`, () => {
    assert.equal(policy.split(date).length - 1, 1, date);
    assert.equal(policy.split(paragraph).length - 1, 1, paragraph);
    const at = policy.indexOf(paragraph);
    assert.ok(policy.indexOf(section3) < at && at < policy.indexOf(section4), `${lang} paragraph sits in section 3`);
    const settings = policy.indexOf(SETTINGS[lang]);
    assert.ok(at < settings && settings < policy.indexOf(section4), `${lang} settings sentence sits in the same paragraph`);
  });
}

// 1.1.1 device mode stores one setting (library_device.dart `packId|practice|pair`, key library_device_v1).
// setLibraryDevice(null) removes the key; resetProgress leaves it (library_device_test.dart).
const DEVICE = {
  ko: ['<li><strong>도서관·교실 시작 설정(기기 안에만 저장):</strong> 어른이 ‘앱을 열면 이 활동으로 시작’을 켜면', '도서관·교실 시작 설정은 앱을 고른 주제로 여는 데만 사용하며 어른이 이 설정을 끄면 지워집니다.'],
  en: ['<li><strong>Library and classroom start setting (stored only in app storage):</strong> if a grown-up turns on “Open the app on this activity”', 'The library and classroom start setting is used only to open the app on the chosen topic and is removed when a grown-up turns it off.'],
  ja: ['<li><strong>図書館・教室の開始設定（端末内にのみ保存）：</strong>大人が「アプリを開くとこの活動から始める」をオンにすると', '図書館・教室の開始設定は、選んだテーマでアプリを開くためにのみ使用し、大人がこの設定をオフにすると消去されます。'],
  zh: ['<li><strong>图书馆与课堂开始设置（仅保存在应用本地）：</strong>成人开启“打开应用时从此活动开始”后', '图书馆与课堂开始设置仅用于让应用打开时进入所选主题，成人关闭该设置后即被清除。'],
  vi: ['<li><strong>Cài đặt bắt đầu cho thư viện và lớp học (chỉ lưu trong bộ nhớ ứng dụng):</strong> khi người lớn bật “Mở ứng dụng vào hoạt động này”', 'Cài đặt bắt đầu cho thư viện và lớp học chỉ dùng để mở ứng dụng vào chủ đề đã chọn và bị xóa khi người lớn tắt cài đặt.'],
};
const HEADINGS = {
  ko: ['<h3>1. 앱에서 처리하는 정보</h3>', '<h3>2. 광고·추적·결제·권한</h3>'],
  en: ['<h3>1. Information handled</h3>', '<h3>2. Ads, tracking, payments and permissions</h3>'],
  ja: ['<h3>1. 本アプリで取り扱う情報</h3>', '<h3>2. 広告・トラッキング・課金・権限</h3>'],
  zh: ['<h3>1. 处理的信息</h3>', '<h3>2. 广告、追踪、付费与权限</h3>'],
  vi: ['<h3>1. Thông tin được xử lý</h3>', '<h3>2. Quảng cáo, theo dõi, thanh toán và quyền truy cập</h3>'],
};

for (const [lang, [item, retention]] of Object.entries(DEVICE)) {
  test(`${lang} policy 1.4: the device start setting is listed in section 1 and its retention in section 3`, () => {
    const [s1, s2] = HEADINGS[lang];
    const [, section3, section4] = POLICY[lang];
    assert.equal(policy.split(item).length - 1, 1, item);
    const at = policy.indexOf(item);
    assert.ok(policy.indexOf(s1) < at && at < policy.indexOf(s2), `${lang} item sits in section 1`);
    assert.equal(policy.split(retention).length - 1, 1, retention);
    const kept = policy.indexOf(retention);
    assert.ok(policy.indexOf(section3) < kept && kept < policy.indexOf(section4), `${lang} retention sits in section 3`);
  });
}

// resetProgress() (app_controller.dart, feat/library-112) removes 17 learning-record keys and keeps exactly
// parent_language_v1, learning_path_v1, learning_level_v1, sound_enabled_v1, onboarding_complete_v1 and
// library_device_v1. Deleting the app removes the app's storage. Section 3 must say exactly that.
const RESET = {
  ko: {
    erases: '‘진도 초기화’는 학습 기록(완료한 활동, 학습한 날짜, 오늘 한 활동 수, 별과 게임 보상, 복습 기록)만 지우고',
    keeps: '보호자 도움말 언어, 학습 시작 경로, 추천 시작 난이도, 음성 재생 설정, 첫 실행 설정 완료 여부, 도서관·교실 시작 설정은 남깁니다.',
    deletion: '앱을 삭제하면 기기 안의 앱 데이터가 모두 지워집니다.',
    old: /진도를 초기화하거나 앱을 삭제할 때 제거됩니다|진도를 초기화해도 남고/,
  },
  en: {
    erases: '“Reset progress” in the grown-up area erases only the learning records (completed activities, learning dates, today\'s activity count, stars and game rewards, and review records).',
    keeps: 'It keeps the grown-up help language, starting path, recommended starting level, sound setting, first-launch setup and the library and classroom start setting.',
    deletion: "Deleting the app removes all of the app's data from the device.",
    old: /They are removed when a grown-up resets progress or deletes the app|resetting progress keeps it/,
  },
  ja: {
    erases: '「進み具合をリセット」は学習記録（完了した活動、学習した日付、今日の活動数、星とゲームのごほうび、復習の記録）だけを消去し',
    keeps: '保護者向けヘルプの言語、学習のスタート地点、おすすめの開始レベル、音声再生の設定、初回設定を終えたかどうか、図書館・教室の開始設定は残します。',
    deletion: '本アプリを削除すると、端末内の本アプリのデータはすべて消去されます。',
    old: /進捗をリセットしたとき、または本アプリを削除したときに消去されます|進捗をリセットしても残り/,
  },
  zh: {
    erases: '“重置进度”只清除学习记录（已完成的活动、学习日期、当天活动数、星星和游戏奖励、复习记录）',
    keeps: '保留家长帮助语言、学习起点、推荐起始难度、声音设置、是否已完成首次设置以及图书馆与课堂开始设置。',
    deletion: '删除应用会清除设备上该应用的全部数据。',
    old: /家长重置进度或删除应用时会清除|重置进度后仍会保留/,
  },
  vi: {
    erases: '“Đặt lại tiến độ” trong khu vực phụ huynh chỉ xóa hồ sơ học tập (hoạt động đã hoàn thành, ngày học, số hoạt động trong ngày, sao và phần thưởng trò chơi, hồ sơ ôn tập)',
    keeps: 'còn giữ lại ngôn ngữ trợ giúp cho phụ huynh, lộ trình bắt đầu, mức khởi đầu đề xuất, cài đặt âm thanh, việc đã hoàn tất thiết lập lần đầu và cài đặt bắt đầu cho thư viện và lớp học.',
    deletion: 'Xóa ứng dụng sẽ xóa toàn bộ dữ liệu của ứng dụng trên thiết bị.',
    old: /Dữ liệu bị xóa khi phụ huynh đặt lại tiến độ hoặc xóa ứng dụng|vẫn còn sau khi đặt lại tiến độ/,
  },
};
// Section 1 names every stored setting that reset keeps, plus the learning records it erases.
const STORED = {
  ko: ['추천 시작 난이도', '첫 실행 설정 완료 여부', '오늘 한 활동 수', '모은 별과 게임 보상', '복습 기록(최근에 한 활동, 틀린 활동, 익힌 정도)'],
  en: ['recommended starting level', 'whether first-launch setup is done', "today's activity count", 'collected stars and game rewards', 'review records (activities done recently, missed or mastered)'],
  ja: ['おすすめの開始レベル', '初回設定を終えたかどうか', '今日の活動数', '集めた星とゲームのごほうび', '復習の記録（最近取り組んだ活動、間違えた活動、身についた度合い）'],
  zh: ['推荐起始难度', '是否已完成首次设置', '当天活动数', '收集的星星和游戏奖励', '复习记录（最近做过、答错过或已掌握的活动）'],
  vi: ['mức khởi đầu đề xuất', 'việc đã hoàn tất thiết lập lần đầu hay chưa', 'số hoạt động trong ngày', 'số sao và phần thưởng trò chơi đã thu thập', 'hồ sơ ôn tập (hoạt động đã làm gần đây, đã trả lời sai hoặc đã thành thạo)'],
};
const section = (lang, from, to) => policy.slice(policy.indexOf(from), policy.indexOf(to));

for (const [lang, { erases, keeps, deletion, old }] of Object.entries(RESET)) {
  test(`${lang} policy 1.4: section 3 says reset erases learning records only, keeps settings, deletion erases all`, () => {
    const [, section3, section4] = POLICY[lang];
    const s3 = section(lang, section3, section4);
    for (const sentence of [erases, keeps, deletion]) assert.equal(s3.split(sentence).length - 1, 1, sentence);
    assert.doesNotMatch(policy, old);
  });
  test(`${lang} policy 1.4: section 1 lists the stored settings and records`, () => {
    const [s1, s2] = HEADINGS[lang];
    const s1Text = section(lang, s1, s2);
    for (const item of STORED[lang]) assert.ok(s1Text.includes(item), item);
  });
}

test('no policy version 1.3 label remains', () => {
  assert.doesNotMatch(policy, /버전 1\.3|Version 1\.3|バージョン 1\.3|版本 1\.3|Phiên bản 1\.3/);
});

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
// /cards/ is the topic list; every full card lives on its own page and on the print-all page.
const cards = read('dist/en/apps/pipi-bridge/library/cards/index.html');
const cardsPrint = read('dist/en/apps/pipi-bridge/library/cards/print/index.html');

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
const cardOf = (t) => cardsPrint.match(new RegExp(`<article class="bl-card" id="${t.id}"[\\s\\S]*?</article>`))?.[0] ?? '';

test('built print-all cards: quick-start set plus every topic and item, practice classes summarized', () => {
  assert.equal(cardsPrint.split('class="bl-phrase-card"').length - 1, 5);
  assert.equal(cardsPrint.split('class="bl-card"').length - 1, 60);
  assert.equal(cardsPrint.split('class="bl-item"').length - 1, 300);
  const tracing = topics.filter((t) => t.practicePoolWithSound.includes('LetterTracePractice'));
  assert.equal(tracing.length, 4);
  assert.equal(cardsPrint.split('<li>Includes letter tracing</li>').length - 1, tracing.length);
  for (const t of tracing) assert.ok(cardOf(t).includes('<li>Includes letter tracing</li>'), t.id);
  // Only topics that actually lose practice with sound off carry the sound tag.
  const fewer = topics.filter((t) => practiceCount(t.practicePoolWithoutSound) < practiceCount(t.practicePoolWithSound));
  assert.equal(fewer.length, 12);
  assert.equal(cardsPrint.split('<li>Fewer practice activities with sound off</li>').length - 1, fewer.length);
  for (const t of fewer) assert.ok(cardOf(t).includes('<li>Fewer practice activities with sound off</li>'), t.id);
  for (const html of [cards, cardsPrint]) {
    assert.doesNotMatch(html, /Needs sound for some practice/);
    assert.doesNotMatch(html.replace(/<style[\s\S]*?<\/style>/g, ''), /\b[A-Z]\w+Practice\b/);
  }
});

test('built cards: the first tag is the app topic summary (packMeta, sound on)', () => {
  for (const t of topics) {
    const tag = `<li>${t.lessons.length} new items · up to ${practiceCount(t.practicePoolWithSound)} practice</li>`;
    assert.ok(cardOf(t).includes(tag), `${t.id}: ${tag}`);
  }
  assert.doesNotMatch(cardsPrint, /new items \+ up to \d+ practice activit/);
});

test('built cards: notes describe 1.1.2 practice and Skip tracing by version (list and print-all)', () => {
  for (const html of [cards, cardsPrint]) {
    assert.ok(html.includes('In version 1.1.2 and later, practice is chosen again on every visit'));
    assert.ok(html.includes('<span class="bl-ui">Skip tracing</span> button lets a child move on without tracing'));
    assert.ok(html.includes('Topic content is the same from version 1.1.0 through 1.1.2'));
    assert.doesNotMatch(html, /Korean Bridge 1\.1\.0 curriculum/);
  }
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
  for (const html of [guide, cards, cardsPrint]) {
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

// Review fixes (app main 43042aa): app.dart home switch, library_session_route.dart tooltips and PopScope.
test('built guide: device mode has no family home, screen readers use the tooltip names, Back on Android', () => {
  assert.ok(guideText.includes('While the setting is on, the app does not show the family home screen at all'));
  assert.ok(guideText.includes('To use the app as a family tablet again, turn the setting off.'));
  assert.doesNotMatch(guideText, /family home screen and the grown-up area stay behind/);
  assert.ok(guideText.includes('which screen readers announce as Talk and explore together and End shared session (grown-up)'));
  assert.doesNotMatch(guideText, /keep the same names for screen readers/);
  assert.ok(guideText.includes('End , or on Android the system Back button or gesture, leads to the same grown-up check'));
  assert.ok(guideText.includes('on Android, the system Back button or gesture also asks for the check'));
  assert.doesNotMatch(guideText, /one way out|only way out|; the system Back button or gesture also asks/i);
});

test('built cards: the note says the app puts letter tracing on the same line', () => {
  assert.ok(cards.includes('the app adds “· includes letter tracing” to the same line; the cards show it as a separate “Includes letter tracing” tag'));
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

// ── Topic list, one page per topic, print-all (2026-11-19) ──
// /cards/ used to hold all 60 full cards (≈84,000px on a 390px phone). It is now a list of
// compact tiles; each full card has its own page (one printed page) and /cards/print/ keeps
// the whole set for printing, out of the index.
const CARDS_URL = 'https://pifl-labs.com/en/apps/pipi-bridge/library/cards/';
const AREA_ORDER = ['korean', 'math', 'school', 'explore'];
const ordered = AREA_ORDER.flatMap((w) => topics.filter((t) => t.world === w));
const slugOf = (t) => t.id.replace(/_/g, '-');
const topicHtml = (t) => read(`dist/en/apps/pipi-bridge/library/cards/${slugOf(t)}/index.html`);
const sitemap = read('dist/sitemap-0.xml');

test('built cards list: one tile per topic, keeping the old #topic anchors, and no full cards', () => {
  const tiles = [...cards.matchAll(/<li class="bl-tile" id="([^"]+)"[^>]*>([\s\S]*?)<\/li>/g)];
  assert.deepEqual(tiles.map((m) => m[1]), ordered.map((t) => t.id));
  for (const [i, m] of tiles.entries()) {
    const t = ordered[i];
    assert.ok(m[2].includes(`href="/en/apps/pipi-bridge/library/cards/${slugOf(t)}/"`), t.id);
    assert.ok(m[2].includes(`>${t.title}</a>`), t.id);
  }
  for (const id of ['quick-start', 'world-korean', 'world-math', 'world-school', 'world-explore', 'about-tags']) {
    assert.ok(cards.includes(`id="${id}"`), id);
  }
  assert.equal(cards.split('class="bl-phrase-card"').length - 1, 5);
  assert.doesNotMatch(cards, /class="bl-card"|class="bl-item"/);
  assert.ok(cards.includes('href="/en/apps/pipi-bridge/library/cards/print/"'));
  // The list stays a fraction of the print-all page.
  assert.ok(plain(cards).length * 4 < plain(cardsPrint).length, `${plain(cards).length} vs ${plain(cardsPrint).length}`);
});

test('built print-all cards: noindex, self-canonical and left out of the sitemap', () => {
  const url = `${CARDS_URL}print/`;
  assert.ok(cardsPrint.includes('<meta name="robots" content="noindex,follow">'));
  assert.ok(cardsPrint.includes(`<link rel="canonical" href="${url}">`));
  assert.ok(!sitemap.includes(`<loc>${url}</loc>`));
});

for (const [i, t] of ordered.entries()) {
  test(`built topic card ${t.id}: own indexable page with one full card and neighbours in list order`, () => {
    const html = topicHtml(t);
    const url = `${CARDS_URL}${slugOf(t)}/`;
    assert.ok(html.includes(`<link rel="canonical" href="${url}">`));
    assert.deepEqual([...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g)].map((m) => [m[1], m[2]]), [['en', url]]);
    assert.doesNotMatch(html, /name="robots"/);
    assert.ok(sitemap.includes(`<loc>${url}</loc>`));
    assert.equal(html.split('class="bl-card"').length - 1, 1);
    assert.ok(html.includes(`<article class="bl-card" id="${t.id}"`));
    assert.equal(html.split('class="bl-item"').length - 1, 5);
    for (const l of t.lessons) assert.ok(html.includes(`<p class="bl-ko" lang="ko">${l.korean}</p>`), l.korean);
    const tag = `<li>${t.lessons.length} new items · up to ${practiceCount(t.practicePoolWithSound)} practice</li>`;
    assert.ok(html.includes(tag), tag);
    const prev = ordered[i - 1], next = ordered[i + 1];
    assert.equal(html.includes('rel="prev"'), Boolean(prev));
    assert.equal(html.includes('rel="next"'), Boolean(next));
    if (prev) assert.ok(html.includes(`rel="prev" href="/en/apps/pipi-bridge/library/cards/${slugOf(prev)}/"`));
    if (next) assert.ok(html.includes(`rel="next" href="/en/apps/pipi-bridge/library/cards/${slugOf(next)}/"`));
    assert.ok(html.includes(`href="/en/apps/pipi-bridge/library/cards/#${t.id}"`));
    assert.doesNotMatch(html.replace(/<[^>]+>/g, ' '), /research-based|proven|fully offline|WCAG|AASL|collaborative|recommended by|award/i);
  });
}
