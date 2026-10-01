import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// 밑그림(PiPi Draw) 개인정보처리방침 사실 검사 — 국외 이전 세부(개인정보 보호법 제28조의8 제2항 항목)와
// 제공자별 보관 기간·법인명·결과 형식·수집 기록·시행일. 근거는 앱 코드(pipi_draw functions/src·lib)와 각 제공자 공식 문서.
const readRepo = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const pagePath = locale => `src/pages/${locale ? `${locale}/` : ''}apps/pipi-draw/privacy.astro`;
const read = locale => readRepo(pagePath(locale));

// 이번 판의 게시일. 게시가 한국시간 10월 1일을 넘기면 src/data/pipi-draw-privacy.mjs 의
// DRAW_PRIVACY_EFFECTIVE_DATE 와 함께 이 값을 실제 게시일로 바꾼다(이전 시행일·변경 내용 문단은 자동으로 바뀐다).
const CURRENT_EFFECTIVE_DATE = '2026-10-01';

const entities = s => s.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'");
const text = html => entities(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const plain = html => entities(html.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();

const LOCALES = {
  ko: {
    article: '제14조 (국외 이전)',
    heading: name => `${name} 이전 세부`,
    country: '미국',
    contact: '개인정보 문의',
    labels: ['이전 항목', '이전 시기·방법', '이용 목적', '보유·이용 기간', '이전 거부 방법·절차와 효과'],
  },
  ja: {
    article: '第14条 (国外移転)',
    heading: name => `${name} への移転の詳細`,
    country: '米国',
    contact: 'プライバシー窓口',
    labels: ['移転する項目', '時期・方法', '利用目的', '保持期間', '移転を拒否する方法・手続と効果'],
  },
  en: {
    article: '14. International Data Transfers',
    heading: name => `Transfer details: ${name}`,
    country: 'United States',
    contact: 'privacy contact',
    labels: ['Items', 'When and how', 'Purpose', 'Retention', 'How to refuse and its effect'],
  },
};
// 루트(/apps/pipi-draw/privacy/)는 영어판이다.
const PAGES = [['ko', 'ko'], ['ja', 'ja'], ['en', 'en'], ['', 'en']];

// 이전받는 자(표의 순서) → 공식 주소와 개인정보 문의 경로(각 사 개인정보처리방침·문의 페이지에서 확인).
const GOOGLE = { address: '1600 Amphitheatre Parkway, Mountain View, CA 94043', route: 'href="https://support.google.com/policies/contact/general_privacy_form"' };
const RECIPIENTS = [
  ['Google LLC (Firebase)', GOOGLE],
  ['Google LLC (Gemini API)', GOOGLE],
  ['OpenAI OpCo, LLC', { address: '1455 3rd Street, San Francisco, CA 94158', route: 'data-email-user="privacy" data-email-domain="openai.com"' }],
  ['Google LLC (AdMob)', GOOGLE],
  ['Apple Inc.', { address: 'One Apple Park Way, Cupertino, CA 95014', route: 'href="https://www.apple.com/legal/privacy/contact/"' }],
  ['Google LLC (Google Play)', GOOGLE],
];

/** <h2> 하나의 본문(다음 <h2> 앞까지). */
function article(page, heading) {
  const start = page.indexOf(`<h2>${heading}</h2>`);
  assert.ok(start >= 0, `missing article: ${heading}`);
  const end = page.indexOf('<h2>', start + 4);
  return page.slice(start, end < 0 ? undefined : end);
}

/** 조 번호로 찾은 <h2> 본문 — 제N조(ko)·第N条(ja)·N.(en). */
function articleNo(page, n) {
  const m = page.match(new RegExp(`<h2>((?:제${n}조|第${n}条|${n}\\.)[^<]*)</h2>`));
  assert.ok(m, `missing article ${n}`);
  return article(page, m[1]);
}

/** 국외 이전 조항의 h3 블록들: { heading, contactHtml, items: [[label, text]] }. */
function transferBlocks(section) {
  return section.split(/<h3>/).slice(1).map(chunk => {
    const heading = text(chunk.slice(0, chunk.indexOf('</h3>')));
    const contactHtml = (chunk.match(/<p>([\s\S]*?)<\/p>/) || [, ''])[1];
    const items = [...chunk.matchAll(/<li><strong>([^<]+)<\/strong>:\s*([\s\S]*?)<\/li>/g)].map(m => [m[1], text(m[2])]);
    return { heading, contactHtml, items, text: text(chunk) };
  });
}

const blockOf = (page, lang, name) => {
  const blocks = transferBlocks(article(page, LOCALES[lang].article));
  const block = blocks.find(b => b.heading === LOCALES[lang].heading(name));
  assert.ok(block, `${lang}: missing transfer block for ${name}`);
  return block;
};

/** 맺음 조항의 두 변경 내용 문단 — {sameDay ? (같은 날 고쳐 쓴 판) : (새 판)}. */
function closingParagraphs(page) {
  const closing = articleNo(page, 17);
  const m = closing.match(/\{sameDay \? \(\s*(<p>[\s\S]*?<\/p>)\s*\) : \(\s*(<p>[\s\S]*?<\/p>)\s*\)\}/);
  assert.ok(m, 'closing article: sameDay ? (...) : (...)');
  return { sameDay: m[1], later: m[2] };
}

// 언어별 기대 문구. 근거는 각 줄 주석.
const FACTS = {
  ko: {
    format: '라인아트 PNG·그림체·사진 느낌 JPEG',
    // 앱 sketch_notifier.dart:179-184(최대 1280px·품질 85) → 서버 index.ts:690-694(최대 1024px JPEG).
    photoRow: ['최대 1280px', '최대 1024px JPEG'],
    transmission: ['앱에서 최대 1280px', '최대 1024px JPEG'],
    // lib 에 setAnalyticsCollectionEnabled·setCrashlyticsCollectionEnabled 호출 0건 — 앱에서 끌 수 없다.
    analyticsPurpose: '사용 분석 및 오류 추적(앱을 쓰는 동안 자동 수집)',
    analyticsRow: ['<td>분석·안정성</td>', 'Firebase Analytics / Crashlytics가 앱을 쓰는 동안 자동 수집'],
    optionalAnalytics: /오류 추적\(선택\)|분석·안정성\(선택\)|Crashlytics \(선택\)|자동 수집 \(사용자 동의 시\)/,
    adRow: '광고를 불러올 때 Google AdMob SDK가 자동 수집(iOS 광고 ID는 추적 허용 시에만, 광고 동의를 묻는 지역에서는 동의 화면을 거친 뒤)',
    firebase: ['Google Cloud 서울 리전', '미국 데이터센터에서만', '최대 1280px', '변환권 구매 기록(거래 ID·상품·플랫폼)과 변환권 잔액',
      '변환권 구매를 확인할 때', '결과를 신고할 때', '앱을 쓰는 동안 자동으로 전송되며 앱 안에서 따로 끌 수 없으므로'],
    gemini: ['사용자 식별자는 보내지 않습니다', 'Gemini API에 전송'],
    admob: ['보상형 광고로 무료 변환을 받을 때는 보상 확인을 위해 익명 사용자 식별자', '9개월', '18개월',
      '광고 동의를 묻지 않는 지역(한국 등)에서는 광고를 불러올 때 IP 주소·이용 정보 등이 전송되며 앱 안에서 따로 끌 수 없습니다'],
    admobRow: '<td>광고 식별자, 기기 정보, 익명 사용자 식별자(보상형 광고 시)</td>',
    apple: ['익명 사용자 식별자로 만든 UUID', '거래 정보를 Apple로 다시 보내지 않습니다'],
    play: ['상품 ID, 구매 토큰', 'Google Play 개발자 API'],
    purchaseRow: '구매 영수증, 거래 ID, 구매 상품·플랫폼, 변환권 잔액',
  },
  ja: {
    format: '線画はPNG・絵柄・写真の雰囲気はJPEG',
    photoRow: ['最大1280px', '最大1024pxのJPEG'],
    transmission: ['アプリで最大1280px', '最大1024pxのJPEG'],
    analyticsPurpose: '利用分析およびエラー追跡(アプリの利用中に自動で収集)',
    analyticsRow: ['<td>分析・安定性</td>', 'Firebase Analytics / Crashlytics がアプリの利用中に自動で収集'],
    optionalAnalytics: /エラー追跡\(任意\)|分析・安定性\(任意\)|Crashlytics\(任意\)|自動収集\(同意時\)/,
    adRow: '広告の読み込み時に Google AdMob SDK が自動で収集(iOS の広告IDはトラッキング許可時のみ、広告の同意を求める地域では同意画面を経た後)',
    firebase: ['Google Cloud のソウルリージョン', '米国のデータセンターでのみ', '最大1280px', '変換チケットの購入記録(取引ID・商品・プラットフォーム)とチケット残高',
      '購入の確認', '結果の報告', 'アプリの利用中に自動で送信され、アプリ内で個別にオフにすることはできません'],
    gemini: ['ユーザー識別子は送信しません', 'Gemini API へ送信'],
    admob: ['リワード広告で無料変換を受け取るときは、報酬を確認するため匿名のユーザー識別子', '9か月', '18か月',
      '広告の同意を求めない地域(韓国など)では、広告を読み込むときにIPアドレスや利用情報などが送信され、アプリ内で個別にオフにすることはできません'],
    admobRow: '<td>広告識別子、デバイス情報、匿名のユーザー識別子(リワード広告の場合)</td>',
    apple: ['匿名のユーザー識別子から作ったUUID', '取引情報を Apple へ送り返すことはありません'],
    play: ['商品ID、購入トークン', 'Google Play Developer API'],
    purchaseRow: '購入領収書、取引ID、購入した商品・プラットフォーム、変換チケットの残高',
  },
  en: {
    format: 'line art as PNG; art styles and photo looks as JPEG',
    photoRow: ['at most 1280px', 'a JPEG of up to 1024px'],
    transmission: ['at most 1280px', 'a JPEG of up to 1024px'],
    analyticsPurpose: 'Usage analytics and crash reporting via Firebase Analytics / Crashlytics (collected automatically while you use the App)',
    analyticsRow: ['<td>Analytics &amp; Stability</td>', 'Collected automatically by Firebase Analytics / Crashlytics while you use the App'],
    optionalAnalytics: /Crashlytics \(optional\)|Stability \(optional\)|AdMob SDK \(with consent\)/,
    adRow: 'Collected automatically by the Google AdMob SDK when ads load (the iOS advertising ID only if you allow tracking; in regions where ad consent is requested, after the consent screen)',
    firebase: ["Google Cloud's Seoul region", "only in Google's US data centers", 'up to 1280px',
      'conversion pack purchase records (transaction ID, product, platform) and the conversion pack balance',
      'have a purchase checked', 'report a result', 'sent automatically while you use the App and cannot be turned off separately in the App'],
    gemini: ['No user identifier is sent', 'to the Gemini API'],
    admob: ['When you watch a rewarded ad to get a free conversion, the anonymous user identifier', '9 months', '18 months',
      'In regions where ad consent is not requested (such as Korea), IP addresses, usage information, and the like are sent when ads load, and this cannot be turned off separately in the App'],
    admobRow: '<td>Ad identifier, device info, anonymous user identifier (rewarded ads)</td>',
    apple: ['a UUID derived from the anonymous user identifier', 'does not send transaction information back to Apple'],
    play: ['the product ID and the purchase token', 'Google Play Developer API'],
    purchaseRow: 'Purchase receipt, transaction ID, product and platform, conversion pack balance',
  },
};

// 변경 내용 — 같은 날(10월 1일) 게시면 2026-06-04 판 대비 전체, 늦어지면 이번 PR 분만(#69 의 OpenAI 추가는 빠진다).
const CHANGE_NOTES = {
  ko: {
    sameDay: ['AI 사진 변환 제공자에 OpenAI 추가', '모든 이전받는 자의 국외 이전 세부', '변환 작업 기록과 AI 결과 신고 기록의 처리 항목·보유 기간 추가',
      '분석·오류·광고 정보의 자동 수집 명시와 사진 전송 크기 정정', '앱에서 제공하지 않는 포인트팩·프리미엄 구독 결제 서술 삭제'],
    later: ['Google Gemini 연결 방식(Gemini API) 정정', 'Google(Firebase·Gemini API·AdMob·Google Play)과 Apple의 국외 이전 세부',
      '변환 작업 기록과 AI 결과 신고 기록의 처리 항목·보유 기간 추가', '분석·오류·광고 정보의 자동 수집 명시와 사진 전송 크기 정정',
      '앱에서 제공하지 않는 포인트팩·프리미엄 구독 결제 서술 삭제'],
    onlySameDay: 'OpenAI 추가',
    hardcodedDates: /2026년 10월 1일|2026년 6월 4일/,
  },
  ja: {
    sameDay: ['AI写真変換の提供者にOpenAIを追加', 'すべての移転先について国外移転の詳細', '変換ジョブの記録とAI結果の報告記録の項目・保有期間を追加',
      '分析・エラー・広告情報の自動収集を明記し写真の送信サイズを訂正', '本アプリで提供していないポイントパック・プレミアムサブスクリプションの課金の記載を削除'],
    later: ['Google Geminiの接続方式(Gemini API)を訂正', 'Google(Firebase・Gemini API・AdMob・Google Play)とAppleへの国外移転の詳細',
      '変換ジョブの記録とAI結果の報告記録の項目・保有期間を追加', '分析・エラー・広告情報の自動収集を明記し写真の送信サイズを訂正',
      '本アプリで提供していないポイントパック・プレミアムサブスクリプションの課金の記載を削除'],
    onlySameDay: 'OpenAIを追加',
    hardcodedDates: /2026年10月1日|2026年6月4日/,
  },
  en: {
    sameDay: ['OpenAI added as an AI photo conversion provider', 'added for every recipient', 'conversion job records and AI result reports added with their retention',
      'automatic collection of analytics, error, and ad data stated and photo upload sizes corrected',
      'point pack and premium subscription purchases, which the App does not offer, removed'],
    later: ['Google Gemini connection method (Gemini API) corrected', 'added for Google (Firebase, Gemini API, AdMob, Google Play) and Apple',
      'conversion job records and AI result reports added with their retention',
      'automatic collection of analytics, error, and ad data stated and photo upload sizes corrected',
      'point pack and premium subscription purchases, which the App does not offer, removed'],
    onlySameDay: 'OpenAI added',
    hardcodedDates: /October 1, 2026|June 4, 2026/,
  },
};

for (const [locale, lang] of PAGES) {
  const name = locale || 'root';
  const L = LOCALES[lang];
  const F = FACTS[lang];

  test(`Draw ${name} policy: every overseas recipient has a transfer block with all statutory items`, () => {
    const section = article(read(locale), L.article);
    const tableRecipients = [...section.matchAll(/<tr>\s*<td>([^<]+)<\/td>/g)].map(m => m[1]);
    assert.deepEqual(tableRecipients, RECIPIENTS.map(([n]) => n), 'table rows');
    const blocks = transferBlocks(section);
    assert.deepEqual(blocks.map(b => b.heading), RECIPIENTS.map(([n]) => L.heading(n)), 'one block per table row, same order');
    for (const [recipient, { address, route }] of RECIPIENTS) {
      const block = blocks.find(b => b.heading === L.heading(recipient));
      assert.ok(block.contactHtml.startsWith(`${L.country} · ${address} · ${L.contact}: `), `${recipient}: country, address, contact`);
      assert.ok(block.contactHtml.includes(route), `${recipient}: official contact route`);
      assert.deepEqual(block.items.map(([label]) => label), L.labels, `${recipient}: items, timing/method, purpose, retention, refusal`);
      for (const [label, value] of block.items) assert.ok(value.length > 10, `${recipient}: empty "${label}"`);
    }
  });

  test(`Draw ${name} policy: provider entity names and retention periods`, () => {
    const page = read(locale);
    // 법인명 — OpenAI 는 계약 법인명으로만(위탁 표·이전 표·세부 제목).
    assert.equal((page.match(/<td>OpenAI OpCo, LLC<\/td>/g) || []).length, 2);
    assert.doesNotMatch(page, /<td>OpenAI<\/td>|<h3>OpenAI<\/h3>/);
    // Gemini 는 AI Studio 의 Gemini API(API 키)로 호출한다 — Vertex AI 가 아니다.
    assert.doesNotMatch(page, /Vertex/);
    assert.equal((page.match(/<td>Google LLC \(Gemini API\)<\/td>/g) || []).length, 2);
    const gemini = { ko: '남용 감시 목적으로 최대 55일 보관 후 삭제', ja: '不正利用監視のため最大55日保管後に削除', en: 'p to 55 days for abuse monitoring, then deleted' }[lang];
    assert.equal(page.split(gemini).length - 1, 2, 'Gemini 55 days: entrustment table and transfer block');
    assert.ok(blockOf(page, lang, 'Google LLC (Gemini API)').text.includes(gemini));
    const openAi = {
      ko: '최대 30일 보관 후 삭제(법령상 더 긴 보관이 필요하거나 OpenAI 서비스·제3자 보호에 합리적으로 필요한 경우 제외',
      ja: '最大30日保管後に削除(法令上より長い保管が必要な場合、またはOpenAIのサービス・第三者の保護に合理的に必要な場合を除く',
      en: "p to 30 days for abuse monitoring, then deleted, unless longer retention is required by law or reasonably necessary to protect the provider's services or third parties",
    }[lang];
    assert.equal(page.split(openAi).length - 1, 2, 'OpenAI 30 days with its exception: entrustment table and transfer block');
    assert.ok(blockOf(page, lang, 'OpenAI OpCo, LLC').text.includes(openAi));
  });

  test(`Draw ${name} policy: transfer facts checked against the app code`, () => {
    const page = read(locale);
    const collected = articleNo(page, 2);
    assert.ok(text(collected).includes(F.format), 'result formats');
    const check = (recipient, needles) => {
      const block = blockOf(page, lang, recipient);
      for (const needle of needles) assert.ok(block.text.includes(needle), `${recipient}: ${needle}`);
    };
    check('Google LLC (Firebase)', F.firebase);
    check('Google LLC (Gemini API)', F.gemini);
    check('Google LLC (AdMob)', F.admob);
    check('Apple Inc.', F.apple);
    check('Google LLC (Google Play)', F.play);
    assert.ok(article(page, L.article).includes(F.admobRow), 'transfer table AdMob row lists the rewarded-ad identifier');
    assert.ok(collected.includes(F.purchaseRow), 'section 2 purchase row lists the purchase record and balance');
  });

  test(`Draw ${name} policy: photo sizes and automatic analytics and ad collection match the app`, () => {
    const page = read(locale);
    const collected = articleNo(page, 2);
    for (const needle of F.photoRow) assert.ok(collected.includes(needle), `section 2 photo row: ${needle}`);
    const conversion = articleNo(page, 3);
    for (const needle of F.transmission) assert.ok(conversion.includes(needle), `section 3 transmission: ${needle}`);
    assert.ok(plain(articleNo(page, 1)).includes(F.analyticsPurpose), 'section 1 analytics purpose');
    for (const needle of F.analyticsRow) assert.ok(collected.includes(needle), `section 2 analytics row: ${needle}`);
    // 광고 데이터도 동의를 묻지 않는 지역(한국 등)에서는 광고를 불러올 때 수집된다 — '동의 시에만'이라고 쓰지 않는다.
    assert.ok(text(collected).includes(F.adRow), 'section 2 advertising row: when it is collected');
    assert.doesNotMatch(page, F.optionalAnalytics, 'analytics and ad data are not described as optional or consent-only');
  });

  test(`Draw ${name} policy: effective date, previous date and change note come from the publish date`, () => {
    const page = read(locale);
    assert.match(page, new RegExp(`const \\{ effectiveDate, previousDate, sameDay \\} = drawPrivacyRevision\\('${lang}'\\);`));
    assert.match(page, /<p class="legal-date">[^<]*\{effectiveDate\}<\/p>/, 'hero uses the shared date');
    const N = CHANGE_NOTES[lang];
    assert.doesNotMatch(page, N.hardcodedDates, 'no hard-coded current or previous effective date');
    const { sameDay, later } = closingParagraphs(page);
    for (const paragraph of [sameDay, later]) {
      assert.ok(paragraph.includes('{effectiveDate}') && paragraph.includes('{previousDate}'), 'both change notes use the shared dates');
    }
    for (const note of N.sameDay) assert.ok(sameDay.includes(note), `same-day change note: ${note}`);
    for (const note of N.later) assert.ok(later.includes(note), `later change note: ${note}`);
    assert.ok(!later.includes(N.onlySameDay), 'a later version does not repeat the change already published on October 1');
  });

  // 서버가 Firestore 에 남기는 기록 두 가지(pipi_draw functions/src):
  //  - sketch_jobs: sketch_job.ts buildProcessingJob·SketchJobResult, expireAt = 생성 + 7일(sketch_job_store.ts)
  //    + Firestore TTL 정책(sketch_jobs.expireAt, ACTIVE). 계정 삭제 시 deleteUserArtifacts 가 함께 지운다.
  //  - ai_reports: ai_report.ts buildAiReportDoc(사유만, 자유 메모 없음). TTL 없음 — 계정 삭제 시 함께 지운다.
  // 포인트팩·프리미엄 구독은 앱에 구매 경로가 없다(AppConfig.premiumEnabled·galleryEnabled = false,
  // 구매 시트는 호출처 없음) — 제1조 인앱 결제는 AI 변환권만.
  test(`Draw ${name} policy: server-side job and report records, and only conversion packs on sale`, () => {
    const page = read(locale);
    const R = {
      ko: {
        jobRow: '변환 작업 기록', reportRow: 'AI 결과 신고 기록',
        jobItems: ['변환 요청 id', '처리 상태(처리 중·완료·실패)', '차감 내역(무료 횟수·변환권)', '실패 시 오류 코드·환불 여부', '사용자 식별자'],
        // 사유 4종 사이는 쉼표 — '사람·동물'의 가운뎃점과 섞여 다섯 개로 읽히지 않게.
        reportItems: ['고른 신고 사유(불쾌하거나 부적절함, 사람·동물 모습이 이상함, 사진과 너무 다름, 기타 중 하나)', '앱 버전·빌드·플랫폼', '사용자 식별자', '자유 입력 메모는 받지 않습니다'],
        jobRetention: '변환 작업 기록: 생성 후 7일이 지나면 자동 삭제(Firestore TTL), 그 전에 계정이 삭제되면 함께 삭제',
        reportRetention: 'AI 결과 신고 기록: 계정 유지 기간 동안 보관, 계정 삭제 시 함께 삭제',
        purchases: 'AI 변환권 구매 처리와 구매 검증', offOffers: /포인트팩|프리미엄/,
        firebase: '변환 작업 기록과 AI 결과 신고 기록',
      },
      ja: {
        jobRow: '変換ジョブの記録', reportRow: 'AI結果の報告記録',
        jobItems: ['変換リクエストID', '処理状態(処理中・完了・失敗)', '差し引いた内容(無料回数・変換チケット)', '失敗時のエラーコード・返金の有無', 'ユーザー識別子'],
        reportItems: ['選んだ理由(不快・不適切な内容、人や動物の姿がおかしい、写真とぜんぜん違う、その他)', 'アプリのバージョン・ビルド・プラットフォーム', 'ユーザー識別子', '自由記述のメモは受け取りません'],
        jobRetention: '変換ジョブの記録: 作成から 7日 経過後に自動削除(Firestore の TTL)。それより前にアカウントが削除された場合は併せて削除',
        reportRetention: 'AI結果の報告記録: アカウント保有期間中は保存、アカウント削除時に併せて削除',
        purchases: 'AI変換チケットの購入処理と購入の確認', offOffers: /ポイントパック|プレミアム/,
        firebase: '変換ジョブの記録とAI結果の報告記録',
      },
      en: {
        jobRow: 'Conversion Job Records', reportRow: 'AI Result Reports',
        jobItems: ['Conversion request ID', 'status (in progress, completed, failed)', 'a free conversion or a conversion pack', 'an error code and whether it was refunded', 'user identifier'],
        reportItems: ['the reason you chose (offensive or inappropriate, people or animals look distorted, too different from the photo, other)', 'app version, build and platform', 'user identifier', 'No free-text note is collected'],
        jobRetention: 'Conversion job records: Automatically deleted 7 days after creation (Firestore TTL), or earlier together with the account if it is deleted',
        reportRetention: 'AI result reports: Retained while the account exists; deleted together with the account',
        purchases: 'Processing and verifying purchases of AI conversion packs', offOffers: /point pack|premium/i,
        firebase: 'conversion job records and AI result reports',
      },
    }[lang];

    const collected = articleNo(page, 2);
    const row = label => {
      const m = collected.match(new RegExp(`<tr>\\s*<td>${label}</td>\\s*<td>([^<]*)</td>`));
      assert.ok(m, `section 2 row: ${label}`);
      return m[1];
    };
    for (const item of R.jobItems) assert.ok(row(R.jobRow).includes(item), `job record item: ${item}`);
    for (const item of R.reportItems) assert.ok(row(R.reportRow).includes(item), `report record item: ${item}`);

    const retention = plain(articleNo(page, 4));
    assert.ok(retention.includes(R.jobRetention), 'job records: 7-day automatic deletion');
    assert.ok(retention.includes(R.reportRetention), 'reports: kept with the account, deleted with it');

    const purposes = plain(articleNo(page, 1));
    assert.ok(purposes.includes(R.purchases), 'in-app purchases: conversion packs');
    assert.doesNotMatch(purposes, R.offOffers, 'no point packs or premium subscription in the purposes');

    assert.ok(blockOf(page, lang, 'Google LLC (Firebase)').text.includes(R.firebase), 'Firebase transfer items');
  });
}

test('Draw privacy dates render per language and reject bad dates', async () => {
  const { DRAW_PRIVACY_EFFECTIVE_DATE, drawPrivacyEffectiveDate } = await import('../src/data/pipi-draw-privacy.mjs');
  assert.equal(DRAW_PRIVACY_EFFECTIVE_DATE, CURRENT_EFFECTIVE_DATE);
  assert.equal(drawPrivacyEffectiveDate('ko', '2026-10-01'), '2026년 10월 1일');
  assert.equal(drawPrivacyEffectiveDate('ja', '2026-10-01'), '2026年10月1日');
  assert.equal(drawPrivacyEffectiveDate('en', '2026-10-01'), 'October 1, 2026');
  assert.equal(drawPrivacyEffectiveDate('en', '2026-12-09'), 'December 9, 2026');
  assert.throws(() => drawPrivacyEffectiveDate('ko', '2026-02-30'));
  assert.throws(() => drawPrivacyEffectiveDate('ko', '2026/10/01'));
  assert.throws(() => drawPrivacyEffectiveDate('fr'));
});

test('Draw privacy revision: publishing on October 1 amends that version, a later date starts a new one', async () => {
  const { drawPrivacyRevision, DRAW_PRIVACY_LIVE_EFFECTIVE_DATE, DRAW_PRIVACY_LIVE_PREVIOUS_DATE } = await import('../src/data/pipi-draw-privacy.mjs');
  // 지금 공개된 판(#69): 시행일 2026-10-01, 이전 방침 시행일 2026-06-04.
  assert.equal(DRAW_PRIVACY_LIVE_EFFECTIVE_DATE, '2026-10-01');
  assert.equal(DRAW_PRIVACY_LIVE_PREVIOUS_DATE, '2026-06-04');
  assert.deepEqual(drawPrivacyRevision('ko', '2026-10-01'), { sameDay: true, effectiveDate: '2026년 10월 1일', previousDate: '2026년 6월 4일' });
  assert.deepEqual(drawPrivacyRevision('ja', '2026-10-01'), { sameDay: true, effectiveDate: '2026年10月1日', previousDate: '2026年6月4日' });
  assert.deepEqual(drawPrivacyRevision('en', '2026-10-01'), { sameDay: true, effectiveDate: 'October 1, 2026', previousDate: 'June 4, 2026' });
  // 10월 2일 이후 게시 — 시행일 = 게시일, 이전 방침 시행일 = 2026-10-01.
  assert.deepEqual(drawPrivacyRevision('ko', '2026-10-02'), { sameDay: false, effectiveDate: '2026년 10월 2일', previousDate: '2026년 10월 1일' });
  assert.deepEqual(drawPrivacyRevision('ja', '2026-10-15'), { sameDay: false, effectiveDate: '2026年10月15日', previousDate: '2026年10月1日' });
  assert.deepEqual(drawPrivacyRevision('en', '2026-11-03'), { sameDay: false, effectiveDate: 'November 3, 2026', previousDate: 'October 1, 2026' });
  // 공개된 판보다 앞선 날짜는 거부한다.
  assert.throws(() => drawPrivacyRevision('ko', '2026-09-30'));
  // 페이지가 쓰는 기본값은 지금 게시일이다.
  assert.equal(drawPrivacyRevision('ko').sameDay, CURRENT_EFFECTIVE_DATE === DRAW_PRIVACY_LIVE_EFFECTIVE_DATE);
});

test('Draw root privacy page mirrors the English page apart from its own links', () => {
  const normalize = page => page
    .replaceAll("'../../../../", "'../../../")
    .replace('<a href="/en/" class="legal-back">', '<a href="/" class="legal-back">')
    .replace('<a href="/en/privacy">', '<a href="/privacy">');
  assert.equal(read(''), normalize(read('en')));
});
