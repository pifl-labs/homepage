import {archiveEvents} from './archive.mjs';
import storeReceipt from '../../docs/release/homepage-store-recheck-20261118.json' with {type:'json'};

const l = (ko, ja, en) => ({ko, ja, en});

// Older public versions without a saved contentEvidence object. Each entry was
// checked against the release notes or listing captured in the archive audit.
// The original observations and private-workflow milestones remain in Git.
const historicalHighlights = {
 'pipi-words-android-110': {
  publication: {date:'2026-11-02',basis:'play-updated',region:'KR'},
  title: l('EPS-TOPIK 단어팩과 표시 언어 추가', 'EPS-TOPIK単語パックと表示言語を追加', 'EPS-TOPIK decks and more display languages'),
  summary: l('EPS-TOPIK 단어팩 7개를 추가했어요. 앱 화면과 단어 뜻을 표시할 언어도 9개 늘었어요.', 'EPS-TOPIK単語パックを7つ追加し、アプリ画面と単語の意味を表示する言語を9つ増やしました。', 'Seven EPS-TOPIK decks were added, along with nine more languages for the interface and word meanings.'),
 },
 'pipi-word-voyage-131': {
  summary: l('테마 항해에서 쉬운 음식 팩을 먼저 보여 줘요. 글자 크기를 키워도 퍼즐의 글자가 칸 안에 들어가도록 개선했어요.', 'テーマ航海ではやさしい食べ物パックを先に表示します。文字を拡大してもパズルのマスに収まるよう改善しました。', 'Theme voyages show the easy food pack first. Puzzle letters stay inside their tiles at larger text sizes.'),
 },
 'draw-123': {
  summary: l('크게 모드에서 도구와 색을 더 크게 볼 수 있어요. 두 손가락으로 확대하거나 움직이고, 색칠할 부분을 먼저 고를 수 있어요.', '大きく表示するモードで道具と色が見やすくなりました。二本指で拡大・移動し、先に塗る場所を選べます。', 'A larger mode makes tools and colors easier to see. Zoom and pan with two fingers, and choose an area before coloring.'),
 },
 'pipi-hello-110': {
  summary: l('일본어 과정에 배운 히라가나로 읽는 첫 그림책과 상황 레슨 8편을 담았어요. 기기 언어에 따라 배우는 언어와 내용이 달라져요.', '習ったハングルで読める初めての絵本と、場面レッスンが加わりました。端末の言語によって学ぶ言語と内容が変わります。', 'The app offers eight illustrated situation lessons, five of them new. The language and lesson content depend on your device language.'),
 },
 'focus-123': {
  summary: l('집중 시간 25분마다 보물 하나를 받아요. 25분에 못 미친 나머지 시간은 다음 항해로 이어져요.', '集中時間25分ごとに宝物を1つ獲得し、残りの時間は次の航海に持ち越します。', 'Earn a treasure for every 25 minutes of focus. Leftover minutes carry over to the next voyage.'),
 },
 'pipi-dday-201': {
  title: l('iOS 26 위젯 날짜 선택 수정', 'iOS 26ウィジェットの日付選択を修正', 'Widget date selection fixed for iOS 26'),
  summary: l('위젯 편집에서 선택한 날짜가 iOS 26에서도 표시돼요. 앱 대표 날짜를 선택하면 위젯이 앱의 대표 날짜를 따라가요.', 'ウィジェット編集で選んだ日付がiOS 26でも表示されます。アプリのメイン日付を選ぶと、ウィジェットがその日付に連動します。', 'The date chosen in Edit Widget now appears on iOS 26. Select the app’s main date to keep the widget in sync with it.'),
 },
 'draw-android-122': {
  title: l('변환 뒤 선 굵기와 밑그림 다듬기', '変換後に線の太さを調整・修正', 'Adjust and clean up outlines after conversion'),
  summary: l('그림체와 배경을 고른 뒤 변환해요. 결과 화면에서 다시 변환하지 않고 선 굵기를 바꾸거나, 필요 없는 선을 손가락으로 지울 수 있어요.', '画風と背景を選んで変換します。結果画面で再変換せずに線の太さを変え、不要な線を指で消せます。', 'Choose a style and background before conversion. On the result screen, change line thickness without reconverting or erase unwanted lines with your finger.'),
  publication: {date:'2026-10-23',basis:'play-production',reference:'8b527a31'},
  releaseNotesReference: {repository:'pifl-labs/pipi-draw', commit:'8ffd56e27820e958a32fb96ff7cb940f9e47767c', path:'android/fastlane/metadata/android/ko-KR/changelogs/52.txt'},
 },
 'pipi-log-1013': {
  summary: l('기분과 날짜만 담은 이미지로 오늘의 기분을 보낼 수 있어요. 기록을 저장할 때 생기던 오류도 고쳤어요.', '気分と日付だけを載せた画像で、今日の気分を送れます。記録を保存するときの不具合も修正しました。', 'Share today’s mood in an image with just the mood and date. This update also fixes errors when saving entries.'),
 },
 'pipi-words-1014': {
  summary: l('타이핑 퀴즈 결과가 멈추던 오류와 TOPIK II 단어팩 열기 문제를 고쳤어요. 카드 뒷면에서 다음 복습일을 볼 수 있어요.', '入力クイズの結果画面が止まる問題と、TOPIK II単語パックを開くときの問題を修正しました。カードの裏面に次の復習日が表示されます。', 'Typing quiz results no longer freeze, and an issue opening TOPIK II decks was fixed. Card backs show the next review date.'),
 },
 'focus-radio': {
  summary: l('로파이 음악과 빗소리를 함께 틀고 각각의 음량을 조절할 수 있어요. 항해 중에도 소리를 바꿀 수 있어요.', 'ローファイ音楽と雨音を重ねて、それぞれの音量を調整できます。航海中も音を切り替えられます。', 'Layer lo-fi music with rain sounds, adjust volumes independently and switch sounds during a voyage.'),
 },
 'draw-112': {
  summary: l('색칠한 그림을 인쇄하거나 PDF로 저장할 수 있어요. 팔레트와 색상 선택도 개선했어요.', 'ぬりえを印刷したりPDFに保存したりできます。パレットと色の選び方も改善しました。', 'Print your coloring pages or save them as PDFs. Palettes and color selection were improved.'),
 },
};

