@AGENTS.md

## Production Safety Rules

### NEVER run `supabase db reset` — not even locally
- `supabase db reset` wipes ALL data including auth users and imported contacts. **Do not run it.**
- Use `supabase migration up` to apply new migrations without losing data.
- `DROP TABLE`, `DELETE FROM` (without WHERE), `TRUNCATE` — never against any environment.

### NEVER run `supabase db push` without explicit user confirmation
- Migrations to production must be confirmed by the user before executing.

### If `supabase db reset` was accidentally run
1. Sign up via the app or create user via Supabase Dashboard (Auth > Users)
2. Run the SQL to grant admin role: `UPDATE profiles SET role = 'admin' WHERE id = '<user-id>';`
3. Re-import contacts and re-seed event data as needed.

### Environment awareness
- Before running any database command or script, verify whether you are targeting **local** or **production**.
- Check for `--linked`, `--project-ref`, or production connection strings before executing.

### Migration script safety
- Never run `migrate-from-csv.ts` against production without explicit user confirmation.
- Always confirm the target environment before running any data migration.

### Email safety
- NEVER send or test emails locally unless the user explicitly provides sample email addresses to use.
- Do not use existing contacts from the database for email testing.
- Always ask the user for test email addresses before any send operation.
