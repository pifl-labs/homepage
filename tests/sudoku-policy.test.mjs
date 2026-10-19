import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

// 한칸씩 스도쿠 방침·지원 페이지의 빌드 결과(dist/)를 검사한다. npm run build 뒤에 실행해야 하며,
// 빌드 전이라 dist/ 가 없으면 이유를 남기고 건너뛴다.
const SITE = 'https://pifl-labs.com';
const PAGES = ['privacy', 'support'];
const LOCALES = ['ko', 'en', 'ja'];
const file = (prefix, page) => new URL(`../dist/${prefix ? `${prefix}/` : ''}apps/pipi-sudoku/${page}/index.html`, import.meta.url);
const skip = !existsSync(file('ko', 'privacy')) && 'dist/ 가 없습니다 — npm run build 뒤에 실행하세요';
const read = (prefix, page) => readFileSync(file(prefix, page), 'utf8');
const url = (locale, page) => `${SITE}/${locale}/apps/pipi-sudoku/${page}/`;
const canonical = html => html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
const alternates = html => Object.fromEntries(
  [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map(m => [m[1], m[2]]),
);

for (const page of PAGES) {
  for (const locale of LOCALES) {
    test(`${locale} ${page}: own canonical, ko/en/ja hreflang and x-default /ko/`, { skip }, () => {
      const html = read(locale, page);
      assert.match(html, new RegExp(`<html lang="${locale}"`));
      assert.equal(canonical(html), url(locale, page));
      assert.deepEqual(alternates(html), {
        en: url('en', page),
        ko: url('ko', page),
        ja: url('ja', page),
        'x-default': url('ko', page),
      });
    });
  }

  test(`unprefixed ${page} renders English with the /en/ canonical`, { skip }, () => {
    const html = read('', page);
    assert.match(html, /<html lang="en"/);
    assert.equal(canonical(html), url('en', page));
    assert.equal(alternates(html)['x-default'], url('ko', page));
  });

  test(`${page}: emails stay obfuscated, never a plain mailto`, { skip }, () => {
    for (const prefix of [...LOCALES, '']) {
      const html = read(prefix, page);
      assert.doesNotMatch(html, /mailto:/i);
      assert.match(html, /data-email-user="privacy" data-email-domain="pifl-labs\.com"/);
    }
  });
}

// 「数独」「SUDOKU」는 일본에서 니콜리의 등록상표다. 일본어판은 「ナンプレ」만 쓰고,
// 남는 "sudoku" 는 URL slug(pipi-sudoku)뿐이어야 한다.
test('Japanese pages never use 数独 or SUDOKU, and sudoku survives only in the slug', { skip }, () => {
  for (const page of PAGES) {
    const html = read('ja', page);
    assert.doesNotMatch(html, /数独|SUDOKU/);
    assert.doesNotMatch(html.replaceAll('pipi-sudoku', ''), /sudoku/i);
    assert.match(html, /ひとマスずつナンプレ/);
  }
});

// Android(Google Play) 앱. 근거는 pipi_sudoku 의 앱 코드다: res/xml/data_extraction_rules.xml·backup_rules.xml 이
// files/SudokuScope(저장 위치)만 Google 계정 백업과 새 기기 이전에 넣고, MainActivity.kt 의 공유는 ACTION_SEND 를
// 시스템 공유 시트(createChooser)로 열며, build.gradle.kts 의 generateLocaleConfig 가 Android 13+ 앱별 언어(en·ja·ko)를
// 만든다. Google 이 처리하는 정보(사용·진단 동의 기기의 충돌·ANR, 테스트 트랙)는 Google 공식 도움말 기준이다.
const text = html => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const ANDROID = {
  privacy: {
    ko: [
      'iPhone·iPad와 Android용 모바일 애플리케이션', '기기의 공유 시트로', 'Android의 Google 계정 백업', '새 기기로 옮기기',
      '제7조 (Apple·Google이 처리하는 정보)', 'Google Play에서 앱을 내려받는 과정', '사용 및 진단 정보 공유에 동의한 경우의 충돌·ANR',
      'Google Play Console의 테스터 목록에 이메일 주소로', 'iOS의 추적 허용 요청',
      'App Store 또는 Google Play에서 앱을 이용하는 경우', '(TestFlight·Google Play 테스터는 제7조 참조)',
    ],
    en: [
      'a mobile app for iPhone, iPad and Android', "opens your device's share sheet", 'on Android a backup to your Google Account',
      'a transfer to a new device', '7. Information Handled by Apple and Google', 'Google Play downloads of the App',
      'opted in, in their device settings, to share usage and diagnostics data',
      'a tester list in Google Play Console', "iOS's App Tracking Transparency prompt", 'For App Store and Google Play users of the App',
      'for TestFlight and Google Play testers, see Section 7',
    ],
    ja: [
      'iPhone・iPad・Android向けのモバイルアプリケーション', '端末の共有シートで', 'AndroidのGoogleアカウントへのバックアップ', '新しい端末への移行',
      '第7条 (Apple・Googleが取り扱う情報)', 'Google Playからの本アプリのダウンロード', '使用状況と診断情報の共有に同意したお客様の端末からのクラッシュ・ANR',
      'Google Play Consoleのテスターリストにメールアドレスで', 'iOSのトラッキングの許可を求める画面',
      'App StoreまたはGoogle Playから本アプリをご利用の場合', '（TestFlightとGoogle Playのテスターについては第7条をご覧ください）',
    ],
  },
  support: {
    ko: ['앱별 언어 설정(Android 13 이상)', 'Android의 Google 계정 백업', '새 기기로 옮기기', '기기 모델과 iOS 또는 Android 버전'],
    en: ["the app's own language setting (Android 13 and later)", 'on Android a backup to your Google Account', 'a transfer to a new device', 'Device model and iOS or Android version'],
    ja: ['アプリごとの言語設定（Android 13以降）', 'AndroidのGoogleアカウントへのバックアップ', '新しい端末への移行', '端末のモデルとiOSまたはAndroidのバージョン'],
  },
};
// iOS 만 말하던 옛 문구. Android 이용자에게 틀린 안내가 되므로 남으면 안 된다.
const IOS_ONLY = {
  ko: ['iOS 공유 시트로', 'iOS 백업 설정을 따릅니다', 'iOS 설정을 따릅니다', '(TestFlight 테스터는', 'iPhone·iPad의 언어 설정을 따릅니다'],
  en: ['opens the iOS share sheet', 'depends on your iOS backup settings', 'depends on your iOS settings', 'for TestFlight testers,', 'Device model and iOS version'],
  ja: ['iOSの共有シートで', 'iOSのバックアップ設定によります', 'iOSの設定によります', '（TestFlightのテスターについて', 'iPhone・iPadの言語設定に従います'],
};

for (const page of PAGES) {
  for (const locale of LOCALES) {
    test(`${locale} ${page}: covers the Android app and drops iOS-only wording`, { skip }, () => {
      const body = text(read(locale, page));
      for (const phrase of ANDROID[page][locale]) assert.ok(body.includes(phrase), `missing: ${phrase}`);
      for (const phrase of IOS_ONLY[locale]) assert.ok(!body.includes(phrase), `iOS-only wording left: ${phrase}`);
      // Google 개인정보처리방침은 그 언어판으로 연결한다(href 는 본문 글자에 없으므로 HTML 에서 본다).
      if (page === 'privacy') {
        assert.ok(read(locale, page).includes(`href="https://policies.google.com/privacy?hl=${locale}"`), `Google privacy link (${locale})`);
      }
    });
  }
}

// 시행일은 머리말(legal-date)과 마지막 조(변경)에 두 번 나오고, 세 언어가 같은 날이어야 한다.
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const iso = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const EFFECTIVE = {
  ko: { hero: /시행일: (\d{4})년 (\d{1,2})월 (\d{1,2})일/, body: /이 개인정보 처리방침은 (\d{4})년 (\d{1,2})월 (\d{1,2})일부터 적용됩니다/ },
  en: { hero: /Effective Date: ([A-Z][a-z]+) (\d{1,2}), (\d{4})/, body: /This Privacy Policy is effective from ([A-Z][a-z]+) (\d{1,2}), (\d{4})/ },
  ja: { hero: /施行日: (\d{4})年(\d{1,2})月(\d{1,2})日/, body: /本プライバシーポリシーは、(\d{4})年(\d{1,2})月(\d{1,2})日から施行します/ },
};
const effective = (locale, pattern, body) => {
  const m = body.match(pattern);
  assert.ok(m, `${locale}: effective date not found (${pattern})`);
  return locale === 'en' ? iso(m[3], MONTHS.indexOf(m[1]) + 1, m[2]) : iso(m[1], m[2], m[3]);
};

test('privacy: one effective date in the hero and the last article, the same in ko, en and ja', { skip }, () => {
  const dates = [...LOCALES, ''].map(prefix => {
    const locale = prefix || 'en';
    const body = text(read(prefix, 'privacy'));
    const hero = effective(locale, EFFECTIVE[locale].hero, body);
    assert.equal(effective(locale, EFFECTIVE[locale].body, body), hero, `${prefix || 'unprefixed'}: hero and last article differ`);
    return hero;
  });
  assert.equal(new Set(dates).size, 1, `effective dates differ: ${dates.join(', ')}`);
});
