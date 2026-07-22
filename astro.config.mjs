// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// pifl-labs.com — Astro static site (Cloudflare Pages 배포)
// publicDir(public/)·outDir(dist/)는 Astro 기본값 사용.
export default defineConfig({
  site: 'https://pifl-labs.com',
  output: 'static',
  trailingSlash: 'ignore',
  // 'directory': 언어 홈페이지(/ko/ /en/ /ja/)를 슬래시 URL로 보존.
  // 레거시 legal URL(/terms)은 CF Pages 가 /terms/ 로 308 정규화(무해).
  build: { format: 'directory' },
  i18n: {
    // 현 운영 라우팅 보존: 루트(/) = 영어 x-default, /ko/ 한국어, /ja/ 일본어.
    // 라우팅은 src/pages 파일 구조가 기존 public/ 을 1:1 미러 → URL 동일.
    defaultLocale: 'en',
    locales: ['en', 'ko', 'ja'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      // noindex 페이지는 사이트맵에 넣지 않는다 — GSC "제출된 URL이 noindex로 표시됨" 오류 방지.
      // 제외 대상 (dist 산출물에서 robots noindex 를 실제로 내보내는 페이지 전부):
      //   · /          — 언어 감지 리다이렉트 랜딩(noindex,follow). 색인 대상은 /ko/ /en/ /ja/
      //   · /go/*      — link-in-bio 허브(noindex,nofollow). 향후 추가되는 허브도 함께 제외
      // 새 noindex 페이지를 만들면 여기에도 추가할 것.
      filter: (page) => page !== 'https://pifl-labs.com/' && !page.includes('/go/'),
    }),
  ],
});
