import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

// 그날까지 "선원 초대" 랜딩(ImportLanding)이 앱을 현재 브랜드로 부르는지 검사한다.
// 브랜드 = apps.ts dday.storeNames.ios[lang]의 콜론 앞부분 (그날까지 · Until That Day · その日まで).
// 빌드 결과 검사는 npm run build 뒤에 실행해야 하며, dist/ 가 없으면 이유를 남기고 건너뛴다.
const LANGS = ['ko', 'en', 'ja'];
const apps = readFileSync(new URL('../src/data/apps.ts', import.meta.url), 'utf8');
const dday = runInNewContext(`({${apps.match(/const dday: AppMeta = \{([\s\S]*?)\n\};/)[1]}})`);
const brand = (lang) => dday.storeNames.ios[lang].split(/[:：]/)[0].trim();
const component = readFileSync(new URL('../src/components/ImportLanding.astro', import.meta.url), 'utf8');
const COPY = runInNewContext(`({${component.match(/const COPY: Record<Lang, Copy> = \{([\s\S]*?)\n\};/)[1]}})`);
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

test('invite brands come from the current iOS store names', () => {
  assert.deepEqual(LANGS.map(brand), ['그날까지', 'Until That Day', 'その日まで']);
});

for (const lang of LANGS) {
  test(`${lang} invite copy names the app by its current brand, never the retired PiPi D-Day`, () => {
    for (const key of ['title', 'desc', 'sub']) assert.ok(COPY[lang][key].includes(brand(lang)), `${lang}.${key} names ${brand(lang)}`);
    assert.doesNotMatch(JSON.stringify(COPY[lang]), /PiPi D-Day/);
  });
}

const built = (prefix) => new URL(`../dist/${prefix ? `${prefix}/` : ''}apps/pipi-dday/import/index.html`, import.meta.url);
const skip = !existsSync(built('ko')) && 'dist/ 가 없습니다 — npm run build 뒤에 실행하세요';
for (const [prefix, lang] of [['ko', 'ko'], ['en', 'en'], ['ja', 'ja'], ['', 'ko']]) {
  test(`built /${prefix ? `${prefix}/` : ''}apps/pipi-dday/import/ uses the ${lang} brand in title, description and lead`, { skip }, () => {
    const html = readFileSync(built(prefix), 'utf8');
    assert.match(html, new RegExp(`<title>[^<]*${escape(brand(lang))}[^<]*</title>`));
    assert.ok(html.includes(`<meta name="description" content="${COPY[lang].desc}"`), 'meta description');
    assert.ok(html.includes(COPY[lang].sub), 'lead');
    assert.doesNotMatch(html, /PiPi D-Day/);
  });
}
