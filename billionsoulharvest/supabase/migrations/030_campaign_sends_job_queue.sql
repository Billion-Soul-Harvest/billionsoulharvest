-- Add retry_count column to campaign_sends
alter table campaign_sends
  add column if not exists retry_count integer not null default 0;

-- Partial index for fast batch pickup of queued sends
create index if not exists idx_campaign_sends_queued
  on campaign_sends (campaign_id, status, created_at)
  where status = 'queued';
