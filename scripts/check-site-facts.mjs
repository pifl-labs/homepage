#!/usr/bin/env node
/**
 * 빌드 전 사실 점검 (경고 전용 — 배포를 막지는 않는다).
 *
 * 1) 릴리스 신선도: apps.ts 의 release.checkedAt 이 오래되면 사이트가 옛 버전을 광고하게 된다.
 * 2) 앱 등록 누락: src/pages/**\/apps/<slug>/ 디렉터리가 있는데 apps.ts 에 없는 슬러그 탐지
 *    (과거 pipi-bridge·pipi-legion 이 사이트 어디서도 링크되지 않는 고아 페이지가 됐다).
 *
 * 실행: npm run build 앞에서 자동(package.json prebuild)
 */
import { readdirSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const WARN_DAYS = 45;
const SRC = new URL('../src/', import.meta.url).pathname;

const apps = readFileSync(join(SRC, 'data/apps.ts'), 'utf8');
const registered = new Set([...apps.matchAll(/slug: '([^']+)'/g)].map((m) => m[1]));

// 1) 신선도
const today = new Date();
const checked = [...apps.matchAll(/checkedAt: '(\d{4}-\d{2}-\d{2})'/g)].map((m) => m[1]).sort();
if (checked.length) {
  const oldest = checked[0];
  const days = Math.floor((today - new Date(`${oldest}T00:00:00Z`)) / 86400000);
  if (days > WARN_DAYS) {
    console.warn(`\n⚠️  [site-facts] 스토어 실측(checkedAt)이 ${days}일 전(${oldest})입니다.`);
    console.warn('   앱 버전·업데이트일이 낡았을 수 있습니다. iTunes Lookup 으로 재확인 후 apps.ts 를 갱신하세요:');
    console.warn('   curl -s "https://itunes.apple.com/lookup?id=1893574694&entity=software&country=kr&limit=50"\n');
  }
}

// 2) 등록 누락
const missing = new Set();
for (const locale of ['ko', 'en', 'ja']) {
  const dir = join(SRC, 'pages', locale, 'apps');
  if (!existsSync(dir)) continue;
  for (const slug of readdirSync(dir, { withFileTypes: true })) {
    if (slug.isDirectory() && !registered.has(slug.name)) missing.add(slug.name);
  }
}
if (missing.size) {
  console.warn(`⚠️  [site-facts] apps.ts 에 없는 앱 페이지: ${[...missing].join(', ')}`);
  console.warn('   방침·지원 페이지만 있는 앱이면 정상입니다. 출시했다면 apps.ts 에 등재해 홈 카드·푸터에 노출하세요.\n');
}
