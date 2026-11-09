import assert from 'node:assert/strict';
const LANGS=new Set(['ko','ja','en']);
/** Public company catalog, not an app install or an attributed conversion. */
export function companyAndroidCatalogUrl(lang){
 assert(LANGS.has(lang),'Unsupported catalog locale');
 return 'https://play.google.com/store/apps/developer?id=PiFl%20Labs&hl='+lang;
}
/** Only the exact company/locale URL on a homepage may use this separate type.
 * Individual app links keep all existing original-destination/attribution checks. */
export function assertCompanyAndroidCatalogAnchor(attrs,lang,isHome){
 assert.equal(isHome,true,'Company catalog is homepage-only');
 assert.equal(attrs['data-company-android-catalog'],'true','Explicit catalog marker required');
 assert.equal(attrs.href,companyAndroidCatalogUrl(lang),'Exact public company path/id/locale/query required');
 assert.equal(Object.hasOwn(attrs,'data-store-link'),false,'Company catalog is not an app installation destination');
 assert.equal(attrs.target,'_blank');
 assert.equal(attrs.rel,'noopener');
 assert(attrs['aria-label']?.includes('PiFl Labs')&&attrs['aria-label']?.includes('Google Play'),'Named company/platform action required');
 return true;
}
