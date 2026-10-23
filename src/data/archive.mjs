import {extraEvents,extraMedia,extraNames} from './archive-extra.mjs';
// Public, manually curated archive. Never import console exports or email bodies.
const l=(ko,ja,en)=>({ko,ja,en});
export const archiveEvents=[...extraEvents,
 {id:'focus-first-approval',app:'pipi-focus',date:'2026-05-21',timestamp:'2026-05-21T09:41:05Z',kind:'approved',platform:'ios',version:null,observedAt:'2026-10-23',source:'notification',title:l('첫 배포 승인 알림','最初の配信承認通知','First distribution approval notice'),summary:l('당시 PiPi Focus의 승인 알림입니다. 버전은 기재되지 않았으며 실제 첫 공개일은 확인되지 않았습니다.','当時のPiPi Focusの承認通知です。バージョンは未記載で、実際の初公開日は未確認です。','Approval notification for the app then named PiPi Focus. No version was stated; its actual first public release date remains unverified.')},
 {id:'focus-web-20260529',app:'pipi-focus',date:'2026-05-29',kind:'asset',platform:'web',version:null,observedAt:'2026-10-23',source:'git',reference:'0253ac3366b0c9bdda94c417deb6d2c53d2f56bb',title:l('첫 웹 소개 자료','最初のウェブ紹介資料','Early website materials'),summary:l('웹 저장소에 아이콘과 항해 화면이 남아 있습니다. 이 날짜는 Git 기록일이며 앱 공개일이 아닙니다.','アイコンと航海画面がウェブの履歴に残っています。Gitの記録日であり、アプリの公開日ではありません。','The website history preserves an icon and voyage screen. This is a Git record date, not the app’s launch date.')},
 {id:'draw-submitted-10',app:'pipi-draw',date:'2026-07-14',timestamp:'2026-07-14T08:30:00Z',kind:'submitted',platform:'ios',version:'1.0',observedAt:'2026-10-23',source:'notification',title:l('1.0 심사 제출','1.0を審査に提出','Version 1.0 submitted'),summary:l('스토어 알림으로 심사 제출을 확인했습니다. 제출은 공개 출시가 아닙니다.','ストア通知で審査提出を確認しました。提出は公開を意味しません。','A store notification confirms review submission. Submission does not establish public availability.')},
 {id:'draw-approved-10',app:'pipi-draw',date:'2026-07-21',timestamp:'2026-07-21T16:53:39Z',kind:'approved',platform:'ios',version:'1.0',observedAt:'2026-10-23',source:'notification',title:l('1.0 승인 알림','1.0の承認通知','Version 1.0 approval'),summary:l('승인 알림을 확인했습니다. 실제 공개일은 이 알림만으로 확정할 수 없습니다.','承認通知を確認しました。この通知だけでは実際の公開日は確定できません。','The approval notification is verified. It does not by itself establish when the app became public.')},
 {id:'draw-assets-20261001',app:'pipi-draw',date:'2026-10-01',kind:'asset',platform:'ios',version:null,observedAt:'2026-10-23',source:'git',reference:'101d79e4',title:l('공식 화면 세트 보관','公式画面セットを保存','Official screenshot set preserved'),summary:l('20260930 폴더의 공식 화면이 Git에 기록되었습니다. 폴더명·커밋일을 스토어 게시일로 해석하지 않습니다.','20260930フォルダーの公式画像がGitに記録されました。フォルダー名やコミット日はストア掲載日ではありません。','Official images in the 20260930 folder were recorded in Git. Folder and commit dates are not store publication dates.')},
 {id:'focus-1016',app:'pipi-focus',date:'2026-10-05',kind:'released',platform:'ios',version:'1.0.16',observedAt:'2026-10-08',source:'public-store',region:'KR · JP · US',title:l('1.0.16 공개 기록','1.0.16の公開記録','Version 1.0.16 on the store'),summary:l('당시 공개 스토어 조회에 남아 있는 버전과 업데이트일입니다. 상세 변경 문구는 이 기록에 보관되지 않았습니다.','当時の公開ストア照会に残るバージョンと更新日です。詳しい変更内容はこの記録には保存されていません。','A dated public-store response preserves this version and update date. Detailed release notes were not retained in this record.')},
 {id:'draw-112',app:'pipi-draw',date:'2026-10-13',timestamp:'2026-10-13T16:44:19Z',kind:'released',platform:'ios',version:'1.1.2',observedAt:'2026-10-14',source:'public-store',region:'KR · JP · US',title:l('인쇄와 더 많은 색','印刷と、もっと多くの色','Printing and more colors'),summary:l('공개 스토어의 1.1.2 기록과 Git 릴리스노트를 대조했습니다. 인쇄·PDF 저장, 팔레트와 색상 선택 개선을 담았습니다.','公開ストアの1.1.2とGitのリリースノートを照合。印刷・PDF保存、パレットや色選択の改善を含みます。','Public-store version 1.1.2 is paired with its Git release notes: printing, PDF export, palettes and improved color selection.')},
 {id:'focus-radio',app:'pipi-focus',date:'2026-10-15',timestamp:'2026-10-15T19:05:28Z',kind:'released',platform:'ios',version:'1.1.0',observedAt:'2026-10-16',source:'public-store',region:'KR · JP · US',title:l('선실 라디오','船室ラジオ','Cabin Radio'),summary:l('로파이와 빗소리를 겹치고 음량을 따로 조절합니다. 항해 중에도 소리를 바꿀 수 있는 공개 기능을 확인했습니다.','ローファイと雨音を重ね、音量を別々に調整。航海中の音の切り替えも公開機能として確認しました。','Layer lo-fi with rain, adjust volumes independently and change sounds during a voyage. Confirmed in the public iOS listing.')},
 {id:'focus-120',app:'pipi-focus',date:'2026-10-19',timestamp:'2026-10-19T13:21:10Z',kind:'released',platform:'ios',version:'1.2.0',observedAt:'2026-10-23',source:'public-store',region:'KR',title:l('한국 스토어 1.2.0 기록','韓国ストアの1.2.0','Version 1.2.0 in Korea'),summary:l('한국 스토어 응답에 1.2.0이 남아 있었습니다. 같은 확인일의 일본·미국 응답은 1.2.1로, 지역별 관측을 분리했습니다.','韓国の応答には1.2.0が残っていました。同日の日本・米国は1.2.1。地域ごとの観測を分けています。','The Korean response still reported 1.2.0 while Japan and the US reported 1.2.1. Regional observations are kept separate.')},
 {id:'focus-121',app:'pipi-focus',date:'2026-10-22',timestamp:'2026-10-22T17:04:30Z',kind:'released',platform:'ios',version:'1.2.1',observedAt:'2026-10-23',source:'public-store',region:'JP · US',title:l('1.2.1과 새로운 등록 화면','1.2.1と新しい掲載画像','Version 1.2.1 and listing images'),summary:l('공개 버전과 공식 스토어 이미지를 보관했습니다. 이미지가 해당 바이너리에서 직접 촬영됐는지는 별도 검증이 필요합니다.','公開バージョンと公式掲載画像を保存。画像がそのバイナリーから直接撮影されたかは別途確認が必要です。','Public version and official listing images were preserved. Direct capture from this exact binary is not independently verified.')},
 {id:'draw-android-122',app:'pipi-draw',date:'2026-10-23',kind:'observed',platform:'android',version:'1.2.2 (52)',observedAt:'2026-10-23',source:'store-check',title:l('Android 공개 배포 확인','Androidの公開配信を確認','Android public release observed'),summary:l('공개 프로덕션 배포를 확인한 날짜입니다. 현재 등록정보의 이전 화면을 새 빌드의 캡처라고 단정하지 않습니다.','公開プロダクション配信を確認した日です。掲載中の以前の画像を新ビルドのキャプチャとは断定しません。','This is the date public production availability was checked. Older listing images are not presented as captures of the new build.')},
].sort((a,b)=>b.date.localeCompare(a.date)||a.id.localeCompare(b.id));
export const archiveApps=['pipi-focus','pipi-draw',...Object.keys(extraMedia)];
export const archiveMedia={...extraMedia,
 'pipi-focus':{oldIcon:'/assets/apps/pipi-focus/icon.webp',oldDate:'2026-05-29',oldShot:'/assets/apps/pipi-focus/en/sail.webp',newShot:'/assets/apps/pipi-focus/submission/20261023-1.webp'},
 'pipi-draw':{oldIcon:'/assets/apps/pipi-draw/icon.webp',oldDate:'2026-06-19',oldShot:'/assets/archive/draw-20260930.webp',newShot:'/assets/apps/pipi-draw/submission/20261023-1.webp'}
};

