import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = locale => readFileSync(
  new URL(`../src/pages/${locale ? `${locale}/` : ''}apps/dialogos/privacy.astro`, import.meta.url),
  'utf8',
);

const shared = [
  'store: false',
  '<strong>OpenAI OpCo, LLC</strong>',
  '1455 3rd Street, San Francisco, CA 94158',
  'data-email-user="privacy" data-email-domain="openai.com"',
  'Cloudflare, Inc.',
  'data-email-user="privacyquestions" data-email-domain="cloudflare.com"',
  'Apple Inc. / Google LLC',
  'https://www.apple.com/legal/privacy/contact/',
  'https://support.google.com/policies/contact/general_privacy_form',
  'data-email-user="privacy" data-email-domain="pifl-labs.com"',
];

const english = {
  effective: 'Effective date: October 1, 2026',
  firstEffective: 'First effective: June 14, 2026',
  deviceIdNotSent: 'it is not sent to OpenAI',
  abuseLogs: 'abuse-monitoring logs, which may include your messages and the replies, for up to 30 days',
  promptCache: 'encrypted prompt cache for no more than 24 hours',
  purchaseItems: 'verification result, and one-way hashes of the anonymous device identifiers of the devices that use the purchase',
  purchaseRetention: 'deleted automatically 5 years (1,830 days) after the transaction date',
  subRetention: 'For a subscription, the 5 years run from the end of its latest subscription period',
  packRetention: 'kept with no deletion date while it still has answers left, because purchased credits must not expire',
  packAfter: 'it is deleted 5 years after its purchase date (within a day, if that date has already passed)',
  countersPurchase: 'and purchase checks sent to the stores)',
  countersNotHashed: 'These are stored under the identifier itself, not a hash, and expire automatically within about two days.',
  reportCountHashed: 'Only the daily number of reports filed is counted by a one-way hash of the identifier',
  purchaseReceipt: 'the same receipt can never be credited twice',
  purchaseLaw: 'Act on Consumer Protection in Electronic Commerce',
  transferRetention: 'purchase-verification records: 5 years from the transaction date — for a subscription, from the end of its latest period; a pack with answers left is kept until they are used up or refunded',
  reportBullet: 'a one-way hash of the anonymous device identifier (never the identifier itself) for 90 days, solely to review the report and keep the app safe',
  reportTextCap: 'the message you sent right before it (each up to 2,000 characters)',
  reportNoteCap: 'any note you add (up to 500 characters)',
  storageException: 'except a reply you report and the message right before it',
  reportPurpose: '(d) review reports of AI replies and keep the app safe',
  reportRetention: '<strong>Report records:</strong> kept for 90 days, then deleted automatically.',
  reportTransferItems: 'report content if you report a reply',
  reportTransferPurpose: 'verifying purchases, receiving reports',
  reportTransferRetention: 'report records: 90 days',
  consentOnDevice: 'the version and date of your AI conversation consent',
  refusalConsent: 'withdraw it at any time in Settings',
  refusal: 'If you do not want these transfers',
  wireLeg: 'the app sends at most the most recent 40 messages, about 22,000 characters',
  forwardLeg: 'passes on only the most recent part, up to 24 messages and 12,000 characters',
  purchaseAuto: 'automatically when the app starts or the store reports a change such as a renewal',
  googleTokenHash: 'for Google Play, a one-way hash of the purchase token',
  spendCounter: 'one service-wide counter per day of the total AI spend',
  rateLimit: 'Cloudflare uses the IP address only transiently, as the key of that counter, and we do not store it in our own records',
  reportTime: 'the time of the report, the mentor',
  inquiry: '<strong>Messages you send us by email.</strong>',
  inquiryRetention: 'kept for 3 years after we have dealt with them, then deleted',
  purchaseStatusOnDevice: 'your purchase status (whether you are on Pro, and how many deep conversations are left)',
  thirdParty: 'we do not provide your personal information to any other third party except with your consent or where the law requires it',
  securityHeading: '<h2>6. Security measures</h2>',
  children: '14 in the Republic of Korea',
  rightsHeading: '<h2>8. Your rights and how to exercise them</h2>',
  rightsList: 'The right to request suspension of processing, correction, deletion, and destruction',
  cloudflareIp: 'connection information such as IP addresses (in request logs; also used transiently for rate limiting)',
  storeItems: 'Apple: the transaction ID; Google: the purchase token and product ID',
  permissions: '<h2>10. App permissions</h2>',
  destruction: '<h2>11. Data destruction</h2>',
  destructionMethod: 'Electronic files are permanently deleted using non-recoverable methods',
  officerHeading: '<h2>12. Data Protection Officer</h2>',
  officerCompany: '<li><strong>Company</strong>: PiFl Labs Co., Ltd.</li>',
  regional: '<h2>13. GDPR (European Economic Area)</h2>',
  changesHeading: '<h2>14. Changes</h2>',
  supersededRetention: ['deleted 90 days after it ends', 'kept for 5 years from the transaction date, then deleted', 'and reports filed)'],
};

