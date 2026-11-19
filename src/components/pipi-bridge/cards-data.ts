// Korean Bridge 도서관·교실 주제 카드 — 목록(/cards/)·주제별(/cards/<주제>/)·전체 인쇄(/cards/print/)
// 세 페이지가 함께 쓰는 데이터와 규칙. 한 곳에서만 정의해 페이지끼리 문구가 갈라지지 않게 한다.
//
// 데이터 출처: Korean Bridge 커리큘럼(code/pipi_bridge/lib/data/)에서 추출한 60개 주제
// (src/data/bridge-library-cards.json). 주제·항목 문구는 1.1.0 추출본이 1.1.2(feat/library-112)
// 소스와 같음을 2026-11-18 대조했다. 연습 클래스 이름은 화면에 내지 않고 요약만 한다.
// 세션 규칙(lib/domain/library/library_session.dart, 1.1.2): 새 항목 5개 + 연습 최대 5개.
// 연습은 방문마다 practicePool* 에서 새로 뽑는다(유형마다 1개, 듣기·화면 유형 교대, 따라 쓰기는 항상 포함).
// practicePoolWithSound = 소리 켬 시 고를 수 있는 연습 전부, practicePoolWithoutSound = 소리 끔(requiresAudio 제외).
// 개수 = min(5, 풀 크기)(practiceCount), 따라 쓰기 = 풀에 LetterTracePractice 존재(includesTracing).
// 태그 첫 줄은 앱 주제 목록의 요약(packMeta '{lessons} new items · up to {practice} practice')과 같은 문구.
// 앱은 따라 쓰기를 같은 줄에 ' · includes letter tracing' 으로 붙이고(_packSummary), 카드는 별도 태그로 나눈다.
import topicsJson from '../../data/bridge-library-cards.json';

export interface Lesson { korean: string; meaning: string; tip: string; mission: string }
export interface Topic {
  id: string;
  world: string;
  title: string;
  description: string;
  practicePoolWithSound: string[];
  practicePoolWithoutSound: string[];
  lessons: Lesson[];
}

export const BASE = 'https://pifl-labs.com';
export const GUIDE_PATH = '/en/apps/pipi-bridge/library/';
export const CARDS_PATH = '/en/apps/pipi-bridge/library/cards/';
export const PRINT_PATH = `${CARDS_PATH}print/`;

// 앱 화면의 영역 이름 그대로(1.1.x 공개본). 앱이 영역 이름을 바꾸면 여기만 고친다.
export const WORLDS = [
  { key: 'korean', name: 'Korean Bridge' },
  { key: 'math', name: 'Math Playground' },
  { key: 'school', name: 'School-life Island' },
  { key: 'explore', name: 'Feelings & Nature' },
] as const;

export const QUICK_ID = 'school_greetings_help';
export const GESTURES: Record<string, string> = {
  '안녕하세요': 'A small bow.',
  '고마워요': 'Take something with both hands.',
  '도와주세요': 'Raise a hand.',
  '잘 모르겠어요': 'Tilt your head.',
  '다시 말해 주세요': 'Cup a hand to your ear.',
};

const all = topicsJson as Topic[];

// 데이터가 바뀌면 조용히 틀린 카드를 찍지 않도록 빌드에서 멈춘다.
if (all.length !== 60) throw new Error(`Expected 60 Bridge topics, got ${all.length}`);
for (const t of all) {
  if (!WORLDS.some((w) => w.key === t.world)) throw new Error(`Unknown world ${t.world} in ${t.id}`);
  if (t.lessons.length !== 5) throw new Error(`${t.id} must have 5 lessons`);
}
const found = all.find((t) => t.id === QUICK_ID);
if (!found) throw new Error(`Missing quick-start topic ${QUICK_ID}`);
for (const l of found.lessons) {
  if (!GESTURES[l.korean]) throw new Error(`Missing gesture for ${l.korean}`);
}
export const quick: Topic = found;

const PRACTICE_LIMIT = 5; // LibrarySessionPlan.practiceLimit
const practiceCount = (pool: string[]) => Math.min(PRACTICE_LIMIT, pool.length);
export function sessionTags(t: Topic): string[] {
  const n = practiceCount(t.practicePoolWithSound);
  // The app's own topic summary (sound on), word for word.
  const tags = [`${t.lessons.length} new items · up to ${n} practice`];
  if (t.practicePoolWithSound.includes('LetterTracePractice')) tags.push('Includes letter tracing');
  // 소리를 끄면 연습 수가 실제로 줄어드는 주제만 표시한다.
  if (practiceCount(t.practicePoolWithoutSound) < n) tags.push('Fewer practice activities with sound off');
  return tags;
}
export const sharedMission = (t: Topic) => {
  const missions = new Set(t.lessons.map((l) => l.mission));
  return missions.size === 1 ? t.lessons[0].mission : null;
};

export const worlds = WORLDS.map((w) => ({ ...w, topics: all.filter((t) => t.world === w.key) }));
/** 목록·인쇄와 같은 순서(영역 순서 → 데이터 순서). 주제별 페이지의 이전·다음도 이 순서를 따른다. */
export const ordered: Topic[] = worlds.flatMap((w) => w.topics);
export const worldName = (key: string) => WORLDS.find((w) => w.key === key)!.name;

// 주소는 하이픈(explore-nature-science), 페이지 안 앵커 id 는 앱 주제 id(explore_nature_science) 그대로.
export const topicSlug = (t: Topic) => t.id.replace(/_/g, '-');
export const topicPath = (t: Topic) => `${CARDS_PATH}${topicSlug(t)}/`;
const slugs = new Set(ordered.map(topicSlug));
if (slugs.size !== ordered.length || slugs.has('print')) throw new Error('Bridge topic card paths must be unique and not "print"');
