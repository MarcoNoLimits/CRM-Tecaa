import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables');
}

// The CRM app uses the dedicated 'crm' Postgres schema at runtime.
// Type inference is intentionally skipped here — each hook applies
// manual casts via src/types/schema.ts to keep TypeScript happy.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: 'crm' },
});
