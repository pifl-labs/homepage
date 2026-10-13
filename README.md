# PiFl Labs — Code like a pirate. Fly like Flutter.

PiFl Labs 마케팅 웹사이트 ([pifl-labs.com](https://pifl-labs.com)) 소스.
Flutter 기반 크로스플랫폼 스튜디오 PiFl Labs의 회사 소개 사이트.

## Visit the official website

[English](https://pifl-labs.com/en/) · [한국어](https://pifl-labs.com/ko/) · [日本語](https://pifl-labs.com/ja/)

The website contains product details and official store links. Some apps include
ads or optional purchases; availability and pricing vary by app and store.
This repository contains the company marketing website, not the Flutter app source.

### App portfolio (PDF)

[Download the eight-app iOS overview (PDF, 4 pages)](https://pifl-labs.com/assets/press/pifl-labs-ios-portfolio-2026-10-11.pdf).
Prepared by PiFl Labs, not an independent review. US App Store snapshot: 11 October 2026.

### Free writing resource

[Your week, one line at a time (A4 PDF)](https://pifl-labs.com/assets/printables/one-line-journal-en.pdf) | [Plaintext companion](https://pifl-labs.com/assets/printables/one-line-journal-en.txt).
Seven undated spaces for a word and a moment. No app or sign-up required. Original PiFl Labs template, prepared with AI assistance; not a health assessment.
The optional Mood Tile iOS link is separate: the app includes ads and an optional one-time upgrade, with no subscription.

### Free focus-start resource

[One small start (A4 PDF)](https://pifl-labs.com/assets/printables/one-small-start-en.pdf) | [Plaintext companion](https://pifl-labs.com/assets/printables/one-small-start-en.txt).
Choose one task, a visible first step and your own time box; park other thoughts and write the next step. No app or sign-up required.
Original PiFl Labs template, prepared with AI assistance; no productivity or health outcome is promised.
The optional Pomodoro at Sea iOS link is separate: free download with ads and optional one-time ad removal.

### Free vocabulary-recall resource

[One word. No peeking. (A5 PDF)](https://pifl-labs.com/assets/printables/one-word-recall-card-en.pdf) | [Plaintext companion](https://pifl-labs.com/assets/printables/one-word-recall-card-en.txt).
Use one word you have already studied: write from its meaning without hints, then reveal your reference and compare for yourself. A blank attempt is OK.
No app or sign-up required. Original PiFl Labs blank template, prepared with AI assistance; no automatic grading, exam score or learning outcome is promised.
The optional Vocab Routine iOS link is separate: free basic decks with daily limits, ads and optional word packs/subscription.

### 한국어 무료 첫 행동 기록지

[하나만, 먼저 시작 (A4 PDF)](https://pifl-labs.com/assets/printables/one-small-start-ko.pdf) | [텍스트 원문](https://pifl-labs.com/assets/printables/one-small-start-ko.txt).
할 일 하나, 눈에 보이는 첫 행동, 스스로 정한 시간과 다음 행동을 적는 종이 양식입니다. 앱 설치나 가입 없이 사용합니다.
피플랩스 원본 양식이며 작성에 AI를 사용했습니다. 집중·학습·건강 효과를 입증하거나 보장하는 자료는 아닙니다.
선택인 집중항해 iOS 타이머는 광고 포함 무료 다운로드, 광고 제거는 선택 1회 구매입니다.
문서에 사용한 Jua 폰트: Copyright 2018 The Jua Project Authors, [SIL Open Font License 1.1](https://pifl-labs.com/assets/printables/jua-OFL.txt). 폰트 출처 표기는 양식이나 앱에 대한 추천·보증을 의미하지 않습니다.

### Free Korean help-request resource

[Please help me (one-page Korean–English PDF)](https://pipi-worlds.com/assets/marketing/bridge-free-activity-20260922/help-me-ko-en.pdf).
For grown-ups and children aged 4–8 who are new to Korean: model a missing-pencil situation, take turns asking for help, then draw another situation. English instructions accompany Korean phrases. No app or sign-up required.
Prepared by PiFl Labs with AI assistance; not independently educator-reviewed or classroom-tested, and no learning outcome is promised.
The optional Korean Bridge iOS app is free and ad-free, with no purchases or subscriptions.

### Free Hangul word-puzzle resource

[Three Hangul puzzles (two-page PDF)](https://pipi-worlds.com/assets/marketing/voyage-chosung-en-20261011/chosung-three-puzzles-en.pdf) | [Plaintext companion](https://pipi-worlds.com/assets/marketing/voyage-chosung-en-20261011/chosung-three-puzzles-en.txt).
For people who already read Hangul: Food, Pets and Travel puzzles with syllable banks, English rules and short word meanings; answers on page 2. No app or sign-up required.
Prepared by PiFl Labs from its own puzzle data, with AI assistance; not curriculum-reviewed or physically print-tested, and no learning outcome is promised.
English meanings belong to this paper resource only. The optional Hangul Voyage iOS app is an ad-supported Korean word puzzle, not an English translation or handwriting app.

## 스택

- **Astro 5** static site
- **Cloudflare Pages** 호스팅 — `main` push 시 자동 배포
- 다국어 — 영어(x-default) / 한국어 / 일본어
- 2026-05 vanilla HTML + Firebase Hosting → Astro + CF Pages 이전 (`MIGRATION-ASTRO.md`)

## 구조

```
src/
  pages/                    # 라우트
    index.astro             # 루트 / — 언어 감지 리다이렉트 랜딩
    en/ ko/ ja/             # 로케일별 index·terms·privacy·apps/*/privacy
    terms.astro privacy.astro apps/*/privacy.astro   # 무prefix 영어 (→ /en/ canonical)
  layouts/BaseLayout.astro  # head·meta·hreflang·nav·footer·스크립트 공통 골격
  components/              # Nav · Footer · AppLanding · ImportLanding · DialogosSource*
  data/apps.ts             # ★앱 랜딩 카피 SSOT (status/stores/nameByLang/schemaCategory)
  pages/go/tiktok.astro    # link-in-bio 허브 (noindex, apps.ts 파생)
  i18n/ui.ts                # nav·footer 다국어 사전
functions/_middleware.ts    # CF Pages Function — Accept-Language i18n 302
public/                     # 패스스루 자산 — CSS·JS·폰트·이미지·_headers·_redirects·robots
astro.config.mjs
```

## 개발

```bash
npm install
npm run dev      # 로컬 dev 서버 (http://localhost:4321)
npm run build    # dist/ 빌드
npm run preview  # 빌드 결과 미리보기
npm test         # 스토어 캠페인 URL·전달·안전성 테스트
npm run test:built # build 후 3언어 홈·앱 링크 회귀 검사
```

## 배포

`main` 브랜치에 push → Cloudflare Pages가 자동 빌드·배포. 로컬 배포 명령 없음.

## 문서

- `DEVELOPMENT-GUIDE.md` — 페이지 추가·수정 가이드
- `CLAUDE.md` — 아키텍처 요약 (Claude Code 용)
- `MIGRATION-ASTRO.md` — Astro 이전 기록
- `STRATEGY-2026.md` — 사업 전략
- `HANDOFF.md` — 세션별 변경 이력
- [캠페인 연결·측정 규약](docs/campaign-attribution.md) — 콘텐츠→웹→스토어, Apple 활성화 게이트·검증 현황
