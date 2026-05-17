// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// pifl-labs.com — Astro static site (Cloudflare Pages 배포)
// ------------------------------------------------------------
// publicDir 를 ./static 으로 둔 이유: 기존 Firebase 호스팅용 public/
// (21개 HTML)을 컷오버 전까지 그대로 두기 위해 Astro 패스스루 자산
// 디렉토리를 분리한다. 마이그레이션 완료 후 public/ 는 삭제 예정.
export default defineConfig({
  site: 'https://pifl-labs.com',
  output: 'static',
  publicDir: './static',
  outDir: './dist',
  // 'ignore': CF Pages 가 /terms 와 /terms/ 양쪽 서빙 → 기존 URL(/terms) 보존
  trailingSlash: 'ignore',
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