const cases = [
  { locale: '', ...english },
  { locale: 'en', ...english },
  {
    locale: 'ko',
    effective: '시행일: 2026년 10월 1일',
    firstEffective: '최초 시행: 2026년 6월 14일',
    deviceIdNotSent: 'OpenAI에는 보내지 않습니다',
    abuseLogs: '남용 감시 로그(메시지와 답변이 포함될 수 있음)를 최대 30일',
    promptCache: '암호화된 프롬프트 캐시는 24시간을 넘기지 않습니다',
    purchaseItems: '확인 결과, 그 구매를 쓰는 기기의 익명 기기 식별자 단방향 해시값',
    purchaseRetention: '거래일로부터 5년(1,830일)이 지나면 자동 삭제합니다',
    subRetention: '구독은 마지막 구독 기간이 끝난 날부터 5년입니다',
    packRetention: '깊은 대화 묶음은 남은 답이 있는 동안 삭제 기한 없이 보관하고(구매한 이용권은 만료되면 안 되므로)',
    packAfter: '다 쓰거나 환불된 뒤에는 구매일로부터 5년이 되는 때(이미 지났다면 하루 안에) 삭제합니다',
    countersPurchase: '스토어 구매 확인 요청 수)',
    countersNotHashed: '이 카운터들은 해시하지 않은 식별자 그대로 저장되며 약 2일 내 자동 만료됩니다.',
    reportCountHashed: '하루 신고 횟수만은 식별자의 단방향 해시로 셉니다',
    purchaseReceipt: '같은 영수증이 두 번 적립되는 것을 막고',
    purchaseLaw: '전자상거래 등에서의 소비자보호에 관한 법률',
    transferRetention: '구매 확인 기록은 거래일로부터 5년 — 구독은 마지막 구독 기간이 끝난 날부터, 남은 답이 있는 깊은 대화 묶음은 다 쓰거나 환불될 때까지 보관',
    reportBullet: '익명 기기 식별자의 단방향 해시(식별자 자체는 저장하지 않음)를 신고 검토와 앱 안전 관리에만 쓰기 위해 90일간 보관하고',
    reportTextCap: '바로 앞에 보내신 메시지(각 최대 2,000자)',
    reportNoteCap: '덧붙인 설명(최대 500자)',
    storageException: '단, 신고하신 답변과 바로 앞 메시지는 아래 "AI 답변 신고"에 따라 보관합니다',
    reportPurpose: '(d) 신고를 검토하고 앱을 안전하게 관리',
    reportRetention: '<strong>신고 기록</strong>: 90일 보관 후 자동 삭제됩니다.',
    reportTransferItems: '신고하신 경우의 신고 내용',
    reportTransferPurpose: '구매 확인, 신고 접수',
    reportTransferRetention: '신고 기록은 90일',
    consentOnDevice: 'AI 대화 동의의 버전·날짜는 기기에만 저장됩니다',
    refusalConsent: '설정에서 언제든 철회하시면 메시지가 전송되지 않습니다',
    refusal: '이전을 거부하는 방법·절차와 효과',
    wireLeg: '앱은 최근 메시지 최대 40개, 약 22,000자까지 보냅니다',
    forwardLeg: '그중 최근 부분(최대 24개 메시지·12,000자)만',
    purchaseAuto: '앱을 시작할 때나 스토어가 갱신 같은 변경을 알릴 때 자동으로',
    googleTokenHash: 'Google Play는 구매 토큰의 단방향 해시',
    spendCounter: '서비스 전체의 하루 AI 사용 금액 합계 카운터',
    rateLimit: 'Cloudflare는 IP 주소를 이 카운터의 키로 일시적으로만 사용하며 당사는 IP 주소를 당사 기록에 저장하지 않습니다',
    reportTime: '신고 시각, 멘토',
    inquiry: '<strong>문의 메일</strong>: 설정의',
    inquiryRetention: '문의 처리를 마친 뒤 3년간 보관하고 삭제합니다',
    purchaseStatusOnDevice: '구매 상태(Pro 여부, 남은 깊은 대화 수)',
    thirdParty: '「개인정보 보호법」 제17조 및 제18조에 해당하는 경우를 제외하고는',
    securityHeading: '<h2>6. 안전성 확보조치</h2>',
    children: '대한민국은 만 14세',
    rightsHeading: '<h2>8. 정보주체의 권리·의무 및 행사방법</h2>',
    rightsList: '개인정보의 처리 정지, 정정·삭제 및 파기를 요구할 권리',
    cloudflareIp: '접속 정보(IP 주소 등. 요청 로그에 남으며 요청 횟수 제한에도 일시적으로 쓰임)',
    storeItems: 'Apple: 거래 ID, Google: 구매 토큰과 상품 ID',
    permissions: '<h2>10. 앱 권한 안내</h2>',
    destruction: '<h2>11. 개인정보의 파기절차 및 방법</h2>',
    destructionMethod: '전자적 파일은 복원이 불가능한 방법으로 영구 삭제합니다',
    officerHeading: '<h2>12. 개인정보 보호책임자</h2>',
    officerCompany: '<li>회사명: 주식회사 피플랩스 (PiFl Labs Co., Ltd.)</li>',
    regional: '<h2>13. 권익침해 구제방법</h2>',
    changesHeading: '<h2>14. 변경</h2>',
    preamble: '「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고',
    international: '<h2>For International Users</h2>',
    supersededRetention: ['권리가 끝난 날', '거래일로부터 5년 보관한 뒤 삭제합니다', '신고 횟수)와'],
  },
  {
    locale: 'ja',
    effective: '施行日: 2026年10月1日',
    firstEffective: '初版施行: 2026年6月14日',
    deviceIdNotSent: 'OpenAI には送信しません',
    abuseLogs: '不正利用監視ログ(メッセージと返答を含む場合があります)を最大30日間',
    promptCache: '暗号化されたプロンプトキャッシュは24時間を超えて保持しません',
    purchaseItems: '確認結果、その購入を使う端末の匿名デバイス識別子の一方向ハッシュ値',
    purchaseRetention: '取引日から5年(1,830日)が過ぎると自動的に削除します',
    subRetention: 'サブスクリプションは最後の契約期間が終了した日から5年です',
    packRetention: '未使用の回答が残っている間は削除期限を設けずに保持し(購入した利用権は失効させてはならないため)',
    packAfter: '使い切るか返金された後は、購入日から5年が経過する時点(すでに過ぎている場合は1日以内)に削除します',
    countersPurchase: 'ストアへの購入確認の回数)',
    countersNotHashed: 'これらはハッシュ化していない識別子のまま保存され、約2日で自動的に失効します。',
    reportCountHashed: '1日の報告の回数だけは識別子の一方向ハッシュで数えます',
    purchaseReceipt: '同じレシートが二重に付与されるのを防ぐため',
    purchaseLaw: '電子商取引等における消費者保護に関する法律',
    transferRetention: '購入確認記録は取引日から5年 — サブスクリプションは最後の契約期間の終了日から、未使用の回答が残る深い対話パックは使い切るか返金されるまで保持',
    reportBullet: '匿名デバイス識別子の一方向ハッシュ(識別子そのものは保存しません)を、報告の確認とアプリの安全管理のためだけに90日間保管し',
    reportTextCap: 'その直前に送ったメッセージ(各最大2,000字)',
    reportNoteCap: '追記(最大500字)',
    storageException: 'ただし、報告した回答とその直前のメッセージは、下記「AIの回答の報告」のとおり保管します',
    reportPurpose: '(d) 報告の確認とアプリの安全管理',
    reportRetention: '<strong>報告記録</strong>: 90日間保持した後、自動的に削除されます。',
    reportTransferItems: '報告した場合の報告内容',
    reportTransferPurpose: '購入確認、報告の受付',
    reportTransferRetention: '報告記録は90日間',
    consentOnDevice: 'AI対話への同意のバージョン・日付は端末内のみに保存されます',
    refusalConsent: '設定からいつでも撤回してください',
    refusal: '移転を拒否する方法と影響',
    wireLeg: 'アプリが送るのは直近の最大40件・約22,000字までです',
    forwardLeg: 'そのうち直近の部分(最大24件・12,000字)だけを',
    purchaseAuto: '本アプリの起動時やストアが更新などの変更を通知したときに自動的に',
    googleTokenHash: 'Google Play は購入トークンの一方向ハッシュ',
    spendCounter: 'サービス全体の1日分の AI 利用金額の合計カウンター',
    rateLimit: 'Cloudflare は IP アドレスをこのカウンターのキーとして一時的に使うだけで、当社は IP アドレスを当社の記録に保存しません',
    reportTime: '報告日時、賢者',
    inquiry: '<strong>お問い合わせメール</strong>: 設定の',
    inquiryRetention: '対応完了後3年間保管し、その後削除します',
    purchaseStatusOnDevice: '購入状態(Pro かどうか、残りの深い対話数)',
    thirdParty: 'お客様の同意がある場合または法令に基づく場合を除き、上記以外の第三者に個人情報を提供しません',
    securityHeading: '<h2>6. 安全管理措置</h2>',
    children: '韓国では14歳',
    rightsHeading: '<h2>8. 利用者の権利と行使方法</h2>',
    rightsList: '個人情報の訂正、削除、処理停止、破棄を要求する権利',
    cloudflareIp: 'IP アドレスなどの接続情報(リクエストログ。レート制限にも一時的に使用)',
    storeItems: 'Apple: 取引ID、Google: 購入トークンと商品ID',
    permissions: '<h2>10. アプリ権限</h2>',
    destruction: '<h2>11. 個人情報の破棄手続および方法</h2>',
    destructionMethod: '電子ファイルは復元不可能な方法で完全に削除します',
    officerHeading: '<h2>12. 個人情報保護責任者</h2>',
    officerCompany: '<li><strong>会社名</strong>: 株式会社ピープルラブズ (PiFl Labs Co., Ltd.)</li>',
    regional: '<h2>13. APPI - 日本の個人情報保護法</h2>',
    changesHeading: '<h2>14. 変更</h2>',
    supersededRetention: ['権利が終了した日', '取引日から5年間保持した後に削除します', '報告の回数)と'],
  },
];

