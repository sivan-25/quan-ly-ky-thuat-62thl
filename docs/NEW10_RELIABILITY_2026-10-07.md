# NEW10 reliability follow-up — 2026-10-07

Scope: `pilot-new10-v1` in `sivan-25/quan-ly-ky-thuat-62thl`.
Baseline: `a0f132d88c5e5c7be99977ac904a974300a3a062`.
Production `main` is not part of this change.

## Changes

- Preserve changes enqueued while a request is in flight; process mutations in order. A failed delete cannot be overtaken by later edits. Web Locks serialize queue writes and drains across tabs.
- Associate new pending mutations and images with the signed-in account. Unowned legacy entries remain stored until the user explicitly recovers them via **Đồng bộ ngay**.
- Overlay pending edits/deletes on cloud snapshots; ignore responses that predate an in-flight queue change or a project switch.
- Retain offline image bytes and uploaded reference until the server acknowledges attachment. A retry reuses the existing uploaded file.
- Keep energy form values and project identity captured at submission, including during slow uploads and project navigation.
- Make UI decoration idempotent and avoid rebuilding identical notification content, eliminating the observer feedback cycle.
- Reject impossible calendar dates and blank numeric readings while permitting zero.
- Protect NEW10 PDF version numbers with a partial unique database index, retry metadata collisions, recover committed records after a lost response, and preserve private Storage/RLS.
- The sync indicator supports click, Enter and Space to retry on desktop/mobile.

## Verification

- Existing ESTA regression suite passed before and after the changes.
- Seven new Node reliability tests cover queue concurrency, ordering, account isolation, pending snapshots, invalid input and PDF retry/recovery.
- Local browser checks: 39 passed and 3 desktop skips; two additional energy-navigation checks passed (desktop + Pixel 7 emulation).
- Browser fixtures use simulated authentication/network responses. They do not prove a live signed-in Supabase upload.
- Database duplicate-version test passed in a rolled-back transaction, including null report periods; no test report is retained.
- The existing CI workflow runs Desktop Chromium, Pixel 7 Chromium and iPhone 14 WebKit for each pilot commit.
- Supabase security advisors showed no new findings after the index migration; the two pre-existing bootstrap/password-protection notices remain outside this change.

## Deployment observation

At audit start the branch head's Vercel status was `failure` with `upgradeToPro=build-rate-limit`, while the preview alias still served `e7207763bd1cdbbfafa2e499698f721406cd1004` (READY).
Verify the exact follow-up commit's deployment status before describing it as live. Do not change the billing plan, switch projects or merge production to bypass the limit.
