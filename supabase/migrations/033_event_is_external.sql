-- Flag to mark events as external (legacy events hosted elsewhere)
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_external boolean NOT NULL DEFAULT false;

-- Backfill: mark events with external_url as external
UPDATE events SET is_external = true WHERE external_url IS NOT NULL AND external_url != '';
