-- When set, the child page's nav link becomes parentHref#nav_anchor
-- instead of linking to a separate page. Clicking scrolls to that section.
ALTER TABLE site_pages ADD COLUMN nav_anchor text;
