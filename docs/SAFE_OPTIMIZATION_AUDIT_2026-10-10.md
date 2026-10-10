# ESTA — Safe Optimization Audit (2026-10-10)

## Scope and provenance

**Status: source-level audit with passing isolated CI regressions, NOT a measured production performance optimization.**

- User-specified repo: `sivan-25/quan-ly-ky-thuat`, `main` at `63d6534bbbd9ecea36bb5090b056f004b8bb7ebc`.
  - Git tree has only `README.md` and `index.html`; the latter says `QLKT5 — Báo cáo kỹ thuật` and uses GitHub's contents API. It is **not** the full ESTA project source.
- Vercel-linked ESTA application repo (confirmed by user-supplied Vercel dashboard screenshot): `sivan-25/quan-ly-ky-thuat-62thl`, `main` at `63aebcc166b09e8fb81b3b858b7237e69021fe1e`.
  - Contains the Admin/project UI, Supabase integration, PDF API, 4-project flows, and automated tests.
  - Vercel dashboard UI shows the project `esta-property-operations` linked to this GitHub repository; however, the exact production commit SHA has not yet been verified by Vercel API.
- Vercel project discovery identified `esta-property-operations`, project ID `prj_8YhYZ4yScXp1NH0xBKDGb1ma8hKd`. Project/deployment inspection was denied (HTTP 403 for the connected scope). **The GitHub repository link is confirmed from Vercel UI; the production commit SHA could not be verified via API.**
- This audit uses GitHub file contents and the Ponytail source rules. GitNexus docs were reviewed, but its CLI/MCP graph **was not run**; it is not part of this patch. Its PolyForm Noncommercial licensing requires a separate use-rights check.

**Safety decision:** work on `optimize-esta-safe` within the linked source repo; add only non-runtime audit guardrails, a static smoke check, a test-only fixture correction, and CI verification. Do not merge, deploy, modify Supabase data, or silently assume this is the production source.

## Source inventory (candidate repo)

At audited `main` tree: **67 files, 5,891,225 bytes of tracked file payload** including fonts and documentation. These are uncompressed source sizes, **not measured browser transfer sizes**.

| Item | Observation |
| --- | --- |
| JS modules outside tests | 10 files, 625,986 tracked bytes |
| Stylesheets | 13 files, 1,173,342 tracked bytes |
| `index.html` | ~157 KB tracked bytes, 2,524 source lines |
| Entry HTML loading | 13 local CSS references; 10 local JS references; 2 external JS references (XLSX and QRCode) |
| `app.js` | 3,703 lines; 56 `addEventListener` appearances; 30 `setTimeout` appearances |
| `demo-lab.js` | 1,770 lines; separate project/inventory/task-save behavior |
| `style.css` | 10,312 lines, 107 `@media` tokens, ~4,640 `!important` tokens |
| `unified.css` | 5,286 lines, ~3,366 `!important` tokens |
| Python PDF endpoint | `api/esta_report.py`, about 47.9 KB |

Counts above are static text scans. Multiple rules for the same selector can be **intentional overrides**, not proof of dead code.

## Confirmed hotspots and constraints

1. **CSS cascade sensitivity.** Thirteen ordered stylesheets are loaded in `index.html` with numerous project/mobile overrides. Removing, deduplicating, reordering or minifying rules without visual-diff baselines can change UI. No such change was made.
2. **Repeated remote synchronization.** `app.js` calls `setInterval(pollProjectSnapshot, 5000)` around line 666, with visibility/focus refresh. `command-center.js` performs another periodic refresh every 60,000 ms near line 395. Investigate request timing/cancellation and unnecessary reads with network traces before changing cadence.
3. **Two task-save paths are not interchangeable.** `app.js` around lines 1422–1485 saves a local task then waits for remote acknowledgment for mobile quick-save. `demo-lab.js` around lines 720–770 performs a blocking server-side inventory reconciliation before updating local task data. A naive shared-save refactor could bypass stock checks or produce misleading success states.
4. **Acknowledgment feedback is intentional.** Both save paths have a 100 ms pause after showing `✓ Đã lưu` (see `app.js` ~1454 and `demo-lab.js` ~753). Do not remove this blindly; verify feedback visibility and measure actual network/UI latency separately.
5. **Navigation/render wrappers.** `command-center.js` wraps `showModule`, `applyBuildingUI`, `render`, `renderHomeDashboard`, and `openAdminPortal` to refresh cross-page alerts. Eliding wrappers without a dependency map would break Admin/project alerts.
6. **Eager third-party scripts.** `index.html` loads XLSX and QRCode external scripts alongside several app modules. These are *candidates* for on-demand loading only after verifying every use, order requirement, offline behavior and mobile/PDF/QR workflow.
7. **PDF and media are critical paths.** `api/esta_report.py`, `reporting/*`, `photo-annotator.js`, and storage upload paths affect layout, signatures, photos and database references. Do not alter compression or template structure without golden-file comparisons.

