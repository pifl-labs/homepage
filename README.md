# PiFl Labs — Code like a pirate. Fly like Flutter.

PiFl Labs 마케팅 웹사이트 ([pifl-labs.com](https://pifl-labs.com)) 소스.
Flutter 기반 크로스플랫폼 스튜디오 PiFl Labs의 회사 소개 사이트.

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
```

## 배포

`main` 브랜치에 push → Cloudflare Pages가 자동 빌드·배포. 로컬 배포 명령 없음.

## 문서

- `DEVELOPMENT-GUIDE.md` — 페이지 추가·수정 가이드
- `CLAUDE.md` — 아키텍처 요약 (Claude Code 용)
- `MIGRATION-ASTRO.md` — Astro 이전 기록
- `STRATEGY-2026.md` — 사업 전략
- `HANDOFF.md` — 세션별 변경 이력
