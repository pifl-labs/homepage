import records from './app-submission-media.json';
import type { Lang } from '../i18n/ui';
type Record = (typeof records)[keyof typeof records];
export function submissionMedia(slug: string): Record | undefined {
  return records[slug as keyof typeof records];
}
export const submissionCopy = {
  ko: { title: '스토어에 제출한 화면', short: 'iOS 등록 화면', pending: '심사 제출 화면*', label: 'App Store 등록정보', detail: '영어 등록정보에 첨부된 공식 화면입니다. 실제 빌드를 실행해 촬영한 최신 화면인지까지는 확인하지 못했습니다.', warning: '심사 중인 화면은 현재 다운로드할 수 있는 버전과 다를 수 있습니다.', footnote: '* 심사 제출 화면은 현재 공개 버전과 다를 수 있습니다. 상세 페이지에서 버전과 출처 범위를 확인하세요.' },
  ja: { title: 'ストアに提出した画面', short: 'iOS 登録画面', pending: '審査提出画面*', label: 'App Store 登録情報', detail: '英語の登録情報に添付された公式画像です。実際のビルドを起動して撮影した最新画面かどうかは未確認です。', warning: '審査中の画面は、現在ダウンロードできるバージョンと異なる場合があります。', footnote: '* 審査提出画面は公開中のバージョンと異なる場合があります。バージョンと確認範囲は詳細ページをご覧ください。' },
  en: { title: 'Screens submitted to the store', short: 'iOS listing image', pending: 'Review preview*', label: 'App Store listing', detail: 'Official images attached to the English listing. We have not verified that they were captured from the attached build.', warning: 'Screens under review may differ from the version currently available to download.', footnote: '* Review previews may differ from the public version. See each app’s detail page for the version and source scope.' },
} satisfies { [key in Lang]: { title: string; short: string; pending: string; label: string; detail: string; warning: string; footnote: string } };
