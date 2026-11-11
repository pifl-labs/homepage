const copy = {
  ko: {
    label: '무료 단어 카드·퀴즈 열기',
    note: '설치·가입 없는 별도 웹 샘플입니다. 답안·진도는 앱으로 옮겨지지 않습니다.',
  },
  ja: {
    label: '無料カード・クイズ',
    note: 'インストール・登録不要のWebサンプルです。回答や進み具合はアプリに引き継がれません。',
  },
  en: {
    label: 'Try free vocabulary cards and quiz',
    note: 'A separate web sample, with no install or sign-up. Answers and progress do not transfer to the app.',
  },
};

export function wordsWebTrialFor({ slug, status, lang }) {
  if (slug !== 'pipi-words' || status !== 'live' || !Object.hasOwn(copy, lang)) return null;
  return { ...copy[lang], href: `https://pipi-worlds.com/${lang}/vocab/` };
}
