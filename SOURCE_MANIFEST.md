# SOURCE MANIFEST — 2026-09-24

Base source commit before backup documentation:
`272eef8e193e72470aa90b32522a514947c893d1`

## Frontend files

| File | Blob SHA at backup | Size | Purpose |
|---|---|---:|---|
| README.md | 13c8f19829dcdcdaf85aef1dddf53d3a3f520705 | 748 B | Repo readme |
| index.html | a169a3801419f475773c4d9f099e779176f421bd | 87,974 B | Main HTML/UI |
| app.js | 989a614bb91ca2dcce735fece7d894b29ae40735 | 139,073 B | Main application logic |
| style.css | f86e22dd4db49a4c57e7cfe267d9ad3764e853b5 | 295,501 B | Main CSS |
| contractor.js | c9b5860bf9a17a7ae6e16e4f5c5fd0f66975b94b | 19,995 B | Contractor module |
| contractor.css | 7d60f515e5977d4a3844b552be8c95996e8beb54 | 22,123 B | Contractor styles |
| assets/esta-login-bg.txt | dfb2c28683326d705f9898bd4cf414095f7922f0 | 12,156 B | Login background asset |
| assets/esta-login-hero.b64 | 12b699e4b61fc61c438aaf7f1db6e5e8437726d5 | 17,154 B | Login hero base64 |
| assets/login-hero.webp | f2d0d1712fe2737d61373fed0b4c34410fbb8bde | 14,999 B | Login image |

## Backend files added to this backup branch

- FULL_SYSTEM_BACKUP_GUIDE.md
- SOURCE_MANIFEST.md
- MIGRATION_HISTORY.md
- supabase/schema_backup.sql
- supabase/functions/admin-users/index.ts
- supabase/functions/project-sync/index.ts
- supabase/functions/central-login/index.ts
- supabase/functions/admin-overview/index.ts

## Production references

- Vercel URL: https://quan-ly-ky-thuat-62thl.vercel.app/
- Supabase project ref: upcjcrycahdfroxggsdz
- GitHub repo: sivan-25/quan-ly-ky-thuat-62thl
- Main branch: main
- Backup branch: backup-2026-09-24-full-system

## Important

The backup branch contains the full current GitHub source plus backend reconstruction files.  
It does NOT embed:
- auth passwords/password hashes
- service role secrets
- all Storage image binaries
- a full PostgreSQL data dump

For data and image backup, follow FULL_SYSTEM_BACKUP_GUIDE.md.
