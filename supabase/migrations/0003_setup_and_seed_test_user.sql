-- =============================================================================
-- CRM-Tecaa: Test User Creation & Demo Seed Data
-- Run this in Supabase SQL Editor to seed the test user:
-- Email:    admin@tecaa.com
-- Password: Password123!
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create test user in auth.users with pre-confirmed email (bypasses SMTP rate limits)
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

  -- Ensure profile exists in crm schema
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'crm' AND table_name = 'profiles') THEN
    INSERT INTO crm.profiles (id, full_name, role)
    VALUES (test_user_id, 'Test Admin', 'admin')
    ON CONFLICT (id) DO UPDATE
    SET role = 'admin', full_name = 'Test Admin';
  END IF;
END $$;
