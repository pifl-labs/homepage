import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

// ---------------------------------------------------------------------------------------------
// Helpers. Facts are checked against the *text* of each article, never against the markup, so the
// page can be re-laid-out (bullets, tables, headings) without touching these expectations.
// ---------------------------------------------------------------------------------------------
const pagePath = locale => `src/pages/${locale ? `${locale}/` : ''}apps/dialogos/privacy.astro`;
const readRepo = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const read = locale => readRepo(pagePath(locale));

const entities = s => s.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&nbsp;', ' ');
const text = html => entities(html.replace(/<wbr\s*\/?>/g, '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
// Whitespace-, comma-, period-, colon- and case-insensitive form, so splitting a sentence into
// bullets (", " -> separate <li>) does not change what a fact looks like.
const flat = s => s.toLowerCase().replace(/[\s,.;:]+/g, '');

const cardHtml = page => page.slice(page.indexOf('<div class="legal-card">'), page.indexOf('</main>'));
const heroHtml = page => page.slice(page.indexOf('<section class="legal-hero">'), page.indexOf('<main class="legal-page">'));

/** The card is an intro followed by <h2> articles. */
function parse(page) {
  const parts = cardHtml(page).split(/<h2>(.*?)<\/h2>/s);
  const articles = [];
  for (let i = 1; i < parts.length; i += 2) {
    articles.push({ heading: text(parts[i]), html: parts[i + 1], text: text(parts[i + 1]) });
  }
  return { intro: parts[0], articles };
}

/** Own text of every <p> and <li> (text of nested lists belongs to the nested items). */
function ownTextBlocks(html) {
  const blocks = [];
  const stack = [];
  for (const [token, close, tag] of html.matchAll(/<(\/?)(li|p)>|[^<]+|<[^>]*>/g).map(m => [m[0], m[1], m[2]])) {
    if (tag) {
      if (close) blocks.push(text(stack.pop() ?? ''));
      else stack.push('');
    } else if (!token.startsWith('<') && stack.length) {
      stack[stack.length - 1] += token;
    }
  }
  return blocks;
}

/** Every fact must appear (in order, if given as a list of fragments) in the text of its article. */
function missing(articleText, facts) {
  const hay = flat(articleText);
  return facts.filter(fact => {
    let from = 0;
    for (const part of Array.isArray(fact) ? fact : [fact]) {
      const i = hay.indexOf(flat(part), from);
      if (i < 0) return true;
      from = i + flat(part).length;
    }
    return false;
  });
}

// Article numbers of the shared structure (the same in every locale).
const A = {
  purpose: 1, items: 2, retention: 3, thirdParty: 4, processors: 5, notCollected: 6, permissions: 7,
  destruction: 8, rights: 9, security: 10, children: 11, transfers: 12, officer: 13, regional: 14, changes: 15,
};

// ---------------------------------------------------------------------------------------------
// Per-locale expectations
// ---------------------------------------------------------------------------------------------
const ko = {
  locale: 'ko',
  headings: [
    '제1조 (개인정보의 처리 목적)', '제2조 (처리하는 개인정보의 항목)', '제3조 (개인정보의 처리 및 보유기간)',
    '제4조 (개인정보의 제3자 제공)', '제5조 (개인정보처리의 위탁 및 공유)', '제6조 (수집하지 않는 정보 및 광고·추적)',
    '제7조 (앱 권한 안내)', '제8조 (개인정보의 파기절차 및 방법)', '제9조 (정보주체의 권리·의무 및 행사방법)',
    '제10조 (개인정보의 안전성 확보조치)', '제11조 (아동의 개인정보 보호)', '제12조 (국외 이전)',
    '제13조 (개인정보 보호책임자)', '제14조 (권익침해 구제방법)', '제15조 (개인정보 처리방침 변경)',
    'For International Users',
  ],
  refNumbers: text => [...text.matchAll(/제(\d+)조/g)].map(m => Number(m[1])),
  staleRef: /\d+항/,
  statute: /「개인정보 보호법」 제30조|제17조 및 제18조/g,
  maxBlock: 320,
  hero: {
    effective: '시행일: 2026년 10월 1일',
    firstEffective: '최초 시행: 2026년 6월 14일',
    provider: '제공자: PiFl Labs',
    name: 'Dialogos',
  },
  roles: ['수탁자', '수탁자', '결제에 관한 독립 관리자'],
  refs: [
    ['(제3조·제12조 참조)', ['retention', 'transfers']],
    ['(보관 기간은 제3조)', ['retention']],
    ['답변에만(제1조) 사용하고 제3조에 따라 보관합니다', ['purpose', 'retention']],
    ['제5조의 제공자 외의 제3자', ['processors']],
    ['(당사로 직접 메일을 보내시는 경우는 제2조 참조)', ['items']],
    ['제3조의 보유기간이 끝난 서버 기록', ['retention']],
    ['(개인정보 보호책임자, 제13조)', ['officer']],
    ['서버 기록은 제3조의 기간이 지나면 자동 삭제됩니다', ['retention']],
    ['(약 2일 내 만료되는 일일 카운터는 예외이며 제2조 참조)', ['items']],
    ['서버 기록은 보관 기간이 끝나면 자동으로 삭제됩니다(제3조)', ['retention']],
    ['남용 감시 로그 최대 30일(제3조의 예외 포함)', ['retention']],
    ['보유·이용 기간: 제3조와 같음', ['retention']],
  ],
  superseded: ['권리가 끝난 날', '거래일로부터 5년 보관한 뒤 삭제합니다', '신고 횟수)와'],
  facts: {
    [A.purpose]: [
      '오직 다음의 목적으로만 사용합니다', '요청하신 대화를 생성', '공정한 일일 사용량 제한을 적용', '구매를 확인해 적용',
      '신고를 검토하고 앱을 안전하게 관리', '보내 주신 문의 메일에 답',
      '어떠한 데이터도 판매·임대하지 않으며 광고에 이용하지 않습니다',
    ],
    [A.items]: [
      '첫 실행 시 생성되는 임의 토큰', 'OpenAI에는 보내지 않습니다',
      '앱은 최근 메시지 최대 40개, 약 22,000자까지 보냅니다',
      '그중 최근 부분(최대 24개 메시지·12,000자)만',
      '대화 내용은 당사 서버에 저장하지 않습니다',
      '신고하신 답변과 바로 앞 메시지는 아래 "AI 답변 신고"에 따라 보관합니다',
      '저장 기능을 끈 상태(store: false)로 OpenAI를 호출',
      '학습용 데이터 제공에 동의(옵트인)하지 않습니다',
      '남용 감시 로그(메시지와 답변이 포함될 수 있음)를 최대 30일 보관',
      '암호화된 프롬프트 캐시를 최대 24시간 보관할 수 있습니다',
      '앱을 시작할 때나 스토어가 갱신 같은 변경을 알릴 때 자동으로',
      'Google Play는 구매 토큰의 단방향 해시',
      ['확인 결과', '그 구매를 쓰는 기기의 익명 기기 식별자 단방향 해시값(구독은 최대 5대의 기기에서 쓸 수 있습니다)'],
      '요청마다 무료/Pro 여부를 서버에 알립니다', '결제카드·청구정보는 받지 않습니다',
      '스토어 구매 확인 요청 수',
      '이 카운터들은 해시하지 않은 식별자 그대로 저장되며 약 2일 내 자동 만료됩니다',
      '하루 신고 횟수만은 식별자의 단방향 해시로 셉니다',
      '서비스 전체의 하루 AI 사용 금액 합계 카운터',
      '특정 기기나 사람과 연결되지 않고 개인정보를 담지 않으며 약 2일 내 자동 만료됩니다',
      'Cloudflare는 IP 주소를 이 카운터의 키로 일시적으로만 사용하며 당사는 IP 주소를 당사 기록에 저장하지 않습니다',
      '기기 식별자 앞 8자리', '대화 내용은 남기지 않습니다',
      '바로 앞에 보내신 메시지(각 최대 2,000자)', '덧붙인 설명(최대 500자)', '신고 시각, 멘토',
      '익명 기기 식별자의 단방향 해시(식별자 자체는 저장하지 않음)', '90일간 보관하고, 그 뒤 자동 삭제합니다',
      "설정의 '문제 신고'를 누르면", '이용자가 직접 써서 보내는 메일',
      'AI 대화 동의의 버전·날짜는 기기에만 저장됩니다', '구매 상태(Pro 여부, 남은 깊은 대화 수)',
    ],
    [A.retention]: [
      '암호화된 프롬프트 캐시는 24시간을 넘기지 않습니다',
      '남용 감시 로그는 최대 30일 보관합니다(법령상 더 긴 보관이 필요하거나 OpenAI 서비스·제3자를 해악으로부터 보호하는 데 합리적으로 필요한 경우 제외)',
      '약 2일 내 자동 만료됩니다', '운영 로그: 7일 내 자동 삭제됩니다',
      '거래일로부터 5년(1,830일)이 지나면 자동 삭제합니다',
      '구독은 마지막 구독 기간이 끝난 날부터 5년입니다',
      '깊은 대화 묶음은 남은 답이 있는 동안 삭제 기한 없이 보관하고(구매한 이용권은 만료되면 안 되므로)',
      '다 쓰거나 환불된 뒤에는 구매일로부터 5년이 되는 때(이미 지났다면 하루 안에) 삭제합니다',
      '같은 영수증이 두 번 적립되는 것을 막고',
      '「전자상거래 등에서의 소비자보호에 관한 법률」이 대금결제와 재화 등의 공급에 관한 기록을 5년간 보존하도록 정하고 있기 때문입니다',
      '신고 기록: 90일 보관 후 자동 삭제됩니다', '문의 처리를 마친 뒤 3년간 보관하고 삭제합니다',
      '앱을 삭제할 때까지 유지되며, 삭제 시 모든 로컬 데이터가 함께 제거됩니다',
    ],
    [A.thirdParty]: ['정보주체의 동의, 법률의 특별한 규정 등 「개인정보 보호법」 제17조 및 제18조에 해당하는 경우를 제외하고는'],
    [A.processors]: ['앱 운영에 필요한 범위에서만', '광고업체·데이터 브로커와는 공유하지 않습니다'],
    [A.notCollected]: [
      '앱 자체는 이름·이메일·계정·위치·연락처·사진·건강/생체 정보를 수집하지 않습니다',
      '분석/광고 SDK 없음', '광고식별자(IDFA/GAID) 없음', '다른 앱·웹사이트에 걸친 추적 없음',
      'App Tracking Transparency(ATT) 동의창도 표시하지 않습니다',
    ],
    [A.permissions]: ['카메라·사진·마이크·위치·연락처·알림·추적 등)을 요청하지 않습니다', '네트워크 연결과, 구매를 위한 각 스토어의 결제 기능만 사용합니다'],
    [A.destruction]: ['별도의 수작업 없이 기간이 끝나는 때 자동으로 삭제됩니다', '전자적 파일은 복원이 불가능한 방법으로 영구 삭제합니다'],
    [A.rights]: [
      '개인정보의 처리 정지, 정정·삭제 및 파기를 요구할 권리',
      '익명 기기 식별자는 이름·이메일과 연결되지 않고 앱에도 표시되지 않습니다',
      '설정에서 AI 대화 동의를 언제든 철회할 수 있습니다', '앱을 삭제하면 모든 로컬 데이터가 지워집니다',
    ],
    [A.security]: [
      '전송 구간 암호화(HTTPS/TLS)', 'API 키와 스토어 확인용 인증 정보는 서버에만 보관하며 앱에 포함하지 않습니다',
      '익명 기기 식별자를 단방향 해시로만 저장합니다', '식별자 앞 8자리만 남기고, 대화 내용·영수증 원문·API 키는 기록하지 않습니다',
      'Google Play 구매 토큰은 단방향 해시로만 저장합니다', '앱 자체에서 별도로 암호화하지는 않습니다',
    ],
    [A.children]: ['대한민국은 만 14세', '식별할 수 있는 범위에서 즉시 삭제합니다'],
    [A.transfers]: [
      '1455 3rd Street, San Francisco, CA 94158',
      '최근 최대 24개·12,000자', '기기 식별자는 보내지 않습니다',
      '암호화된 프롬프트 캐시 24시간 이내', '모델 학습에 사용하지 않음',
      '대화 내용(중계만 하고 저장하지 않음)',
      '신고 내용(신고한 답변과 바로 앞 메시지, 신고 사유, 덧붙인 설명, 신고 시각, 멘토, 앱 언어·버전, 기기 식별자의 단방향 해시)',
      '접속 정보(IP 주소 등. 요청 로그에 남으며 요청 횟수 제한에도 일시적으로 쓰임)',
      '구매 확인 기록은 거래일로부터 5년 — 구독은 마지막 구독 기간이 끝난 날부터, 남은 답이 있는 깊은 대화 묶음은 다 쓰거나 환불될 때까지 보관',
      '신고 기록은 90일', '신고 접수, 남용 요청 제한',
      'Apple: 거래 ID, Google: 구매 토큰과 상품 ID',
      '결제 처리자인 각 사의 개인정보 처리방침에 따름',
      '이전을 거부하는 방법·절차와 효과', '설정에서 언제든 철회하시면 메시지가 전송되지 않습니다',
      '이전을 거부하시면 답변 생성과 구매 적용을 이용할 수 없습니다',
    ],
    [A.officer]: ['회사명: 주식회사 피플랩스 (PiFl Labs Co., Ltd.)'],
    [A.changes]: ['변경 시 위 시행일을 갱신하고 중요한 변경은 앱 내에서 안내합니다', '2026년 10월 1일 개정', 'AI 제공자를 Anthropic에서 OpenAI로 변경했습니다'],
  },
};

const ja = {
  locale: 'ja',
  headings: [
    '第1条 (利用目的)', '第2条 (取り扱う個人情報の項目)', '第3条 (保有期間)', '第4条 (第三者提供)',
    '第5条 (個人情報処理の委託および共有)', '第6条 (収集しない情報、広告およびトラッキング)', '第7条 (アプリ権限)',
    '第8条 (個人情報の破棄手続および方法)', '第9条 (利用者の権利と行使方法)', '第10条 (安全管理措置)',
    '第11条 (子どものプライバシー)', '第12条 (国外移転)', '第13条 (個人情報保護責任者)',
    '第14条 (APPI - 日本の個人情報保護法)', '第15条 (改定)',
  ],
  refNumbers: text => [...text.matchAll(/第(\d+)条/g)].map(m => Number(m[1])),
  staleRef: /\d+項/,
  statute: /(?!)/g,
  maxBlock: 220,
  hero: {
    effective: '施行日: 2026年10月1日',
    firstEffective: '初版施行: 2026年6月14日',
    provider: '提供者: PiFl Labs',
    name: 'Dialogos',
  },
  roles: ['処理者', '処理者', '決済に関する独立した管理者'],
  refs: [
    ['(第3条・第12条参照)', ['retention', 'transfers']],
    ['(保持期間は第3条)', ['retention']],
    ['返信のためだけ(第1条)に使用し、第3条のとおり保管します', ['purpose', 'retention']],
    ['第5条の提供者以外の第三者', ['processors']],
    ['(当社へ直接メールを送る場合は第2条参照)', ['items']],
    ['第3条の保持期間が終了したサーバーの記録', ['retention']],
    ['(個人情報保護責任者、第13条)', ['officer']],
    ['サーバーの記録は第3条の期間が過ぎると自動的に削除されます', ['retention']],
    ['(約2日で失効する日次カウンターは例外です。第2条参照)', ['items']],
    ['サーバーの記録は保持期間が終わると自動的に削除されます(第3条)', ['retention']],
    ['不正利用監視ログ最大30日間(第3条の例外を含む)', ['retention']],
    ['保持期間: 第3条のとおり', ['retention']],
  ],
  superseded: ['権利が終了した日', '取引日から5年間保持した後に削除します', '報告の回数)と'],
  facts: {
    [A.purpose]: [
      '次の目的のためだけに使用します', '要求された対話の生成', '公平な1日の利用制限の適用', '購入の確認と適用',
      '報告の確認とアプリの安全管理', 'お寄せいただいたメールへの返信',
      'いかなるデータも販売・貸与せず、広告には利用しません',
    ],
    [A.items]: [
      '初回起動時に生成されるランダムなトークン', 'OpenAI には送信しません',
      'アプリが送るのは直近の最大40件・約22,000字までです',
      'そのうち直近の部分(最大24件・12,000字)だけを',
      '対話内容は当社サーバーに保存しません',
      '報告した回答とその直前のメッセージは、下記「AIの回答の報告」のとおり保管します',
      '保存機能をオフにした状態(store: false)で OpenAI を呼び出す',
      '学習用データの提供に同意(オプトイン)しません',
      '不正利用監視ログ(メッセージと返答を含む場合があります)を最大30日間保持し',
      '暗号化されたプロンプトキャッシュを最大24時間保持する場合があります',
      '本アプリの起動時やストアが更新などの変更を通知したときに自動的に',
      'Google Play は購入トークンの一方向ハッシュ',
      ['確認結果', 'その購入を使う端末の匿名デバイス識別子の一方向ハッシュ値(サブスクリプションは最大5台の端末で使えます)'],
      'リクエストごとに無料/Pro の区分をサーバーへ伝えます', 'カード・請求情報は受け取りません',
      'ストアへの購入確認の回数',
      'これらはハッシュ化していない識別子のまま保存され、約2日で自動的に失効します',
      '1日の報告の回数だけは識別子の一方向ハッシュで数えます',
      'サービス全体の1日分の AI 利用金額の合計カウンター',
      '特定の端末や個人と紐づかず、個人情報を含まず、約2日で自動的に失効します',
      'Cloudflare は IP アドレスをこのカウンターのキーとして一時的に使うだけで、当社は IP アドレスを当社の記録に保存しません',
      '識別子の先頭8文字', '対話内容は記録しません',
      'その直前に送ったメッセージ(各最大2,000字)', '追記(最大500字)', '報告日時、賢者',
      '匿名デバイス識別子の一方向ハッシュ(識別子そのものは保存しません)', '90日間保管し、その後自動的に削除します',
      '設定の「問題を報告」を押すと', '利用者が自分で書いて送るメール',
      'AI対話への同意のバージョン・日付は端末内のみに保存されます', '購入状態(Pro かどうか、残りの深い対話数)',
    ],
    [A.retention]: [
      '暗号化されたプロンプトキャッシュは24時間を超えて保持しません',
      '不正利用監視ログは最大30日間保持します(法令上より長い保持が必要な場合や、OpenAI のサービス・第三者を害から守るために合理的に必要な場合を除く)',
      '約2日で自動失効します', '運用ログ: 7日以内に自動削除されます',
      '取引日から5年(1,830日)が過ぎると自動的に削除します',
      'サブスクリプションは最後の契約期間が終了した日から5年です',
      '未使用の回答が残っている間は削除期限を設けずに保持し(購入した利用権は失効させてはならないため)',
      '使い切るか返金された後は、購入日から5年が経過する時点(すでに過ぎている場合は1日以内)に削除します',
      '同じレシートが二重に付与されるのを防ぐため',
      '「電子商取引等における消費者保護に関する法律」が代金決済および財貨等の供給に関する記録を5年間保存するよう定めているためです',
      '報告記録: 90日間保持した後、自動的に削除されます', '対応完了後3年間保管し、その後削除します',
      'アプリを削除するまで保持され、削除時にすべてのローカルデータが消去されます',
    ],
    [A.thirdParty]: ['お客様の同意がある場合または法令に基づく場合を除き'],
    [A.processors]: ['アプリ運営に必要な範囲でのみ', '広告業者・データブローカーとは共有しません'],
    [A.notCollected]: [
      '本アプリ自体は氏名・メール・アカウント・位置・連絡先・写真・健康/生体情報を収集しません',
      '分析/広告SDKなし', '広告識別子(IDFA/GAID)なし', '他のアプリ・ウェブサイトをまたぐトラッキングなし',
      'App Tracking Transparency(ATT)同意ダイアログも表示しません',
    ],
    [A.permissions]: ['カメラ・写真・マイク・位置情報・連絡先・通知・トラッキングなど)を要求しません', 'ネットワーク接続と、購入のための各ストアの決済機能のみを使用します'],
    [A.destruction]: ['手作業を介さず、期間の終了時に自動的に削除されます', '電子ファイルは復元不可能な方法で完全に削除します'],
    [A.rights]: [
      '個人情報の訂正、削除、処理停止、破棄を要求する権利',
      '匿名デバイス識別子は氏名・メールと紐づかず、アプリにも表示されません',
      '設定でAI対話への同意をいつでも撤回できます', 'アプリを削除すればすべてのローカルデータが消去されます',
    ],
    [A.security]: [
      '転送時に暗号化(HTTPS/TLS)', 'API キーとストア確認用の認証情報はサーバーのみで保管し、アプリには含めません',
      '匿名デバイス識別子を一方向ハッシュでのみ保存します', '識別子の先頭8文字のみを残し、対話内容・レシートの原文・API キーは記録しません',
      'Google Play の購入トークンは一方向ハッシュでのみ保存します', 'アプリ独自の暗号化は行いません',
    ],
    [A.children]: ['韓国では14歳', '特定できる範囲で直ちに削除します'],
    [A.transfers]: [
      '1455 3rd Street, San Francisco, CA 94158',
      '直近最大24件・12,000字', 'デバイス識別子は送信しません',
      '暗号化されたプロンプトキャッシュ24時間以内', 'モデルの学習に使用しない',
      '対話内容(中継のみで保存しない)',
      '報告内容(報告した回答とその直前のメッセージ、報告理由、追記、報告日時、賢者、アプリの言語・バージョン、デバイス識別子の一方向ハッシュ)',
      'IP アドレスなどの接続情報(リクエストログ。レート制限にも一時的に使用)',
      '購入確認記録は取引日から5年 — サブスクリプションは最後の契約期間の終了日から、未使用の回答が残る深い対話パックは使い切るか返金されるまで保持',
      '報告記録は90日間', '報告の受付、不正なリクエストの制限',
      'Apple: 取引ID、Google: 購入トークンと商品ID',
      '決済処理者である各社のプライバシーポリシーに従う',
      '移転を拒否する方法と影響', '設定からいつでも撤回してください。メッセージは送信されなくなります',
      '拒否した場合、返答の生成と購入の適用はご利用いただけません',
    ],
    [A.officer]: ['会社名: 株式会社ピープルラブズ (PiFl Labs Co., Ltd.)'],
    [A.regional]: ['日本の個人情報保護法(APPI)に基づき、日本のユーザーは個人情報の開示、訂正、利用停止を請求する権利を有します'],
    [A.changes]: ['更新時は上記の施行日を改定し、重要な変更はアプリ内で通知します', '2026年10月1日改定', 'AI 提供者を Anthropic から OpenAI に変更しました'],
  },
};

const en = {
  locale: 'en',
  headings: [
    '1. Purpose of Processing', '2. Information We Process', '3. Retention Period', '4. Disclosure to Third Parties',
    '5. Processing Entrustment and Sharing', '6. What We Do Not Collect, Advertising and Tracking', '7. App Permissions',
    '8. Data Destruction', '9. Your Rights and How to Exercise Them', '10. Security Measures', "11. Children's Privacy",
    '12. International Data Transfers', '13. Data Protection Officer', '14. GDPR (European Economic Area)',
    '15. Changes to this Policy',
  ],
  refNumbers: text => [...text.matchAll(/sections? (\d+)(?: and (\d+))?/gi)].flatMap(m => [m[1], m[2]].filter(Boolean).map(Number)),
  staleRef: /(?!)/,
  statute: /(?!)/g,
  maxBlock: 380,
  hero: {
    effective: 'Effective date: October 1, 2026',
    firstEffective: 'First effective: June 14, 2026',
    provider: 'Provider: PiFl Labs',
    name: 'Dialogos',
  },
  roles: ['Processor', 'Processor', 'Independent controllers for payment'],
  refs: [
    ['(see sections 3 and 12)', ['retention', 'transfers']],
    ['(how long it is kept: section 3)', ['retention']],
    ['We use it only to answer you (section 1) and keep it as described in section 3', ['purpose', 'retention']],
    ['other than the providers in section 5', ['processors']],
    ['(if you write to us by email, see section 2)', ['items']],
    ['Server records whose retention period (section 3) has ended', ['retention']],
    ['(our Data Protection Officer, section 13)', ['officer']],
    ['on the schedule in section 3', ['retention']],
    ['(the daily counters, which expire within about two days, are the exception — see section 2)', ['items']],
    ['when their retention period ends (section 3)', ['retention']],
    ['(with the exceptions in section 3)', ['retention']],
    ['Retention: as in section 3', ['retention']],
  ],
  superseded: ['deleted 90 days after it ends', 'kept for 5 years from the transaction date, then deleted', 'and reports filed)'],
  facts: {
    [A.purpose]: [
      'We use information solely to', 'generate the dialogue you request', 'enforce fair daily-usage limits',
      'verify and apply your purchases', 'review reports of AI replies and keep the app safe', 'answer the messages you send us',
      'We do not sell or rent any data, and we do not use it for advertising',
    ],
    [A.items]: [
      'On first launch the app generates a random token stored on your device', 'It is not sent to OpenAI',
      'The app sends at most the most recent 40 messages, about 22,000 characters',
      'passes on only the most recent part, up to 24 messages and 12,000 characters',
      'We do not store your conversation content on our servers',
      'except a reply you report and the message right before it (see "Reports of AI replies" below)',
      'We call OpenAI with storage turned off (store: false)',
      'we do not opt in to sharing data for training',
      'abuse-monitoring logs, which may include your messages and the replies, for up to 30 days',
      'encrypted prompt cache for up to 24 hours',
      'automatically when the app starts or the store reports a change such as a renewal',
      'for Google Play, a one-way hash of the purchase token',
      ['verification result', 'one-way hashes of the anonymous device identifiers of the devices that use the purchase (a subscription works on up to five devices)'],
      'whether you are on the free tier or Pro', 'We never receive your payment card or billing details',
      'purchase checks sent to the stores',
      'These are stored under the identifier itself, not a hash, and expire automatically within about two days',
      'Only the daily number of reports filed is counted by a one-way hash of the identifier',
      'one service-wide counter per day of the total AI spend',
      'It is not tied to any device or person, contains no personal data, and expires automatically within about two days',
      'Cloudflare uses the IP address only transiently, as the key of that counter, and we do not store it in our own records',
      'first 8 characters of the device identifier', 'never message content',
      'the message you sent right before it (each up to 2,000 characters)', 'any note you add (up to 500 characters)',
      'the time of the report, the mentor',
      'a one-way hash of the anonymous device identifier (never the identifier itself)',
      'We keep these for 90 days, solely to review the report and keep the app safe, and then delete them automatically',
      '"Report a problem" in Settings opens your email app', 'it is an email you write and send',
      'the version and date of your AI conversation consent', 'your purchase status (whether you are on Pro, and how many deep conversations are left)',
    ],
    [A.retention]: [
      "encrypted prompt cache is kept for no more than 24 hours",
      "abuse-monitoring logs are kept for up to 30 days (longer only where required by law or reasonably necessary to protect OpenAI's services or others from harm)",
      'expire automatically within about two days', 'Operational logs: deleted automatically within 7 days',
      'deleted automatically 5 years (1,830 days) after the transaction date',
      'For a subscription, the 5 years run from the end of its latest subscription period',
      'kept with no deletion date while it still has answers left, because purchased credits must not expire',
      'it is deleted 5 years after its purchase date (within a day, if that date has already passed)',
      'so that the same receipt can never be credited twice',
      'Korean e-commerce law (the Act on Consumer Protection in Electronic Commerce) requires records of payments and supply to be kept for 5 years',
      'Report records: kept for 90 days, then deleted automatically', 'kept for 3 years after we have dealt with them, then deleted',
      'remain until you delete the app, which removes all local data',
    ],
    [A.thirdParty]: ['except with your consent or where the law requires it'],
    [A.processors]: ['only as needed to run the app', 'We do not share data with advertisers or data brokers'],
    [A.notCollected]: [
      'The app itself collects no name, email, account, location, contacts, photos, health data, or biometric data',
      'No analytics or advertising SDKs', 'No advertising identifier (IDFA/GAID)', 'No tracking across other apps or websites',
      'shows no App Tracking Transparency prompt because it does not track you',
    ],
    [A.permissions]: ['(such as camera, photos, microphone, location, contacts, notifications, or tracking)', "only uses the network connection to reach our server and each store's payment system for purchases"],
    [A.destruction]: ['deleted automatically when it ends, with no manual step', 'Electronic files are permanently deleted using non-recoverable methods'],
    [A.rights]: [
      'The right to request suspension of processing, correction, deletion, and destruction',
      'the anonymous device identifier is not linked to your name or email and is not shown in the app',
      'Withdraw your AI conversation consent at any time in Settings', 'Clear all local data by deleting the app',
    ],
    [A.security]: [
      'encryption in transit (HTTPS/TLS)', "API key and our store-verification credentials are stored only on the server and are never shipped inside the app",
      'keep the anonymous device identifier only as a one-way hash', 'keep only the first 8 characters of the identifier and never contain message content, receipts, or API keys',
      'A Google Play purchase token is stored only as a one-way hash', 'without separate app-level encryption',
    ],
    [A.children]: ['14 in the Republic of Korea', 'as far as we can identify it'],
    [A.transfers]: [
      '1455 3rd Street, San Francisco, CA 94158',
      'up to the 24 most recent messages / 12,000 characters', 'The device identifier is not sent',
      'encrypted prompt cache for no more than 24 hours', 'not used for model training',
      'conversation content (relayed only, not stored)',
      'report content if you report a reply (the reply and the message before it, reason, note, time of the report, mentor, app language and version, one-way hash of the device identifier)',
      'connection information such as IP addresses (in request logs; also used transiently for rate limiting)',
      'purchase-verification records: 5 years from the transaction date — for a subscription, from the end of its latest period; a pack with answers left is kept until they are used up or refunded',
      'report records: 90 days', 'receiving reports, limiting abusive requests',
      'Apple: the transaction ID; Google: the purchase token and product ID',
      "under each company's own privacy policy, as the payment processor",
      'If you do not want these transfers', 'withdraw it at any time in Settings — your messages are then not sent',
      'Without these transfers we cannot generate replies or apply purchases',
    ],
    [A.officer]: ['Company: PiFl Labs Co., Ltd.'],
    [A.regional]: ['If you are located in the EEA, you have additional rights under the General Data Protection Regulation'],
    [A.changes]: ['we will revise the effective date above and, for material changes, surface a notice in the app', 'Revised October 1, 2026', 'Our AI provider changed from Anthropic to OpenAI'],
  },
};

// root (/apps/dialogos/privacy/) is the English page
const cases = [ko, ja, en, { ...en, locale: '' }];
const name = c => c.locale || 'root';

// Facts that must hold on every locale: entities, contact points (data attributes) and store links.
const shared = [
  'store: false',
  'OpenAI OpCo, LLC',
  '1455 3rd Street, San Francisco, CA 94158',
  'data-email-user="privacy" data-email-domain="openai.com"',
  'Cloudflare, Inc.',
  'data-email-user="privacyquestions" data-email-domain="cloudflare.com"',
  'Apple Inc. / Google LLC',
  'https://www.apple.com/legal/privacy/contact/',
  'https://support.google.com/policies/contact/general_privacy_form',
  'data-email-user="privacy" data-email-domain="pifl-labs.com"',
  'data-email-user="support" data-email-domain="pifl-labs.com"',
];

const logPolicyCssHash = () => createHash('sha256').update(readRepo('public/styles-log-policy.css')).digest('hex').slice(0, 12);

for (const c of cases) {
  const n = name(c);

  // ---------------------------------------------------------------- facts
  test(`Dialogos ${n} privacy policy keeps every fact in its own article`, () => {
    const { articles } = parse(read(c.locale));
    for (const [number, facts] of Object.entries(c.facts)) {
      const article = articles[Number(number) - 1];
      assert.ok(article, `${n}: article ${number} is missing`);
      assert.deepEqual(missing(article.text, facts), [], `${n}: article ${number} (${article.heading}) lost a fact`);
    }
  });

  test(`Dialogos ${n} privacy policy names OpenAI OpCo, LLC and its contact points`, () => {
    const page = read(c.locale);
    for (const text of shared) assert.ok(page.includes(text), `${n}: missing ${text}`);
    // Anthropic remains only in the revision note (article 15).
    assert.equal((page.match(/Anthropic/g) || []).length, 1, `${n}: Anthropic outside the revision note`);
    assert.ok(parse(page).articles[A.changes - 1].text.includes('Anthropic'), `${n}: Anthropic is not in the revision note`);
    // The processor and the transfer recipient carry the legal entity name, never the bare brand.
    for (const bare of ['<strong>OpenAI</strong>', '<td>OpenAI</td>', '<h3>OpenAI</h3>']) {
      assert.ok(!page.includes(bare), `${n}: OpenAI listed without its legal entity name (${bare})`);
    }
    assert.ok(!page.includes('TODO'), `${n}: a placeholder is left in the page`);
  });

  test(`Dialogos ${n} privacy policy does not claim safeguards the app does not have`, () => {
    const page = read(c.locale);
    // Other PiFl Labs app policies list these in their safety measures. Dialogos has no
    // PrivacyInfo.xcprivacy and keeps nothing in Keychain/Keystore (the anonymous id and
    // consent live in SharedPreferences), so copying the bullet over would be untrue.
    for (const claim of ['Privacy Manifest', 'PrivacyInfo', 'Keychain', 'Keystore']) {
      assert.ok(!page.includes(claim), `${n}: claims ${claim}`);
    }
  });

  test(`Dialogos ${n} privacy policy states the purchase-record retention the ledger applies`, () => {
    const page = text(cardHtml(read(c.locale)));
    for (const old of c.superseded) assert.ok(!page.includes(old), `${n}: superseded text remains: ${old}`);
  });

  // ---------------------------------------------------------------- structure
  test(`Dialogos ${n} privacy policy numbers its articles 1-15 in order, with the standard titles`, () => {
    const { articles } = parse(read(c.locale));
    assert.deepEqual(articles.map(a => a.heading), c.headings);
  });

  test(`Dialogos ${n} privacy policy cross-references point at the right article`, () => {
    const { intro, articles } = parse(read(c.locale));
    const body = text(intro) + ' ' + articles.map(a => a.text).join(' ');
    let rest = flat(body.replace(c.statute, ' '));
    for (const [needle, topics] of c.refs) {
      assert.ok(flat(body).includes(flat(needle)), `${n}: missing reference text: ${needle}`);
      assert.deepEqual(c.refNumbers(needle), topics.map(topic => A[topic]), `${n}: wrong article number in: ${needle}`);
      rest = rest.replaceAll(flat(needle), '');
    }
    // After removing the listed references nothing may still point at an article (e.g. an old "5항").
    const leftover = rest.match(/제\d+조|第\d+条|sections?\d+|\d+항|\d+項/gi) || [];
    assert.deepEqual(leftover, [], `${n}: unlisted or stale cross-reference`);
    assert.ok(!c.staleRef.test(body), `${n}: old-numbering reference remains`);
  });

  test(`Dialogos ${n} privacy policy keeps its lists and tables balanced`, () => {
    const page = read(c.locale);
    for (const tag of ['ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'p', 'h2', 'h3', 'strong']) {
      const open = (page.match(new RegExp(`<${tag}[ >]`, 'g')) || []).length;
      const close = (page.match(new RegExp(`</${tag}>`, 'g')) || []).length;
      assert.equal(open, close, `${n}: <${tag}> ${open} vs </${tag}> ${close}`);
    }
  });

  // ---------------------------------------------------------------- layout shared with the other app policies
  test(`Dialogos ${n} privacy policy uses the shared policy layout, CSS and table component`, () => {
    const page = read(c.locale);
    assert.ok(
      page.includes(`extraCss={["/styles.css", "/styles-log-policy.css?v=${logPolicyCssHash()}"]}`),
      `${n}: policy CSS must be pinned to the file's content hash`,
    );
    assert.match(page, /import ScrollableLegalTable from '(?:\.\.\/)+components\/ScrollableLegalTable\.astro';/);
    const hero = heroHtml(page);
    assert.ok(hero.includes('<h1 class="log-policy-heading">'), `${n}: heading markup`);
    assert.ok(hero.includes(`<span class="log-policy-name">${c.hero.name}</span>`), `${n}: heading name`);
    const date = text(hero.slice(hero.indexOf('<p class="legal-date">')));
    for (const part of [c.hero.effective, c.hero.firstEffective, c.hero.provider]) {
      assert.ok(date.includes(part), `${n}: date line lacks ${part}`);
    }
    assert.ok(hero.includes('<span class="legal-revised">'), `${n}: second date line`);
  });

  test(`Dialogos ${n} privacy policy opens with one intro paragraph (the shared CSS styles only the first paragraph as the intro)`, () => {
    const { intro } = parse(read(c.locale));
    assert.equal((intro.match(/<p>/g) || []).length, 1, `${n}: a second paragraph before the first article leaves it without spacing`);
  });

  test(`Dialogos ${n} privacy policy lists processors in a scrollable table`, () => {
    const page = read(c.locale);
    assert.equal((page.match(/<ScrollableLegalTable label="[^"]+">/g) || []).length, 1);
    assert.equal((page.match(/<\/ScrollableLegalTable>/g) || []).length, 1);
    assert.equal((page.match(/<table>/g) || []).length, 1);
    const [, body] = page.match(/<ScrollableLegalTable label="[^"]+">([\s\S]*?)<\/ScrollableLegalTable>/);
    assert.match(body.trim(), /^<table>[\s\S]*<\/table>$/);
    assert.equal((body.match(/<th>/g) || []).length, 3, `${n}: three column headers`);
    const rows = [...body.matchAll(/<tr>\s*<td>(.*?)<\/td>\s*<td>(.*?)<\/td>\s*<td>(.*?)<\/td>\s*<\/tr>/gs)].map(m => m.slice(1, 4).map(text));
    assert.deepEqual(rows.map(r => r[0]), ['OpenAI OpCo, LLC', 'Cloudflare', 'Apple / Google']);
    assert.deepEqual(rows.map(r => r[2]), c.roles);
    // the same table sits in article 5
    assert.ok(parse(page).articles[A.processors - 1].html.includes('<ScrollableLegalTable'));
  });

  test(`Dialogos ${n} privacy policy has no wall of text`, () => {
    // The old page packed whole sections into single list items (up to 1,400 characters). Own text of
    // each paragraph / list item (nested lists excluded) stays short enough to scan.
    const longest = ownTextBlocks(cardHtml(read(c.locale))).reduce((a, b) => (b.length > a.length ? b : a), '');
    assert.ok(longest.length <= c.maxBlock, `${n}: a block is ${longest.length} characters: ${longest.slice(0, 80)}...`);
  });
}

test('Dialogos privacy policies share one structure in every locale', () => {
  // Same number of paragraphs, list items and sub-headings in each article (13-14 differ by design:
  // the Korean page carries the statutory officer/remedy items, en/ja carry GDPR/APPI instead).
  const shape = page => {
    const { intro, articles } = parse(page);
    const count = (html, re) => (html.match(re) || []).length;
    return [intro, ...articles].map(a => {
      const html = typeof a === 'string' ? a : a.html;
      return [count(html, /<p>/g), count(html, /<li>/g), count(html, /<h3>/g), count(html, /<table>/g), count(html, /<ol>/g)];
    });
  };
  const [koShape, jaShape, enShape] = [read('ko'), read('ja'), read('en')].map(shape);
  const same = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].filter(i => ![13, 14].includes(i));
  for (const i of same) {
    assert.deepEqual(jaShape[i], koShape[i], `ja vs ko, article ${i}`);
    assert.deepEqual(enShape[i], koShape[i], `en vs ko, article ${i}`);
  }
});

test('Dialogos root privacy page mirrors the English page', () => {
  const strip = page => page
    .replace(/^import BaseLayout from .*$/m, '')
    .replace(/^import ScrollableLegalTable from .*$/m, '');
  assert.equal(strip(read('')), strip(read('en')));
});

// The Korean statutory items are copied from the other PiFl Labs app policies: if they change
// there (a new officer, a new hotline number), Dialogos has to change with them.
test('Dialogos ko privacy policy carries the same officer and remedy lines as the other Korean app policies', () => {
  const dialogos = read('ko');
  for (const other of ['pipi-log', 'pipi-draw', 'pipi-focus']) {
    const page = readRepo(`src/pages/ko/apps/${other}/privacy.astro`);
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
