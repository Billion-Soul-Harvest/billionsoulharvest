-- Fix admin RLS policies that directly query admin_users table
-- instead of using the SECURITY DEFINER is_admin() function.
-- Direct queries fail because admin_users itself has RLS enabled.

DROP POLICY IF EXISTS "Admins have full access to events" ON events;
CREATE POLICY "Admins have full access to events" ON events FOR ALL USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins have full access to contacts" ON contacts;
CREATE POLICY "Admins have full access to contacts" ON contacts FOR ALL USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins have full access to follow_ups" ON follow_ups;
CREATE POLICY "Admins have full access to follow_ups" ON follow_ups FOR ALL USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins have full access to regions" ON ministry_regions;
CREATE POLICY "Admins have full access to regions" ON ministry_regions FOR ALL USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins have full access to registrations" ON registrations;
CREATE POLICY "Admins have full access to registrations" ON registrations FOR ALL USING (is_admin(auth.uid()));

-- Grant table-level permissions to authenticated role (RLS still controls access)
GRANT ALL ON public.events TO authenticated;
GRANT ALL ON public.contacts TO authenticated;
GRANT ALL ON public.follow_ups TO authenticated;
GRANT ALL ON public.ministry_regions TO authenticated;
GRANT ALL ON public.registrations TO authenticated;
GRANT ALL ON public.admin_users TO authenticated;
GRANT ALL ON public.event_speakers TO authenticated;
GRANT ALL ON public.event_programs TO authenticated;
GRANT ALL ON public.event_faqs TO authenticated;
GRANT ALL ON public.event_sections TO authenticated;
GRANT ALL ON public.event_pages TO authenticated;
GRANT ALL ON public.event_page_blocks TO authenticated;

-- Grant SELECT to anon for public-facing pages (RLS still controls access)
GRANT SELECT ON public.events TO anon;
GRANT SELECT ON public.contacts TO anon;
GRANT SELECT ON public.ministry_regions TO anon;
GRANT SELECT ON public.registrations TO anon;
GRANT SELECT ON public.event_speakers TO anon;
GRANT SELECT ON public.event_programs TO anon;
GRANT SELECT ON public.event_faqs TO anon;
GRANT SELECT ON public.event_sections TO anon;
GRANT SELECT ON public.event_pages TO anon;
GRANT SELECT ON public.event_page_blocks TO anon;
GRANT INSERT ON public.registrations TO anon;
GRANT INSERT ON public.contacts TO anon;
