import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {appList} from '../src/data/apps.ts';
const supported=new Set(['GameApplication','SocialNetworkingApplication','TravelApplication','ShoppingApplication','SportsApplication','LifestyleApplication','BusinessApplication','DesignApplication','DeveloperApplication','DriverApplication','EducationalApplication','HealthApplication','FinanceApplication','SecurityApplication','BrowserApplication','CommunicationApplication','DesktopEnhancementApplication','EntertainmentApplication','MultimediaApplication','HomeApplication','UtilitiesApplication','ReferenceApplication']);
const expected={'dialogos':'LifestyleApplication','pipi-focus':'BusinessApplication','pipi-hello':'EducationalApplication','pipi-words':'EducationalApplication','pipi-dday':'LifestyleApplication','pipi-log':'LifestyleApplication','pipi-draw':'DesignApplication','pipi-word-voyage':'GameApplication','pipi-bridge':'EducationalApplication'};
// Metadata consumers only; no supported enum may be invented from an app subtype.
test('every released app has its documented supported software category',()=>{
 const live=appList.filter(app=>app.status==='live');assert.deepEqual(new Set(live.map(app=>app.slug)),new Set(Object.keys(expected)));
 for(const app of live){assert.equal(app.schemaCategory,expected[app.slug],app.slug);assert.ok(supported.has(app.schemaCategory));}
});
test('newly released Dialogos has its public category; Legion remains upcoming',()=>{
 const dialogos=appList.find(app=>app.slug==='dialogos'),legion=appList.find(app=>app.slug==='pipi-legion');assert.equal(dialogos.status,'live');assert.equal(dialogos.schemaCategory,'LifestyleApplication');assert.equal(legion.status,'soon');assert.equal(legion.schemaCategory,'GameApplication');
});
for(const component of ['AppLanding','AppsJsonLd'])test(component+' omits unknown categories instead of outputting the MobileApplication subtype',()=>{
 const src=readFileSync(new URL('../src/components/'+component+'.astro',import.meta.url),'utf8');assert.doesNotMatch(src,/applicationCategory:\s*app\.schemaCategory\s*\?\?\s*['"]MobileApplication['"]/);assert.match(src,/\.\.\.\(app\.schemaCategory \? \{ applicationCategory: app\.schemaCategory \} : \{\}\)/);
 assert.doesNotMatch(src,/aggregateRating|ratingValue|ratingCount|reviewRating/);
});
test('all supplied categories, including future games, belong to the supported enumeration',()=>{
 for(const app of appList)if(app.schemaCategory)assert.ok(supported.has(app.schemaCategory),app.slug);
 assert.ok(!supported.has('MobileApplication'));assert.ok(!supported.has('WebApplication'));
});
