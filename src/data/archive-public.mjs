import {archiveEvents} from './archive.mjs';

const l = (ko, ja, en) => ({ko, ja, en});

// Older public versions without a saved contentEvidence object. Each entry was
// checked against the release notes or listing captured in the archive audit.
// The original observations and private-workflow milestones remain in Git.
const historicalHighlights = {
 'pipi-words-android-110': {
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

export function releaseDate(event) {
 return event.storeUpdated || event.date;
}

export function displayKind(event) {
 return event.storeUpdated ? 'released' : event.kind;
}

const sudokuNotes = archiveEvents.find(e => e.id === 'pipi-sudoku-ios-observed-20261117');
const publicHighlights = {
 ...historicalHighlights,
 // One card for this exact iOS version: keep its original store timestamp
 // and regional evidence, with the richer notes confirmed in the KR store.
 'pipi-sudoku-ios-102': {
  title: sudokuNotes.title,
  summary: sudokuNotes.summary,
  contentEvidence: sudokuNotes.contentEvidence,
  url: sudokuNotes.url,
 },
};

export const publicArchiveEvents = archiveEvents
 .filter(e => ['released', 'observed'].includes(e.kind)
   && ['ios', 'android'].includes(e.platform) && e.version
   && ['public-store', 'store-check'].includes(e.source)
   && (e.contentEvidence || Object.hasOwn(publicHighlights, e.id))
   && e.id !== sudokuNotes.id)
 .map(({milestones, ...e}) => ({...e, ...publicHighlights[e.id]}))
 .sort((a,b) => releaseDate(b).localeCompare(releaseDate(a)) || a.id.localeCompare(b.id));

export const publicArchiveApps = [...new Set(publicArchiveEvents.map(e => e.app))];

export const publicArchiveEvidence = {
 checkedAt: publicArchiveEvents.map(e => e.observedAt).sort().at(-1),
 scope: 'Public App Store and Google Play releases and updates with documented user-facing changes or maintenance notes.',
 events: publicArchiveEvents,
};