// Notification timestamps are separate from public-store update timestamps.
const milestones={
 'draw-approved-10':{submittedAt:'2026-07-14T08:30:00Z',approvalNotifiedAt:'2026-07-21T16:53:39Z'},
 'draw-112':{submittedAt:'2026-10-13T07:38:00Z',approvalNotifiedAt:'2026-10-13T16:42:32Z'},
 'focus-radio':{submittedAt:'2026-10-14T23:39:00Z',approvalNotifiedAt:'2026-10-15T19:04:25Z'},
 'focus-120':{submittedAt:'2026-10-18T14:32:00Z',approvalNotifiedAt:'2026-10-19T13:21:50Z'},
 'focus-121':{submittedAt:'2026-10-22T02:53:00Z',approvalNotifiedAt:'2026-10-22T17:02:24Z'}
};
for(const event of archiveEvents){
 event.timeBasis=event.kind==='released'?'public-store-update':event.kind==='approved'?'notification-date':event.kind==='submitted'?'submission-time':event.kind==='asset'?'git-record-date':'observation-date';
 if(milestones[event.id])event.milestones=milestones[event.id];
}
export const archiveNames={...extraNames,
 'pipi-focus':['PiPi Focus','PiPi Focus: Pirate Pomodoro','Pomodoro at Sea: Focus Timer'],
 'pipi-draw':['PiPi Draw','PiPi Draw - AI Sketch Coloring','Photo Outlines: Coloring Book']
};
