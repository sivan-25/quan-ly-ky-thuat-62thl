# ESTA — Safe Optimization Audit (2026-10-10)

## Scope and provenance

**Status: source audit, passing isolated CI regressions, and one narrowly scoped unmerged request-coalescing improvement. Production UI/data and measured runtime speed remain unchanged/unverified.**

- User-specified repo: `sivan-25/quan-ly-ky-thuat`, `main` at `63d6534bbbd9ecea36bb5090b056f004b8bb7ebc`.
  - Git tree has only `README.md` and `index.html`; the latter says `QLKT5 — Báo cáo kỹ thuật` and uses GitHub's contents API. It is **not** the full ESTA project source.
- Vercel-linked ESTA application repo (confirmed by user-supplied Vercel dashboard screenshot): `sivan-25/quan-ly-ky-thuat-62thl`, `main` at `63aebcc166b09e8fb81b3b858b7237e69021fe1e`.
  - Contains the Admin/project UI, Supabase integration, PDF API, 4-project flows, and automated tests.
  - Vercel dashboard UI shows the project `esta-property-operations` linked to this GitHub repository; however, the exact production commit SHA has not yet been verified by Vercel API.
- Vercel project `esta-property-operations` (`prj_8YhYZ4yScXp1NH0xBKDGb1ma8hKd`) was inspected successfully without explicit team scope. Production deployment `dpl_GBfPnn3cs3EF3g6LB9MFZqgaHYw6` is `READY` and targets `main` SHA **`63aebcc166b09e8fb81b3b858b7237e69021fe1e`**, exactly the original branch baseline. Preview is separate.
- This audit uses GitHub file contents and the Ponytail source rules. GitNexus docs were reviewed, but its CLI/MCP graph **was not run**; it is not part of this patch. Its PolyForm Noncommercial licensing requires a separate use-rights check.

**Safety decision:** work only on `optimize-esta-safe` within the linked source repo. Non-runtime guardrails and tests plus a minimal runtime snapshot-polling change are in DRAFT PR; no production release. Do not merge, deploy, modify Supabase data, or silently assume this is the production source.

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

**Runtime scope:** only `pollProjectSnapshot` in `app.js` was adjusted. No HTML, CSS, other JavaScript flows, Python/PDF templates, authentication, RLS, schema, or production data was changed. This is an unmerged Preview-only patch.

## Baseline & validation status

| Validation | Current status |
| --- | --- |
| GitHub tree / static source inspection | Completed |
| GitNexus graph indexing / impact | Not run (tool unavailable; license check pending) |
| Ponytail minimal-change review | Applied to proposed workflow; source rules inspected |
| Production Vercel SHA / Git link verification | **Confirmed:** `sivan-25/quan-ly-ky-thuat-62thl` `main` `63aebcc...` `READY`, domain `esta-property-operations.vercel.app` |
| `npm ci --ignore-scripts && npm test` | **PASS** in GitHub Actions; test-only JSDOM `matchMedia` fixture correction |
| Python unit tests | **PASS**: 11 tests; PDF fixture benchmark: 16 tasks, 21 images, 7 pages, 1.29 MB, ~0.97 s |
| Desktop/mobile screenshots | Not collected |
| Supabase CRUD/regression | Not executed (live data protection) |
| PDF golden-file compare | Not run |
| Lighthouse/Network/INP/LCP or save latency | Not measured |
| Vercel preview / production | Production and preview deployment metadata verified via Vercel API. No production deployment performed for this PR. |

Do not advertise performance gains until measurements exist.

## Prioritized safe execution plan

**P0 — Correct source of truth.**
- Source repo, branch, deployed production SHA confirmed. Root directory was not independently established, but runtime repo/commit match source baseline.
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

Only report real-world speed gains after measured before/after timing and visual regression tests. The initial request-coalescing patch demonstrably reduces *overlapping same-session refresh calls* under fixture conditions, but no end-user speed improvement has been measured.