## What is already changed on this branch

- `AGENTS.md`: repository-specific conservative edit/verification rules inspired by Ponytail, plus conditional guidance for GitNexus.
- `tests/static-assets.test.cjs`: a small dependency-free check that locally referenced JS/CSS files in `index.html` exist, and reports their raw tracked sizes.
- This audit report.
- `.github/workflows/esta-safe-optimization.yml`: isolated GitHub Actions checks for existing JS and PDF regressions.
- `tests/task-completion.test.cjs`: JSDOM fixture now mocks missing browser `matchMedia` (the original app is untouched).

**No runtime HTML, CSS, JavaScript, Python, APIs, PDF templates, authentication, RLS, schema, or data was changed.**

## Baseline & validation status

| Validation | Current status |
| --- | --- |
| GitHub tree / static source inspection | Completed |
| GitNexus graph indexing / impact | Not run (tool unavailable; license check pending) |
| Ponytail minimal-change review | Applied to proposed workflow; source rules inspected |
| Production Vercel SHA / Git link verification | Vercel dashboard screenshot confirms linked GitHub repo; production SHA inaccessible via Vercel API 403 |
| `npm ci --ignore-scripts && npm test` | **PASS** in GitHub Actions; test-only JSDOM `matchMedia` fixture correction |
| Python unit tests | **PASS**: 11 tests; PDF fixture benchmark: 16 tasks, 21 images, 7 pages, 1.29 MB, ~0.97 s |
| Desktop/mobile screenshots | Not collected |
| Supabase CRUD/regression | Not executed (live data protection) |
| PDF golden-file compare | Not run |
| Lighthouse/Network/INP/LCP or save latency | Not measured |
| Vercel preview / production | Preview reported success via GitHub commit status; no authenticated Vercel deep inspection or production deployment performed |

Do not advertise performance gains until measurements exist.

## Prioritized safe execution plan

**P0 — Correct source of truth.**
- Repository link is verified by the user's Vercel dashboard screenshot. Verify the exact production commit and root directory in Vercel before runtime changes; confirm it matches the tested base SHA.
- Use a **separate isolated fixture/test database** for write tests. Do not use production credentials for CRUD smoke testing.

**P1 — Freeze baseline and add regression protection.**
- Run `npm ci && npm test`, `python3 -m unittest discover -s tests -v`, `node tests/static-assets.test.cjs`.
- Compare browser screenshots at 320, 390, 768, 1024 and 1440 px for each Admin/project screen, modal, and work/energy/PDF path. Compare PDF page order, fonts, photo sizing and field layout.
- Measure asset transfer sizes, navigation, Core Web Vitals and save acknowledgment under the same hardware/network.

**P2 — Target measured hotspots in small PRs.**
- Profile navigation refresh, project snapshot polling and unnecessary requests; avoid increasing read volume simply to make updates *seem* faster.
- Trace XLSX/QRCode usage; experiment with lazy loading on a separate branch and verify the related functions.
- Investigate duplicated CSS blocks only with cascade-aware tooling and visual equivalence. Preserve stylesheets order.
- Review image upload and PDF generation with representative real-sized *non-production* fixtures.

**P3 — Review and release.**
- Require unchanged behavior and appearance, no new errors, successful targeted tests and build, measured performance impact, and rollback plan.
- Keep the PR draft until verified; do **not** merge into `main` or deploy production without explicit user approval.

## Exit criteria for a real optimization PR

Only report “optimized” when there are actual runtime diffs, measurements before/after, documented test results, confirmed deployment origin, and evidence that all 4 projects and Admin keep their layout, workflows, permissions, data semantics and ESTA PDF standard.

## CI baseline evidence (2026-10-10)

- Initial run: [38015488736](https://github.com/sivan-25/quan-ly-ky-thuat-62thl/actions/runs/38015488736). PDF and asset-reference checks passed; JS suite failed only because JSDOM did not implement `window.matchMedia`.
- Corrected **test-only fixture**, then reran: [38015557211](https://github.com/sivan-25/quan-ly-ky-thuat-62thl/actions/runs/38015557211). Both JS and PDF jobs completed successfully. No runtime code was modified.
- This establishes a regression-test baseline; it does **not** measure or claim real-world frontend speed improvement. No browser visual/performance baseline exists yet.
