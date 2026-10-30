# AGENTS.md — ESTA Web App development policy

This file guides AI-assisted changes to this repository. Read `README.md` and `docs/REPO_SOURCE_INTEGRATION.md` before making changes.

## Scope and source priority
1. Treat this repository (`sivan-25/quan-ly-ky-thuat-62thl`) as the source of truth for the currently deployed ESTA web application.
2. Review the user's other connected repositories as potential references, **not** as automatically compatible dependencies. See the source map.
3. Prefer small, scoped changes; do not replace the application with a different framework or import whole repositories without explicit review.
4. For new features, identify relevant prior implementation first, verify it is licensed for the intended use, then adapt the smallest compatible piece.

## Preserve working behaviors
- Preserve Supabase Auth, session handling, RLS, existing project boundaries, APIs, bucket and schema.
- Do not invent users, credentials, backend endpoints or fixture records in production.
- Default to piloting changes on project 130 first; extend to other projects only after acceptance.
- Maintain mobile/tablet/desktop responsive behavior, readable buttons/text, current theme and proper Vietnamese labels.
- Support immediate UI updates where safe; offline work must queue and reconcile changes safely rather than falsely reporting that remote data is saved.
- No new unreviewed secrets or database changes.

## Quality gates (all mandatory before release)
1. **Research:** Determine existing files, dependencies, business constraints and source-license conditions.
2. **Design:** State affected screens/project IDs, state flows, data ownership, rollback and tests.
3. **Build:** Implement in a short-lived branch, with minimal diff.
4. **Independent review:** Check authorization, input safety, regression risks, third-party licensing and scope.
5. **Test:** Run `npm ci && npm test` and `python3 -m unittest discover -s tests -v`, plus browser tests of login, mobile, form save, error states, and project 130; do not claim tests pass without actual evidence.
6. **Release:** Merge/deploy only when checks pass and the owner approves. The default branch deploys automatically via Vercel.

## Failure & rollback
- On FAIL, stop deployment, record failing test and affected files, return to responsible stage.
- Do not let the creating Agent self-approve.
- Keep the previous functioning commit. Revert changes on failure; never reset real Supabase data as a rollback substitute.
- Never change production login or cross-project permissions as an incidental feature edit.

## Source map
See `docs/REPO_SOURCE_INTEGRATION.md` for all seven repositories and their appropriate uses.
