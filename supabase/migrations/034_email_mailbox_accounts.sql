-- ============================================================
-- Email Mailbox Accounts — IMAP/SMTP account configuration
-- Provider-agnostic: supports Hostinger, Gmail, Outlook, etc.
-- ============================================================

create table email_accounts (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  email_address text not null unique,
  imap_host text not null default 'imap.hostinger.com',
  imap_port int not null default 993,
  smtp_host text not null default 'smtp.hostinger.com',
  smtp_port int not null default 465,
  username text not null,
  encrypted_password text not null,
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Updated-at trigger
-- ============================================================
create trigger trg_email_accounts_updated_at before update on email_accounts
  for each row execute function update_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table email_accounts enable row level security;

create policy "Admins have full access to email_accounts"
  on email_accounts for all
  using (is_admin(auth.uid()));

-- ============================================================
-- Grants
-- ============================================================
grant all on public.email_accounts to authenticated;
