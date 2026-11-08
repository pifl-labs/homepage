# Free resource library review

Base: main 624fb30507afc8a90d8c66fe9e86ad28beba0eeb. New branch codex/free-resource-library. No production deployment authorized.

Purpose: preview and open existing free resources without installing an app. Eight resource groups; 14 file variants (13 PDFs + 1 PNG), 4 instruction languages. The UI is translated in KO/EN/JA; original worksheets are not translated or regenerated.

Sources: homepage public/assets/printables and existing pipi-worlds public/assets/marketing originals, read only. Catalog stores original SHA256; preview JPGs are rendered from PDF page 1 with pdftoppm, PNG resized with sips. No generated replacement artwork. Existing PDF/text files and public paths unchanged. External originals/guide URLs remain on PiPi Worlds. The company portfolio is excluded.

UI: dedicated /{lang}/resources/, purpose/instruction-language/primary-format intersection filters, URL state/popstate and locale query preservation; home has 3 compact samples; app pages link only their relevant library entries. Navigation/footer add library separately from archive and living tools.

Automated: npm run build PASS (166 pages); npm test PASS (526); npm run test:built PASS (45 localized home/app pages, 180 store links + Draw/store-transition checks). Historical resource tests migrated from retired English-only panels to shared catalog; original Words file hash assertions retained.

Live local browser: Japanese language -> 1 result; +PNG -> empty; Back -> 1; reset -> 8. Visual review of local KO desktop and EN 320px at 130% shows readable originals and controls. Further viewport/remote checks recorded in follow-up below.

Downloads: earlier HTTP client returned 403; not interpreted as missing files. Current authorized normal-browser recheck: IAB opened PDF URL but rendered blank viewer; Chrome PDF navigation timed out. PDF download success remains UNVERIFIED, not a 404 claim. Local original bytes and built links verified. No access controls changed or bypassed.

Release gate: draft review only. No main merge or production deployment. Do not equate local build success with all matrix cells or external download availability.

Follow-up local QA: KO/EN/JA at 320/375/768/1280/1920 each measured at the actual requested viewport, horizontal overflow false for all 15 cells. KO 320px built-page fixture with html font-size 32px (200%) preserved filter operation and width; EN 320px site 130% and JA desktop 130% visually inspected. KO light desktop and dark mobile cards inspected, including image proportions, line wrapping, link touch targets. Direct filtered hash link initially scrolled before hidden cards settled; client now scrolls after restoring filters. No global release PASS claimed for uninspected combinations.

## Follow-up: filter arrow consistency

Inspected the supplied screenshot pixels and exact c70c4bc Cloudflare preview. The control is a native select, not a summary marker. All three resource selects had appearance:auto, no background image and 9.6px right padding; their page CSS was loaded and browser console had no errors. The archive explicitly styles a 16px chevron. This is inconsistent native styling, not evidence of missing CSS/CSP blocking.

Resource selects now match archive chevrons (16px, 0.8rem inset, 2.4rem reserved text space), surface, strong border and 10px radius. Native semantics remain; forced-colors retains native arrows. No new script or asset request. Home branding typography remains distinct; shared header/body fonts, palette, left-aligned content, cards and link directions were visually compared on home, Focus detail, archive and resources.

Validation: build 166 pages, all 526 tests and built-link checks pass. Actual PIRATE local browser: KO 375px, EN/JA 320px, keyboard Tab with visible 3px focus ring, and 320px/200% font fixture (not OS text scaling): no horizontal overflow; select text and chevron remain separate. Fixture removed. Native OS popup rendering/forced-colors was not cross-platform tested.

Download follow-up completed before this styling change: all 14 PDF/PNG downloads through the allowed browser succeeded and SHA256 matched catalog originals. 11 unique text companions matched rendered text; two activity guides opened. Earlier automated HTTP403 was not treated as missing material.
