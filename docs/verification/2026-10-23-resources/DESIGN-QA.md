# Free resource library review

Base: main 624fb30507afc8a90d8c66fe9e86ad28beba0eeb. New branch codex/free-resource-library. No production deployment authorized.

Purpose: preview and open existing free resources without installing an app. Eight resource groups; 14 file variants (13 PDFs + 1 PNG), 4 instruction languages. The UI is translated in KO/EN/JA; original worksheets are not translated or regenerated.

Sources: homepage public/assets/printables and existing pipi-worlds public/assets/marketing originals, read only. Catalog stores original SHA256; preview JPGs are rendered from PDF page 1 with pdftoppm, PNG resized with sips. No generated replacement artwork. Existing PDF/text files and public paths unchanged. External originals/guide URLs remain on PiPi Worlds. The company portfolio is excluded.

UI: dedicated /{lang}/resources/, purpose/instruction-language/primary-format intersection filters, URL state/popstate and locale query preservation; home has 3 compact samples; app pages link only their relevant library entries. Navigation/footer add library separately from archive and living tools.

Automated: npm run build PASS (166 pages); npm test PASS (526); npm run test:built PASS (45 localized home/app pages, 180 store links + Draw/store-transition checks). Historical resource tests migrated from retired English-only panels to shared catalog; original Words file hash assertions retained.

Live local browser: Japanese language -> 1 result; +PNG -> empty; Back -> 1; reset -> 8. Visual review of local KO desktop and EN 320px at 130% shows readable originals and controls. Further viewport/remote checks recorded in follow-up below.

Downloads: earlier HTTP client returned 403; not interpreted as missing files. Current authorized normal-browser recheck: IAB opened PDF URL but rendered blank viewer; Chrome PDF navigation timed out. PDF download success remains UNVERIFIED, not a 404 claim. Local original bytes and built links verified. No access controls changed or bypassed.

Release gate: draft review only. No main merge or production deployment. Do not equate local build success with all matrix cells or external download availability.
