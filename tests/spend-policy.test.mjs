import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

// 가계부: 매일 지출 기록(pipi-spend, 스토어 영문명 Spending Log: Expense Tracker) 개인정보처리방침의 빌드 결과(dist/)를 검사한다.
// npm run build 뒤에 실행해야 하며, dist/ 가 없으면 이유를 남기고 건너뛴다.
// 원고(SSOT)는 pipi_spend 의 docs/privacy/privacy-{ko,en,ja,de,fr,es,pt-BR,it,zh-Hant,id}.md(시행 2026-10-27)다:
// 수기 입력 전용·서버 없음, AdMob(배너·전면·보상형)+UMP+iOS ATT, Google Analytics for Firebase(광고 ID 수집 끔),
// Pro 1회 구매(com.pifl.pipi.spend.pro), 앱 안 링크는 app_config.dart — ko/en/ja 는 /<lang>/apps/pipi-spend/privacy,
// 나머지 7개 언어는 /apps/pipi-spend/privacy#<Locale.languageCode>(pt-BR→pt, zh-Hant→zh).
const SITE = 'https://pifl-labs.com';
const LOCALES = ['ko', 'en', 'ja'];
const PREFIXES = [...LOCALES, ''];
const EXTRA = [
  { lang: 'de', id: 'de', title: 'Datenschutzerklärung — Spending Log: Expense Tracker', date: 'Gültig ab: 27. Oktober 2026', retention: '3 Jahre nach Abschluss Ihres Anliegens' },
  { lang: 'fr', id: 'fr', title: 'Politique de confidentialité — Spending Log: Expense Tracker', date: 'Date d\'entrée en vigueur : 27 octobre 2026', retention: 'conservés 3 ans après le traitement de votre demande' },
  { lang: 'es', id: 'es', title: 'Política de privacidad — Spending Log: Expense Tracker', date: 'Fecha de entrada en vigor: 27 de octubre de 2026', retention: 'se conservan 3 años después de atender su solicitud' },
  { lang: 'pt-BR', id: 'pt', title: 'Política de Privacidade — Spending Log: Expense Tracker', date: 'Data de vigência: 27 de outubro de 2026', retention: 'mantidos por 3 anos após o tratamento da sua solicitação' },
  { lang: 'it', id: 'it', title: 'Informativa sulla privacy — Spending Log: Expense Tracker', date: 'Data di entrata in vigore: 27 ottobre 2026', retention: 'conservate per 3 anni dopo la gestione della tua richiesta' },
  { lang: 'zh-Hant', id: 'zh', title: '隱私權政策 — Spending Log: Expense Tracker', date: '生效日期：2026 年 10 月 27 日', retention: '在處理完你的請求後保存 3 年' },
  { lang: 'id', id: 'id', title: 'Kebijakan Privasi — Spending Log: Expense Tracker', date: 'Tanggal berlaku: 27 Oktober 2026', retention: 'disimpan selama 3 tahun setelah permintaan Anda selesai ditangani' },
];
const file = prefix => new URL(`../dist/${prefix ? `${prefix}/` : ''}apps/pipi-spend/privacy/index.html`, import.meta.url);
const skip = !existsSync(file('ko')) && 'dist/ 가 없습니다 — npm run build 뒤에 실행하세요';
const read = prefix => readFileSync(file(prefix), 'utf8');
// 루트 페이지는 scoped <style> 때문에 요소마다 data-astro-cid 속성이 붙는다 — 여는 태그는 [^>]* 로 받는다.
const main = html => html.match(/<main class="legal-page"[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? '';
const hero = html => html.match(/<section class="legal-hero"[^>]*>[\s\S]*?<\/section>/)?.[0] ?? '';
// 루트 페이지: 영어 본문(첫 legal-card, 언어 내비 주석 앞까지)과 언어 섹션을 나눈다.
const englishCard = html => main(html).match(/<div class="legal-card"[^>]*>[\s\S]*?<\/div>\s*<!-- Other languages/)?.[0] ?? '';
// 영어 본문: /en/ 은 main 전체, 루트는 영어 카드만.
const english = prefix => (prefix === '' ? englishCard(read('')) : main(read(prefix)));
const section = (html, id) => html.match(new RegExp(`<section id="${id}" lang="[^"]+"[^>]*>[\\s\\S]*?<\\/section>`))?.[0] ?? '';
const count = (html, re) => (html.match(re) ?? []).length;
const url = locale => `${SITE}/${locale}/apps/pipi-spend/privacy/`;
const canonical = html => html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
const alternates = html => Object.fromEntries(
  [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map(m => [m[1], m[2]]),
);
const name = prefix => prefix || 'root';
const EFFECTIVE = { ko: '시행일: 2026년 10월 27일', en: 'Effective date: October 27, 2026', ja: '施行日：2026年10月27日', '': 'Effective date: October 27, 2026' };
const H1 = { ko: '개인정보 처리방침 — 가계부: 매일 지출 기록', en: 'Privacy Policy — Spending Log: Expense Tracker', ja: 'プライバシーポリシー — 家計簿：毎日の支出記録', '': 'Privacy Policy — Spending Log: Expense Tracker' };

for (const locale of LOCALES) {
  test(`${locale}: own canonical, ko/en/ja hreflang and x-default /ko/`, { skip }, () => {
    const html = read(locale);
    assert.match(html, new RegExp(`<html lang="${locale}"`));
    assert.equal(canonical(html), url(locale));
    assert.deepEqual(alternates(html), { en: url('en'), ko: url('ko'), ja: url('ja'), 'x-default': url('ko') });
  });
}

test('unprefixed path renders English with the /en/ canonical', { skip }, () => {
  const html = read('');
  assert.match(html, /<html lang="en"/);
  assert.equal(canonical(html), url('en'));
  assert.equal(alternates(html)['x-default'], url('ko'));
});

test('title, effective date 2026-10-27, obfuscated support email only, current company address', { skip }, () => {
  for (const prefix of PREFIXES) {
    const html = read(prefix);
    const head = hero(html);
    const body = main(html);
    assert.match(head, new RegExp(`<span class="text-gradient"[^>]*>${H1[prefix].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</span>`), `${name(prefix)}: 원고 제목`);
    assert.ok(head.includes(EFFECTIVE[prefix]), `${name(prefix)}: 시행일`);
    assert.doesNotMatch(body, /mailto:/i);
    assert.doesNotMatch(body, /andrew\.kim|privacy \(at\)/i);
    assert.doesNotMatch(body, /support@pifl-labs\.com/, `${name(prefix)}: 평문 이메일 없음`);
    assert.match(body, /data-email-user="support" data-email-domain="pifl-labs\.com"/);
    assert.match(body, /죽성서길 59|59 Jukseongseo-gil/, `${name(prefix)}: 법인 주소`);
    assert.match(body, /696579400/, `${name(prefix)}: D-U-N-S`);
    assert.doesNotMatch(body, /아란서길|Aranseo/);
  }
});

// 원고 ## 17개 = ko/en/ja 페이지의 h2 17개. 루트는 영어 카드 h2 17개 + 언어 섹션마다 h2(제목) 1개·h3(조항) 17개·h4 6개.
test('heading counts match the manuscripts (17 sections, 6 sub-sections per language)', { skip }, () => {
  for (const locale of LOCALES) {
    const body = main(read(locale));
    assert.equal(count(body, /<h2[\s>]/g), 17, `${locale}: h2`);
    assert.equal(count(body, /<h3[\s>]/g), 6, `${locale}: h3`);
  }
  const root = read('');
  assert.equal(count(englishCard(root), /<h2[\s>]/g), 17, 'root(en): h2');
  assert.equal(count(englishCard(root), /<h3[\s>]/g), 6, 'root(en): h3');
  for (const { id, lang } of EXTRA) {
    const sec = section(root, id);
    assert.ok(sec, `root: section #${id}`);
    assert.equal(count(sec, /<h2[\s>]/g), 1, `${lang}: 섹션 제목 h2`);
    assert.equal(count(sec, /<h3[\s>]/g), 17, `${lang}: 조항 h3`);
    assert.equal(count(sec, /<h4[\s>]/g), 6, `${lang}: 하위 조항 h4`);
  }
});

// 앱 app_config.dart: 7개 언어는 /apps/pipi-spend/privacy#<Locale.languageCode> — 앵커 id 가 정확히 de/fr/es/pt/it/zh/id 여야 한다.
test('root page carries the 7 extra-language sections with exact anchor ids and a language nav', { skip }, () => {
  const html = read('');
  const body = main(html);
  assert.match(body, /<nav class="legal-lang-nav"[^>]*aria-label="Other languages"/);
  for (const { lang, id, title, date, retention } of EXTRA) {
    assert.equal(count(html, new RegExp(`id="${id}"`, 'g')), 1, `#${id} 는 페이지에 한 번`);
    const sec = section(html, id);
    assert.ok(sec.startsWith(`<section id="${id}" lang="${lang}"`), `${lang}: <section id lang>`);
    assert.ok(sec.includes(title), `${lang}: 원고 제목`);
    assert.ok(sec.includes(date), `${lang}: 시행일`);
    assert.ok(sec.includes(retention), `${lang}: 지원 메일 3년`);
    assert.ok(body.includes(`href="#${id}"`), `${lang}: 앵커 내비 링크`);
    assert.ok(sec.includes('AdMob') && sec.includes('Firebase') && sec.includes('com.pifl.pipi.spend.pro'), `${lang}: AdMob·Firebase·Pro`);
    assert.doesNotMatch(sec, /support@pifl-labs\.com|mailto:/);
  }
  for (const locale of LOCALES) {
    assert.equal(count(read(locale), /<section id="(de|fr|es|pt|it|zh|id)"/g), 0, `${locale}: 언어 섹션 없음`);
  }
});

// 광고·분석·동의·ATT·Pro 를 숨기는 문장이 들어오면 안 되고, 원고의 핵심 사실이 각 언어판에 있어야 한다.
test('ads, consent, analytics and Pro are disclosed in every locale', { skip }, () => {
  const rules = {
    // 루트 페이지의 <strong> 에는 data-astro-cid 가 붙으므로 여는 태그는 [^>]* 로 받는다.
    ko: [/Google AdMob/, /User Messaging Platform/, /앱 추적 투명성\(ATT\)/, /Google Analytics for Firebase/, /광고 ID 수집은 <strong[^>]*>꺼져 있습니다\.<\/strong>/,
      /com\.pifl\.pipi\.spend\.pro/, /하루 최대 2번의 전면 광고/, /은행·카드 연동, 영수증 촬영·인식, 클라우드 동기화가 없으며/],
    en: [/Google AdMob/, /User Messaging Platform/, /App Tracking Transparency \(ATT\)/, /Google Analytics for Firebase/, /collection of the advertising ID by Firebase is <strong[^>]*>disabled<\/strong>/,
      /com\.pifl\.pipi\.spend\.pro/, /full-screen ads at most twice a day/, /no bank or card linking, no receipt scanning and no cloud sync/],
    ja: [/Google AdMob/, /User Messaging Platform/, /App Tracking Transparency（ATT）/, /Google Analytics for Firebase/, /広告IDの収集は<strong[^>]*>無効<\/strong>/,
      /com\.pifl\.pipi\.spend\.pro/, /1日2回までの全画面広告/, /銀行口座・カードとの連携、レシートの読み取り、クラウド同期もありません/],
  };
  rules[''] = rules.en;
  const stale = /shows no ads|no ads and no tracking|광고를 보여 주지 않으며|광고 SDK를 포함하지 않|広告を表示せず|広告SDKを含みません|subscription (?:plan|price)|구독료|定期購読/i;
  for (const prefix of PREFIXES) {
    const body = prefix ? main(read(prefix)) : english('');
    assert.ok(body.length > 1000, `${name(prefix)}: 본문 추출`);
    for (const re of rules[prefix]) assert.match(body, re, `${name(prefix)}: ${re}`);
    assert.doesNotMatch(body, stale, `${name(prefix)}: 옛/틀린 문장`);
  }
});

// 빈칸·선례 정렬(pipi-bp ko/ja 공개본 origin/main, pipi-habit 공개본): 보호책임자 표기, 만 14세, 지원 메일 3년, 구제기관 연락처 형식, 일본어 회사명.
test('ko/ja blanks are filled from the published pipi-bp pages; no placeholder remains', { skip }, () => {
  const ko = main(read('ko'));
  assert.doesNotMatch(ko, /성명·직책 기재/);
  assert.match(ko, /개인정보 보호책임자: 주식회사 피플랩스 \(PiFl Labs Co\., Ltd\.\)/);
  assert.match(ko, /만 14세 미만\(EEA에서는 16세 미만\)/);
  assert.doesNotMatch(ko, /만 13세 미만/);
  assert.match(ko, /<strong[^>]*>지원 메일:<\/strong> 문의 처리 완료 후 3년 동안 보관한 뒤 지웁니다\./);
  for (const line of ['개인정보분쟁조정위원회: (국번없이) 1833-6972 (www.kopico.go.kr)', '개인정보침해신고센터(한국인터넷진흥원): (국번없이) 118 (privacy.kisa.or.kr)',
    '대검찰청: (국번없이) 1301 (www.spo.go.kr)', '경찰청: (국번없이) 182 (ecrm.cyber.go.kr)']) {
    assert.ok(ko.includes(line), `ko: ${line}`);
  }
  const ja = main(read('ja'));
  assert.match(ja, /株式会社ピープルラブズ（PiFl Labs Co\., Ltd\.、以下「当社」）/);
  assert.match(ja, /名称：株式会社ピープルラブズ（PiFl Labs Co\., Ltd\.）/);
  assert.match(ja, /対応完了後3年間保存し、その後削除します/);
  for (const prefix of ['en', '']) {
    assert.match(english(prefix), /kept for 3 years after your request is resolved, then deleted/, `${name(prefix)}: 3 years`);
  }
});

test('legal basis table, Korea/Japan/US-state sections and Google policy links are present', { skip }, () => {
  for (const prefix of PREFIXES) {
    const body = main(read(prefix));
    assert.match(body, /GDPR/, `${name(prefix)}: GDPR`);
    assert.match(body, /policies\.google\.com\/technologies\/partner-sites/, `${name(prefix)}: Google 파트너 정책 링크`);
    assert.match(body, /policies\.google\.com\/technologies\/retention/, `${name(prefix)}: Google 보유 정책 링크`);
    assert.match(body, /Do Not Sell or Share My Personal Information/, `${name(prefix)}: 미국 주법 거부 문구`);
    assert.match(body, /27-12|27条の12|27조의12/, `${name(prefix)}: 일본 외부송신`);
  }
});

test('policy links stay inside the same locale; no other-locale or general-policy links', { skip }, () => {
  for (const prefix of PREFIXES) {
    const body = main(read(prefix));
    for (const other of LOCALES.filter(l => l !== prefix)) {
      assert.ok(!body.includes(`href="/${other}/`), `${name(prefix)}: 다른 로케일(${other}) 링크 없음`);
    }
  }
});

// 대표 규칙(2026-10-27): 앱 전용 법적 링크는 사이트 공용 푸터에 넣지 않는다.
test('the shared site footer does not link the app policy', { skip }, () => {
  for (const locale of LOCALES) {
    const html = readFileSync(new URL(`../dist/${locale}/index.html`, import.meta.url), 'utf8');
    const footer = html.match(/<footer[\s\S]*?<\/footer>/)?.[0] ?? '';
    assert.ok(footer.length > 0, `${locale}: footer 존재`);
    assert.ok(!footer.includes('pipi-spend'), `${locale}: 공용 푸터에 pipi-spend 링크 없음`);
  }
});
