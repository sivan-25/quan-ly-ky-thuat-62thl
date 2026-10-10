# ESTA — Safe AI coding guardrails

These instructions apply to this repository's code changes and reviews.

## Preserve product behavior
- Do not modify the production branch, deploy production, or run writes/deletes/migrations against live Supabase without explicit approval.
- Preserve the exact HTML structure, desktop/mobile presentation, CSS cascade, colors, labels, positioning, workflow, PDF format, API contracts, data schemas, authorization, and the four active projects: 62 THL, 68 PĐL, 127 HH, 130 HH.
- Be especially careful with `app.js`, `demo-lab.js`, `command-center.js`, `api/esta_report.py`, the ordered CSS stylesheets, and cache-busting URLs in `index.html`.
- Never equate “saved to localStorage” with “acknowledged by Supabase.” Do not report success before the relevant server response.
- Do not drop validation, accessibility, error handling, rollback protection, or image cleanup to shorten code.

## Before editing
1. Confirm the intended repository, branch, baseline commit, and actual Vercel deployment origin. If production provenance cannot be confirmed, disclose this and do not claim changes are production-equivalent.
2. Follow the Ponytail approach: read and trace the real flow first, check for an existing solution, prefer platform features and current dependencies, then make the smallest correct change.
3. Search all readers/callers of modified functions, including Admin, project pages, mobile, image/PDF handlers, and task inventory reconciliation.
4. Treat GitNexus as **optional development-only analysis tooling**. Check its PolyForm Noncommercial license and environment compatibility before installation/use; it is not a dependency of ESTA. Use its impact map only if lawful and available; otherwise perform a manual call/dependency map.
5. Record an observable baseline (tests, screenshot comparisons, bundle sizes, response timing) before claiming improvement.

## During editing
- Work only on a dedicated feature branch with reviewable commits; avoid mass reformatting and extra dependencies.
- Keep CSS cascade order and media-query behavior unchanged unless visual-regression tests confirm equivalence at 320, 390, 768, 1024, and 1440 px.
- Optimize measured bottlenecks, not arbitrary source-line counts. Do not remove a duplicate-looking selector/function without impact and behavior evidence.
- Test all four projects and Admin for create/edit/delete, task completion and linked inventory, authorization, syncing, media, navigation, and ESTA-standard PDF.
- Never modify the database, production Auth/RLS/Storage, or live business data from automated tests.

## Verification
- Project test commands: `npm ci && npm test` and `python3 -m unittest discover -s tests -v` in a suitably isolated environment.
- Extra dependency-free local asset smoke check: `node tests/static-assets.test.cjs`.
- Compare screen captures and PDFs before/after where possible. Report precisely which checks ran and their results; never claim an unrun build, test, or performance measurement passed.
- Submit a **draft PR**; merge/deploy only after the user's explicit approval.
