const copy = {
  ko: {
    label: '무료 글자 연결 해보기',
    note: '한글을 읽는 분을 위한 별도 웹 예시 3판입니다. 설치·가입 없이 이용하며, 결과는 앱으로 옮겨지지 않습니다.',
  },
  en: {
    label: 'Try free Korean word links',
    note: 'Three separate examples for Hangul readers, with English instructions. No install or sign-up; answers do not transfer to the app.',
  },
};

export function voyageWebTrialFor({ slug, status, lang }) {
  if (slug !== 'pipi-word-voyage' || status !== 'live' || !Object.hasOwn(copy, lang)) return null;
  return { ...copy[lang], href: `https://pipi-worlds.com/${lang}/learn/korean-word-link/` };
}