const koreaDay = new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'});
export function publicationFor(event) {
 if(event.publication) return event.publication;
 if(event.platform==='android' && event.storeUpdated) return {date:event.storeUpdated,basis:'play-updated',region:event.region};
 if(event.platform!=='ios') return null;
 const id=event.url?.match(/\/id(\d+)/)?.[1];
 const receipt=id && storeReceipt.ios.apps.find(a=>String(a.trackId)===id && a.version===event.version);
 const timestamp=event.timestamp || receipt?.currentVersionReleaseDate;
 if(timestamp) return {date:koreaDay.format(new Date(timestamp)),basis:'ios-released-kst',timestamp};
 if(event.timeBasis==='public-store-update') return {date:event.date,basis:'ios-store-date'};
 return null;
}
export function releaseDate(event) {
 return event.publication?.date ?? null;
}

export function displayKind(event) {
 return event.publication?.basis==='play-production' ? 'observed' : 'released';
}

const sudokuNotes = archiveEvents.find(e => e.id === 'pipi-sudoku-ios-observed-20261117');
const publicHighlights = {
 ...historicalHighlights,
 // The Play notes describe the new home and widget. The matching production
 // build document also records the Play rename and Android-only purchase.
 'kkachi-android-observed-20261117': {
  title: l('나의 민화 홈과 2027년 상세 풀이', '民画と2027年の詳しい読み解き', 'Your folk painting at home and a detailed 2027 reading'),
  summary: l(
   'Google Play 이름을 ‘까치: 나만의 민화’로 바꿨어요. 첫 화면에서 내 민화를 족자로 펼치고, 그림 읽기에서 소재의 뜻을 보거나 가족·친구의 그림을 고를 수 있어요. 위젯은 ‘오늘’로 바로 열려요. Android에서는 2027년 상세 풀이를 한국어·영어·일본어로 앱 안에서 구매할 수 있어요.',
   'Google Playでの名前を「カチ：わたしの民画」に変更しました。ホームで自分の民画を掛け軸で開き、モチーフの意味を読んだり、家族や友だちの絵を選んだりできます。ウィジェットから「今日」を直接開けます。Androidでは2027年の詳しい読み解きを日本語・韓国語・英語で購入できます。',
   'The Google Play listing is now Kkachi: Your Folk Painting. Open your painting as a hanging scroll, read about its motifs, or choose a family member’s or friend’s painting from Home. The widget opens Today directly. On Android, the detailed 2027 reading is available as an in-app purchase in English, Korean and Japanese.',
  ),
  releaseNotesReference: {repository:'pifl-labs/kkachi-saju', commit:'68ef75c61089c9c170235b5e0a140baa831e6637', path:'docs/paid-2027/README.md'},
 },
 // One card for this exact iOS version: keep its original store timestamp
 // and regional evidence, with the richer notes confirmed in the KR store.
 'pipi-sudoku-ios-102': {
  title: sudokuNotes.title,
  summary: sudokuNotes.summary,
  contentEvidence: sudokuNotes.contentEvidence,
  url: sudokuNotes.url,
 },
};

