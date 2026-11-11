const copy = {
  ko: {
    label: '웹 타이머 먼저 써보기',
    note: '설치·가입 없이 쓰는 별도 웹 체험입니다. 기록과 보물은 앱으로 옮겨지지 않습니다.',
  },
  ja: {
    label: 'Webタイマーを試す',
    note: 'インストール・登録不要の別のWeb体験です。記録や宝物はアプリへ引き継がれません。',
  },
  en: {
    label: 'Try the web timer',
    note: 'A separate web preview, with no install or sign-up. Sessions and treasures do not transfer to the app.',
  },
};

export function focusWebTrialFor({ slug, status, lang }) {
  if (slug !== 'pipi-focus' || status !== 'live' || !Object.hasOwn(copy, lang)) return null;
  return { ...copy[lang], href: `https://pipi-worlds.com/${lang}/pomodoro/` };
}
