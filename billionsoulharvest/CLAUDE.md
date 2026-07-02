@AGENTS.md

## Production Safety Rules

### NEVER run destructive database commands against production
- `supabase db reset` — wipes ALL data including auth users. Only use for local dev.
- `DROP TABLE`, `DELETE FROM` (without WHERE), `TRUNCATE` — never against production.

### NEVER run `supabase db push` without explicit user confirmation
- Migrations to production must be confirmed by the user before executing.

### After local `supabase db reset`, always re-create the admin user
1. Run `supabase db reset` (local only)
2. Sign up via the app or create user via Supabase Dashboard (Auth > Users)
3. Run the SQL to grant admin role: `UPDATE profiles SET role = 'admin' WHERE id = '<user-id>';`
4. Remind the user that all data (including auth users) was wiped.

### Environment awareness
- Before running any database command or script, verify whether you are targeting **local** or **production**.
- Check for `--linked`, `--project-ref`, or production connection strings before executing.

### Migration script safety
- Never run `migrate-from-csv.ts` against production without explicit user confirmation.
- Always confirm the target environment before running any data migration.
