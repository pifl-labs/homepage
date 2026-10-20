import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const read = locale => readFileSync(
  new URL(`../src/pages/${locale ? `${locale}/` : ''}apps/pipi-words/privacy.astro`, import.meta.url),
  'utf8',
);

const cases = [
  {
    locale: 'ko',
    revision: '최근 수정:',
    sdk: '광고 및 SDK 데이터',
    identifier: '기기 식별자',
    location: 'IP 주소에서 추정한 대략적 위치',
    ads: '비맞춤 광고만 요청',
    att: '광고를 시작하기 전에 앱 추적 투명성(ATT) 권한을 묻습니다',
    oldAtt: 'ATT) 권한을 요청하지 않습니다',
    otherId: '다른 기기 식별자와 SDK 데이터는 처리될 수 있습니다',
    transfer: '기기 식별자, IP 추정 대략 위치, 기기·광고 이용 및 진단 정보',
    noTracking: '광고 식별자를 앱·웹사이트 간 추적 목적으로 사용하지 않습니다',
  },
  {
    locale: 'ja',
    revision: '最終更新:',
    sdk: '広告・SDK データ',
    identifier: 'デバイス識別子',
    location: 'IP アドレスから推定されるおおよその位置',
    ads: '非パーソナライズ広告のみをリクエスト',
    att: '広告を開始する前に App Tracking Transparency（ATT）の許可を求めます',
    oldAtt: 'ATT）の許可を求めません',
    otherId: '他のデバイス識別子や SDK データは処理される場合があります',
    transfer: 'デバイス識別子、IP から推定したおおよその位置、端末・広告の利用情報、診断情報',
    noTracking: '広告識別子をアプリやWebサイトをまたいだトラッキング目的で使用しません',
  },
  {
    locale: 'en',
    revision: 'Last updated:',
    sdk: 'Advertising and SDK data',
    identifier: 'Device identifiers',
    location: 'coarse location inferred from IP address',
    ads: 'non-personalized ads',
    att: 'asks for App Tracking Transparency (ATT) permission before ads start',
    oldAtt: 'does not request App Tracking Transparency (ATT) permission',
    otherId: 'Other device identifiers and SDK data may still be processed',
    transfer: 'Device identifiers, coarse location inferred from IP, device and ad interaction data, diagnostics',
    noTracking: 'The advertising identifier is not used to track you across apps or websites',
  },
  {
    locale: '',
    revision: 'Last updated:',
    sdk: 'Advertising and SDK data',
    identifier: 'Device identifiers',
    location: 'coarse location inferred from IP address',
    ads: 'non-personalized ads',
    att: 'asks for App Tracking Transparency (ATT) permission before ads start',
    oldAtt: 'does not request App Tracking Transparency (ATT) permission',
    otherId: 'Other device identifiers and SDK data may still be processed',
    transfer: 'Device identifiers, coarse location inferred from IP, device and ad interaction data, diagnostics',
    noTracking: 'The advertising identifier is not used to track you across apps or websites',
  },
];

for (const { locale, revision, sdk, identifier, location, ads, att, oldAtt, otherId, transfer, noTracking } of cases) {
  test(`Words ${locale} privacy policy discloses SDK data without unsupported no-tracking promise`, () => {
    const page = read(locale);
    for (const expected of [revision, 'datetime="2026-04-17"', 'datetime="2026-10-21"', sdk, identifier, location, ads, att, otherId, transfer, 'IDFA']) {
      assert.ok(page.includes(expected), `${locale}: missing ${expected}`);
    }
    assert.ok(!page.includes(noTracking), `${locale}: unsupported tracking promise remains`);
    // 1.0.14(33)부터 iOS 는 광고 시작 전에 ATT 를 묻는다(App Store 5.1.2(i) 거절 대응).
    assert.ok(!page.includes(oldAtt), `${locale}: outdated 'no ATT request' statement remains`);
    assert.match(page, /Google AdMob/);
    assert.match(page, /2026/);
    assert.equal((page.match(/<ScrollableLegalTable label=/g) || []).length, 3);
    assert.equal((page.match(/<\/ScrollableLegalTable>/g) || []).length, 3);
    assert.equal((page.match(/<table>/g) || []).length, 3);
    assert.equal((page.match(/<\/table>/g) || []).length, 3);
    assert.equal((page.match(/Google LLC \(AdMob\)/g) || []).length, 1);
    const cssHash = createHash('sha256').update(readFileSync(new URL('../public/styles-words-policy.css', import.meta.url))).digest('hex').slice(0, 12);
    assert.ok(page.includes(`/styles-words-policy.css?v=${cssHash}`), `${locale}: stale stylesheet key`);
  });
}
