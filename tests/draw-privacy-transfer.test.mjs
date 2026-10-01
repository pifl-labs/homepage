import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// 밑그림(PiPi Draw) 개인정보처리방침 사실 검사 — 국외 이전 세부(개인정보 보호법 제28조의8 제2항 항목)와
// 제공자별 보관 기간·법인명·결과 형식·시행일. 근거는 앱 코드(pipi_draw functions/src·lib)와 각 제공자 공식 문서.
const readRepo = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const pagePath = locale => `src/pages/${locale ? `${locale}/` : ''}apps/pipi-draw/privacy.astro`;
const read = locale => readRepo(pagePath(locale));

const entities = s => s.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'");
const text = html => entities(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

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

for (const [locale, lang] of PAGES) {
  const name = locale || 'root';
  const L = LOCALES[lang];

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
    const facts = {
      ko: {
        format: '라인아트 PNG·그림체·사진 느낌 JPEG',
        firebase: ['Google Cloud 서울 리전', '미국 데이터센터에서만'],
        gemini: ['사용자 식별자는 보내지 않습니다', 'Gemini API에 전송'],
        admob: ['보상형 광고로 무료 변환을 받을 때는 보상 확인을 위해 익명 사용자 식별자', '9개월', '18개월'],
        apple: ['익명 사용자 식별자로 만든 UUID', '거래 정보를 Apple로 다시 보내지 않습니다'],
        play: ['상품 ID, 구매 토큰', 'Google Play 개발자 API'],
      },
      ja: {
        format: '線画はPNG・絵柄・写真の雰囲気はJPEG',
        firebase: ['Google Cloud のソウルリージョン', '米国のデータセンターでのみ'],
        gemini: ['ユーザー識別子は送信しません', 'Gemini API へ送信'],
        admob: ['リワード広告で無料変換を受け取るときは、報酬を確認するため匿名のユーザー識別子', '9か月', '18か月'],
        apple: ['匿名のユーザー識別子から作ったUUID', '取引情報を Apple へ送り返すことはありません'],
        play: ['商品ID、購入トークン', 'Google Play Developer API'],
      },
      en: {
        format: 'line art as PNG; art styles and photo looks as JPEG',
        firebase: ["Google Cloud's Seoul region", "only in Google's US data centers"],
        gemini: ['No user identifier is sent', 'to the Gemini API'],
        admob: ['When you watch a rewarded ad to get a free conversion, the anonymous user identifier', '9 months', '18 months'],
        apple: ['a UUID derived from the anonymous user identifier', 'does not send transaction information back to Apple'],
        play: ['the product ID and the purchase token', 'Google Play Developer API'],
      },
    }[lang];
    assert.ok(text(article(page, page.match(/<h2>((?:제2조|第2条|2\.)[^<]*)<\/h2>/)[1])).includes(facts.format), 'result formats');
    const check = (recipient, needles) => {
      const block = blockOf(page, lang, recipient);
      for (const needle of needles) assert.ok(block.text.includes(needle), `${recipient}: ${needle}`);
    };
    check('Google LLC (Firebase)', facts.firebase);
    check('Google LLC (Gemini API)', facts.gemini);
    check('Google LLC (AdMob)', facts.admob);
    check('Apple Inc.', facts.apple);
    check('Google LLC (Google Play)', facts.play);
  });

  test(`Draw ${name} policy: effective date comes from one shared line, previous date and change note kept`, () => {
    const page = read(locale);
    assert.match(page, new RegExp(`const effectiveDate = drawPrivacyEffectiveDate\\('${lang}'\\);`));
    assert.match(page, /<p class="legal-date">[^<]*\{effectiveDate\}<\/p>/, 'hero uses the shared date');
    // 맺음 조항(제17조·第17条·17.) — ko 는 그 뒤에 국제 이용자 안내가 더 있다.
    const closing = article(page, page.match(/<h2>((?:제17조|第17条|17\.)[^<]*)<\/h2>/)[1]);
    assert.ok(closing.includes('{effectiveDate}'), 'closing article uses the shared date');
    assert.doesNotMatch(page, /2026년 10월 1일|2026年10月1日|October 1, 2026/, 'no hard-coded current effective date');
    const previous = { ko: '2026년 6월 4일', ja: '2026年6月4日', en: 'June 4, 2026' }[lang];
    assert.ok(closing.includes(previous), 'previous effective date');
    const note = { ko: '모든 이전받는 자의 국외 이전 세부', ja: 'すべての移転先について国外移転の詳細', en: 'added for every recipient' }[lang];
    assert.ok(closing.includes(note), 'change note mentions the transfer details');
  });

  // 서버가 Firestore 에 남기는 기록 두 가지(pipi_draw functions/src):
  //  - sketch_jobs: sketch_job.ts buildProcessingJob·SketchJobResult, expireAt = 생성 + 7일(sketch_job_store.ts)
  //    + Firestore TTL 정책(sketch_jobs.expireAt, ACTIVE). 계정 삭제 시 deleteUserArtifacts 가 함께 지운다.
  //  - ai_reports: ai_report.ts buildAiReportDoc(사유만, 자유 메모 없음). TTL 없음 — 계정 삭제 시 함께 지운다.
  // 포인트팩·프리미엄 구독은 앱에 구매 경로가 없다(AppConfig.premiumEnabled·galleryEnabled = false,
  // 구매 시트는 호출처 없음) — 제1조 인앱 결제는 AI 변환권만.
  test(`Draw ${name} policy: server-side job and report records, and only conversion packs on sale`, () => {
    const page = read(locale);
    const plain = html => entities(html.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
    const R = {
      ko: {
        jobRow: '변환 작업 기록', reportRow: 'AI 결과 신고 기록',
        jobItems: ['변환 요청 id', '처리 상태(처리 중·완료·실패)', '차감 내역(무료 횟수·변환권)', '실패 시 오류 코드·환불 여부', '사용자 식별자'],
        reportItems: ['고른 신고 사유', '앱 버전·빌드·플랫폼', '사용자 식별자', '자유 입력 메모는 받지 않습니다'],
        jobRetention: '변환 작업 기록: 생성 후 7일이 지나면 자동 삭제(Firestore TTL), 그 전에 계정이 삭제되면 함께 삭제',
        reportRetention: 'AI 결과 신고 기록: 계정 유지 기간 동안 보관, 계정 삭제 시 함께 삭제',
        purchases: 'AI 변환권 구매 처리와 구매 검증', offOffers: /포인트팩|프리미엄/,
        firebase: '변환 작업 기록과 AI 결과 신고 기록',
        notes: ['변환 작업 기록과 AI 결과 신고 기록의 처리 항목·보유 기간 추가', '포인트팩·프리미엄 구독 결제 서술 삭제'],
      },
      ja: {
        jobRow: '変換ジョブの記録', reportRow: 'AI結果の報告記録',
        jobItems: ['変換リクエストID', '処理状態(処理中・完了・失敗)', '差し引いた内容(無料回数・変換チケット)', '失敗時のエラーコード・返金の有無', 'ユーザー識別子'],
        reportItems: ['選んだ理由', 'アプリのバージョン・ビルド・プラットフォーム', 'ユーザー識別子', '自由記述のメモは受け取りません'],
        jobRetention: '変換ジョブの記録: 作成から 7日 経過後に自動削除(Firestore の TTL)。それより前にアカウントが削除された場合は併せて削除',
        reportRetention: 'AI結果の報告記録: アカウント保有期間中は保存、アカウント削除時に併せて削除',
        purchases: 'AI変換チケットの購入処理と購入の確認', offOffers: /ポイントパック|プレミアム/,
        firebase: '変換ジョブの記録とAI結果の報告記録',
        notes: ['変換ジョブの記録とAI結果の報告記録の項目・保有期間を追加', 'ポイントパック・プレミアムサブスクリプションの課金の記載を削除'],
      },
      en: {
        jobRow: 'Conversion Job Records', reportRow: 'AI Result Reports',
        jobItems: ['Conversion request ID', 'status (in progress, completed, failed)', 'a free conversion or a conversion pack', 'an error code and whether it was refunded', 'user identifier'],
        reportItems: ['the reason you chose', 'app version, build and platform', 'user identifier', 'No free-text note is collected'],
        jobRetention: 'Conversion job records: Automatically deleted 7 days after creation (Firestore TTL), or earlier together with the account if it is deleted',
        reportRetention: 'AI result reports: Retained while the account exists; deleted together with the account',
        purchases: 'Processing and verifying purchases of AI conversion packs', offOffers: /point pack|premium/i,
        firebase: 'conversion job records and AI result reports',
        notes: ['conversion job records and AI result reports added with their retention', 'point pack and premium subscription purchases, which the App does not offer, removed'],
      },
    }[lang];

    const collected = article(page, page.match(/<h2>((?:제2조|第2条|2\.)[^<]*)<\/h2>/)[1]);
    const row = label => {
      const m = collected.match(new RegExp(`<tr>\\s*<td>${label}</td>\\s*<td>([^<]*)</td>`));
      assert.ok(m, `section 2 row: ${label}`);
      return m[1];
    };
    for (const item of R.jobItems) assert.ok(row(R.jobRow).includes(item), `job record item: ${item}`);
    for (const item of R.reportItems) assert.ok(row(R.reportRow).includes(item), `report record item: ${item}`);

    const retention = plain(article(page, page.match(/<h2>((?:제4조|第4条|4\.)[^<]*)<\/h2>/)[1]));
    assert.ok(retention.includes(R.jobRetention), 'job records: 7-day automatic deletion');
    assert.ok(retention.includes(R.reportRetention), 'reports: kept with the account, deleted with it');

    const purposes = plain(article(page, page.match(/<h2>((?:제1조|第1条|1\.)[^<]*)<\/h2>/)[1]));
    assert.ok(purposes.includes(R.purchases), 'in-app purchases: conversion packs');
    assert.doesNotMatch(purposes, R.offOffers, 'no point packs or premium subscription in the purposes');

    assert.ok(blockOf(page, lang, 'Google LLC (Firebase)').text.includes(R.firebase), 'Firebase transfer items');
    const closing = article(page, page.match(/<h2>((?:제17조|第17条|17\.)[^<]*)<\/h2>/)[1]);
    for (const note of R.notes) assert.ok(closing.includes(note), `change note: ${note}`);
  });
}