## CI baseline evidence (2026-10-10)

- Initial run: [38015488736](https://github.com/sivan-25/quan-ly-ky-thuat-62thl/actions/runs/38015488736). PDF and asset-reference checks passed; JS suite failed only because JSDOM did not implement `window.matchMedia`.
- Corrected **test-only fixture**, then reran: [38015557211](https://github.com/sivan-25/quan-ly-ky-thuat-62thl/actions/runs/38015557211). Both JS and PDF jobs completed successfully. No runtime code was modified.
- This establishes a regression-test baseline; it does **not** measure or claim real-world frontend speed improvement. No browser visual/performance baseline exists yet.

## Safe runtime change — project snapshot polling (2026-10-10)

- In `app.js`, `pollProjectSnapshot` now coalesces overlapping `projectSync("get")` operations per project **and navigation session**. Two simultaneous interval/focus triggers produce one request; a newly visited project is not blocked by a stale in-flight poll.
- The project ID is captured at request start; late responses are ignored if the project or navigation sequence has changed. Existing data version checks, polling interval (5 s), visibility/Admin-page guards, and normal refresh behavior remain in place.
- Added `tests/project-polling.test.cjs` (mock-only; no live Supabase writes), wired into `npm test` to check duplicate polls, project switch, A→B→A return, exceptions/retry, hidden/Admin skip.
- Initial CI checks (prior to A→B→A extension): [38016027790](https://github.com/sivan-25/quan-ly-ky-thuat-62thl/actions/runs/38016027790) passed JavaScript and PDF jobs. The expanded test must also pass before release.
- **No measured user latency or transfer-size improvement claimed.** This specific change cuts redundant concurrent polling requests, not the 5-second normal refresh cadence.

## Phase 2 — operations data fetching & stock calculation (2026-10-10)

**Runtime changes: `demo-lab.js` only.** No HTML, CSS, database schema, RLS, API contracts, PDFs, or production business records modified.

1. `demoLoad(force=false)` now reuses an in-flight promise for the same project and navigation session, so simultaneous UI callers use one batch of **8 Supabase table reads** instead of issuing duplicate batches. Reads continue fetching the same eight tables and return the same `demoCache` shape.
2. Explicit `demoLoad(true)` refreshes still initiate a fresh batch, as required after writes to incidents, checklists, equipment, and inventory. Non-forced UI callers join the latest in-flight refresh rather than reading stale cached values during that refresh.
3. A monotonically increasing request ID blocks an older batch from overwriting the cache after a newer refresh or a project switch. The new promise map is cleaned after completion or handled failures.
4. `demoStock(m)` now accumulates matching transactions with a single loop, avoiding an intermediate array produced by `filter()`. Opening stock, incoming/outgoing arithmetic and ID comparisons remain unchanged.

**Verification**

- Isolated test `tests/project-operations-loading.test.cjs` verifies concurrent loads, fresh/forced reads, cached results, A→B→A navigation, stale response prevention, retry on a failed query, inactive app checks, and inventory arithmetic.
- [GitHub Actions run #38016644457](https://github.com/sivan-25/quan-ly-ky-thuat-62thl/actions/runs/38016644457): both JS and Python/PDF regression jobs **passed**.
- GitHub/Vercel build of preview from `7f5c335397f1c5080df96f05ddbb694064a924f1`: **READY**. The production `main` branch remains untouched.
- Controlled fixture result: two simultaneous ordinary initial calls cause **8** table requests rather than **16**; a forced load still performs all **8** tables. This is a count from mocked tests, **not a measured real-network benchmark**.

**Open release gates**

- Browser screenshot visual comparison on actual mobile & desktop breakpoints, and authenticated operations smoke checks against isolated nonproduction data are still needed.
- Actual before/after network transfer, navigation, input responsiveness and save latency are not measured. Avoid claiming a percentage speedup.
- No merge or release to production until the user's explicit approval.
