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
  /** 스토어 등재명이 언어별로 다른 앱만 지정 (미지정 언어는 name 사용) */
  nameByLang?: Partial<Record<Lang, string>>;
  status: 'live' | 'soon';
  category: Record<Lang, string>;
  stores: StoreLinks;
  /** schema.org applicationCategory (미지정 시 MobileApplication). 게임은 GameApplication. */
  schemaCategory?: string;
  heroShot: string;          // hero 대표 스크린샷 file 명
  content: Record<Lang, AppContent>;
}

/** 언어별 표시명 — 스토어 등재명과 일치시킨다 (예: ko '피피 낱말항해'). */
export const appName = (app: AppMeta, lang: Lang): string => app.nameByLang?.[lang] ?? app.name;

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

const hello: AppMeta = {
  slug: 'pipi-hello',
  name: 'PiPi Hello',
  status: 'live',
  category: { ko: '교육 · 어린이 일본어', ja: '教育 · こども韓国語', en: 'Education · Kids Japanese' },
  stores: {
    ios: 'https://apps.apple.com/app/id6777299814',
    android: 'https://play.google.com/store/apps/details?id=com.pifl.pipi.hello',
  },
  heroShot: 'home',
  content: {
    ko: {
      tagline: '첫 일본어 한마디를,\n놀이처럼',
      lede: '6~8세 우리 아이의 첫 일본어. 히라가나·가타카나부터 기초 단어·인사까지, 글자카드와 듣기 놀이로 하나씩 인출하며 익혀요. 광고 없이, 계정 없이, 100% 기기 안에서.',
      metaDesc: '6~8세 어린이의 첫 일본어. 히라가나·가타카나·기초 단어·인사를 놀이처럼. 광고 0, 데이터 수집 0, 부모게이트로 안전하게.',
      shotsTitle: '글자에서 첫 한마디까지',
      featuresTitle: '부모가 안심하는 이유',
      ctaTitle: '첫 일본어, 오늘 시작해요',
      ctaSub: 'iOS · Android에서. 광고 없이, 무료체험으로.',
      shots: [
        { file: 'home',  label: '오늘의 학습',      desc: '지도를 따라 글자와 단어를 차례로 만나요.' },
        { file: 'cards', label: '글자카드',         desc: '히라가나·가타카나를 그림·소리와 함께.' },
        { file: 'words', label: '기초 단어',        desc: '동물·숫자·색깔 같은 첫 단어 100개.' },
        { file: 'learn', label: '소리로 익히는 드릴', desc: '듣고 고르며 글자를 인출해요.' },
        { file: 'write', label: '획순 따라 쓰기',    desc: '손가락으로 획순을 따라 그으며 익혀요.' },
      ],
      features: [
        { icon: 'fa-ban',           title: '광고 0',         desc: '아이가 보는 화면에 광고 surface가 하나도 없습니다.' },
        { icon: 'fa-shield-halved', title: '데이터 수집 0',  desc: '계정도 서버도 없이, 학습 기록은 100% 기기 안에만.' },
        { icon: 'fa-user-shield',   title: '부모게이트',     desc: '결제·설정은 어른용 곱셈 문제를 통과해야 열려요.' },
        { icon: 'fa-volume-high',   title: '듣고 익히는 발음', desc: '기기 TTS로 글자·단어 소리를 바로 들려줘요(녹음 없음).' },
      ],
    },
    ja: {
      tagline: 'はじめての韓国語を、\nあそぶように。',
      lede: '6〜8歳のはじめての韓国語。ハングルの反切表から基礎単語・あいさつまで、文字カードと聞き取り遊びでひとつずつ覚えます。広告なし、アカウントなし、100%端末の中で。',
      metaDesc: '6〜8歳のはじめての韓国語。ハングル・基礎単語・あいさつをあそぶように。広告ゼロ、データ収集ゼロ、保護者ゲートで安心。',
      shotsTitle: '文字から最初のひとことまで',
      featuresTitle: '保護者が安心できる理由',
      ctaTitle: 'はじめての韓国語を、今日から。',
      ctaSub: 'iOS · Android で。広告なし、無料体験から。',
      shots: [
        { file: 'home',  label: '今日の学習',        desc: 'マップに沿って文字や単語を順番に。' },
        { file: 'cards', label: '文字カード',        desc: 'ハングルを絵と音といっしょに。' },
        { file: 'words', label: '基礎単語',          desc: '動物・数・色などはじめての単語100。' },
        { file: 'learn', label: '音で覚えるドリル',   desc: '聞いて選んで文字を思い出す。' },
        { file: 'match', label: '音と文字のマッチング', desc: '音を聞いて正しい文字を合わせる遊び。' },
      ],
      features: [
        { icon: 'fa-ban',           title: '広告ゼロ',       desc: '子どもの画面に広告は一切表示されません。' },
        { icon: 'fa-shield-halved', title: 'データ収集ゼロ', desc: 'アカウントもサーバーもなく、記録は100%端末内だけ。' },
        { icon: 'fa-user-shield',   title: '保護者ゲート',   desc: '課金や設定は大人向けの計算問題を解いてから。' },
        { icon: 'fa-volume-high',   title: '聞いて覚える発音', desc: '端末のTTSで文字や単語の音をすぐに再生(録音なし)。' },
      ],
    },
    en: {
      tagline: "A child's first Japanese,\nlearned through play.",
      lede: 'A first Japanese for kids aged 6–8. From hiragana and katakana to basic words and greetings, learned by recall with letter cards and listening games. No ads, no account, fully on device.',
      metaDesc: 'A first Japanese for kids 6–8. Hiragana, katakana, first words and greetings through play. No ads, no data collected, 100% on-device with a parental gate.',
      shotsTitle: 'From letters to a first hello',
      featuresTitle: 'Why PiPi Hello',
      ctaTitle: 'Start their first Japanese today',
      ctaSub: 'On iOS & Android. No ads, free trial.',
      shots: [
        { file: 'home',  label: "Today's lesson",  desc: 'Follow the map through letters and words, one at a time.' },
        { file: 'cards', label: 'Letter cards',    desc: 'Hiragana and katakana paired with picture and sound.' },
        { file: 'words', label: 'First words',     desc: '100 first words — animals, numbers, colors.' },
        { file: 'learn', label: 'Learn by listening', desc: 'Listen and choose to recall each letter.' },
        { file: 'write', label: 'Trace the strokes',  desc: 'Follow the stroke order with a fingertip.' },
      ],
      features: [
        { icon: 'fa-ban',           title: 'Zero ads',          desc: 'No ads anywhere — not a single ad surface a child can see.' },
        { icon: 'fa-shield-halved', title: 'Zero data collected', desc: 'No account, no server — every record stays on the device.' },
        { icon: 'fa-user-shield',   title: 'Parental gate',     desc: 'Payments and settings open only after an adult math problem.' },
        { icon: 'fa-volume-high',   title: 'Hear every sound',  desc: 'On-device TTS plays each letter and word aloud (no recording).' },
      ],
    },
  },
};