test('Draw privacy effective date renders per language and rejects bad dates', async () => {
  const { DRAW_PRIVACY_EFFECTIVE_DATE, drawPrivacyEffectiveDate } = await import('../src/data/pipi-draw-privacy.mjs');
  assert.equal(DRAW_PRIVACY_EFFECTIVE_DATE, '2026-10-01');
  assert.equal(drawPrivacyEffectiveDate('ko'), '2026년 10월 1일');
  assert.equal(drawPrivacyEffectiveDate('ja'), '2026年10月1日');
  assert.equal(drawPrivacyEffectiveDate('en'), 'October 1, 2026');
  assert.equal(drawPrivacyEffectiveDate('en', '2026-12-09'), 'December 9, 2026');
  assert.throws(() => drawPrivacyEffectiveDate('ko', '2026-02-30'));
  assert.throws(() => drawPrivacyEffectiveDate('ko', '2026/10/01'));
  assert.throws(() => drawPrivacyEffectiveDate('fr'));
});

test('Draw root privacy page mirrors the English page apart from its own links', () => {
  const normalize = page => page
    .replaceAll("'../../../../", "'../../../")
    .replace('<a href="/en/" class="legal-back">', '<a href="/" class="legal-back">')
    .replace('<a href="/en/privacy">', '<a href="/privacy">');
  assert.equal(read(''), normalize(read('en')));
});
