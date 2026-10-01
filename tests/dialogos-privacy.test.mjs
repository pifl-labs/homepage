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
];

const english = {
  effective: 'Effective date: October 1, 2026',
  firstEffective: 'First effective: June 14, 2026',
  deviceIdNotSent: 'it is not sent to OpenAI',
  abuseLogs: 'abuse-monitoring logs, which may include your messages and the replies, for up to 30 days',
  promptCache: 'encrypted prompt cache for no more than 24 hours',
  purchaseItems: 'verification result, and a hash of the anonymous device identifier',
  purchaseRetention: 'kept for 5 years from the transaction date',
  purchaseReceipt: 'the same receipt can never be credited twice',
  purchaseLaw: 'Act on Consumer Protection in Electronic Commerce',
  transferRetention: 'purchase-verification records: 5 years from the transaction date',
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
  supersededRetention: 'deleted 90 days after it ends',
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
    purchaseItems: '확인 결과, 익명 기기 식별자의 해시값',
    purchaseRetention: '거래일로부터 5년 보관한 뒤 삭제합니다',
    purchaseReceipt: '같은 영수증이 두 번 적립되는 것을 막고',
    purchaseLaw: '전자상거래 등에서의 소비자보호에 관한 법률',
    transferRetention: '구매 확인 기록은 거래일로부터 5년',
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
    supersededRetention: '권리가 끝난 날',
  },
  {
    locale: 'ja',
    effective: '施行日: 2026年10月1日',
    firstEffective: '初版施行: 2026年6月14日',
    deviceIdNotSent: 'OpenAI には送信しません',
    abuseLogs: '不正利用監視ログ(メッセージと返答を含む場合があります)を最大30日間',
    promptCache: '暗号化されたプロンプトキャッシュは24時間を超えて保持しません',
    purchaseItems: '確認結果、匿名デバイス識別子のハッシュ値',
    purchaseRetention: '取引日から5年間保持した後に削除します',
    purchaseReceipt: '同じレシートが二重に付与されるのを防ぐため',
    purchaseLaw: '電子商取引等における消費者保護に関する法律',
    transferRetention: '購入確認記録は取引日から5年間',
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
    supersededRetention: '権利が終了した日',
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

  test(`Dialogos ${name} privacy policy keeps purchase records for 5 years`, () => {
    const page = read(locale);
    assert.ok(!page.includes(supersededRetention), `${name}: the superseded purchase retention remains`);
  });

  test(`Dialogos ${name} privacy policy keeps its lists balanced`, () => {
    const page = read(locale);
    for (const tag of ['ul', 'li']) {
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
