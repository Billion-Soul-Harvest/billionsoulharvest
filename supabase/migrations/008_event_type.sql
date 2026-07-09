-- Add event_type column to events table
alter table events add column event_type text default 'conference'
  check (event_type in (
    'service', 'conference', 'workshop', 'social', 'prayer_meeting',
    'youth_event', 'training', 'church_anniversary', 'other'
  ));
