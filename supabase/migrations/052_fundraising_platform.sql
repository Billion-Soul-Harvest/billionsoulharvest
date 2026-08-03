-- ============================================================
-- Fundraising Platform Schema
-- ============================================================

-- Enums
CREATE TYPE fund_campaign_status AS ENUM (
  'draft', 'pending_review', 'active', 'paused', 'completed', 'rejected', 'cancelled'
);

CREATE TYPE fund_campaign_category AS ENUM (
  'church_planting', 'missions_trips', 'bible_distribution', 'medical_missions',
  'disaster_relief', 'building_projects', 'youth_ministry', 'worship_ministry', 'other'
);

CREATE TYPE fund_donation_status AS ENUM (
  'pending', 'succeeded', 'failed', 'refunded', 'partially_refunded'
);

-- ============================================================
-- fund_profiles — public user profiles for fund platform
-- ============================================================
CREATE TABLE fund_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  avatar_url text,
  bio text,
  is_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_fund_profiles_updated_at
  BEFORE UPDATE ON fund_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- fund_teams — team fundraising groups
-- ============================================================
CREATE TABLE fund_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  goal_cents bigint NOT NULL DEFAULT 0,
  captain_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_fund_teams_updated_at
  BEFORE UPDATE ON fund_teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- fund_team_members — team membership
-- ============================================================
CREATE TABLE fund_team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES fund_teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('captain', 'member')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, user_id)
);

-- ============================================================
-- fund_campaigns — fundraising campaigns
-- ============================================================
CREATE TABLE fund_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  story_html text NOT NULL DEFAULT '',
  category fund_campaign_category NOT NULL DEFAULT 'other',
  status fund_campaign_status NOT NULL DEFAULT 'draft',
  goal_cents bigint NOT NULL DEFAULT 0,
  raised_cents bigint NOT NULL DEFAULT 0,
  donor_count integer NOT NULL DEFAULT 0,
  banner_url text,
  gallery_images jsonb NOT NULL DEFAULT '[]'::jsonb,
  team_id uuid REFERENCES fund_teams(id) ON DELETE SET NULL,
  end_date timestamptz,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- FK to fund_profiles for PostgREST joins (creator_id already FKs to auth.users)
ALTER TABLE fund_campaigns
  ADD CONSTRAINT fund_campaigns_creator_profile_fkey
  FOREIGN KEY (creator_id) REFERENCES fund_profiles(id) ON DELETE CASCADE;

CREATE INDEX idx_fund_campaigns_creator ON fund_campaigns(creator_id);
CREATE INDEX idx_fund_campaigns_status ON fund_campaigns(status);
CREATE INDEX idx_fund_campaigns_category ON fund_campaigns(category);
CREATE INDEX idx_fund_campaigns_team ON fund_campaigns(team_id);
CREATE INDEX idx_fund_campaigns_featured ON fund_campaigns(is_featured) WHERE is_featured = true;

CREATE TRIGGER set_fund_campaigns_updated_at
  BEFORE UPDATE ON fund_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- fund_donations — individual donations
-- ============================================================
CREATE TABLE fund_donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES fund_campaigns(id) ON DELETE CASCADE,
  donor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  donor_name text NOT NULL DEFAULT 'Anonymous',
  donor_email text,
  amount_cents bigint NOT NULL CHECK (amount_cents > 0),
  fee_cents bigint NOT NULL DEFAULT 0,
  status fund_donation_status NOT NULL DEFAULT 'pending',
  is_anonymous boolean NOT NULL DEFAULT false,
  is_recurring boolean NOT NULL DEFAULT false,
  message text,
  stripe_payment_intent_id text UNIQUE,
  matched_amount_cents bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fund_donations_campaign ON fund_donations(campaign_id);
CREATE INDEX idx_fund_donations_donor ON fund_donations(donor_id);
CREATE INDEX idx_fund_donations_status ON fund_donations(status);
CREATE INDEX idx_fund_donations_stripe ON fund_donations(stripe_payment_intent_id);

CREATE TRIGGER set_fund_donations_updated_at
  BEFORE UPDATE ON fund_donations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- fund_updates — campaign blog posts
