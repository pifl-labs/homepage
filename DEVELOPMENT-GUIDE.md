# PiFl Labs 개발 가이드

Astro + Cloudflare Pages 기반 pifl-labs.com 의 페이지 추가·수정 가이드.

## 1. 구조

```
src/
  pages/<locale>/<page>.astro   # 라우트 = 파일 경로
  layouts/BaseLayout.astro      # 공통 head·nav·footer
  components/Nav.astro Footer.astro
  i18n/ui.ts                    # nav·footer chrome 다국어 문자열
public/                         # 패스스루 자산 (URL 루트로 그대로 서빙)
```

- 라우트는 `src/pages/` 파일 경로 그대로. `src/pages/ko/terms.astro` → `/ko/terms/`.
- 콘텐츠 본문은 각 `.astro` 파일이 보유. nav/footer 같은 chrome 만 컴포넌트로 공유.

## 2. 페이지 수정

기존 페이지 텍스트/구조는 해당 `.astro` 파일을 직접 편집.
**다국어 동기화**: 한 페이지를 고치면 `en/` `ko/` `ja/` 3개 로케일 파일을 함께 수정.
무prefix 영어 페이지(`src/pages/terms.astro` 등)도 `/en/` 트윈과 내용 일치 유지.

## 3. 페이지 추가

1. `src/pages/<locale>/<name>.astro` 3개(en/ko/ja) 생성.
2. 각 파일은 `BaseLayout` 으로 감싼다:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
---
<BaseLayout
  lang="ko"
  title="페이지 제목"
  description="페이지 설명"
  canonical="https://pifl-labs.com/ko/<name>/"
  alternates={[
    { hreflang: 'en', href: 'https://pifl-labs.com/en/<name>/' },
    { hreflang: 'ko', href: 'https://pifl-labs.com/ko/<name>/' },
    { hreflang: 'ja', href: 'https://pifl-labs.com/ja/<name>/' },
    { hreflang: 'x-default', href: 'https://pifl-labs.com/ko/<name>/' },
  ]}
>
  <!-- 페이지 본문 (section 등) -->
</BaseLayout>
```

3. legal 류 페이지면 `extraCss={["/styles.css"]}` 추가.

## 4. 규칙

- **canonical/hreflang**: 무prefix 영어 페이지는 canonical 을 `/en/...` 으로, x-default 는 항상 `/ko/...`.
- **CSP**: `public/_headers` 의 `script-src 'self'` — 인라인 `<script>` 금지. 외부 스크립트만.
- **이미지**: `<picture>` WebP + PNG fallback, `width`/`height` 명시.
- **이메일**: 평문 `mailto:` 금지 — `data-email-user`/`data-email-domain` + `script.js` 런타임 조립.
- **디자인 토큰**: 색·폰트·간격은 `public/colors_and_type.css` 토큰(`var(--*)`) 사용. raw 값 금지.
- **nav/footer 문자열**: `src/i18n/ui.ts` 에만 추가.

## 5. 검증

```bash
npm run build    # 빌드 통과 확인
npm run preview  # 로컬에서 렌더 확인
```

`main` push → Cloudflare Pages 자동 배포. 다른 브랜치 push 는 미리보기 배포만 생성(프로덕션 무영향).
