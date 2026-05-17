// pifl-labs.com — UI chrome 다국어 사전
// 페이지 본문 콘텐츠는 각 페이지 파일이 보유. 여기는 nav/footer 칩 텍스트만.
export type Lang = 'en' | 'ko' | 'ja';

export interface UiStrings {
  co: string;
  navCrew: string;
  navShip: string;
  navLog: string;
  navCta: string;
  footTagline: string;
  footDesc: string;
  footNavigate: string;
  footHome: string;
  footContact: string;
  copyright: string;
  terms: string;
  privacy: string;
  theme: string;
  themeAuto: string;
  themeLight: string;
  themeDark: string;
  textSize: string;
  tsGlyph: string;
  tsNormal: string;
  tsLarge: string;
  tsXlarge: string;
}

export const ui: Record<Lang, UiStrings> = {
  en: {
    co: 'CO., LTD.',
    navCrew: 'Crew', navShip: 'Ship', navLog: 'Log', navCta: 'Read the log',
    footTagline: 'Code like a pirate. Fly like Flutter.',
    footDesc: 'A Flutter-based cross-platform studio. Sailing the digital seas with a very small, very opinionated parrot.',
    footNavigate: 'Navigate', footHome: 'Home', footContact: 'Contact',
    copyright: '© 2026 PiFl Labs Co., Ltd.', terms: 'Terms', privacy: 'Privacy',
    theme: 'Theme', themeAuto: 'Auto', themeLight: 'Light', themeDark: 'Dark',
    textSize: 'Text size', tsGlyph: 'A',
    tsNormal: 'Normal text size', tsLarge: 'Large text size', tsXlarge: 'Extra large text size',
  },
  ko: {
    co: '주식회사',
    navCrew: '크루', navShip: '배', navLog: '항해일지', navCta: '일지 읽기',
    footTagline: '해적처럼 코딩, Flutter처럼 비상.',
    footDesc: 'Flutter 기반 크로스플랫폼 스튜디오. 아주 작고, 아주 고집 센 앵무새와 함께 디지털 바다를 건너갑니다.',
    footNavigate: '둘러보기', footHome: '홈', footContact: '연락처',
    copyright: '© 2026 주식회사 PiFl Labs', terms: '이용약관', privacy: '개인정보',
    theme: '테마', themeAuto: '자동', themeLight: '밝게', themeDark: '어둡게',
    textSize: '글자 크기', tsGlyph: '가',
    tsNormal: '보통 글자 크기', tsLarge: '큰 글자 크기', tsXlarge: '아주 큰 글자 크기',
  },
  ja: {
    co: '株式会社',
    navCrew: 'クルー', navShip: '船', navLog: '航海日誌', navCta: '日誌を読む',
    footTagline: '海賊のようにコード、Flutterのように飛ぶ。',
    footDesc: 'Flutterベースのクロスプラットフォームスタジオ。とても小さくて、とても頑固なオウムと一緒に、デジタルの海を旅しています。',
    footNavigate: '案内', footHome: 'ホーム', footContact: '連絡先',
    copyright: '© 2026 株式会社 PiFl Labs', terms: '利用規約', privacy: 'プライバシー',
    theme: 'テーマ', themeAuto: '自動', themeLight: 'ライト', themeDark: 'ダーク',
    textSize: '文字サイズ', tsGlyph: 'あ',
    tsNormal: '標準の文字サイズ', tsLarge: '大きい文字サイズ', tsXlarge: '特大の文字サイズ',
  },
};

// 로케일별 경로 prefix. 영어(x-default)는 루트라 prefix 없음.
export function localeBase(lang: Lang): string {
  return lang === 'en' ? '' : `/${lang}`;
}
