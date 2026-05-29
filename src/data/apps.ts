// pifl-labs.com — 앱 마케팅 랜딩 데이터 (SSOT)
// 모든 카피는 실제 출시 앱 기능에 근거. 과장·미구현 기능 언급 금지.
// 스크린샷은 public/assets/apps/{slug}/{lang}/*.webp (언어별 캡션 박힘).
import type { Lang } from '../i18n/ui';

export interface AppShot {
  file: string;   // webp 파일명 (확장자 제외) — {slug}/{lang}/{file}.webp
  label: string;  // 스크린샷 보조 제목
  desc: string;   // 한 줄 설명
}
export interface AppFeature {
  icon: string;   // Font Awesome 클래스
  title: string;
  desc: string;
}
export interface AppContent {
  tagline: string;   // hero 한 줄 카피
  lede: string;      // hero 부연
  metaDesc?: string; // SEO meta description (없으면 lede 자동 축약). 긴 lede 어색한 절단 방지용.
  shotsTitle: string;
  featuresTitle: string;
  ctaTitle: string;
  ctaSub: string;
  shots: AppShot[];
  features: AppFeature[];
}
export interface StoreLinks { ios?: string; android?: string }
export interface AppMeta {
  slug: string;
  name: string;
  status: 'live' | 'soon';
  category: Record<Lang, string>;
  stores: StoreLinks;
  heroShot: string;          // hero 대표 스크린샷 file 명
  content: Record<Lang, AppContent>;
}

// 앱 상태 라벨 (홈 카드 배지용) — 3개 홈 파일이 공유하는 SSOT
export const statusLabels: Record<Lang, { live: string; soon: string }> = {
  ko: { live: '출시됨', soon: '곧 출시' },
  ja: { live: '公開中', soon: '近日' },
  en: { live: 'Live', soon: 'Soon' },
};

// 스토어 배지 라벨 (status·플랫폼별)
export const storeLabels: Record<Lang, { ios: string; android: string; soon: string; onIos: string; onAndroid: string }> = {
  ko: { ios: 'App Store', android: 'Google Play', soon: '곧 출시', onIos: 'App Store에서 받기', onAndroid: 'Google Play에서 받기' },
  ja: { ios: 'App Store', android: 'Google Play', soon: '近日公開', onIos: 'App Storeで入手', onAndroid: 'Google Playで入手' },
  en: { ios: 'App Store', android: 'Google Play', soon: 'Coming soon', onIos: 'Download on the App Store', onAndroid: 'Get it on Google Play' },
};

