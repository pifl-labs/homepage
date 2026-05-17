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
  integrations: [sitemap()],
});
