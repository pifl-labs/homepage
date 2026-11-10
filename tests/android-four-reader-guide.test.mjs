import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=p=>readFileSync(new URL(p,import.meta.url));
const receipt=JSON.parse(read('../docs/release/android-four-reader-guide-20261110.json'));
const text=read('../public/assets/printables/android-everyday-apps-four-ko.txt').toString('utf8');
const pdf=read('../public/assets/printables/android-everyday-apps-four-ko-a4.pdf');
const raw=pdf.toString('latin1');
const packages=['com.pifl.pipi.kkachi','com.pifl.pipi.spend','com.pifl.pipi.sudoku','com.pifl.pipi.bp'];
test('four selected Korean Android listings have independent exact public identity and free-install evidence',()=>{
 assert.equal(receipt.observedOn,'2026-11-10');assert.equal(receipt.koreanStoreSources.length,4);
 assert.deepEqual(receipt.koreanStoreSources.map(x=>x.package),packages);
 for(const row of receipt.koreanStoreSources){
  assert.equal(row.HTTP,200);assert.equal(row.author,'PiFl Labs');assert.equal(Number(row.price),0);assert.equal(row.currency,'KRW');
  let u=new URL(row.url);assert.equal(u.hostname,'play.google.com');assert.equal(u.searchParams.get('id'),row.package);assert.equal(u.searchParams.get('hl'),'ko');assert.equal(u.searchParams.get('gl'),'KR');
  assert.match(row.sourceSHA256,/^[a-f0-9]{64}$/);assert.ok(text.includes(row.name));
 }
 assert.ok(receipt.reusedProductDescriptionSources.every(x=>x.providedEarlierTodayReusedNotNewGET));
});
test('PDF is the visually reviewed four-page static artifact with only the four exact store links and existing catalog',()=>{
 assert.ok(raw.startsWith('%PDF-'));assert.equal((raw.match(/\/Type \/Page\b/g)||[]).length,4);
 const urls=[...raw.matchAll(/\/URI \(([^)]+)\)/g)].map(x=>x[1]);assert.equal(urls.length,8);
 for(const pkg of packages)assert.ok(urls.includes(`https://play.google.com/store/apps/details?id=${pkg}&hl=ko&gl=KR`));
 assert.ok(urls.every(s=>{let u=new URL(s);return u.hostname==='play.google.com' && (u.pathname==='/store/apps/details'&&packages.includes(u.searchParams.get('id'))||u.pathname==='/store/apps/developer'&&u.searchParams.get('id')==='PiFl Labs')}));
 assert.match(raw,/\/FontFile2\b/);assert.doesNotMatch(raw,/\/JavaScript\b|\/Launch\b|\/EmbeddedFile\b|\/Encrypt\b|\/AcroForm\b|\/Users\/pirate/);
});
test('bytes, OFL and consumer cost/data/medical boundaries are preserved rather than all-free or all-offline claims',()=>{
 for(const [file,hash] of Object.entries(receipt.assetsSHA256))assert.equal(createHash('sha256').update(read('../public/assets/printables/'+file)).digest('hex'),hash);
 assert.match(read('../public/assets/printables/android-everyday-apps-four-OFL.txt').toString(),/SIL OPEN FONT LICENSE|SIL Open Font License/);
 for(const s of ['앱 내 구매','광고가 있는 무료 앱','일회성 Pro','AdMob','Firebase','자동으로 읽거나','힌트가 없는 단계','익명 별명','측정 앱이 아닙니다','진단·치료하지 않습니다','PDF·CSV 내보내기']) {
  assert.ok(text.includes(s),s);
 }
 assert.doesNotMatch(text,/완전 무료|의학적 효과|혈압을 낮|미래를 보장|다운로드 \d+만/);
});
test('public README adds this Korean Android companion without relabeling the older eight-app iOS PDF or company count',()=>{
 const readme=read('../README.md').toString();assert.ok(readme.includes('### Android 앱 선택 안내 (한국어)'));
 for(const file of ['android-everyday-apps-four-ko-a4.pdf','android-everyday-apps-four-ko.txt'])assert.ok(readme.includes('https://pifl-labs.com/assets/printables/'+file));
 assert.ok(readme.includes('회사의 전체 앱 수를 뜻하지 않습니다'));
 assert.ok(readme.includes('eight-app iOS overview (PDF, 4 pages)'));
 assert.ok(readme.includes('com.pifl.pipi.bp&hl=ko&gl=KR'));
});
