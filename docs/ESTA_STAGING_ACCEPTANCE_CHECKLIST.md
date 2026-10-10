# ESTA — Staging verification checklist (production-isolated)

Status: **BLOCKED — no confirmed independent staging database** (2026-10-10).

## Safe infrastructure discovery
- The production ESTA Vercel project uses `main`; current optimization is a separate Preview on `optimize-esta-safe`.
- A Supabase project with the app's production URL is active. Supabase returned **no development branches** for that project.
- Another Supabase project named for 130 HH exists but is inactive. **Do not use, reset, restore, copy, write to, or delete it until its owner explicitly confirms its purpose.**
- No Vercel custom staging environment was found.
- Source browser screenshots and API flows are tested with fully mocked data. This is not a substitute for real authenticated CRUD.

## Setup only after owner confirms billing and organization
1. Request explicit owner choice of Supabase organization and confirmation of the displayed cost for a new dev branch/project. Never provision one without this authorization.
2. Create a brand-new isolated database without copying production user/task/media data. Apply the exact checked-in application migrations and security policies. Verify schema and permissions with synthetic accounts only.
3. Create separate test users for Admin and four project-scoped technical roles. Do not reuse production email addresses, passwords, JWTs, service-role keys or API sessions.
4. Create a separately scoped Vercel preview/staging environment; inject only *staging* publishable credentials. Explicitly confirm browser and server endpoints point to staging before any write tests.
5. Keep service-role keys server-side and mark all CI logs/artifacts as potentially sensitive; never upload secrets or real user details.

## Required nonproduction acceptance tests
- Admin: create/assign/edit tasks for 62 THL, 68 PĐL, 127 HH, 130 HH; return navigation without mixing data.
- Tasks: create/edit/complete/cancel; verify completed tasks can have result without mandatory note; verify actual save acknowledgement and error rollback.
- Inventory: stock in/out, failed/duplicate concurrent mutation, link task to material use; validate opening+in-out=closing without negatives.
- Incidents/inspections/maintenance/contractors: add and edit, change project and ensure no stale data.
- Energy: EVN1/EVN2 measured separately at 68 PĐL; XLNT units m³; date filtering.
- Images: camera/upload/edit/remove on mobile, confirm only staging Storage is used.
- PDFs: compare actual exported text, signatures, page layout and images to golden reports with 1+2+3 photos.
- Authorization: viewer is read-only and never reaches write endpoints; technical users can access only assigned projects.
- Performance: same viewport/device/network profile before and after, repeat each operation at least 10 times; capture median and p95 for nav, save acknowledgement, network requests and PDF generation.
- Security: test only synthetic staging data. Delete or reset test data only in the **new staging environment** and only after explicit scope check.

## Production release gate
- Latest JS/PDF suite passes.
- Desktop/mobile visual comparison passes (significant pixel and layout checks).
- All staging CRUD/permission flows pass without live production data.
- A measured before/after timing report is attached.
- Owner reviews Preview and explicitly approves merging PR #29 and redeploying production.
- Keep a rollback commit identified and retain the previous Vercel deployment.

**Never treat a successful Vercel Preview build as proof of functional correctness on production data.**
