## Goal
Confirm that `src/styles.css` contains no `@import` statements that Lightning CSS could reject, and optionally validate via a dev-server build.

## Verification Plan

1. **Read `src/styles.css`**  
   Inspect the file for all `@import` rules and confirm:
   - Only package imports (`@import "tailwindcss" source(none);`, `@import "tw-animate-css";`) are present.
   - No remote URL imports such as `https://fonts.googleapis.com/...` remain.
   - No filesystem-relative imports point to missing files.
   - All `@import` rules appear at the top of the file before other rules.

2. **Check related files**  
   Confirm Google Fonts are loaded via `<link>` tags in `src/routes/__root.tsx` (preconnect + stylesheet), so removing the CSS `@import` does not break fonts.

3. **Optional build validation**  
   Run `bun run build:dev` to confirm the dev server no longer returns 500 for `/src/styles.css` and no Lightning CSS `@import` error is emitted.

## Expected Outcome
- `src/styles.css` is compliant with Lightning CSS `@import` rules.
- No file changes are required unless a new rejected `@import` is found.
- Build completes without the previous `@import rules must precede all rules` or `ENOENT` errors.