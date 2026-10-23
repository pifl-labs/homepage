# Archive multi-app selection review — 2026-10-23

- Removed the app select and replaced it with 14 icon/name native toggle buttons. None selected means all; selected apps form a union. Year/platform/kind intersect that union.
- Repeated `app` query parameters preserve multi-selection; legacy single app and comma-separated values are accepted. Unknown app values are ignored. App-only clear retains other filters; full reset clears all.
- Removed Web from platform choices. Four existing official-app asset records now have null platform and display “platform-unspecified assets”. Git/website custody is a source, not a release platform. All 30 event IDs and 14 app release states remain intact; no website implementation history was added.
- Kept external same-origin module scripts under the existing CSP. No security policy change.
- PIRATE local IAB actual click/keyboard checks under script-src self: Focus 6, Focus+Draw 11, iOS intersection 9, Android intersection 1, year 2026 and reload 1; Words+Log+Hello 6, Space removes Log =>4, back=>6, forward=>4.
- 320px, KO/JA/EN with 200% root text fixture: no document horizontal overflow. Buttons reflow to one column for large text and use at least 48px targets; regular mobile uses compact wrapping columns. This fixture is not native browser zoom.
- Automated suite: 525 passed; built link and localized store-transition checks passed. Remote Preview validation and screenshots reported with final PR head.