const ddayAndroid = storeReceipt.android.find(e=>e.package==='com.pifl.pipi.dday'&&e.version==='2.0.3');
const dday203 = {
 id:'pipi-dday-android-203',app:'pipi-dday',platform:'android',kind:'observed',source:'public-store',
 version:ddayAndroid.version, region:storeReceipt.region, url:ddayAndroid.url,
 date:storeReceipt.observedAt, observedAt:storeReceipt.observedAt, timeBasis:'observation-date',
 storeUpdated:ddayAndroid.updated.match(/\d+/g).map((x,i)=>i?x.padStart(2,'0'):x).join('-'),
 title:l('오늘의 기념일 공유와 여행 중 알림','当日の記念日を共有、旅行先でも通知','Share today’s milestone and keep reminders local'),
 summary:l('기념일 당일에 홈에서 바로 공유할 수 있어요. 날짜를 잘못 입력하면 형식과 허용 범위를 안내하고, 다른 시간대에서 앱을 열면 알림이 현지 시각에 맞춰 다시 예약돼요.','記念日の当日はホームから共有できます。日付を誤入力したときは形式と範囲を案内し、別の時間帯でアプリを開くと現地時刻に合わせて通知を設定し直します。','Share a milestone from Home on the day itself. Date entry shows format and range guidance, and reminders reschedule to local time when you open the app in a different time zone.'),
 contentEvidence:{id:'pipi-dday-android-203',kind:'store-release-notes',checkedAt:storeReceipt.observedAt,url:'/archive-release-notes-20261118.json'},
};

export const publicArchiveEvents = [...archiveEvents,dday203]
 .filter(e => ['released', 'observed'].includes(e.kind)
   && ['ios', 'android'].includes(e.platform) && e.version
   && ['public-store', 'store-check'].includes(e.source)
   && (e.contentEvidence || Object.hasOwn(publicHighlights, e.id))
   && e.id !== sudokuNotes.id)
 .map(({milestones, ...e}) => ({...e, ...publicHighlights[e.id]}))
 .map(e => {
  const publication=publicationFor(e);
  if(e.app==='pipi-dday'&&e.version==='2.0.2') {
   const summary=e.platform==='ios'
    ? l('사진이 위젯을 가득 채우고, iOS의 틴트·투명 모드에서도 사진이 보이도록 고쳤어요. 날짜 삭제를 되돌리면 사진과 알림도 복원돼요.','写真がウィジェット全体を埋め、iOSの色合い・透明表示でも写真が出るように修正しました。日付の削除を取り消すと写真と通知も戻ります。','Photos fill the widget and remain visible in iOS tinted and clear modes. Undoing a deleted date also restores its photo and reminders.')
    : l('사진이 위젯을 가득 채우고 기본 위젯의 얇은 테두리를 없앴어요. 날짜 삭제를 되돌리면 사진과 알림도 복원돼요.','写真がウィジェット全体を埋め、標準ウィジェットの細い枠線をなくしました。日付の削除を取り消すと写真と通知も戻ります。','Photos fill the widget, and the default Android widget no longer has a thin border. Undoing a deleted date also restores its photo and reminders.');
   const releaseNotesReference=e.platform==='ios' ? {
    repository:'pifl-labs/pipi-dday', commit:'18616088370ff055d7c0bd00ace30b98c8cb3cb0', path:'docs/release/2.0.2+45.md',
   } : undefined;
   return {...e,publication,summary,...(releaseNotesReference&&{releaseNotesReference})};
  }
  return {...e,publication};
 })
 .filter(e=>e.publication)
 .sort((a,b) => releaseDate(b).localeCompare(releaseDate(a)) || a.id.localeCompare(b.id));

export const publicArchiveApps = [...new Set(publicArchiveEvents.map(e => e.app))];

export const publicArchiveEvidence = {
 checkedAt: publicArchiveEvents.map(e => e.observedAt).sort().at(-1),
 scope: 'Public App Store and Google Play releases and updates with documented user-facing changes or maintenance notes.',
 events: publicArchiveEvents,
};
