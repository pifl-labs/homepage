# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PiFl Labs marketing website (pifl-labs.com) — "Code like a pirate. Fly like Flutter."
**Astro 5 static site**, hosted on **Cloudflare Pages**, multi-language (en x-default, ko, ja).
2026-05 migrated from a vanilla HTML + Firebase Hosting setup (see `MIGRATION-ASTRO.md`).

## Project Structure

```
src/
  pages/                  # 라우트 — 기존 public/ URL 1:1 미러
    index.astro           # 루트 / — 언어 감지 리다이렉트 랜딩 (noindex)
    en/  ko/  ja/          # 로케일별 index·terms·privacy·apps/*/privacy
    terms.astro privacy.astro apps/*/privacy.astro  # 무prefix(영어) — /en/ canonical
  layouts/BaseLayout.astro # head·meta·hreflang·nav·footer·scripts 공통 골격
  components/              # Nav.astro / Footer.astro
  i18n/ui.ts               # nav·footer chrome 다국어 사전
functions/_middleware.ts   # CF Pages Function — Accept-Language i18n 302
public/                    # 패스스루 자산 (publicDir) — CSS·JS·폰트·이미지·_headers·_redirects·robots
astro.config.mjs           # output static, i18n(en/ko/ja), build format directory
```

## Key Architecture

- **Astro static build**: `npm run build` → `dist/`. CF Pages가 git push 시 자동 빌드·배포.
- **공통 레이아웃**: `BaseLayout` + `Nav`/`Footer` 컴포넌트. 페이지 본문만 각 `.astro`가 보유.
- **i18n**: 루트 `/`는 `functions/_middleware.ts`가 `Accept-Language`·쿠키 감지 → `/ko//en//ja` 302.
  미들웨어 미실행 환경은 `public/lang-detect.js`가 클라이언트 폴백. x-default = `/ko/`.
- **CSP**: `public/_headers`에 정의. `script-src 'self'` — 인라인 JS 금지. 외부 스크립트(`/theme-init.js`,
  `/script.js`, `/lang-detect.js`)만 사용.
- **테마·글자크기**: `<html data-theme>`/`data-type-scale` + `theme-init.js`(pre-paint) + `colors_and_type.css`
  토큰. 라이트모드는 `:root[data-theme="light"]` 오버라이드.
- **이메일 난독화**: 평문 `mailto:` 금지. `data-email-user`/`data-email-domain` + `script.js` 런타임 조립.
- **이미지**: `<picture>` WebP + PNG fallback, `width`/`height` 명시.
- **CSS SSOT**: `public/colors_and_type.css`(토큰) + `styles-stickerbook.css` + `styles.css`(legal).

## Development Commands

```bash
npm install
npm run dev      # 로컬 dev 서버
npm run build    # dist/ 빌드
npm run preview  # 빌드 결과 미리보기
```

배포: `main` 브랜치에 push → Cloudflare Pages 자동 배포. 로컬 배포 명령 없음.

## 페이지/콘텐츠 수정

- 본문은 각 로케일 `.astro`가 직접 보유 — en/ko/ja를 함께 수정.
- nav/footer 텍스트는 `src/i18n/ui.ts`.
- canonical/hreflang는 BaseLayout에 `pageKey` 기반으로 전달 (생성 당시 `gen-pages.mjs` 규칙: en→/en/, x-default→/ko/).

## Reference Files

- `MIGRATION-ASTRO.md` — Firebase → Astro/CF Pages 이전 기록
- `STRATEGY-2026.md` — 사업 전략
- `HANDOFF.md` — 세션별 변경 이력