for (const { locale, supersededRetention, ...expected } of cases) {
  const name = locale || 'root';

  test(`Dialogos ${name} privacy policy names OpenAI OpCo, LLC and discloses reports`, () => {
    const page = read(locale);
    for (const text of [...Object.values(expected), ...shared]) {
      assert.ok(page.includes(text), `${name}: missing ${text}`);
    }
    // Anthropic remains only in the revision note (section 10).
    assert.equal((page.match(/Anthropic/g) || []).length, 1, `${name}: Anthropic outside the revision note`);
    assert.ok(!page.includes('<strong>Anthropic</strong>'), `${name}: Anthropic still listed as a processor`);
    // The processor and transfer recipient carry the legal entity name.
    assert.ok(!page.includes('<strong>OpenAI</strong>'), `${name}: OpenAI listed without its legal entity name`);
    // The reserved spot for the report sentence has been filled.
    assert.ok(!page.includes('TODO'), `${name}: a placeholder is left in the page`);
  });

  test(`Dialogos ${name} privacy policy does not claim safeguards the app does not have`, () => {
    const page = read(locale);
    // Other PiFl Labs app policies list these in their safety measures. Dialogos has no
    // PrivacyInfo.xcprivacy and keeps nothing in Keychain/Keystore (the anonymous id and
    // consent live in SharedPreferences), so copying the bullet over would be untrue.
    for (const claim of ['Privacy Manifest', 'PrivacyInfo', 'Keychain', 'Keystore']) {
      assert.ok(!page.includes(claim), `${name}: claims ${claim}`);
    }
  });

  test(`Dialogos ${name} privacy policy numbers its sections 1-14 in order`, () => {
    const numbers = [...read(locale).matchAll(/<h2>(\d+)\. /g)].map(m => Number(m[1]));
    assert.deepEqual(numbers, Array.from({ length: 14 }, (_, i) => i + 1), `${name}: section numbers`);
  });

  test(`Dialogos ${name} privacy policy states the purchase-record retention the ledger applies`, () => {
    const page = read(locale);
    for (const old of supersededRetention) {
      assert.ok(!page.includes(old), `${name}: superseded text remains: ${old}`);
    }
  });

  test(`Dialogos ${name} privacy policy keeps its lists balanced`, () => {
    const page = read(locale);
    for (const tag of ['ul', 'ol', 'li']) {
      const open = (page.match(new RegExp(`<${tag}>`, 'g')) || []).length;
      const close = (page.match(new RegExp(`</${tag}>`, 'g')) || []).length;
      assert.equal(open, close, `${name}: <${tag}> ${open} vs </${tag}> ${close}`);
    }
  });
}