-- ============================================================
CREATE TABLE fund_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES fund_campaigns(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body_html text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fund_updates_campaign ON fund_updates(campaign_id);

CREATE TRIGGER set_fund_updates_updated_at
  BEFORE UPDATE ON fund_updates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- fund_comments — donor comments on campaigns
-- ============================================================
CREATE TABLE fund_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES fund_campaigns(id) ON DELETE CASCADE,
  donor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  donation_id uuid REFERENCES fund_donations(id) ON DELETE SET NULL,
  author_name text NOT NULL DEFAULT '',
  body text NOT NULL,
  is_hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fund_comments_campaign ON fund_comments(campaign_id);

-- ============================================================
-- fund_matching_rules — admin-configured donation matching
-- ============================================================
CREATE TABLE fund_matching_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_ratio numeric(5,2) NOT NULL DEFAULT 1.00,
  max_match_cents bigint,
  total_budget_cents bigint NOT NULL DEFAULT 0,
  spent_cents bigint NOT NULL DEFAULT 0,
  category fund_campaign_category,
  campaign_id uuid REFERENCES fund_campaigns(id) ON DELETE CASCADE,
  is_active boolean NOT NULL DEFAULT true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_fund_matching_rules_updated_at
  BEFORE UPDATE ON fund_matching_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- fund_recurring_subscriptions — track recurring donations
-- ============================================================
CREATE TABLE fund_recurring_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES fund_campaigns(id) ON DELETE CASCADE,
  donor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_cents bigint NOT NULL CHECK (amount_cents > 0),
  interval text NOT NULL DEFAULT 'month' CHECK (interval IN ('week', 'month', 'year')),
  stripe_subscription_id text UNIQUE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fund_recurring_donor ON fund_recurring_subscriptions(donor_id);
CREATE INDEX idx_fund_recurring_campaign ON fund_recurring_subscriptions(campaign_id);

CREATE TRIGGER set_fund_recurring_subscriptions_updated_at
  BEFORE UPDATE ON fund_recurring_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- RLS Policies
-- ============================================================

ALTER TABLE fund_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fund_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE fund_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE fund_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE fund_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE fund_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE fund_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE fund_matching_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE fund_recurring_subscriptions ENABLE ROW LEVEL SECURITY;

-- fund_profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON fund_profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON fund_profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON fund_profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins manage all profiles"
  ON fund_profiles FOR ALL USING (is_admin(auth.uid()));

-- fund_campaigns
CREATE POLICY "Active campaigns are viewable by everyone"
  ON fund_campaigns FOR SELECT USING (
    status = 'active' OR creator_id = auth.uid() OR is_admin(auth.uid())
  );

CREATE POLICY "Authenticated users can create campaigns"
  ON fund_campaigns FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own campaigns"
  ON fund_campaigns FOR UPDATE USING (
    creator_id = auth.uid() OR is_admin(auth.uid())
  );

CREATE POLICY "Admins can delete campaigns"
  ON fund_campaigns FOR DELETE USING (is_admin(auth.uid()));

-- fund_donations
CREATE POLICY "Donors can view own donations"
  ON fund_donations FOR SELECT USING (
    donor_id = auth.uid() OR is_admin(auth.uid())
    OR campaign_id IN (SELECT id FROM fund_campaigns WHERE creator_id = auth.uid())
  );

CREATE POLICY "Anyone can create donations"
  ON fund_donations FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins manage all donations"
  ON fund_donations FOR ALL USING (is_admin(auth.uid()));

-- fund_updates
CREATE POLICY "Updates are viewable on active campaigns"
  ON fund_updates FOR SELECT USING (
    campaign_id IN (SELECT id FROM fund_campaigns WHERE status = 'active')
    OR author_id = auth.uid()
    OR is_admin(auth.uid())
  );

CREATE POLICY "Campaign creators can manage updates"
  ON fund_updates FOR INSERT WITH CHECK (
    author_id = auth.uid()
    AND campaign_id IN (SELECT id FROM fund_campaigns WHERE creator_id = auth.uid())
  );

CREATE POLICY "Campaign creators can edit updates"
  ON fund_updates FOR UPDATE USING (author_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Campaign creators can delete updates"
  ON fund_updates FOR DELETE USING (author_id = auth.uid() OR is_admin(auth.uid()));

-- fund_comments
CREATE POLICY "Comments are viewable on active campaigns"
  ON fund_comments FOR SELECT USING (
    is_hidden = false
    OR donor_id = auth.uid()
    OR is_admin(auth.uid())
  );

CREATE POLICY "Anyone can create comments"
  ON fund_comments FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage comments"
  ON fund_comments FOR ALL USING (is_admin(auth.uid()));

-- fund_teams
CREATE POLICY "Teams are viewable by everyone"
  ON fund_teams FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create teams"
  ON fund_teams FOR INSERT WITH CHECK (auth.uid() = captain_id);

CREATE POLICY "Captains can update own teams"
  ON fund_teams FOR UPDATE USING (captain_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Admins can delete teams"
  ON fund_teams FOR DELETE USING (is_admin(auth.uid()));

-- fund_team_members
CREATE POLICY "Team members are viewable by everyone"
  ON fund_team_members FOR SELECT USING (true);

CREATE POLICY "Captains can manage team members"
  ON fund_team_members FOR INSERT WITH CHECK (
    team_id IN (SELECT id FROM fund_teams WHERE captain_id = auth.uid())
    OR is_admin(auth.uid())
  );

CREATE POLICY "Captains can remove team members"
  ON fund_team_members FOR DELETE USING (
    team_id IN (SELECT id FROM fund_teams WHERE captain_id = auth.uid())
    OR user_id = auth.uid()
    OR is_admin(auth.uid())
  );

-- fund_matching_rules
CREATE POLICY "Matching rules are viewable by everyone"
  ON fund_matching_rules FOR SELECT USING (true);

CREATE POLICY "Admins manage matching rules"
  ON fund_matching_rules FOR ALL USING (is_admin(auth.uid()));

-- fund_recurring_subscriptions
CREATE POLICY "Donors can view own subscriptions"
  ON fund_recurring_subscriptions FOR SELECT USING (
    donor_id = auth.uid() OR is_admin(auth.uid())
  );

CREATE POLICY "Authenticated users can create subscriptions"
  ON fund_recurring_subscriptions FOR INSERT WITH CHECK (auth.uid() = donor_id);

CREATE POLICY "Donors can update own subscriptions"
  ON fund_recurring_subscriptions FOR UPDATE USING (
    donor_id = auth.uid() OR is_admin(auth.uid())
  );

-- ============================================================
-- Storage bucket for fund images
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'fund-images',
  'fund-images',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view fund images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'fund-images');

CREATE POLICY "Authenticated users can upload fund images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'fund-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own fund images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'fund-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own fund images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'fund-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Grant service role access
GRANT ALL ON fund_profiles TO service_role;
GRANT ALL ON fund_campaigns TO service_role;
GRANT ALL ON fund_donations TO service_role;
GRANT ALL ON fund_updates TO service_role;
GRANT ALL ON fund_comments TO service_role;
GRANT ALL ON fund_teams TO service_role;
GRANT ALL ON fund_team_members TO service_role;
GRANT ALL ON fund_matching_rules TO service_role;
GRANT ALL ON fund_recurring_subscriptions TO service_role;