const words: AppMeta = {
  slug: 'pipi-words',
  name: 'PiPi Words',
  status: 'live',
  category: { ko: '교육 · 어휘', ja: '教育 · 語彙', en: 'Education · Vocabulary' },
  stores: {
    ios: 'https://apps.apple.com/app/pipi-words-jlpt-topik-vocab/id6770267735',
    android: 'https://play.google.com/store/apps/details?id=com.pifl.pipi.words',
  },
  heroShot: 'home',
  content: {
    ko: {
      tagline: '바다를 건너, 말을 잇다',
      lede: 'JLPT N5~N1과 TOPIK 1~6급 어휘를 시험 출제 유형 그대로. SM-2 간격 반복으로 외운 단어는 오래 남고, 인터넷 없이 어디서나. 한국인은 일본어를, 일본인은 한국어를 — 한 앱에서.',
      shotsTitle: '항해하듯 쌓이는 어휘 학습',
      featuresTitle: '왜 PiPi Words 인가',
      ctaTitle: '오늘 단어 학습을 시작하세요',
      ctaSub: 'iOS · Android에서 무료로 시작.',
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
      ctaTitle: '今日から単語学習を始めよう',
      ctaSub: 'iOS · Android で無料ではじめる。',
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
      ctaTitle: 'Start studying today',
      ctaSub: 'Free to start on iOS & Android.',
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

const dday: AppMeta = {
  slug: 'pipi-dday',
  name: 'PiPi D-Day',
  status: 'live',
  category: { ko: '생산성 · 디데이', ja: '生産性 · カウントダウン', en: 'Productivity · Countdown' },
  stores: {
    ios: 'https://apps.apple.com/app/pipi-d-day/id6770268950',
    android: 'https://play.google.com/store/apps/details?id=com.pifl.pipi.dday',
  },
  heroShot: 'home',
  content: {
    ko: {
      tagline: '모든 순간이\n목적지로 향하는 항해',
      lede: '수능·결혼기념일·전역·생일까지, 소중한 날을 해적 항해처럼 카운트다운. D-100부터 D-Day까지 PiPi의 표정이 6단계로 바뀌고, 홈 화면 위젯으로 매일 확인합니다.',
      shotsTitle: '남은 날이 항해가 되는 순간',
      featuresTitle: '왜 PiPi D-Day 인가',
      ctaTitle: '지금 항해를 시작하세요',
      ctaSub: 'iOS · Android에서 무료로 시작.',
      shots: [
        { file: 'home',        label: '모든 D-Day를 한눈에',  desc: '수능·기념일·전역까지, 소중한 날을 홈에서 바로 확인.' },
        { file: 'detail',      label: 'PiPi가 6단계로 반응',   desc: '남은 날에 따라 표정이 바뀌는 항해형 카운트다운 상세.' },
        { file: 'widget_skin', label: '홈 화면 위젯 스킨 6종', desc: '기본 항해부터 보물섬·폭풍우까지 위젯을 골라요.' },
        { file: 'form',        label: '어떤 날이든 등록',      desc: '카테고리 8종·색상 8가지, 카운트다운·업 모두 지원.' },
        { file: 'onboarding',  label: 'PiPi와 함께 출항',      desc: 'PiPi가 당신의 모든 항해를 함께 카운트다운합니다.' },
      ],
      features: [
        { icon: 'fa-face-smile',       title: 'PiPi의 6단계 리액션', desc: 'D-100부터 D-Day까지 PiPi의 표정이 6단계로 바뀝니다.' },
        { icon: 'fa-table-cells-large', title: '홈 화면 위젯',        desc: 'iOS·Android 위젯과 스킨 6종으로 남은 날을 항상 곁에.' },
        { icon: 'fa-bell',             title: '마일스톤 알림',       desc: 'D-100·30·7·1·D-Day마다 PiPi의 해적 메시지로 알립니다.' },
        { icon: 'fa-wifi',             title: '100% 오프라인',       desc: '서버도 계정도 없이, 모든 기록은 기기 안에.' },
      ],
    },
    ja: {
      tagline: 'すべての瞬間は、\n目的地へ向かう航海',
      lede: '受験・結婚記念日・誕生日まで、大切な日を海賊の航海としてカウントダウン。D-100からD-DayまでPiPiの表情が6段階で変化し、ホーム画面ウィジェットで毎日確認できます。',
      shotsTitle: '残り日数が航海になる瞬間',
      featuresTitle: 'PiPi D-Day を選ぶ理由',
      ctaTitle: '今すぐ航海を始めよう',
      ctaSub: 'iOS · Android で無料ではじめる。',
      shots: [
        { file: 'home',        label: 'すべてのDデイをひと目で', desc: '受験・記念日・誕生日まで、大切な日をホームですぐ。' },
        { file: 'detail',      label: 'PiPiが6段階でリアクション', desc: '残り日数で表情が変わる、航海型カウントダウンの詳細。' },
        { file: 'widget_skin', label: 'ホーム画面ウィジェット6種', desc: 'スタンダード航海から宝の島・嵐の海まで選べる。' },
        { file: 'form',        label: 'どんな日も登録',          desc: 'カテゴリー8種・色8色、カウントダウンもアップも。' },
        { file: 'onboarding',  label: 'PiPiと一緒に出航',        desc: 'PiPiがあなたのすべての航海を一緒にカウントダウン。' },
      ],
      features: [
        { icon: 'fa-face-smile',       title: 'PiPiの6段階リアクション', desc: 'D-100からD-DayまでPiPiの表情が6段階で変化します。' },
        { icon: 'fa-table-cells-large', title: 'ホーム画面ウィジェット',  desc: 'iOS·Androidウィジェットとスキン6種で残り日数をいつも。' },
        { icon: 'fa-bell',             title: 'マイルストーン通知',     desc: 'D-100·30·7·1·D-Dayごとに PiPiの海賊メッセージでお知らせ。' },
        { icon: 'fa-wifi',             title: '100% オフライン',       desc: 'サーバーもアカウントも不要、記録はすべて端末内に。' },
      ],
    },
    en: {
      tagline: 'Every moment is a voyage toward your destination.',
      lede: "Count down to weddings, exams, birthdays and more as a pirate voyage. PiPi's expression shifts through 6 stages from D-100 to D-Day, right on your home screen widget.",
      metaDesc: 'A countdown widget where parrot PiPi reacts in 6 stages from D-100 to D-Day. Weddings, exams, birthdays — fully offline, no account. Free on iOS & Android.',
      shotsTitle: 'The moment days become a voyage',
      featuresTitle: 'Why PiPi D-Day',
      ctaTitle: 'Start your voyage now',
      ctaSub: 'Free to start on iOS & Android.',
      shots: [
        { file: 'home',        label: 'Every D-Day at a glance',  desc: 'Exams, anniversaries, birthdays — see your big days on the home.' },
        { file: 'detail',      label: 'PiPi reacts in 6 stages',  desc: 'A voyage-style countdown that changes as your day nears.' },
        { file: 'widget_skin', label: '6 home screen widget skins', desc: 'From Classic Voyage to Treasure Island and Stormy Seas.' },
        { file: 'form',        label: 'Add any milestone',        desc: '8 categories, 8 colors, both countdown and count-up.' },
        { file: 'onboarding',  label: 'Set sail with PiPi',       desc: 'PiPi counts down every one of your voyages with you.' },
      ],
      features: [
        { icon: 'fa-face-smile',       title: "PiPi's 6 reactions",  desc: "PiPi's expression shifts through 6 stages from D-100 to D-Day." },
        { icon: 'fa-table-cells-large', title: 'Home screen widget', desc: 'iOS & Android widgets with 6 skins keep the count always near.' },
        { icon: 'fa-bell',             title: 'Milestone alerts',    desc: 'Pirate messages from PiPi at D-100, 30, 7, 1 and D-Day.' },
        { icon: 'fa-wifi',             title: '100% offline',        desc: 'No server, no account — every record stays on device.' },
      ],
    },
  },
};

const log: AppMeta = {
  slug: 'pipi-log',
  name: 'PiPi Log',
  status: 'live',
  category: { ko: '라이프스타일 · 감정 일기', ja: 'ライフスタイル · 気分日記', en: 'Lifestyle · Mood journal' },
  stores: {
    ios: 'https://apps.apple.com/app/pipi-log/id6770272665',
    android: 'https://play.google.com/store/apps/details?id=com.pifl.pipi.log',
  },
  heroShot: 'home',
  content: {
    ko: {
      tagline: '하루의 마음을\n바다 날씨로 남기다',
      lede: '매일의 기분을 9단계 바다 날씨로 기록하면 PiPi가 그 마음에 반응합니다. 선장의 질문으로 하루를 돌아보고, 한 달의 항해를 지도 한 장으로. 계정도 서버도 없이, 모든 기록은 기기 안에.',
      shotsTitle: '마음을 적는 항해일지',
      featuresTitle: '왜 PiPi Log 인가',
      ctaTitle: '지금 항해를 시작하세요',
      ctaSub: 'iOS · Android에서 무료로 시작.',
      shots: [
        { file: 'home',        label: '오늘의 바다 날씨로 기록',  desc: '기분을 9단계 바다 날씨로 고르고 PiPi와 하루를 적어요.' },
        { file: 'calendar',    label: '한 달을 바다 날씨 달력으로', desc: '날짜마다 그날의 날씨가 찍혀 한 달이 한눈에.' },
        { file: 'analytics',   label: '마음의 흐름을 한눈에',     desc: '주간 무드 변화와 감정 분포를 차트로 돌아봐요.' },
        { file: 'monthly-map', label: '한 달의 항해를 한 장으로', desc: '이 달의 바다 날씨 지도를 이미지로 공유합니다.' },
        { file: 'collection',  label: '지난 일지 다시 꺼내 보기', desc: '날짜·즐겨찾기로 지난 항해 기록을 다시 읽어요.' },
      ],
      features: [
        { icon: 'fa-cloud-sun', title: '9단계 바다 날씨',   desc: '무지개 바다부터 태풍까지, 기분을 날씨로 기록.' },
        { icon: 'fa-feather',   title: 'PiPi가 마음에 반응', desc: '기록한 기분에 PiPi가 항해 메시지로 답합니다.' },
        { icon: 'fa-pen-nib',   title: '선장의 질문',       desc: '매일 다른 질문으로 하루를 가볍게 돌아봐요.' },
        { icon: 'fa-lock',      title: '잠금 + 100% 오프라인', desc: '생체인증 잠금, 계정·서버 없이 기기에만 저장.' },
      ],
    },
    ja: {
      tagline: '今日の心を、\n海の天気で残す',
      lede: '毎日の気分を9段階の海の天気で記録すると、PiPiがその心に反応します。船長の質問で一日を振り返り、ひと月の航海を一枚の地図に。アカウントもサーバーもなく、すべて端末の中に。',
      shotsTitle: '心を綴る航海日誌',
      featuresTitle: 'PiPi Log を選ぶ理由',
      ctaTitle: '今すぐ航海を始めよう',
      ctaSub: 'iOS · Android で無料ではじめる。',
      shots: [
        { file: 'home',        label: '今日の海の天気で記録',     desc: '気分を9段階の海の天気で選び、PiPiと一日を綴る。' },
        { file: 'calendar',    label: 'ひと月を海の天気カレンダーで', desc: '日ごとの天気が並び、ひと月がひと目で。' },
        { file: 'analytics',   label: '心の流れをひと目で',       desc: '週間の気分変化と感情分布をチャートで振り返る。' },
        { file: 'monthly-map', label: 'ひと月の航海を一枚に',     desc: '今月の海の天気マップを画像で共有。' },
        { file: 'collection',  label: '過去の日誌をもう一度',     desc: '日付やお気に入りで過去の記録を読み返す。' },
      ],
      features: [
        { icon: 'fa-cloud-sun', title: '9段階の海の天気',   desc: '虹の海から台風まで、気分を天気で記録。' },
        { icon: 'fa-feather',   title: 'PiPiが心に反応',    desc: '記録した気分にPiPiが航海メッセージで応える。' },
        { icon: 'fa-pen-nib',   title: '船長の質問',        desc: '毎日違う質問で一日を軽く振り返る。' },
        { icon: 'fa-lock',      title: 'ロック + 100%オフライン', desc: '生体認証ロック、アカウント・サーバーなしで端末内に保存。' },
      ],
    },
    en: {
      tagline: 'Log your heart\nas sea weather.',
      lede: "Record each day's mood as one of 9 sea-weathers and PiPi reacts to how you feel. Reflect with the captain's prompt, then turn a month's voyage into a single map. No account, no server — everything stays on your device.",
      metaDesc: "A voyage-log mood journal: record each day's mood as one of 9 sea-weathers and PiPi reacts. Charts, a shareable monthly map, biometric lock — fully offline. Free on iOS & Android.",
      shotsTitle: 'A logbook for your heart',
      featuresTitle: 'Why PiPi Log',
      ctaTitle: 'Start your voyage now',
      ctaSub: 'Free to start on iOS & Android.',
      shots: [
        { file: 'home',        label: "Log today's sea weather",   desc: 'Pick your mood from 9 sea-weathers and write the day with PiPi.' },
        { file: 'calendar',    label: 'A month as a weather calendar', desc: "Each day's weather lands on the calendar at a glance." },
        { file: 'analytics',   label: 'Your mood trend at a glance', desc: 'Review weekly mood shifts and emotion distribution in charts.' },
        { file: 'monthly-map', label: 'A month in one shareable map', desc: "Share this month's sea-weather map as an image." },
        { file: 'collection',  label: 'Revisit past entries',      desc: 'Reopen past logs by date or favorites.' },
      ],
      features: [
        { icon: 'fa-cloud-sun', title: '9 sea-weathers',    desc: 'From rainbow seas to typhoons — log your mood as weather.' },
        { icon: 'fa-feather',   title: 'PiPi reacts',        desc: 'PiPi answers your logged mood with a pirate message.' },
        { icon: 'fa-pen-nib',   title: "The captain's prompt", desc: 'A fresh question each day to reflect, lightly.' },
        { icon: 'fa-lock',      title: 'Locked & 100% offline', desc: 'Biometric lock, no account or server — stored on device.' },
      ],
    },
  },
};

// Dialogos — 스토아 철학 대화 앱 (PiPi 라인과 별개 브랜드). 콘텐츠 SSOT = pipi_thus/docs/{SPEC,release/STORE-METADATA,legal/*}.
// 미출시 → status 'soon'. 출시 시 status 'live' + stores URL 추가.
const dialogos: AppMeta = {
  slug: 'dialogos',
  name: 'Dialogos',
  status: 'soon',
  category: { ko: '라이프스타일 · 철학', ja: 'ライフスタイル · 哲学', en: 'Lifestyle · Philosophy' },
  stores: {},
  heroShot: 'home',
  content: {
    ko: {
      tagline: '고대의 현자와\n마주 앉다',
      lede: '마르쿠스 아우렐리우스·세네카·에픽테토스·소크라테스와 1:1로 대화하세요. 일의 불안, 관계의 고민, 선택의 망설임 — 당신의 물음에 네 현자가 각자의 목소리로, 퍼블릭 도메인 원전에 근거해 답합니다. 광고도 계정도 없이.',
      metaDesc: '스토아 철학자와 1:1로 대화하는 앱. 마르쿠스·세네카·에픽테토스·소크라테스가 원전에 근거해 답하고 출처를 함께 보여줍니다. 광고·계정 없음.',
      shotsTitle: '현자와 마주 앉는 순간',
      featuresTitle: '왜 Dialogos 인가',
      ctaTitle: '곧 대화를 시작합니다',
      ctaSub: 'App Store · Google Play 출시 준비 중.',
      shots: [
        { file: 'home',          label: '고대의 현자와 마주 앉다', desc: '마르쿠스·세네카·에픽테토스·소크라테스 중 오늘의 상대를 고릅니다.' },
        { file: 'chat_marcus',   label: '원전에 근거한 답, 출처까지', desc: '모든 답변에 퍼블릭 도메인 원전 출처가 함께 붙습니다.' },
        { file: 'chat_socrates', label: '답을 주지 않고 되묻는다',   desc: '소크라테스는 결론 대신 당신을 다시 생각하게 합니다.' },
        { file: 'onboarding',    label: '매일 무료로, 광고 없이',     desc: '계정 가입 없이 매일 무료로 대화를 시작합니다.' },
      ],
      features: [
        { icon: 'fa-feather',     title: '네 명의 현자',     desc: '명상록·편지·엥케이리디온·대화편 — 각자의 목소리로 답합니다.' },
        { icon: 'fa-quote-right', title: '원전 근거 인용',   desc: '명언 붙여넣기가 아니라, 답변마다 퍼블릭 도메인 출처를 표기.' },
        { icon: 'fa-ban',         title: '광고·추적 없음',   desc: '광고도 계정도 없고, 대화 내용은 서버에 저장하지 않습니다.' },
        { icon: 'fa-language',    title: 'ja · ko · en 네이티브', desc: '번역이 아닌 시장별 네이티브 톤으로 대화합니다.' },
      ],
    },
    ja: {
      tagline: '古代の賢者と\n向き合う',
      lede: 'マルクス・アウレリウス、セネカ、エピクテトス、ソクラテスと一対一で対話。仕事の不安、人間関係、選択の迷い——あなたの問いに、四人の賢者がそれぞれの声で、パブリックドメインの原典に基づいて答えます。広告もアカウントもなし。',
      metaDesc: 'ストア派の賢者と一対一で対話するアプリ。マルクス・セネカ・エピクテトス・ソクラテスが原典に基づいて答え、出典を添えて示します。広告・アカウントなし。',
      shotsTitle: '賢者と向き合う瞬間',
      featuresTitle: 'Dialogos を選ぶ理由',
      ctaTitle: 'まもなく対話を始めます',
      ctaSub: 'App Store · Google Play で公開準備中。',
      shots: [
        { file: 'home',          label: '古代の賢者と向き合う', desc: 'マルクス・セネカ・エピクテトス・ソクラテスから今日の相手を選ぶ。' },
        { file: 'chat_marcus',   label: '原典に基づく答え、出典つき', desc: 'すべての返答にパブリックドメイン原典の出典が添えられます。' },
        { file: 'chat_socrates', label: '答えを与えず、問い返す',   desc: 'ソクラテスは結論ではなく、あなたに問い返します。' },
        { file: 'onboarding',    label: '毎日無料、広告なし',       desc: 'アカウント登録なしで毎日無料で対話を始めます。' },
      ],
      features: [
        { icon: 'fa-feather',     title: '四人の賢者',       desc: '自省録・手紙・提要・対話篇——それぞれの声で答えます。' },
        { icon: 'fa-quote-right', title: '原典に基づく出典', desc: '名言の貼り付けではなく、返答ごとにパブリックドメインの出典を表示。' },
        { icon: 'fa-ban',         title: '広告・トラッキングなし', desc: '広告もアカウントもなく、対話内容はサーバーに保存しません。' },
        { icon: 'fa-language',    title: 'ja · ko · en ネイティブ', desc: '翻訳ではなく市場ごとのネイティブなトーンで対話します。' },
      ],
    },
    en: {
      tagline: 'Sit with the\nancient sages',
      lede: "Talk one-on-one with Marcus Aurelius, Seneca, Epictetus, and Socrates. Anxiety about work, a difficult relationship, a hard decision — bring your question, and four sages answer in their own voice, grounded in public-domain sources. No ads, no account.",
      metaDesc: 'Talk one-on-one with Marcus Aurelius, Seneca, Epictetus and Socrates. Every reply is grounded in public-domain sources, with citations. No ads, no account.',
      shotsTitle: 'The moment you sit with a sage',
      featuresTitle: 'Why Dialogos',
      ctaTitle: 'Conversations begin soon',
      ctaSub: 'Coming to the App Store & Google Play.',
      shots: [
        { file: 'home',          label: 'Sit with the ancient sages',  desc: "Choose today's mentor from Marcus, Seneca, Epictetus and Socrates." },
        { file: 'chat_marcus',   label: 'Grounded in sources, cited',   desc: 'Every reply carries a public-domain source citation.' },
        { file: 'chat_socrates', label: "He doesn't answer — he asks",  desc: 'Socrates makes you think again instead of handing you a conclusion.' },
        { file: 'onboarding',    label: 'Free every day, no ads',       desc: 'Start talking for free every day, with no account.' },
      ],
      features: [
        { icon: 'fa-feather',     title: 'Four sages',         desc: 'Meditations, Letters, Enchiridion, Dialogues — each in their own voice.' },
        { icon: 'fa-quote-right', title: 'Grounded in sources', desc: 'Not quote-wallpaper — every reply shows its public-domain source.' },
        { icon: 'fa-ban',         title: 'No ads, no tracking', desc: 'No ads, no account, and we never store your conversations on our servers.' },
        { icon: 'fa-language',    title: 'Native in ja · ko · en', desc: 'Not translated — a native tone written for each market.' },
      ],
    },
  },
};

// PiPi Draw — 사진을 AI 라인아트로 바꿔 색칠하는 드로잉 앱.
// 콘텐츠 SSOT = pipi_draw/ios/fastlane/metadata + .arb. 2026-07-22 양 스토어 출시.
const draw: AppMeta = {
  slug: 'pipi-draw',
  name: 'PiPi Draw',
  status: 'live',
  category: { ko: '크리에이티브 · 색칠', ja: 'クリエイティブ · ぬりえ', en: 'Creative · Coloring' },
  stores: {
    ios: 'https://apps.apple.com/app/id6779071131',
    android: 'https://play.google.com/store/apps/details?id=com.pifl.pipi.draw',
  },
  heroShot: 'ai_result',
  content: {
    ko: {
      tagline: '내 사진이\n색칠 도안이 된다',
      lede: '찍은 사진 한 장을 AI가 깔끔한 라인아트로 바꿔 줍니다. 변환된 스케치를 내 손으로 색칠해 나만의 작품으로 완성하세요. 그림 실력은 필요 없어요 — 색칠의 즐거움만 있으면 됩니다.',
      metaDesc: '사진을 AI가 색칠하기 좋은 라인아트로 변환해 주는 드로잉 앱. 10종 프로 브러시로 색칠하고, 드로잉 중 광고 없이 집중. iOS · Android.',
      shotsTitle: '사진 한 장에서 작품까지',
      featuresTitle: '왜 PiPi Draw 인가',
      ctaTitle: '지금 색칠을 시작하세요',
      ctaSub: 'iOS · Android에서 무료로 시작.',
      shots: [
        { file: 'ai_result', label: '사진이 스케치가 된다',  desc: 'AI가 사진을 색칠하기 좋은 라인아트로 변환합니다.' },
        { file: 'ai_styles', label: '원하는 스타일로',       desc: '기본 · 잉크 · 카툰 · 사실적 + 라인 두께·디테일·대비 조절.' },
        { file: 'coloring',  label: '내 손으로 색칠',        desc: '변환된 스케치를 캔버스로 가져와 색을 채웁니다.' },
        { file: 'brushes',   label: '10종 프로 브러시',      desc: '연필·마커·크레용·붓·수채화·형광펜까지 골라 그려요.' },
        { file: 'home',      label: '작품 보관함',           desc: '그린 작품이 홈에 차곡차곡 — 이어 그리기도 한 번에.' },
      ],
      features: [
        { icon: 'fa-wand-magic-sparkles', title: 'AI 스케치 변환', desc: '카메라·앨범 사진을 색칠하기 좋은 라인아트로 바꿔 줍니다.' },
        { icon: 'fa-paintbrush',          title: '10종 프로 브러시', desc: '연필·마커·크레용·붓·수채화 등 iPad급 브러시로 색칠.' },
        { icon: 'fa-ban',                 title: '드로잉 중 광고 없음', desc: '색칠에 빠져 있는 동안에는 광고를 띄우지 않습니다.' },
        { icon: 'fa-mobile-screen',       title: 'iOS · Android',     desc: 'Flutter 단일 코드베이스로 두 스토어 모두 지원.' },
      ],
    },
    ja: {
      tagline: '私の写真が\nぬりえ図案になる',
      lede: '撮った写真をAIがきれいなラインアートに変換。変換されたスケッチを自分の手で塗って、自分だけの作品に仕上げましょう。絵の才能は不要 — 塗る楽しさだけあればいい。',
      metaDesc: '写真をAIが塗りやすいラインアートに変換するお絵かきアプリ。10種のプロブラシで塗り、お絵かき中は広告なし。iOS · Android。',
      shotsTitle: '写真一枚から作品まで',
      featuresTitle: 'PiPi Draw を選ぶ理由',
      ctaTitle: '今すぐ塗りはじめよう',
      ctaSub: 'iOS · Android で無料ではじめる。',
      shots: [
        { file: 'ai_result', label: '写真がスケッチになる',  desc: 'AIが写真を塗りやすいラインアートに変換します。' },
        { file: 'ai_styles', label: '好きなスタイルで',       desc: '基本 · インク · カトゥーン · リアル + 線の太さ·ディテール·コントラスト調整。' },
        { file: 'coloring',  label: '自分の手で塗る',         desc: '変換したスケッチをキャンバスに取り込んで色を塗ります。' },
        { file: 'brushes',   label: '10種のプロブラシ',       desc: '鉛筆·マーカー·クレヨン·筆·水彩·蛍光ペンまで選べます。' },
        { file: 'home',      label: '作品コレクション',       desc: '描いた作品がホームに整列 — 続きを描くのもワンタップ。' },
      ],
      features: [
        { icon: 'fa-wand-magic-sparkles', title: 'AIスケッチ変換',  desc: 'カメラ·アルバムの写真を塗りやすいラインアートに変換。' },
        { icon: 'fa-paintbrush',          title: '10種のプロブラシ', desc: '鉛筆·マーカー·クレヨン·筆·水彩などiPad級のブラシで。' },
        { icon: 'fa-ban',                 title: 'お絵かき中は広告なし', desc: '塗りに集中している間は広告を表示しません。' },
        { icon: 'fa-mobile-screen',       title: 'iOS · Android',     desc: 'Flutter単一コードベースで両ストアに対応。' },
      ],
    },
    en: {
      tagline: 'Your photo becomes\na coloring page',
      lede: 'Snap a photo and AI turns it into clean line art. Color the sketch by hand and make it your own — no drawing skill required, just the joy of coloring.',
      metaDesc: 'A drawing app that turns your photos into colorable line art with AI. Color with 10 pro brushes, with no ads while you draw. iOS & Android.',
      shotsTitle: 'From one photo to artwork',
      featuresTitle: 'Why PiPi Draw',
      ctaTitle: 'Start coloring today',
      ctaSub: 'Free to start on iOS & Android.',
      shots: [
        { file: 'ai_result', label: 'Your photo becomes a sketch', desc: 'AI converts your photo into colorable line art.' },
        { file: 'ai_styles', label: 'In the style you want',       desc: 'Default · Ink · Cartoon · Realistic, with line, detail and contrast controls.' },
        { file: 'coloring',  label: 'Color it by hand',            desc: 'Bring the sketch to the canvas and fill it with color.' },
        { file: 'brushes',   label: '10 pro brushes',              desc: 'Pencil, marker, crayon, brush, watercolor, highlighter and more.' },
        { file: 'home',      label: 'Your gallery',                desc: 'Every piece lined up on the home screen — pick up where you left off.' },
      ],
      features: [
        { icon: 'fa-wand-magic-sparkles', title: 'AI sketch conversion', desc: 'Turns camera or album photos into colorable line art.' },
        { icon: 'fa-paintbrush',          title: '10 pro brushes',       desc: 'Pencil, marker, crayon, brush, watercolor — an iPad-grade engine.' },
        { icon: 'fa-ban',                 title: 'No ads while drawing',  desc: 'We never interrupt you with an ad while you are coloring.' },
        { icon: 'fa-mobile-screen',       title: 'iOS & Android',         desc: 'One Flutter codebase, shipped to both stores.' },
      ],
    },
  },
};

// PiPi Word Voyage(피피 낱말항해) — 콘텐츠 SSOT = games/pipi_word_voyage/docs/release/_app-facts.md.
// 2026-07-22 양 스토어 출시. ko 단독 소프트런치(ja/en UI 뼈대) — 랜딩 3언어는 유지.
const wordVoyage: AppMeta = {
  slug: 'pipi-word-voyage',
  name: 'PiPi Word Voyage',
  nameByLang: { ko: '피피 낱말항해', ja: 'ピピ ことばの航海' }, // 실제 스토어 등재명
  status: 'live',
  category: { ko: '게임 · 낱말 퍼즐', ja: 'ゲーム · 単語パズル', en: 'Games · Word Puzzle' },
  schemaCategory: 'GameApplication',
  stores: {
    ios: 'https://apps.apple.com/app/id6788949612',
    android: 'https://play.google.com/store/apps/details?id=com.pifl.pipi.wordvoyage',
  },
  heroShot: 'game',
  content: {
    ko: {
      tagline: '글자를 이어\n섬을 하나씩 개척하라',
      lede: '원형으로 놓인 글자를 드래그로 이어 낱말을 완성하고, 12개 해역 120개 섬의 바다 지도를 개척하는 한글 워드 퍼즐. 계정 없이 바로 시작하고, 오프라인으로 조용히 즐기세요.',
      metaDesc: '글자를 드래그로 이어 낱말을 완성하는 오프라인 한글 워드 퍼즐. 12개 해역 120개 섬, 오늘의 퍼즐과 항해일지까지. iOS · Android.',
      shotsTitle: '낱말로 그리는 바다 지도',
      featuresTitle: '왜 피피 낱말항해인가',
      ctaTitle: '낱말 항해를 시작하세요',
      ctaSub: 'iOS · Android에서 무료로.',
      shots: [
        { file: 'home',    label: '항해 준비',             desc: '항해사 PiPi와 함께 낱말 항해를 시작합니다.' },
        { file: 'game',    label: '드래그 한 번에 낱말 완성', desc: '원형 글자를 이어 목표 낱말을 채웁니다.' },
        { file: 'voyage',  label: '12개 해역, 120개 섬',    desc: '섬을 하나씩 개척하며 바다 지도를 완성해요.' },
        { file: 'daily',   label: '오늘의 퍼즐',            desc: '하루 한 판으로 연속 항해 기록을 쌓아요.' },
        { file: 'logbook', label: '항해일지',               desc: '발견한 낱말이 도감에 차곡차곡 남습니다.' },
      ],
      features: [
        { icon: 'fa-spell-check',  title: '검증된 낱말만',      desc: '표준국어대사전을 바탕으로 검증한 낱말만 담았습니다.' },
        { icon: 'fa-calendar-day', title: '오늘의 퍼즐 · 스트릭', desc: '하루 한 판, 연속 항해 기록이 매일의 동기를 만듭니다.' },
        { icon: 'fa-book-open',    title: '항해일지(낱말 도감)', desc: '발견한 모든 낱말이 항해일지에 영구히 남습니다.' },
        { icon: 'fa-wifi',         title: '계정 없이 오프라인',  desc: '로그인 없이 바로 시작, 진행도는 기기 안에만 저장됩니다.' },
      ],
    },
    ja: {
      tagline: '文字をつないで\n島を開拓しよう',
      lede: '円形に並んだ文字をドラッグでつないで単語を完成し、12海域120の島の海図を開拓する韓国語単語パズル。アカウント不要ですぐ始められ、オフラインで静かに楽しめます。',
      metaDesc: '文字をドラッグでつないで単語を完成するオフライン韓国語単語パズル。12海域120の島、今日のパズルと航海日誌も。iOS · Android。',
      shotsTitle: '単語で描く海図',
      featuresTitle: 'ピピ ことばの航海を選ぶ理由',
      ctaTitle: '言葉の航海を始めよう',
      ctaSub: 'iOS · Android で無料。',
      shots: [
        { file: 'home',    label: '出航の準備',           desc: '航海士ピピと一緒に言葉の航海を始めます。' },
        { file: 'game',    label: 'ドラッグ一回で単語完成', desc: '円形の文字をつないで目標の単語を埋めます。' },
        { file: 'voyage',  label: '12海域、120の島',      desc: '島を一つずつ開拓して海図を完成させましょう。' },
        { file: 'daily',   label: '今日のパズル',          desc: '一日一回のパズルで連続航海記録を積み上げます。' },
        { file: 'logbook', label: '航海日誌',              desc: '見つけた単語がコレクションに残ります。' },
      ],
      features: [
        { icon: 'fa-spell-check',  title: '検証済みの単語だけ',   desc: '標準国語大辞典で検証した単語だけを収録しています。' },
        { icon: 'fa-calendar-day', title: '今日のパズル · 連続記録', desc: '一日一回、連続航海記録が毎日のモチベーションに。' },
        { icon: 'fa-book-open',    title: '航海日誌(単語図鑑)',   desc: '発見したすべての単語が航海日誌に永久に残ります。' },
        { icon: 'fa-wifi',         title: 'アカウント不要 · オフライン', desc: 'ログインなしですぐ開始、進捗は端末内にのみ保存。' },
      ],
    },
    en: {
      tagline: 'Link letters,\nchart the sea',
      lede: 'Drag across a ring of letters to form words and chart 120 islands across 12 seas in this Korean word puzzle. No account needed — start instantly and play fully offline.',
      metaDesc: 'Offline Korean word puzzle: link letters to form words, clear 120 islands across 12 seas, keep a daily streak and a word logbook. iOS & Android.',
      shotsTitle: 'A sea chart drawn with words',
      featuresTitle: 'Why PiPi Word Voyage',
      ctaTitle: 'Start your word voyage',
      ctaSub: 'Free on iOS & Android.',
      shots: [
        { file: 'home',    label: 'Ready to sail',        desc: 'Begin your word voyage with navigator PiPi.' },
        { file: 'game',    label: 'One drag, one word',   desc: 'Link the ring of letters to fill the target words.' },
        { file: 'voyage',  label: '120 islands, 12 seas', desc: 'Clear islands one by one and complete the chart.' },
        { file: 'daily',   label: 'Daily puzzle',         desc: 'One puzzle a day keeps your voyage streak alive.' },
        { file: 'logbook', label: 'Word logbook',         desc: 'Every word you discover is logged forever.' },
      ],
      features: [
        { icon: 'fa-spell-check',  title: 'Dictionary-verified words', desc: 'Every word is validated against the Standard Korean Dictionary.' },
        { icon: 'fa-calendar-day', title: 'Daily puzzle & streak',     desc: 'One puzzle a day builds a voyage streak that keeps you coming back.' },
        { icon: 'fa-book-open',    title: 'Voyage logbook',            desc: 'Every word you discover is recorded permanently.' },
        { icon: 'fa-wifi',         title: 'Offline, no account',       desc: 'Start instantly with no login — progress stays on your device.' },
      ],
    },
  },
};

export const apps: Record<string, AppMeta> = { 'pipi-focus': focus, 'pipi-draw': draw, 'pipi-word-voyage': wordVoyage, 'pipi-hello': hello, 'pipi-words': words, 'pipi-dday': dday, 'pipi-log': log, 'dialogos': dialogos };
export const appList: AppMeta[] = [focus, draw, wordVoyage, hello, words, dday, log, dialogos];
/** 출시 완료 앱 수 — 카피·구조화 데이터가 수동 숫자를 들고 있지 않게 파생시킨다. */
export const liveAppCount: number = appList.filter((a) => a.status === 'live').length;
