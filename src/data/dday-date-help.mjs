// Existing Korean-only guide; it is not a preview of native app settings.
export function ddayDateHelpFor({ slug, status, lang }) {
  if (slug !== 'pipi-dday' || status !== 'live' || lang !== 'ko') return null;
  return {
    href: 'https://pipi-worlds.com/ko/world/hundredth-day/',
    label: '100일째와 100일 뒤 비교하기',
    note: '설치·가입 없는 별도 웹 계산기입니다. 앱의 계산 설정과는 별개이며 결과도 자동으로 옮겨지지 않습니다.',
  };
}