const focus: AppMeta = {
  slug: 'pipi-focus',
  name: 'PiPi Focus',
  status: 'live',
  category: { ko: '생산성 · 집중', ja: '生産性 · 集中', en: 'Productivity · Focus' },
  stores: {
    ios: 'https://apps.apple.com/app/pipi-focus-pirate-pomodoro/id6762258878',
    android: 'https://play.google.com/store/apps/details?id=com.pifl.pipi.focus',
  },
  heroShot: 'sail',
  content: {
    ko: {
      tagline: '집중은 한 번의 항해다',
      lede: '25분 집중하면 PiPi의 배가 바다를 건넙니다. 세션을 끝낼 때마다 보물이 쌓이고, 선장을 꾸미고, 새로운 섬이 열려요. 포모도로를 대항해로 바꾼 집중 타이머.',
      shotsTitle: '한 번의 세션, 한 번의 항해',
      featuresTitle: '왜 PiPi Focus 인가',
      ctaTitle: '첫 항해를 시작하세요',
      ctaSub: 'iOS · Android에서 무료로.',
      shots: [
        { file: 'sail',        label: '출항하라',          desc: '25분 타이머로 한 번의 항해를 시작합니다.' },
        { file: 'voyage',      label: '집중하는 동안 항해', desc: '타이머가 도는 동안 배가 실제로 바다를 건넙니다.' },
        { file: 'treasure',    label: '끝내면 보물',        desc: '세션을 완주할 때마다 보물을 하나씩 획득.' },
        { file: 'collection',  label: '보물 도감',          desc: '동전·조개·보석·유물을 등급별로 수집합니다.' },
        { file: 'customize',   label: 'PiPi 선장 꾸미기',   desc: '해적 모자·안대·왕관을 항해로 잠금 해제.' },
        { file: 'progress',    label: '항해 기록',          desc: '주간 집중 추이와 섬 탐험으로 진척을 한눈에.' },
      ],
      features: [
        { icon: 'fa-ban',          title: '집중 중 광고 없음', desc: '집중을 깨는 광고는 항해 중 절대 띄우지 않습니다.' },
        { icon: 'fa-wifi',         title: '100% 오프라인',     desc: '계정도 인터넷도 필요 없이, 모든 기록은 기기 안에.' },
        { icon: 'fa-gem',          title: '게임처럼 쌓이는 동기', desc: '보물·섬·업적이 매일의 집중에 보상을 줍니다.' },
        { icon: 'fa-mobile-screen', title: 'iOS · Android',     desc: 'Flutter 단일 코드베이스로 두 스토어 모두 지원.' },
      ],
    },
    ja: {
      tagline: '集中は、一度の航海。',
      lede: '25分集中すると、PiPiの船が海を渡ります。セッションを終えるたびに宝物が貯まり、船長を着せ替え、新しい島が開きます。ポモドーロを大航海に変えた集中タイマー。',
      shotsTitle: '一度のセッション、一度の航海',
      featuresTitle: 'PiPi Focus を選ぶ理由',
      ctaTitle: '最初の航海を始めよう',
      ctaSub: 'iOS · Android で無料。',
      shots: [
        { file: 'sail',        label: '出航せよ',            desc: '25分タイマーで一度の航海を始めます。' },
        { file: 'voyage',      label: '集中する間、航海',     desc: 'タイマーが回る間、船が実際に海を渡ります。' },
        { file: 'treasure',    label: '終えると宝物',         desc: 'セッションを完走するたびに宝物を一つ獲得。' },
        { file: 'collection',  label: '宝物コレクション',     desc: 'コイン・貝殻・宝石・遺物をレア度別に収集。' },
        { file: 'customize',   label: 'PiPi船長を着せ替え',   desc: '海賊帽・眼帯・王冠を航海でアンロック。' },
        { file: 'progress',    label: '航海の記録',           desc: '週間の集中推移と島の探検で進捗をひと目で。' },
      ],
      features: [
        { icon: 'fa-ban',          title: '集中中は広告なし',   desc: '集中を妨げる広告は航海中に一切表示しません。' },
        { icon: 'fa-wifi',         title: '100% オフライン',    desc: 'アカウントもネットも不要、記録はすべて端末内に。' },
        { icon: 'fa-gem',          title: 'ゲームのように続く動機', desc: '宝物・島・実績が毎日の集中にごほうびを。' },
        { icon: 'fa-mobile-screen', title: 'iOS · Android',     desc: 'Flutter単一コードベースで両ストアに対応。' },
      ],
    },
    en: {
      tagline: 'Focus is a single voyage.',
      lede: "Focus for 25 minutes and PiPi's ship crosses the sea. Every session you finish stacks treasure, dresses up the captain, and unlocks a new island. A focus timer that turns the Pomodoro into a grand voyage.",
      metaDesc: 'Turn the Pomodoro into a voyage. Focus 25 minutes, sail the sea, earn treasure and dress up Captain PiPi. Free on iOS & Android, fully offline.',
      shotsTitle: 'One session, one voyage',
      featuresTitle: 'Why PiPi Focus',
      ctaTitle: 'Set sail on your first voyage',
      ctaSub: 'Free on iOS & Android.',
      shots: [
        { file: 'sail',        label: 'Set sail',              desc: 'Start a voyage with a single 25-minute timer.' },
        { file: 'voyage',      label: 'Sail while you focus',  desc: 'Your ship actually crosses the sea as the timer runs.' },
        { file: 'treasure',    label: 'Finish, earn treasure', desc: 'Earn a piece of treasure every session you complete.' },
        { file: 'collection',  label: 'Treasure collection',   desc: 'Collect coins, shells, gems and artifacts by rarity.' },
        { file: 'customize',   label: 'Dress up Captain PiPi', desc: 'Unlock pirate hats, eye patches and crowns by voyaging.' },
        { file: 'progress',    label: 'Voyage log',            desc: 'See weekly focus trends and island exploration at a glance.' },
      ],
      features: [
        { icon: 'fa-ban',          title: 'No ads while focusing', desc: 'We never interrupt a voyage with a focus-breaking ad.' },
        { icon: 'fa-wifi',         title: '100% offline',          desc: 'No account, no internet — every record stays on device.' },
        { icon: 'fa-gem',          title: 'Motivation that builds', desc: 'Treasure, islands and achievements reward daily focus.' },
        { icon: 'fa-mobile-screen', title: 'iOS & Android',         desc: 'One Flutter codebase, shipped to both stores.' },
      ],
    },
  },
};

