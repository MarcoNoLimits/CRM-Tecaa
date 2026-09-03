-- =============================================================================
-- CRM-Tecaa Dedicated 'crm' Schema + RLS Policies + Test User + Demo Seed Data
-- =============================================================================

-- 1. Extensions & Schema Setup
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE SCHEMA IF NOT EXISTS crm;

GRANT USAGE ON SCHEMA crm TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA crm GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA crm GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- 2. Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS crm.profiles (
  id UUID REFERENCES auth.users (id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('admin', 'manager', 'member')) DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Companies Table
CREATE TABLE IF NOT EXISTS crm.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  domain TEXT,
  industry TEXT,
  size TEXT,
  website TEXT,
  owner_id UUID REFERENCES crm.profiles (id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Contacts Table
CREATE TABLE IF NOT EXISTS crm.contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  company_id UUID REFERENCES crm.companies (id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('active', 'inactive', 'lead', 'archived')) DEFAULT 'active',
  owner_id UUID REFERENCES crm.profiles (id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Pipeline Stages Table
CREATE TABLE IF NOT EXISTS crm.pipeline_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  color TEXT DEFAULT '#5e6ad2',
  position INTEGER NOT NULL,
  probability INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Deals Table
CREATE TABLE IF NOT EXISTS crm.deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  value DECIMAL(12, 2),
  stage_id UUID REFERENCES crm.pipeline_stages (id) ON DELETE SET NULL,
  contact_id UUID REFERENCES crm.contacts (id) ON DELETE SET NULL,
  company_id UUID REFERENCES crm.companies (id) ON DELETE SET NULL,
  owner_id UUID REFERENCES crm.profiles (id),
  status TEXT CHECK (status IN ('open', 'won', 'lost')) DEFAULT 'open',
  close_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. Activities Table
CREATE TABLE IF NOT EXISTS crm.activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT CHECK (type IN ('call', 'email', 'meeting', 'note')) NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  contact_id UUID REFERENCES crm.contacts (id) ON DELETE CASCADE,
  company_id UUID REFERENCES crm.companies (id) ON DELETE CASCADE,
  deal_id UUID REFERENCES crm.deals (id) ON DELETE CASCADE,
  owner_id UUID REFERENCES crm.profiles (id),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES crm.profiles (id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. Tasks Table
CREATE TABLE IF NOT EXISTS crm.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('todo', 'in_progress', 'done', 'cancelled')) DEFAULT 'todo',
  priority TEXT CHECK (priority IN ('urgent', 'high', 'medium', 'low')) DEFAULT 'medium',
  assignee_id UUID REFERENCES crm.profiles (id),
  due_date TIMESTAMP WITH TIME ZONE,
  contact_id UUID REFERENCES crm.contacts (id) ON DELETE SET NULL,
  company_id UUID REFERENCES crm.companies (id) ON DELETE SET NULL,
  deal_id UUID REFERENCES crm.deals (id) ON DELETE SET NULL,
  created_by UUID REFERENCES crm.profiles (id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. Enable Row Level Security (RLS)
ALTER TABLE crm.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm.tasks ENABLE ROW LEVEL SECURITY;

-- 10. RLS Policies (Allow authenticated users full access in v1)
DO $$
BEGIN
  -- Profiles
  DROP POLICY IF EXISTS "profiles_all_auth" ON crm.profiles;
  CREATE POLICY "profiles_all_auth" ON crm.profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- Companies
  DROP POLICY IF EXISTS "companies_all_auth" ON crm.companies;
  CREATE POLICY "companies_all_auth" ON crm.companies FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- Contacts
  DROP POLICY IF EXISTS "contacts_all_auth" ON crm.contacts;
  CREATE POLICY "contacts_all_auth" ON crm.contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- Pipeline Stages
  DROP POLICY IF EXISTS "pipeline_stages_all_auth" ON crm.pipeline_stages;
  CREATE POLICY "pipeline_stages_all_auth" ON crm.pipeline_stages FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- Deals
  DROP POLICY IF EXISTS "deals_all_auth" ON crm.deals;
  CREATE POLICY "deals_all_auth" ON crm.deals FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- Activities
  DROP POLICY IF EXISTS "activities_all_auth" ON crm.activities;
  CREATE POLICY "activities_all_auth" ON crm.activities FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- Tasks
  DROP POLICY IF EXISTS "tasks_all_auth" ON crm.tasks;
  CREATE POLICY "tasks_all_auth" ON crm.tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
END $$;

-- 11. Grant Table & Sequence permissions to roles
GRANT ALL ON ALL TABLES IN SCHEMA crm TO authenticated, anon, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA crm TO authenticated, anon, service_role;

-- 12. Trigger to automatically create crm.profiles when auth.users signs up
CREATE OR REPLACE FUNCTION crm.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO crm.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'member'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION crm.handle_new_user();

-- 13. Seed Default Pipeline Stages
INSERT INTO crm.pipeline_stages (name, color, position, probability)
SELECT * FROM (VALUES 
  ('Lead', '#7170ff', 0, 10),
  ('Qualified', '#5e6ad2', 1, 25),
  ('Proposal', '#828fff', 2, 50),
  ('Negotiation', '#f59e0b', 3, 75),
  ('Closed Won', '#27a644', 4, 100),
  ('Closed Lost', '#62666d', 5, 0)
) AS t(name, color, position, probability)
WHERE NOT EXISTS (SELECT 1 FROM crm.pipeline_stages LIMIT 1);

-- 14. Create / Seed Test Admin User directly into auth.users (bypasses email rate limits)
-- Credentials:
-- Email:    admin@tecaa.com
-- Password: Password123!
DO $$
DECLARE
  test_user_id UUID := 'a0000000-0000-0000-0000-000000000001';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@tecaa.com') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      test_user_id,
      'authenticated',
      'authenticated',
      'admin@tecaa.com',
      crypt('Password123!', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Test Admin"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
  ELSE
    SELECT id INTO test_user_id FROM auth.users WHERE email = 'admin@tecaa.com';
    UPDATE auth.users
    SET encrypted_password = crypt('Password123!', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
        raw_user_meta_data = '{"full_name":"Test Admin"}'
    WHERE id = test_user_id;
  END IF;

  -- Ensure profile exists with admin role
  INSERT INTO crm.profiles (id, full_name, role)
  VALUES (test_user_id, 'Test Admin', 'admin')
  ON CONFLICT (id) DO UPDATE
  SET role = 'admin', full_name = 'Test Admin';
END $$;

-- 15. Seed Demo Data (Company, Contacts, Deals, Tasks, Activities)
DO $$
DECLARE
  admin_id UUID;
  company_techcorp UUID;
  company_acme UUID;
  contact_sarah UUID;
  contact_alex UUID;
  stage_lead UUID;
  stage_qualified UUID;
  stage_proposal UUID;
  stage_won UUID;
  deal_enterprise UUID;
  deal_starter UUID;
BEGIN
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@tecaa.com';
  IF admin_id IS NULL THEN RETURN; END IF;

  -- Seed Companies
  INSERT INTO crm.companies (id, name, domain, industry, size, website, owner_id)
  VALUES 
    ('c0000000-0000-0000-0000-000000000001', 'TechCorp International', 'techcorp.io', 'Technology', '51-200', 'https://techcorp.io', admin_id),
    ('c0000000-0000-0000-0000-000000000002', 'Acme Logistics', 'acmelogistics.com', 'Supply Chain', '201-1000', 'https://acmelogistics.com', admin_id)
  ON CONFLICT (id) DO NOTHING;

  company_techcorp := 'c0000000-0000-0000-0000-000000000001';
  company_acme := 'c0000000-0000-0000-0000-000000000002';

  -- Seed Contacts
  INSERT INTO crm.contacts (id, first_name, last_name, email, phone, company_id, status, owner_id)
  VALUES
    ('b0000000-0000-0000-0000-000000000001', 'Sarah', 'Connor', 'sarah.connor@techcorp.io', '+1 555 0192', company_techcorp, 'active', admin_id),
    ('b0000000-0000-0000-0000-000000000002', 'Alex', 'Mercer', 'alex.mercer@acmelogistics.com', '+1 555 0184', company_acme, 'lead', admin_id)
  ON CONFLICT (id) DO NOTHING;

  contact_sarah := 'b0000000-0000-0000-0000-000000000001';
  contact_alex := 'b0000000-0000-0000-0000-000000000002';

  -- Fetch Stages
  SELECT id INTO stage_lead FROM crm.pipeline_stages WHERE name = 'Lead' LIMIT 1;
  SELECT id INTO stage_qualified FROM crm.pipeline_stages WHERE name = 'Qualified' LIMIT 1;
  SELECT id INTO stage_proposal FROM crm.pipeline_stages WHERE name = 'Proposal' LIMIT 1;
  SELECT id INTO stage_won FROM crm.pipeline_stages WHERE name = 'Closed Won' LIMIT 1;

  -- Seed Deals
  INSERT INTO crm.deals (id, title, value, stage_id, contact_id, company_id, owner_id, status)
  VALUES
    ('d0000000-0000-0000-0000-000000000001', 'Enterprise Cloud Migration', 48000.00, stage_proposal, contact_sarah, company_techcorp, admin_id, 'open'),
    ('d0000000-0000-0000-0000-000000000002', 'Fleet Tracking License', 15000.00, stage_qualified, contact_alex, company_acme, admin_id, 'open')
  ON CONFLICT (id) DO NOTHING;

  deal_enterprise := 'd0000000-0000-0000-0000-000000000001';
  deal_starter := 'd0000000-0000-0000-0000-000000000002';

  -- Seed Tasks
  INSERT INTO crm.tasks (title, description, status, priority, assignee_id, due_date, contact_id, deal_id)
  VALUES
    ('Send Q3 Architecture Proposal', 'Deliver updated PDF proposal with revised SLA terms', 'todo', 'urgent', admin_id, NOW() + INTERVAL '2 days', contact_sarah, deal_enterprise),
    ('Schedule intro demo with ops team', 'Walk through the telematics API endpoints', 'in_progress', 'high', admin_id, NOW() + INTERVAL '4 days', contact_alex, deal_starter),
    ('Review contract terms with legal', 'Check standard confidentiality clauses', 'done', 'medium', admin_id, NOW() - INTERVAL '1 day', contact_sarah, deal_enterprise)
  ON CONFLICT DO NOTHING;

  -- Seed Activities
  INSERT INTO crm.activities (type, subject, description, contact_id, company_id, deal_id, owner_id, due_date)
  VALUES
    ('call', 'Introductory discovery call', 'Discussed current infrastructure pains and cloud roadmap', contact_sarah, company_techcorp, deal_enterprise, admin_id, NOW() - INTERVAL '2 days'),
    ('meeting', 'Technical deep-dive on API', 'Reviewed webhook payloads and rate limiting requirements', contact_alex, company_acme, deal_starter, admin_id, NOW() + INTERVAL '1 day'),
    ('note', 'Client budget approved', 'VP of Ops confirmed budget envelope for migration in Q4', contact_sarah, company_techcorp, deal_enterprise, admin_id, NULL)
  ON CONFLICT DO NOTHING;
END $$;

-- 16. Notify PostgREST to reload schema cache immediately
NOTIFY pgrst, 'reload schema';
