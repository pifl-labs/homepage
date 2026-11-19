import test from 'node:test';import assert from 'node:assert/strict';
import {readApps,matchesRecord,writeQuery} from '../public/archive-filters.mjs';
import {archiveReleaseCards} from '../src/data/archive-release-cards.mjs';
const order=[...new Set(archiveReleaseCards.map(e=>e.app))];
const filter=(apps,other={year:'all',platform:'all',kind:'all'})=>archiveReleaseCards.filter(e=>matchesRecord({...e,year:e.sortDate.slice(0,4),platform:e.releases.map(r=>r.platform).join(' ')},new Set(apps),other));
test('single legacy, repeated and comma-separated app queries all resolve safely',()=>{
 assert.deepEqual([...readApps(new URLSearchParams('app=pipi-focus'),order)],['pipi-focus']);
 assert.deepEqual([...readApps(new URLSearchParams('app=pipi-legion'),order)],[]);
 assert.deepEqual([...readApps(new URLSearchParams('app=pipi-focus&app=pipi-draw&app=pipi-focus&app=invalid'),order)],['pipi-focus','pipi-draw']);
 assert.deepEqual([...readApps(new URLSearchParams('app=pipi-focus,pipi-draw'),order)],['pipi-focus','pipi-draw']);
});
test('app union intersects platform/year/type; empty app selection means all',()=>{
 assert.equal(filter([]).length,archiveReleaseCards.length);
 assert.deepEqual(filter(['pipi-focus','pipi-draw']),archiveReleaseCards.filter(c=>['pipi-focus','pipi-draw'].includes(c.app)));
 assert.deepEqual(filter(['pipi-focus','pipi-draw'],{year:'2026',platform:'android',kind:'all'}),archiveReleaseCards.filter(c=>['pipi-focus','pipi-draw'].includes(c.app)&&c.sortDate.startsWith('2026')&&c.releases.some(r=>r.platform==='android')));
 assert.ok(filter(['pipi-focus']).length>6);
 assert.equal(filter(['pipi-sky'],{year:'all',platform:'ios',kind:'released'}).length,0);
 assert.ok(archiveReleaseCards.every(e=>e.releases.every(r=>r.platform!=='web')));
});
test('multi-select URL serializes canonically and round trips without lost filters',()=>{
 const selected=new Set(['pipi-focus','pipi-draw']);const query=writeQuery(selected,order,{year:'2026',platform:'ios',kind:'all'});
 assert.deepEqual([...readApps(new URLSearchParams(query),order)].sort(),[...selected].sort());
 assert.equal(new URLSearchParams(query).get('year'),'2026');
 assert.equal(writeQuery(new Set(),order,{year:'all',platform:'all',kind:'all'}),'');
});
