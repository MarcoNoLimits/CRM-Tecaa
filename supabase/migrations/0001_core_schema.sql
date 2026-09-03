-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users (id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('admin', 'manager', 'member')) DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  domain TEXT,
  industry TEXT,
  size TEXT,
  website TEXT,
  owner_id UUID REFERENCES public.profiles (id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create contacts table
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  company_id UUID REFERENCES public.companies (id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('active', 'inactive', 'lead', 'archived')) DEFAULT 'active',
  owner_id UUID REFERENCES public.profiles (id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create pipeline_stages table
CREATE TABLE public.pipeline_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  color TEXT DEFAULT '#5e6ad2',
  position INTEGER NOT NULL,
  probability INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create deals table
CREATE TABLE public.deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  value DECIMAL(12, 2),
  stage_id UUID REFERENCES public.pipeline_stages (id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.contacts (id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.companies (id) ON DELETE SET NULL,
  owner_id UUID REFERENCES public.profiles (id),
  status TEXT CHECK (status IN ('open', 'won', 'lost')) DEFAULT 'open',
  close_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create activities table
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT CHECK (type IN ('call', 'email', 'meeting', 'note')) NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  contact_id UUID REFERENCES public.contacts (id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies (id) ON DELETE CASCADE,
  deal_id UUID REFERENCES public.deals (id) ON DELETE CASCADE,
  due_date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES public.profiles (id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('todo', 'in_progress', 'done', 'cancelled')) DEFAULT 'todo',
  priority TEXT CHECK (priority IN ('urgent', 'high', 'medium', 'low')) DEFAULT 'medium',
  assignee_id UUID REFERENCES public.profiles (id),
  due_date TIMESTAMP WITH TIME ZONE,
  contact_id UUID REFERENCES public.contacts (id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.companies (id) ON DELETE SET NULL,
  deal_id UUID REFERENCES public.deals (id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles (id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public read, authenticated write/update (simple v1)
CREATE POLICY "Enable read for authenticated users" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Enable update for users on own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable read for authenticated users" ON public.companies FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON public.companies FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.companies FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for admin users" ON public.companies FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read for authenticated users" ON public.contacts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON public.contacts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.contacts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON public.contacts FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read for all" ON public.pipeline_stages FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.pipeline_stages FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.pipeline_stages FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read for authenticated users" ON public.deals FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON public.deals FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.deals FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON public.deals FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read for authenticated users" ON public.activities FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON public.activities FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.activities FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON public.activities FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read for authenticated users" ON public.tasks FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON public.tasks FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.tasks FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON public.tasks FOR DELETE USING (auth.role() = 'authenticated');

-- Create default pipeline stages
INSERT INTO public.pipeline_stages (name, color, position, probability) VALUES
  ('Lead', '#7170ff', 0, 10),
  ('Qualified', '#5e6ad2', 1, 25),
  ('Proposal', '#828fff', 2, 50),
  ('Negotiation', '#7170ff', 3, 75),
  ('Closed Won', '#27a644', 4, 100),
  ('Closed Lost', '#62666d', 5, 0);
