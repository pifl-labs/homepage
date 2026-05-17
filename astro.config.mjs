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
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'ko',
    locales: ['ko', 'en', 'ja'],
    routing: {
      prefixDefaultLocale: false, // ko 는 prefix 없이 루트(/), en→/en/, ja→/ja/
    },
  },
  integrations: [sitemap()],
});
