# pifl-labs.com — Astro + Cloudflare Pages 이전 계획

**작성**: 2026-05-17 · **상태**: 진행 중 (1단계 착수)
**대상 저장소**: `pifl-labs/homepage` (code/pifl-labs)

---

## 목표

순수 정적 HTML(21개 중복 파일) + Firebase Hosting →
**Astro static + Cloudflare Pages**.

- git push = 자동 배포 → 로컬 Firebase 인증 문제(`login:ci` 정책 변경으로 토큰 만료) 영구 제거
- 공통 레이아웃으로 21개 파일 중복 해소
- pipi-worlds.com과 동일 스택 → 정신적 비용·도구 통일

## 참조 모델 — pipi-worlds

- Astro 5.1, `output: 'static'`
- i18n: `defaultLocale: 'ko'`, `locales: ['ko','en','ja']`
- `src/pages/{ko,en,ja}/` 로케일별 페이지 디렉토리
- `public/_headers` — Cloudflare Pages 헤더(보안·캐시)
- 배포: `git push` → CF Pages 자동 빌드. GitHub Actions 불필요, 어댑터 불필요(static)

---

## 현재 → 목표 매핑

| 항목 | 현재 (Firebase) | 목표 (Astro/CF) |
|---|---|---|
| 페이지 | 21개 독립 HTML | `src/pages/` — 고유 7종 × 로케일, 공통 레이아웃 |
| 레이아웃 | 없음 (전 파일 중복) | `BaseLayout` + `Nav`/`Footer`/`FooterPrefs` 컴포넌트 |
| i18n | `firebase.json` rewrites + `localized-files/` | Astro i18n (`ko` 기본, `/en/` `/ja/`) |
| CSS | `colors_and_type`+`styles-stickerbook`+`styles` | `src/styles/`, 레이아웃 import |
| theme-init | 외부 동기 스크립트 (CSP 회피) | `<script is:inline>` (`_headers`로 CSP 관리) |
| 보안 헤더 | `firebase.json` headers | `public/_headers` |
| 배포 | `firebase deploy` (로컬 인증) | git push → CF Pages 자동 |

---

## 작업 분해 (4단계)

### 1단계 — 스캐폴드 (risk: low, 라이브 무영향)
- **T1** Astro 5 도입: `package.json`, `astro.config.mjs` (`output: static`, i18n config), `tsconfig.json`
- **T2** CSS 3종 + 폰트 + 이미지 에셋 → `src/styles/`, `public/`

### 2단계 — 컴포넌트화 (risk: medium, 핵심)
- **T3** `BaseLayout.astro` — head·meta·canonical·hreflang·theme-init `is:inline`
- **T4** `Nav.astro` / `Footer.astro` / `FooterPrefs.astro` 컴포넌트 — 21파일 중복 해소
- **T5** 페이지 이관: index/terms/privacy + 앱 privacy 2종 → `src/pages/{ko,en,ja}/`

### 3단계 — 인프라 (risk: medium)
- **T6** `public/_headers` — `firebase.json` 보안 헤더(CSP·HSTS·X-Frame·Permissions-Policy) 이식
- **T7** SEO 패리티 — `@astrojs/sitemap`, robots.txt, **기존 URL 구조 100% 유지** (canonical/hreflang/og 1:1)
- **T8** CF Pages 프로젝트 생성 + GitHub 연동 (build: `astro build`, output: `dist`)

### 4단계 — 검증·컷오버 (risk: HIGH — 사용자 직접)
- **T9** `*.pages.dev` 프리뷰 전수 검증 (라이트/다크·글자크기·i18n·SEO)
- **T10** ⚠️ **DNS 컷오버** — pifl-labs.com Firebase → CF Pages. **사용자 직접 실행/승인**
- **T11** 안정화 확인 후 Firebase Hosting 폐기

---

## 핵심 리스크

1. **DNS 컷오버 (T10)** — 잘못하면 사이트 다운. 프리뷰 완전 검증 후 사용자가 직접 실행.
2. **SEO URL 패리티** — Firebase i18n(`localized-files/ko/`)과 Astro i18n 라우팅 차이.
   기존 색인 URL이 깨지면 검색 유입 손실 → URL 1:1 매핑 + 필요 시 301 `_redirects`.
3. **CSP** — `is:inline` 스크립트 정책. `_headers`에 hash 또는 정책 조정.

## 진행 원칙

- 신규 브랜치 `feat/astro-migration`에서 작업, `*.pages.dev` 프리뷰로 병행 운영
- Firebase는 컷오버 성공 확인까지 유지
- DNS 컷오버는 어떤 경우에도 자동 실행 금지 — 사용자 승인 필수

## 진행 로그

- 2026-05-17: 계획 문서 작성, `feat/astro-migration` 브랜치 생성, 1단계 착수
