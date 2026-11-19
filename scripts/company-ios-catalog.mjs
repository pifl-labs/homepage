import assert from 'node:assert/strict';
const LANGS=new Set(['ko','ja','en']);
// PiFl Labs Co., Ltd. 의 App Store 개발자 페이지(id 는 BaseLayout Organization sameAs 와 같다).
// 국가 경로를 넣지 않아 방문자의 스토어(KR·JP·US 등)로 열리게 한다 — 개별 앱 링크(apps.apple.com/app/id…)와 같은 방식.
const APPLE_DEVELOPER_ID='1893574694';
/** Public company catalog on the App Store, not an app install or an attributed conversion. */
export function companyIosCatalogUrl(lang){
 assert(LANGS.has(lang),'Unsupported catalog locale');
 return `https://apps.apple.com/developer/id${APPLE_DEVELOPER_ID}`;
}
/** Only the exact company URL on a homepage may use this separate type.
 * Individual app links keep all existing original-destination/attribution checks. */
export function assertCompanyIosCatalogAnchor(attrs,lang,isHome){
 assert.equal(isHome,true,'Company catalog is homepage-only');
 assert.equal(attrs['data-company-ios-catalog'],'true','Explicit catalog marker required');
 assert.equal(attrs.href,companyIosCatalogUrl(lang),'Exact public company developer path required');
 assert.equal(Object.hasOwn(attrs,'data-store-link'),false,'Company catalog is not an app installation destination');
 assert.equal(attrs.target,'_blank');
 assert.equal(attrs.rel,'noopener');
 assert(attrs['aria-label']?.includes('PiFl Labs')&&attrs['aria-label']?.includes('App Store'),'Named company/platform action required');
 return true;
}
