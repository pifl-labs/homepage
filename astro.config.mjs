// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { apps, latestUpdate } from './src/data/apps.ts';

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
    // 현 운영 라우팅 보존: 루트(/) = 언어 감지 리다이렉트 랜딩(noindex, canonical·x-default 모두 /ko/),
    // /ko/ 한국어, /en/ 영어, /ja/ 일본어.
    // 라우팅은 src/pages 파일 구조가 기존 public/ 을 1:1 미러 → URL 동일.
    defaultLocale: 'en',
    locales: ['en', 'ko', 'ja'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      // 색인 대상 = 로케일 prefix 가 붙은 URL 뿐이다.
      //  · '/'          — 언어 감지 리다이렉트 랜딩(noindex)
      //  · '/terms' '/privacy' '/apps/**' 등 무prefix 경로 — functions/_middleware.ts 가
      //    Accept-Language 로 302 하므로 프로덕션에서 200 으로 서빙되지 않는다(중복 URL).
      //  · '/go/*'      — link-in-bio 허브(noindex,nofollow)
      //  · '/apps/pipi-dday/import' — 쿼리 없이는 의미 없는 딥링크 폴백(noindex,follow)
      // 경로로 판정한다 — 도메인 문자열로 비교하면 site 값이 바뀔 때 조용히 무력화된다.
      filter: (page) => {
        const { pathname } = new URL(page);
        if (!/^\/(ko|en|ja)\//.test(pathname)) return false;
        if (pathname.startsWith('/go/')) return false;
        if (/\/apps\/pipi-dday\/import\/?$/.test(pathname)) return false;
        return true;
      },
      // 언어별 대체 URL(xhtml:link)을 사이트맵이 직접 선언하게 한다 — 3언어가 1:1 미러라 안전.
      i18n: {
        defaultLocale: 'ko',
        locales: { ko: 'ko-KR', en: 'en-US', ja: 'ja-JP' },
      },
      // 앱 랜딩은 스토어 실측 업데이트일을 lastmod 로 쓴다(수기 날짜 금지).
      serialize(item) {
        const m = new URL(item.url).pathname.match(/^\/(?:ko|en|ja)\/apps\/([^/]+)\/?$/);
        const slug = m?.[1];
        const app = slug ? apps[slug] : undefined;
        const updated = app ? latestUpdate(app) : '';
        if (updated) item.lastmod = `${updated}T00:00:00+09:00`;
        return item;
      },
    }),
  ],
});
