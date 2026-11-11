import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = p => fs.readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const component = read('src/components/SuneungCalendar.astro');
const raw = fs.readFileSync(new URL('../public/assets/calendars/2027-suneung-date-ko.ics', import.meta.url));
const folded = raw.toString('utf8');
const event = folded.replace(/\r\n[ \t]/g, '');
const lines = event.split('\r\n').filter(Boolean);
const prop = k => lines.filter(l => l.startsWith(k + ':')).map(l => l.slice(k.length + 1));

test('only KO D-Day route adds section through existing slot', () => {
  assert.match(read('src/pages/ko/apps/pipi-dday/index.astro'), /SuneungCalendar slot="before-showcase"/);
  for (const l of ['en', 'ja']) assert.doesNotMatch(read(`src/pages/${l}/apps/pipi-dday/index.astro`), /SuneungCalendar/);
});
test('date is exam year 2026 and academic year 2027, never stale today count', () => {
  assert(component.includes('2027학년도 수능 날짜'));
  assert(component.includes('datetime="2026-11-19"'));
  assert(component.includes('2026년 11월 19일 목요일'));
  assert.equal(new Date('2026-11-19T00:00:00Z').getUTCDay(), 4);
  assert.doesNotMatch(component, /D-\d+|오늘.*남|2027-11-19|<script/);
});
test('one valid calendar and one event with required stable fields', () => {
  for (const p of ['BEGIN:VCALENDAR', 'END:VCALENDAR', 'BEGIN:VEVENT', 'END:VEVENT', 'VERSION:2.0']) assert.equal(lines.filter(l => l === p).length, 1);
  assert.deepEqual(prop('UID'), ['2027-suneung-20261119@pifl-labs.com']);
  assert.match(prop('DTSTAMP')[0], /^20261111T\d{6}Z$/);
  assert.equal(prop('PRODID').length, 1);
});
test('single all-day date uses exclusive next-day end and no timezone shift', () => {
  assert.deepEqual(prop('DTSTART;VALUE=DATE'), ['20261119']);
  assert.deepEqual(prop('DTEND;VALUE=DATE'), ['20261120']);
  assert.equal((Date.parse('2026-11-20') - Date.parse('2026-11-19')) / 86400000, 1);
  assert.deepEqual(prop('TRANSP'), ['TRANSPARENT']);
  assert.doesNotMatch(event, /TZID|BEGIN:VTIMEZONE|RRULE|RDATE|DURATION|VALARM|TRIGGER|ATTENDEE|ORGANIZER|LOCATION|GEO|METHOD|REFRESH/);
});
test('UTF8 calendar uses CRLF, safe physical folding <=75 octets and no BOM', () => {
  assert.equal(raw.toString('utf8'), new TextDecoder('utf-8', {fatal: true}).decode(raw));
  assert(!raw.subarray(0, 3).equals(Buffer.from([239, 187, 191])));
  assert(!folded.replace(/\r\n/g, '').includes('\n'));
  assert(folded.endsWith('\r\n'));
  for (const l of folded.split('\r\n')) assert(Buffer.byteLength(l, 'utf8') <= 75);
  assert.equal(prop('DESCRIPTION').length, 1);
  assert(prop('DESCRIPTION')[0].includes('\\n출처: 교육부 2024-08-16'));
});
test('official source and independence disclosure appear in page and file', () => {
  assert(prop('URL')[0].startsWith('https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=294&boardSeq=100526&'));
  for (const x of ['교육부 원문 확인', '교육부와 무관한 PiFl Labs', '입실 시각·준비물·최신 공지']) assert(component.includes(x));
  assert(prop('DESCRIPTION')[0].includes('교육부와 무관한 비공식 달력 파일'));
  assert.equal(prop('SUMMARY')[0], '2027학년도 대학수학능력시험');
});
test('free standalone download does not claim app install or automatic calendar addition', () => {
  for (const x of ['type="text/calendar"', 'download="2027-suneung-date-ko.ics"', '달력 파일 받기', '앱 설치 없이', '별도 알림은 넣지', '가져오기 전에 날짜를 확인']) assert(component.includes(x));
  assert.doesNotMatch(component, /<form|<input|<iframe|webcal:|calendar.google|자동.*추가|그날까지.*가져오기/);
});
test('app relationship keeps Android manual date and free/paid limits distinct', () => {
  for (const x of ['Android 앱', '시험 날짜를 직접', '날짜 5개까지 무료', '광고 제거·날짜 무제한', '선택형 Pro 한 번 결제', '구독은 아니', 'Google Play 버튼', '앱은 필요하지']) assert(component.includes(x));
  assert.doesNotMatch(component, /합격 보장|성적 향상|무광고 무료|새 기능|new feature/);
});
test('scoped responsive styles use existing tokens without hiding or truncating prose', () => {
  for (const x of ['min-width: 0', 'flex-wrap: wrap', 'max-width: 100%', 'min-height: 44px', 'var(--bg-card)', 'word-break: keep-all']) assert(component.includes(x));
  assert.doesNotMatch(component, /text-overflow|max-height|overflow:\s*hidden|white-space:\s*nowrap|font-size:\s*\d+px/);
});

test('page and calendar use the same verified MOE announcement, not the unavailable March link', () => {
  const expected = 'https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=294&boardSeq=100526&lev=0&m=020402&opType=N&s=moe';
  assert.equal(prop('URL')[0], expected);
  assert.ok(component.includes(expected.replaceAll('&', '&amp;')));
  assert.doesNotMatch(component + event, /boardSeq=105756|2026-03-31/);
  assert.ok(prop('DESCRIPTION')[0].includes('교육부 2024-08-16 수능 시행일 발표.'));
});
