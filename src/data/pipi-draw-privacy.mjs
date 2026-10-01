// 밑그림(PiPi Draw) 개인정보처리방침 시행일 — 4개 언어 페이지(ko·ja·en·루트)의 머리말과 맺음 조항이 함께 쓴다.
// 게시가 늦어지면 아래 한 줄만 실제 게시일(YYYY-MM-DD)로 바꾼다.
// 이전 방침 시행일(2026-06-04)은 각 페이지 맺음 조항에 그대로 둔다.
export const DRAW_PRIVACY_EFFECTIVE_DATE = '2026-10-01';

const EN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** 시행일을 페이지 언어로 쓴다 — ko '2026년 10월 1일', ja '2026年10月1日', en 'October 1, 2026'. */
export function drawPrivacyEffectiveDate(lang, isoDate = DRAW_PRIVACY_EFFECTIVE_DATE) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) throw new Error(`시행일은 YYYY-MM-DD 형식이어야 합니다: ${isoDate}`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) {
    throw new Error(`시행일이 올바른 날짜가 아닙니다: ${isoDate}`);
  }
  switch (lang) {
    case 'ko':
      return `${year}년 ${month}월 ${day}일`;
    case 'ja':
      return `${year}年${month}月${day}日`;
    case 'en':
      return `${EN_MONTHS[month - 1]} ${day}, ${year}`;
    default:
      throw new Error(`지원하지 않는 언어입니다: ${lang}`);
  }
}