test('Dialogos root privacy page mirrors the English page', () => {
  const strip = page => page.replace(/^import BaseLayout from .*$/m, '');
  assert.equal(strip(read('')), strip(read('en')));
});

// The Korean statutory items are copied from the other PiFl Labs app policies: if they change
// there (a new officer, a new hotline number), Dialogos has to change with them.
test('Dialogos ko privacy policy carries the same officer and remedy lines as the other Korean app policies', () => {
  const dialogos = read('ko');
  for (const other of ['pipi-log', 'pipi-draw', 'pipi-focus']) {
    const page = readFileSync(
      new URL(`../src/pages/ko/apps/${other}/privacy.astro`, import.meta.url),
      'utf8',
    );
    const lines = [
      ...page.matchAll(/<li>(?:개인정보분쟁조정위원회|개인정보침해신고센터|대검찰청|경찰청): [^<]*<\/li>/g),
      ...page.matchAll(/<li>회사명: [^<]*<\/li>/g),
    ].map(m => m[0]);
    assert.equal(lines.length, 5, `${other}: expected the officer line and 4 remedy lines, got ${lines.length}`);
    for (const line of lines) {
      assert.ok(dialogos.includes(line), `dialogos ko is missing a line of ${other}: ${line}`);
    }
  }
});

test('Dialogos root, en and ja privacy pages leave out the Korea-only items', () => {
  // Like the other apps: the remedy hotlines and the international-users block are Korean-page items.
  for (const locale of ['', 'en', 'ja']) {
    const page = read(locale);
    assert.ok(!page.includes('kopico.go.kr'), `${locale || 'root'}: has the Korean remedy list`);
    assert.ok(!page.includes('For International Users'), `${locale || 'root'}: has the international-users block`);
  }
});

test('Dialogos ko privacy policy has the international-users block like the other Korean app policies', () => {
  const page = read('ko');
  assert.ok(page.includes('<h3>GDPR (European Economic Area)</h3>'));
  assert.ok(page.includes('<h3>APPI (Japan)</h3>'));
});
