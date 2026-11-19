// 홈 앱 카탈로그의 용도별 묶음(필터). 스토어 분류(category)는 앱마다 제각각이라
// 방문자가 고르는 기준인 '무엇을 하고 싶은가'로 다시 묶는다. 홈에 오르는 앱은
// 정확히 한 묶음에 속해야 하며, 새 앱이 묶음 없이 빠지지 않게 AppCatalog 빌드에서 확인한다.
// (이 파일은 데이터만 둔다 — 테스트가 Node 에서 바로 읽을 수 있게 런타임 import 없음)
import type { Lang } from '../i18n/ui';

export interface AppGroup { key: string; label: Record<Lang, string>; slugs: string[] }

export const APP_GROUPS: AppGroup[] = [
  { key: 'learn', label: { ko: '배움', ja: '学び', en: 'Learn' },
    slugs: ['pipi-bridge', 'pipi-hello', 'pipi-words', 'pipi-word-voyage'] },
  { key: 'focus', label: { ko: '집중·시간', ja: '集中・時間', en: 'Focus & time' },
    slugs: ['pipi-focus', 'pipi-dday', 'pipi-tide'] },
  { key: 'create', label: { ko: '그림·퍼즐', ja: 'お絵描き・パズル', en: 'Create & play' },
    slugs: ['pipi-draw', 'pipi-sudoku'] },
  { key: 'life', label: { ko: '기록·생활', ja: '記録・暮らし', en: 'Journal & life' },
    slugs: ['pipi-log', 'dialogos', 'pipi-dream', 'kkachi', 'pipi-spend', 'pipi-bp', 'pipi-sky'] },
];

export const groupOf = (slug: string) => APP_GROUPS.find((g) => g.slugs.includes(slug))!.key;

/** Every home app in exactly one group, and no group lists an app that is not on home. */
export function assertAppGroups(homeSlugs: string[]) {
  const grouped = APP_GROUPS.flatMap((g) => g.slugs);
  for (const slug of homeSlugs) {
    const n = grouped.filter((s) => s === slug).length;
    if (n !== 1) throw new Error(`Home app ${slug} must be in exactly one APP_GROUPS entry (found ${n})`);
  }
  for (const slug of grouped) {
    if (!homeSlugs.includes(slug)) throw new Error(`APP_GROUPS lists ${slug}, which is not on the home catalog`);
  }
}
