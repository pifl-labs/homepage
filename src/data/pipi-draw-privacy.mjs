// 밑그림(PiPi Draw) 개인정보처리방침의 시행일 — 4개 언어 페이지(ko·ja·en·루트)의 머리말과 맺음 조항이 함께 쓴다.
//
// 지금 공개된 판은 #69 로, 시행일은 2026-10-01 이고 이전 방침 시행일은 2026-06-04 이다.
// 이 판을 고치는 PR 을 게시하는 날(한국시간)에 따라 세 가지가 함께 정해진다.
//   1) 10월 1일 안에 게시하면 같은 판을 고쳐 쓰는 것이다.
//      - 시행일: 2026-10-01
//      - 이전 방침 시행일: 2026-06-04
//      - 변경 내용: 2026-06-04 판에서 바뀐 것 전체(#69 + 이번 PR). 페이지에서 sameDay 쪽 문단이 나온다.
//   2) 10월 2일 이후에 게시하면 새 판이다.
//      - 시행일: 게시일
//      - 이전 방침 시행일: 2026-10-01
//      - 변경 내용: 이번 PR 분만. 페이지에서 later 쪽 문단이 나온다.
//
// 게시가 늦어지면 두 줄을 실제 게시일(YYYY-MM-DD)로 바꾼다.
//   - 아래 DRAW_PRIVACY_EFFECTIVE_DATE
//   - tests/draw-privacy-transfer.test.mjs 의 CURRENT_EFFECTIVE_DATE 기대값
// 이전 방침 시행일과 변경 내용 문단은 이 날짜로 자동으로 고른다. 두 경우 모두 테스트가 고정한다.
// 이 PR 을 게시한 뒤 다음에 개정할 때는 아래 LIVE 두 값을 그 시점에 공개된 판으로 옮기고,
// 페이지의 두 변경 내용 문단을 새로 쓴다.
export const DRAW_PRIVACY_EFFECTIVE_DATE = '2026-10-01';

/** 지금 공개된 판(#69)의 시행일, 그리고 그 판이 맺음 조항에 적은 이전 방침 시행일. */
export const DRAW_PRIVACY_LIVE_EFFECTIVE_DATE = '2026-10-01';
export const DRAW_PRIVACY_LIVE_PREVIOUS_DATE = '2026-06-04';

const EN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** 날짜를 페이지 언어로 쓴다 — ko '2026년 10월 1일', ja '2026年10月1日', en 'October 1, 2026'. */
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

/**
 * 게시일에 따른 시행일·이전 방침 시행일·변경 내용 판을 함께 돌려준다.
 * sameDay 가 true 면 공개된 판을 같은 날 고쳐 쓴 것이고, false 면 새 판이다.
 */
export function drawPrivacyRevision(lang, isoDate = DRAW_PRIVACY_EFFECTIVE_DATE) {
  const effectiveDate = drawPrivacyEffectiveDate(lang, isoDate); // 형식·날짜 검사를 먼저 한다.
  if (isoDate < DRAW_PRIVACY_LIVE_EFFECTIVE_DATE) {
    throw new Error(`시행일은 공개된 판(${DRAW_PRIVACY_LIVE_EFFECTIVE_DATE})보다 앞설 수 없습니다: ${isoDate}`);
  }
  const sameDay = isoDate === DRAW_PRIVACY_LIVE_EFFECTIVE_DATE;
  return {
    sameDay,
    effectiveDate,
    previousDate: drawPrivacyEffectiveDate(
      lang,
      sameDay ? DRAW_PRIVACY_LIVE_PREVIOUS_DATE : DRAW_PRIVACY_LIVE_EFFECTIVE_DATE,
    ),
  };
}
