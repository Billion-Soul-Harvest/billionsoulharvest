-- ============================================================
-- Seed Ministry Regions
-- ============================================================
insert into ministry_regions (name, color, description) values
  ('Brazil', '#22c55e', 'Brazil ministry region — South America'),
  ('Nepal', '#f97316', 'Nepal ministry region — South Asia'),
  ('North India', '#eab308', 'North India ministry region — South Asia'),
  ('Mexico', '#ef4444', 'Mexico ministry region — Central America'),
  ('Philippines', '#3b82f6', 'Philippines ministry region — Southeast Asia')
on conflict (name) do nothing;

-- ============================================================
-- Seed Brazil Global Harvest Summit 2026 Event
-- ============================================================
insert into events (
  title,
  slug,
  description,
  long_description,
  location,
  city,
  country,
  start_date,
  end_date,
  status,
  region_id
) values (
  'Brazil Global Harvest Summit 2026',
  'brazil-global-harvest-2026',
  'Join us for the Brazil Global Harvest Summit — a powerful gathering of pastors, leaders, and believers from across the globe, united in the mission to reach a billion souls for Christ.',
  '<p>The <strong>Brazil Global Harvest Summit 2026</strong> is a landmark gathering bringing together pastors, ministry leaders, and believers from around the world.</p>
<p>This summit will be a time of worship, prayer, strategic planning, and fellowship as we advance the vision of reaching a billion souls for Christ.</p>
<h3>What to Expect</h3>
<ul>
<li>Powerful worship and prayer sessions</li>
<li>Teaching from international ministry leaders</li>
<li>Strategic planning for regional harvest initiatives</li>
<li>Networking with pastors and leaders from around the globe</li>
<li>Cultural experiences in beautiful Brazil</li>
</ul>
<p>Whether you are a pastor, church leader, missionary, or passionate believer — this summit is for you.</p>',
  'TBD',
  'Brazil',
  'Brazil',
  '2026-07-20',
  '2026-07-25',
  'registration_open',
  (select id from ministry_regions where name = 'Brazil')
)
on conflict (slug) do nothing;
