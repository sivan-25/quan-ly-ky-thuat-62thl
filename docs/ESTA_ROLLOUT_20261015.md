# ESTA rollout / 2026-10-15

User approved exactly eight improvements: maintenance calendars/cycles/status, equipment profiles, completed-work A4 certificate, task status/progress, mobile/camera/PWA, central per-project performers, idempotent maintenance-task-inventory links, and selected-item/combined PDFs. No other modules are authorized for redesign.

## Sequential rollout
1. **127HH**: pilot and test upgraded systems catalog first. Audit maintenance-model compatibility, task states, camera and mobile. Obtain acceptance.
2. **130HH**: compare existing systems catalog with 127HH pilot; retain the 100 existing maintenance plan items and completion certificate behavior.
3. **62THL**: only after acceptance, adapt legacy maintenance and role-specific workflows.
4. **68PĐL**: only after acceptance, retain existing 65 maintenance plans, dual-EVN meters and XLNT.

## Safety / recovery
- Source code before change: branch `backup/esta-before-4project-rollout-20261015` @ `a83b1d33f39b2a1ae7cedd42238478383d44ce39`.
- All changes initially on `feature/esta-four-project-rollout-phase1-20261015`; do **not** merge to main before acceptance and checks.
- Source backup is **not** a production database backup. Before any production schema/data change, obtain an independent, restorable Supabase backup and test restoration. Existing project_snapshot_history is audit, not a replacement for database backups.
- Keep the existing 127HH/130HH equipment-table RLS (one project each), project-scoped user permissions and Audit. Do not copy data between project IDs.
- Run Node, PDF regression, desktop widths 1280+, mobile widths 360/390/430, Android/iOS camera and PWA checks; compare counts and sample PDF screenshots.
- Database and production remain untouched by this phase-one branch.
## Progress
Phase 1 stages only equipment screen navigation and existing pilot modules. All other approved improvements remain pending until test/acceptance gates.


## Shared building systems: four-project consolidation
- One shared `building-systems.js` and `building-systems.css`; duplicate 127HH/130HH modules removed on feature branch. Four projects share identical UI, fields and workflows.
- 127HH continues using existing `building_equipment_profiles_127`; 130HH, 62THL, 68PĐL use `building_equipment_profiles`, always filtering by `building_id`.
- Supabase RLS policy expansion for 62THL and 68PĐL is **STAGED ONLY**, not applied before a verified independent backup. Until then, their test preview writes may be rejected.
- Maintenance/certificate/other screens remain separate pending scope-safe refactor. No production release yet.
