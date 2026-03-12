-- =============================================================================
-- 003_full_schema.sql
-- Full schema recreation for new Supabase instance (uzivlllaltblwqyykfup)
-- Generated from lib/supabase/types.ts + migrations 001 + 002
-- Run this in the Supabase SQL Editor of the NEW project BEFORE running the
-- migration script.
-- =============================================================================

-- -----------------------------------------------------------------------
-- EXTENSIONS
-- -----------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------
-- ENUMS
-- -----------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- -----------------------------------------------------------------------
-- TABLES (ordered by FK dependency)
-- -----------------------------------------------------------------------

-- profiles (no FK deps; references auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id                uuid        PRIMARY KEY,
  avatar_url        text,
  bio               text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  experience_level  text,
  full_name         text,
  github_url        text,
  is_public         boolean     NOT NULL DEFAULT true,
  linkedin_url      text,
  location          text,
  portfolio_url     text,
  role              text        NOT NULL DEFAULT 'user',
  tech_stack        text[],
  title             text,
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- user_roles
CREATE TABLE IF NOT EXISTS user_roles (
  id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role    app_role NOT NULL,
  user_id uuid NOT NULL
);

-- companies
CREATE TABLE IF NOT EXISTS companies (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  cover_image_url  text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  description      text,
  industry         text,
  is_verified      boolean     NOT NULL DEFAULT false,
  location         text,
  logo_url         text,
  name             text        NOT NULL,
  plan             text        NOT NULL DEFAULT 'free',
  plan_started_at  timestamptz,
  size             text,
  slug             text,
  tech_stack       text[],
  updated_at       timestamptz NOT NULL DEFAULT now(),
  user_id          uuid        NOT NULL,
  website          text
);

CREATE INDEX IF NOT EXISTS companies_slug_idx ON companies(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS companies_user_id_idx ON companies(user_id);

-- affiliate_links (no FK deps)
CREATE TABLE IF NOT EXISTS affiliate_links (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_url         text        NOT NULL,
  category              text,
  clicks                integer     DEFAULT 0,
  commission_description text,
  commission_type       text,
  commission_value      numeric,
  conversions           integer     DEFAULT 0,
  created_at            timestamptz DEFAULT now(),
  is_active             boolean     DEFAULT true,
  revenue_total         numeric     DEFAULT 0,
  tool_description      text,
  tool_logo_url         text,
  tool_name             text        NOT NULL,
  tool_slug             text        NOT NULL
);

-- tools (FK: affiliate_links)
CREATE TABLE IF NOT EXISTS tools (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_link_id uuid        REFERENCES affiliate_links(id) ON DELETE SET NULL,
  affiliate_url     text,
  alternatives      text[],
  avg_rating        numeric     NOT NULL DEFAULT 0,
  best_for          text,
  category          text        NOT NULL,
  company_hq        text,
  company_name      text,
  cons              text[],
  created_at        timestamptz NOT NULL DEFAULT now(),
  description       text,
  founded_year      integer,
  is_editors_choice boolean     DEFAULT false,
  is_featured       boolean     NOT NULL DEFAULT false,
  is_published      boolean     DEFAULT true,
  languages         text[],
  logo_url          text,
  long_description  text,
  name              text        NOT NULL,
  platforms         text[],
  pricing_details   text,
  pricing_from      text,
  pricing_model     text,
  pros              text[],
  review_count      integer     NOT NULL DEFAULT 0,
  screenshot_urls   text[],
  slug              text        NOT NULL UNIQUE,
  subcategory       text,
  tagline           text,
  tags              text[],
  updated_at        timestamptz,
  views_count       integer     DEFAULT 0,
  website_url       text
);

CREATE INDEX IF NOT EXISTS tools_slug_idx ON tools(slug);
CREATE INDEX IF NOT EXISTS tools_category_idx ON tools(category);
CREATE INDEX IF NOT EXISTS tools_is_published_idx ON tools(is_published);

-- jobs (FK: companies, with JobTech extra columns from migration 001)
CREATE TABLE IF NOT EXISTS jobs (
  id                          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  applications_count          integer     NOT NULL DEFAULT 0,
  apply_url                   text,
  category                    text        NOT NULL,
  company_id                  uuid        REFERENCES companies(id) ON DELETE SET NULL,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  description                 text        NOT NULL,
  experience_level            text        NOT NULL,
  expires_at                  timestamptz,
  is_active                   boolean     NOT NULL DEFAULT true,
  is_featured                 boolean     NOT NULL DEFAULT false,
  is_sponsored                boolean     NOT NULL DEFAULT false,
  location                    text        NOT NULL,
  salary_max                  integer,
  salary_min                  integer,
  slug                        text        NOT NULL UNIQUE,
  tech_tags                   text[],
  title                       text        NOT NULL,
  views_count                 integer     NOT NULL DEFAULT 0,
  work_model                  text        NOT NULL,
  -- JobTech columns (migration 001)
  external_id                 text        UNIQUE,
  source                      text        NOT NULL DEFAULT 'manual',
  external_url                text,
  is_external                 boolean     NOT NULL DEFAULT false,
  company_name_override       text,
  company_logo_url_override   text,
  last_synced_at              timestamptz
);

CREATE INDEX IF NOT EXISTS jobs_slug_idx ON jobs(slug);
CREATE INDEX IF NOT EXISTS jobs_category_idx ON jobs(category);
CREATE INDEX IF NOT EXISTS jobs_is_active_idx ON jobs(is_active);
CREATE INDEX IF NOT EXISTS jobs_external_id_idx ON jobs(external_id) WHERE external_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS jobs_source_idx ON jobs(source);
CREATE INDEX IF NOT EXISTS jobs_last_synced_idx ON jobs(last_synced_at) WHERE is_external = true;

-- articles
CREATE TABLE IF NOT EXISTS articles (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  author_avatar_url    text,
  author_bio           text,
  author_github_url    text,
  author_linkedin_url  text,
  author_name          text,
  author_slug          text,
  category             text        NOT NULL,
  content              text,
  excerpt              text,
  hero_image_alt       text,
  hero_image_url       text,
  is_featured          boolean     NOT NULL DEFAULT false,
  is_published         boolean     NOT NULL DEFAULT false,
  likes_count          integer     NOT NULL DEFAULT 0,
  meta_description     text,
  meta_title           text,
  published_at         timestamptz,
  reading_time_minutes integer,
  slug                 text        NOT NULL UNIQUE,
  tags                 text[],
  title                text        NOT NULL,
  updated_at           timestamptz,
  views_count          integer     NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS articles_slug_idx ON articles(slug);
CREATE INDEX IF NOT EXISTS articles_category_idx ON articles(category);
CREATE INDEX IF NOT EXISTS articles_is_published_idx ON articles(is_published);

-- events (FK: companies)
CREATE TABLE IF NOT EXISTS events (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id         uuid        REFERENCES companies(id) ON DELETE SET NULL,
  created_at         timestamptz NOT NULL DEFAULT now(),
  current_attendees  integer     NOT NULL DEFAULT 0,
  date_end           date,
  date_start         date        NOT NULL,
  description        text,
  end_date           date,
  event_type         text,
  format             text,
  hero_image_url     text,
  image_url          text,
  is_canceled        boolean     DEFAULT false,
  is_featured        boolean     NOT NULL DEFAULT false,
  is_free            boolean     DEFAULT false,
  is_online          boolean     NOT NULL DEFAULT false,
  is_published       boolean     DEFAULT true,
  location_address   text,
  location_city      text,
  location_lat       numeric,
  location_lng       numeric,
  location_name      text,
  long_description   text,
  max_attendees      integer,
  online_url         text,
  organizer_logo_url text,
  organizer_name     text,
  organizer_url      text,
  organizer_user_id  uuid,
  price              numeric     NOT NULL DEFAULT 0,
  registration_url   text,
  slug               text        NOT NULL UNIQUE,
  start_date         date        NOT NULL DEFAULT CURRENT_DATE,
  tags               text[],
  ticket_currency    text,
  ticket_price       numeric,
  ticket_url         text,
  time_end           text,
  time_start         text,
  timezone           text,
  title              text        NOT NULL,
  video_url          text,
  views_count        integer     DEFAULT 0
);

CREATE INDEX IF NOT EXISTS events_slug_idx ON events(slug);
CREATE INDEX IF NOT EXISTS events_date_start_idx ON events(date_start);
CREATE INDEX IF NOT EXISTS events_is_published_idx ON events(is_published);

-- salary_data
CREATE TABLE IF NOT EXISTS salary_data (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  city             text        NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  currency         text,
  data_source      text        NOT NULL DEFAULT 'internal',
  experience_level text        NOT NULL,
  role             text        NOT NULL,
  salary_max       integer     NOT NULL,
  salary_median    integer     NOT NULL,
  salary_min       integer     NOT NULL,
  salary_p25       integer,
  salary_p75       integer,
  sample_size      integer,
  tech_stack       text[],
  updated_at       timestamptz,
  year             integer     NOT NULL DEFAULT EXTRACT(YEAR FROM now())
);

-- salary_submissions
CREATE TABLE IF NOT EXISTS salary_submissions (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  bonus_amount     integer,
  city             text        NOT NULL,
  company_size     text,
  company_type     text,
  education        text,
  experience_level text        NOT NULL,
  experience_years integer     NOT NULL,
  includes_bonus   boolean     DEFAULT false,
  industry         text,
  is_approved      boolean     DEFAULT false,
  is_verified      boolean     DEFAULT false,
  monthly_salary   integer     NOT NULL,
  remote_policy    text,
  role             text        NOT NULL,
  submitted_at     timestamptz DEFAULT now(),
  user_id          uuid
);

-- ads
CREATE TABLE IF NOT EXISTS ads (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_email  text,
  advertiser_name   text        NOT NULL,
  clicks            integer     NOT NULL DEFAULT 0,
  cost_amount       numeric,
  cost_model        text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  daily_budget      numeric,
  description       text,
  destination_url   text        NOT NULL,
  end_date          date        NOT NULL,
  format            text,
  image_url         text,
  impressions       integer     NOT NULL DEFAULT 0,
  is_active         boolean     NOT NULL DEFAULT true,
  placement         text        NOT NULL,
  priority          integer     DEFAULT 0,
  start_date        date        NOT NULL,
  target_categories text[],
  target_pages      text[],
  title             text        NOT NULL,
  total_budget      numeric,
  updated_at        timestamptz
);

-- newsletter_subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text        NOT NULL UNIQUE,
  is_active     boolean     NOT NULL DEFAULT true,
  source        text,
  subscribed_at timestamptz NOT NULL DEFAULT now()
);

-- contact_messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  email      text        NOT NULL,
  is_read    boolean     DEFAULT false,
  message    text        NOT NULL,
  name       text        NOT NULL,
  subject    text        NOT NULL
);

-- subscriptions (FK: companies)
CREATE TABLE IF NOT EXISTS subscriptions (
  id                     uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  cancel_at_period_end   boolean     DEFAULT false,
  company_id             uuid        REFERENCES companies(id) ON DELETE SET NULL,
  created_at             timestamptz DEFAULT now(),
  current_period_end     timestamptz,
  current_period_start   timestamptz,
  monthly_price          numeric     NOT NULL,
  plan                   text        NOT NULL,
  status                 text,
  stripe_customer_id     text,
  stripe_subscription_id text,
  trial_end              timestamptz,
  updated_at             timestamptz
);

-- revenue_log
CREATE TABLE IF NOT EXISTS revenue_log (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  amount          numeric     NOT NULL DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  currency        text,
  description     text,
  reference_id    text,
  reference_type  text,
  source          text        NOT NULL
);

-- job_alerts
CREATE TABLE IF NOT EXISTS job_alerts (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  email      text        NOT NULL,
  filters    jsonb       NOT NULL DEFAULT '{}',
  is_active  boolean     NOT NULL DEFAULT true,
  user_id    uuid        NOT NULL
);

-- applications (FK: jobs)
CREATE TABLE IF NOT EXISTS applications (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   timestamptz NOT NULL DEFAULT now(),
  email        text        NOT NULL,
  full_name    text        NOT NULL,
  job_id       uuid        NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  linkedin_url text,
  message      text,
  phone        text,
  resume_url   text,
  status       text        NOT NULL DEFAULT 'pending',
  user_id      uuid        NOT NULL
);

CREATE INDEX IF NOT EXISTS applications_job_id_idx ON applications(job_id);
CREATE INDEX IF NOT EXISTS applications_user_id_idx ON applications(user_id);

-- article_likes (FK: articles)
CREATE TABLE IF NOT EXISTS article_likes (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid        NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id    uuid        NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS article_likes_article_user_idx ON article_likes(article_id, user_id);

-- comments (FK: articles, self)
CREATE TABLE IF NOT EXISTS comments (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id        uuid        NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  content           text        NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  is_edited         boolean     DEFAULT false,
  parent_comment_id uuid        REFERENCES comments(id) ON DELETE CASCADE,
  updated_at        timestamptz,
  user_id           uuid        NOT NULL
);

CREATE INDEX IF NOT EXISTS comments_article_id_idx ON comments(article_id);

-- bookmarks (FK: articles)
CREATE TABLE IF NOT EXISTS bookmarks (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid        NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  user_id    uuid        NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS bookmarks_article_user_idx ON bookmarks(article_id, user_id);

-- tool_reviews (FK: tools)
CREATE TABLE IF NOT EXISTS tool_reviews (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  cons             text,
  content          text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  experience_level text,
  helpful_count    integer     DEFAULT 0,
  is_verified      boolean     DEFAULT false,
  pros             text,
  rating           numeric     NOT NULL,
  title            text,
  tool_id          uuid        NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  updated_at       timestamptz,
  use_case         text,
  user_id          uuid        NOT NULL
);

CREATE INDEX IF NOT EXISTS tool_reviews_tool_id_idx ON tool_reviews(tool_id);

-- tool_comparisons
CREATE TABLE IF NOT EXISTS tool_comparisons (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz DEFAULT now(),
  slug        text        NOT NULL UNIQUE,
  tool_ids    uuid[]      NOT NULL,
  views_count integer     DEFAULT 0
);

-- review_helpful (FK: tool_reviews)
CREATE TABLE IF NOT EXISTS review_helpful (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  review_id  uuid        NOT NULL REFERENCES tool_reviews(id) ON DELETE CASCADE,
  user_id    uuid        NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS review_helpful_review_user_idx ON review_helpful(review_id, user_id);

-- forum_posts
CREATE TABLE IF NOT EXISTS forum_posts (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  category          text        NOT NULL,
  comment_count     integer     NOT NULL DEFAULT 0,
  content           text        NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  downvotes         integer     DEFAULT 0,
  is_locked         boolean     DEFAULT false,
  is_pinned         boolean     NOT NULL DEFAULT false,
  is_published      boolean     DEFAULT true,
  is_solved         boolean     DEFAULT false,
  last_activity_at  timestamptz,
  slug              text,
  solved_comment_id uuid,
  tags              text[],
  title             text        NOT NULL,
  updated_at        timestamptz NOT NULL DEFAULT now(),
  upvotes           integer     NOT NULL DEFAULT 0,
  user_id           uuid        NOT NULL,
  views             integer     NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS forum_posts_category_idx ON forum_posts(category);
CREATE INDEX IF NOT EXISTS forum_posts_user_id_idx ON forum_posts(user_id);

-- forum_comments (FK: forum_posts, self)
CREATE TABLE IF NOT EXISTS forum_comments (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  content           text        NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  downvotes         integer     DEFAULT 0,
  is_accepted_answer boolean    DEFAULT false,
  is_edited         boolean     DEFAULT false,
  parent_comment_id uuid        REFERENCES forum_comments(id) ON DELETE CASCADE,
  post_id           uuid        NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  updated_at        timestamptz,
  upvotes           integer     NOT NULL DEFAULT 0,
  user_id           uuid        NOT NULL
);

CREATE INDEX IF NOT EXISTS forum_comments_post_id_idx ON forum_comments(post_id);

-- forum_votes (FK: forum_posts, forum_comments)
CREATE TABLE IF NOT EXISTS forum_votes (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid        REFERENCES forum_comments(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  post_id    uuid        REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id    uuid        NOT NULL,
  vote_type  text        NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS forum_votes_user_post_idx ON forum_votes(user_id, post_id) WHERE post_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS forum_votes_user_comment_idx ON forum_votes(user_id, comment_id) WHERE comment_id IS NOT NULL;

-- showcase_projects
CREATE TABLE IF NOT EXISTS showcase_projects (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  category         text,
  comment_count    integer     DEFAULT 0,
  created_at       timestamptz DEFAULT now(),
  demo_url         text,
  description      text        NOT NULL,
  github_url       text,
  is_featured      boolean     DEFAULT false,
  is_published     boolean     DEFAULT true,
  long_description text,
  screenshot_urls  text[],
  slug             text        NOT NULL UNIQUE,
  tech_stack       text[],
  thumbnail_url    text,
  title            text        NOT NULL,
  updated_at       timestamptz,
  upvotes          integer     DEFAULT 0,
  user_id          uuid        NOT NULL,
  views            integer     DEFAULT 0
);

CREATE INDEX IF NOT EXISTS showcase_projects_user_id_idx ON showcase_projects(user_id);

-- showcase_votes (FK: showcase_projects)
CREATE TABLE IF NOT EXISTS showcase_votes (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  project_id uuid        NOT NULL REFERENCES showcase_projects(id) ON DELETE CASCADE,
  user_id    uuid        NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS showcase_votes_project_user_idx ON showcase_votes(project_id, user_id);

-- showcase_comments (FK: showcase_projects)
CREATE TABLE IF NOT EXISTS showcase_comments (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  content    text        NOT NULL,
  created_at timestamptz DEFAULT now(),
  project_id uuid        NOT NULL REFERENCES showcase_projects(id) ON DELETE CASCADE,
  user_id    uuid        NOT NULL
);

-- user_reputation
CREATE TABLE IF NOT EXISTS user_reputation (
  user_id           uuid        PRIMARY KEY,
  accepted_answers  integer     DEFAULT 0,
  comments_count    integer     DEFAULT 0,
  posts_count       integer     DEFAULT 0,
  rank              text,
  showcase_projects integer     DEFAULT 0,
  total_points      integer     DEFAULT 0,
  updated_at        timestamptz,
  upvotes_received  integer     DEFAULT 0
);

-- event_registrations (FK: events)
CREATE TABLE IF NOT EXISTS event_registrations (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  company              text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  dietary_requirements text,
  email                text,
  event_id             uuid        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  full_name            text,
  role                 text,
  status               text,
  user_id              uuid        NOT NULL
);

CREATE INDEX IF NOT EXISTS event_registrations_event_id_idx ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS event_registrations_user_id_idx ON event_registrations(user_id);

-- event_speakers (FK: events)
CREATE TABLE IF NOT EXISTS event_speakers (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  avatar_url       text,
  bio              text,
  company          text,
  created_at       timestamptz DEFAULT now(),
  event_id         uuid        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  linkedin_url     text,
  name             text        NOT NULL,
  sort_order       integer     DEFAULT 0,
  talk_description text,
  talk_title       text,
  title            text
);

CREATE INDEX IF NOT EXISTS event_speakers_event_id_idx ON event_speakers(event_id);

-- event_sponsors (FK: events)
CREATE TABLE IF NOT EXISTS event_sponsors (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz DEFAULT now(),
  event_id    uuid        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  logo_url    text        NOT NULL,
  name        text        NOT NULL,
  sort_order  integer     DEFAULT 0,
  tier        text,
  website_url text
);

-- event_agenda (FK: events, event_speakers)
CREATE TABLE IF NOT EXISTS event_agenda (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz DEFAULT now(),
  description text,
  event_id    uuid        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  sort_order  integer     DEFAULT 0,
  speaker_id  uuid        REFERENCES event_speakers(id) ON DELETE SET NULL,
  time_end    text,
  time_start  text        NOT NULL,
  title       text        NOT NULL,
  type        text
);

CREATE INDEX IF NOT EXISTS event_agenda_event_id_idx ON event_agenda(event_id);

-- ad_impressions (FK: ads)
CREATE TABLE IF NOT EXISTS ad_impressions (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id      uuid        REFERENCES ads(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  ip_hash    text,
  page_url   text,
  session_id text,
  user_agent text
);

CREATE INDEX IF NOT EXISTS ad_impressions_ad_id_idx ON ad_impressions(ad_id);

-- ad_clicks (FK: ads)
CREATE TABLE IF NOT EXISTS ad_clicks (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id      uuid        REFERENCES ads(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  ip_hash    text,
  page_url   text,
  session_id text,
  user_agent text
);

CREATE INDEX IF NOT EXISTS ad_clicks_ad_id_idx ON ad_clicks(ad_id);

-- affiliate_clicks (FK: affiliate_links, tools)
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_link_id uuid        REFERENCES affiliate_links(id) ON DELETE SET NULL,
  clicked_at        timestamptz NOT NULL DEFAULT now(),
  page_url          text,
  session_id        text,
  tool_id           uuid        NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  user_id           uuid
);

CREATE INDEX IF NOT EXISTS affiliate_clicks_tool_id_idx ON affiliate_clicks(tool_id);

-- pricing_plans
CREATE TABLE IF NOT EXISTS pricing_plans (
  id             uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  cta_text       text    NOT NULL DEFAULT 'Kom igång',
  features       jsonb   NOT NULL DEFAULT '[]',
  is_featured    boolean NOT NULL DEFAULT false,
  name           text    NOT NULL,
  price_monthly  numeric NOT NULL,
  price_yearly   numeric,
  sort_order     integer NOT NULL DEFAULT 0
);

-- company_follows (FK: companies)
CREATE TABLE IF NOT EXISTS company_follows (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid        NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id    uuid        NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS company_follows_company_user_idx ON company_follows(company_id, user_id);

-- company_inquiries
CREATE TABLE IF NOT EXISTS company_inquiries (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  company    text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  email      text        NOT NULL,
  message    text,
  name       text        NOT NULL,
  phone      text
);

-- saved_jobs (FK: jobs)
CREATE TABLE IF NOT EXISTS saved_jobs (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  job_id     uuid        NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id    uuid        NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS saved_jobs_job_user_idx ON saved_jobs(job_id, user_id);

-- reading_history (FK: articles)
CREATE TABLE IF NOT EXISTS reading_history (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id         uuid        NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  read_at            timestamptz DEFAULT now(),
  scroll_percentage  integer,
  user_id            uuid        NOT NULL
);

CREATE INDEX IF NOT EXISTS reading_history_user_id_idx ON reading_history(user_id);

-- -----------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------

ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies            ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_links      ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools                ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE events               ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_data          ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_submissions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_log          ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_alerts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications         ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_likes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments             ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks            ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_reviews         ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_comparisons     ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpful       ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_comments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_votes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE showcase_projects    ENABLE ROW LEVEL SECURITY;
ALTER TABLE showcase_votes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE showcase_comments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reputation      ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_speakers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_sponsors       ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_agenda         ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_impressions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_clicks            ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks     ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_plans        ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_follows      ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_inquiries    ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_history      ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------
-- RLS POLICIES  (permissive – tighten later as needed)
-- -----------------------------------------------------------------------

-- Public read tables
CREATE POLICY "Public read articles"         ON articles             FOR SELECT USING (true);
CREATE POLICY "Public read jobs"             ON jobs                 FOR SELECT USING (true);
CREATE POLICY "Public read tools"            ON tools                FOR SELECT USING (true);
CREATE POLICY "Public read events"           ON events               FOR SELECT USING (true);
CREATE POLICY "Public read companies"        ON companies            FOR SELECT USING (true);
CREATE POLICY "Public read salary_data"      ON salary_data          FOR SELECT USING (true);
CREATE POLICY "Public read pricing_plans"    ON pricing_plans        FOR SELECT USING (true);
CREATE POLICY "Public read affiliate_links"  ON affiliate_links      FOR SELECT USING (true);
CREATE POLICY "Public read forum_posts"      ON forum_posts          FOR SELECT USING (true);
CREATE POLICY "Public read forum_comments"   ON forum_comments       FOR SELECT USING (true);
CREATE POLICY "Public read showcase_projects" ON showcase_projects   FOR SELECT USING (true);
CREATE POLICY "Public read event_speakers"   ON event_speakers       FOR SELECT USING (true);
CREATE POLICY "Public read event_sponsors"   ON event_sponsors       FOR SELECT USING (true);
CREATE POLICY "Public read event_agenda"     ON event_agenda         FOR SELECT USING (true);
CREATE POLICY "Public read tool_comparisons" ON tool_comparisons     FOR SELECT USING (true);
CREATE POLICY "Public read tool_reviews"     ON tool_reviews         FOR SELECT USING (true);
CREATE POLICY "Public read user_reputation"  ON user_reputation      FOR SELECT USING (true);
CREATE POLICY "Public read ads"              ON ads                  FOR SELECT USING (true);

-- Allow upsert from API sync (jobs)
CREATE POLICY "Allow upsert from API sync"   ON jobs                 FOR ALL USING (true) WITH CHECK (true);

-- Authenticated users: read own + write own
CREATE POLICY "Auth read profiles"           ON profiles             FOR SELECT USING (true);
CREATE POLICY "Auth update own profile"      ON profiles             FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Auth insert own profile"      ON profiles             FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Auth manage own bookmarks"    ON bookmarks            FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth read bookmarks"          ON bookmarks            FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Auth manage own article_likes" ON article_likes       FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth read article_likes"      ON article_likes        FOR SELECT USING (true);

CREATE POLICY "Auth manage own comments"     ON comments             FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth read comments"           ON comments             FOR SELECT USING (true);

CREATE POLICY "Auth manage own applications" ON applications         FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Auth manage own job_alerts"   ON job_alerts           FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Auth read own saved_jobs"     ON saved_jobs           FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Auth manage own saved_jobs"   ON saved_jobs           FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Auth manage own reading_history" ON reading_history   FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Auth manage own forum_posts"  ON forum_posts          FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth update own forum_posts"  ON forum_posts          FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Auth delete own forum_posts"  ON forum_posts          FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Auth manage own forum_comments" ON forum_comments     FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth update own forum_comments" ON forum_comments     FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Auth delete own forum_comments" ON forum_comments     FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Auth manage own forum_votes"  ON forum_votes          FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth read forum_votes"        ON forum_votes          FOR SELECT USING (true);

CREATE POLICY "Auth manage own showcase"     ON showcase_projects    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth update own showcase"     ON showcase_projects    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Auth delete own showcase"     ON showcase_projects    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Auth manage own showcase_votes" ON showcase_votes     FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth read showcase_votes"     ON showcase_votes       FOR SELECT USING (true);

CREATE POLICY "Auth manage own showcase_comments" ON showcase_comments FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth read showcase_comments"  ON showcase_comments    FOR SELECT USING (true);

CREATE POLICY "Auth manage own tool_reviews" ON tool_reviews         FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth update own tool_reviews" ON tool_reviews         FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Auth delete own tool_reviews" ON tool_reviews         FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Auth manage own review_helpful" ON review_helpful     FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Auth manage own event_regs"   ON event_registrations  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth read own event_regs"     ON event_registrations  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Auth manage own companies"    ON companies            FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth update own companies"    ON companies            FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Auth delete own companies"    ON companies            FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Auth manage own company_follows" ON company_follows   FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth read company_follows"    ON company_follows      FOR SELECT USING (true);

CREATE POLICY "Auth manage own salary_submissions" ON salary_submissions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Auth insert newsletter"       ON newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth insert contact"          ON contact_messages      FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth insert company_inquiry"  ON company_inquiries     FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth insert salary_submission" ON salary_submissions   FOR INSERT WITH CHECK (true);

CREATE POLICY "Auth insert affiliate_clicks" ON affiliate_clicks      FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth insert ad_impressions"   ON ad_impressions        FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth insert ad_clicks"        ON ad_clicks             FOR INSERT WITH CHECK (true);

CREATE POLICY "Auth read own subscriptions"  ON subscriptions        FOR SELECT USING (true);

CREATE POLICY "Auth read user_roles"         ON user_roles           FOR SELECT USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------
-- FUNCTIONS
-- -----------------------------------------------------------------------

CREATE OR REPLACE FUNCTION has_role(
  _role    app_role,
  _user_id uuid
) RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id
      AND role    = _role
  );
$$;

CREATE OR REPLACE FUNCTION increment_ad_clicks(p_ad_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE ads SET clicks = clicks + 1 WHERE id = p_ad_id;
$$;

CREATE OR REPLACE FUNCTION increment_ad_impressions(p_ad_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE ads SET impressions = impressions + 1 WHERE id = p_ad_id;
$$;

CREATE OR REPLACE FUNCTION increment_article_views(article_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE articles SET views_count = views_count + 1 WHERE id = article_id;
$$;

CREATE OR REPLACE FUNCTION increment_event_views(p_event_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE events SET views_count = COALESCE(views_count, 0) + 1 WHERE id = p_event_id;
$$;

CREATE OR REPLACE FUNCTION increment_forum_post_views(p_post_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE forum_posts SET views = views + 1 WHERE id = p_post_id;
$$;

CREATE OR REPLACE FUNCTION increment_tool_views(p_tool_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE tools SET views_count = COALESCE(views_count, 0) + 1 WHERE id = p_tool_id;
$$;

CREATE OR REPLACE FUNCTION owns_job(
  _job_id  uuid,
  _user_id uuid
) RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM   jobs j
    JOIN   companies c ON c.id = j.company_id
    WHERE  j.id       = _job_id
      AND  c.user_id  = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION upsert_reputation(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_posts    integer;
  v_comments integer;
  v_upvotes  integer;
  v_accepted integer;
  v_showcase integer;
  v_points   integer;
  v_rank     text;
BEGIN
  SELECT COUNT(*) INTO v_posts    FROM forum_posts    WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_comments FROM forum_comments WHERE user_id = p_user_id;
  SELECT COALESCE(SUM(upvotes),0) INTO v_upvotes FROM forum_posts WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_accepted FROM forum_comments WHERE user_id = p_user_id AND is_accepted_answer = true;
  SELECT COUNT(*) INTO v_showcase FROM showcase_projects WHERE user_id = p_user_id AND is_published = true;

  v_points := (v_posts * 5) + (v_comments * 2) + (v_upvotes * 3) + (v_accepted * 10) + (v_showcase * 8);

  v_rank := CASE
    WHEN v_points >= 1000 THEN 'expert'
    WHEN v_points >= 500  THEN 'senior'
    WHEN v_points >= 100  THEN 'intermediate'
    WHEN v_points >= 10   THEN 'beginner'
    ELSE 'newcomer'
  END;

  INSERT INTO user_reputation (user_id, posts_count, comments_count, upvotes_received, accepted_answers, showcase_projects, total_points, rank, updated_at)
  VALUES (p_user_id, v_posts, v_comments, v_upvotes, v_accepted, v_showcase, v_points, v_rank, now())
  ON CONFLICT (user_id) DO UPDATE SET
    posts_count       = EXCLUDED.posts_count,
    comments_count    = EXCLUDED.comments_count,
    upvotes_received  = EXCLUDED.upvotes_received,
    accepted_answers  = EXCLUDED.accepted_answers,
    showcase_projects = EXCLUDED.showcase_projects,
    total_points      = EXCLUDED.total_points,
    rank              = EXCLUDED.rank,
    updated_at        = now();
END;
$$;

-- -----------------------------------------------------------------------
-- Migration 002: Fix article images (safe to run multiple times)
-- -----------------------------------------------------------------------

UPDATE articles
SET hero_image_url = 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&q=80'
WHERE title ILIKE '%RAG-arkitektur%'
  AND (hero_image_url IS NULL OR hero_image_url = '' OR hero_image_url ILIKE '%unsplash.com/photo-1526374965328%');

UPDATE articles
SET hero_image_url = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&q=80'
WHERE title ILIKE '%nybörjar%' AND title ILIKE '%ML%'
  AND (hero_image_url IS NULL OR hero_image_url = '');

UPDATE articles
SET hero_image_url = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&q=80'
WHERE title ILIKE '%nybörjar%' AND title ILIKE '%Python%'
  AND (hero_image_url IS NULL OR hero_image_url = '');

UPDATE articles
SET hero_image_url = 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80'
WHERE hero_image_url IS NULL OR hero_image_url = '';