const words: AppMeta = {
  slug: 'pipi-words',
  name: 'PiPi Words',
  status: 'soon',
  category: { ko: '교육 · 어휘', ja: '教育 · 語彙', en: 'Education · Vocabulary' },
  stores: {},
  heroShot: 'home',
  content: {
    ko: {
      tagline: '바다를 건너, 말을 잇다',
      lede: 'JLPT N5~N1과 TOPIK 1~6급 어휘를 시험 출제 유형 그대로. SM-2 간격 반복으로 외운 단어는 오래 남고, 인터넷 없이 어디서나. 한국인은 일본어를, 일본인은 한국어를 — 한 앱에서.',
      shotsTitle: '항해하듯 쌓이는 어휘 학습',
      featuresTitle: '왜 PiPi Words 인가',
      ctaTitle: '곧 항해를 시작합니다',
      ctaSub: 'App Store · Google Play 출시 준비 중.',
      shots: [
        { file: 'home',         label: '오늘의 학습 한눈에', desc: '오늘 외울 단어와 연속 학습일을 홈에서 바로.' },
        { file: 'study',        label: '레벨별 덱 선택',     desc: 'JLPT·TOPIK 레벨을 골라 단어 항해를 시작.' },
        { file: 'flashcard',    label: '카드로 가볍게',       desc: '최빈출 표시와 발음 듣기가 있는 플래시카드.' },
        { file: 'voyage',       label: '항해 지도로 진도',    desc: '레벨은 섬으로, 진도는 항로로 한눈에.' },
        { file: 'achievements', label: '업적으로 쌓이는 습관', desc: '연속 학습일과 업적이 매일의 학습을 보상.' },
      ],
      features: [
        { icon: 'fa-bullseye',  title: '시험 출제 유형 맞춤', desc: '단순 단어장이 아닌 JLPT·TOPIK 출제 유형 학습.' },
        { icon: 'fa-rotate',    title: 'SM-2 간격 반복',     desc: '잊을 때쯤 다시 꺼내 학습 시간을 아낍니다.' },
        { icon: 'fa-language',  title: '한일 양방향',        desc: '한국인은 일본어, 일본인은 한국어 — 한 앱에서.' },
        { icon: 'fa-wifi',      title: '100% 오프라인',      desc: '계정 없이, 비행기 안에서도 학습할 수 있습니다.' },
      ],
    },
    ja: {
      tagline: '海を越えて、言葉をつなぐ',
      lede: 'TOPIK 1~6級とJLPT N5~N1の語彙を、出題形式そのままで。SM-2間隔反復で覚えた単語は長く記憶に残り、ネットなしでどこでも。日本人は韓国語を、韓国人は日本語を — 一つのアプリで。',
      shotsTitle: '航海のように積み上がる語彙学習',
      featuresTitle: 'PiPi Words を選ぶ理由',
      ctaTitle: 'まもなく航海へ',
      ctaSub: 'App Store · Google Play で公開準備中。',
      shots: [
        { file: 'home',         label: '今日の学習をひと目で', desc: '今日覚える単語と連続学習日をホームですぐに。' },
        { file: 'study',        label: 'レベル別デッキ選択',   desc: 'JLPT·TOPIKのレベルを選んで単語の航海へ。' },
        { file: 'flashcard',    label: 'カードで気軽に',       desc: '頻出表示と発音再生つきのフラッシュカード。' },
        { file: 'voyage',       label: '航海マップで進捗',     desc: 'レベルは島、進捗は航路でひと目で。' },
        { file: 'achievements', label: '実績で続く習慣',       desc: '連続学習日と実績が毎日の学習にごほうびを。' },
      ],
      features: [
        { icon: 'fa-bullseye',  title: '出題形式に最適化',   desc: '単なる単語帳ではなくJLPT·TOPIK出題形式で学習。' },
        { icon: 'fa-rotate',    title: 'SM-2 間隔反復',      desc: '忘れる頃に復習して学習時間を節約します。' },
        { icon: 'fa-language',  title: '韓日双方向',         desc: '日本人は韓国語、韓国人は日本語 — 一つのアプリで。' },
        { icon: 'fa-wifi',      title: '100% オフライン',    desc: 'アカウントなし、飛行機の中でも学習できます。' },
      ],
    },
    en: {
      tagline: 'Cross the sea, connect words.',
      lede: 'Learn JLPT N5–N1 and TOPIK level 1–6 vocabulary the way exams actually test it. SM-2 spaced repetition keeps words in memory, fully offline, anywhere. Korean speakers learn Japanese, Japanese speakers learn Korean — in one app.',
      metaDesc: 'Learn JLPT N5–N1 and TOPIK 1–6 vocabulary the way exams test it. SM-2 spaced repetition, two-way Korean–Japanese, works fully offline.',
      shotsTitle: 'Vocabulary that builds like a voyage',
      featuresTitle: 'Why PiPi Words',
      ctaTitle: 'A voyage is setting out soon',
      ctaSub: 'Coming to the App Store & Google Play.',
      shots: [
        { file: 'home',         label: "Today's study at a glance", desc: "See today's words and your streak right on the home." },
        { file: 'study',        label: 'Pick a level deck',         desc: 'Choose a JLPT or TOPIK level and start the voyage.' },
        { file: 'flashcard',    label: 'Light, card by card',       desc: 'Flashcards with high-frequency tags and audio playback.' },
        { file: 'voyage',       label: 'Progress on the map',       desc: 'Levels as islands, progress as a sailing route.' },
        { file: 'achievements', label: 'A habit that adds up',      desc: 'Streaks and achievements reward your daily study.' },
      ],
      features: [
        { icon: 'fa-bullseye',  title: 'Built around exams', desc: 'Not a plain word list — tuned to JLPT & TOPIK question types.' },
        { icon: 'fa-rotate',    title: 'SM-2 spaced repetition', desc: 'Resurfaces each word right before you forget it.' },
        { icon: 'fa-language',  title: 'Two-way Korean–Japanese', desc: 'Learn Japanese or Korean — both directions, one app.' },
        { icon: 'fa-wifi',      title: '100% offline',       desc: 'No account required — study even on a plane.' },
      ],
    },
  },
};

export const apps: Record<string, AppMeta> = { 'pipi-focus': focus, 'pipi-words': words };
export const appList: AppMeta[] = [focus, words];
