// Supabase Database type — uses 'crm' as the schema with a public key proxy
// so supabase-js v2 can resolve table types correctly
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          role: 'admin' | 'manager' | 'member';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'admin' | 'manager' | 'member';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'admin' | 'manager' | 'member';
          created_at?: string;
          updated_at?: string;
        };
      };
      companies: {
        Row: {
          id: string;
          name: string;
          domain: string | null;
          industry: string | null;
          size: string | null;
          website: string | null;
          owner_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          domain?: string | null;
          industry?: string | null;
          size?: string | null;
          website?: string | null;
          owner_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          domain?: string | null;
          industry?: string | null;
          size?: string | null;
          website?: string | null;
          owner_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      contacts: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string | null;
          phone: string | null;
          company_id: string | null;
          status: 'active' | 'inactive' | 'lead' | 'archived';
          owner_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          email?: string | null;
          phone?: string | null;
          company_id?: string | null;
          status?: 'active' | 'inactive' | 'lead' | 'archived';
          owner_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          email?: string | null;
          phone?: string | null;
          company_id?: string | null;
          status?: 'active' | 'inactive' | 'lead' | 'archived';
          owner_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      pipeline_stages: {
        Row: {
          id: string;
          name: string;
          color: string | null;
          position: number;
          probability: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          color?: string | null;
          position: number;
          probability?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string | null;
          position?: number;
          probability?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      deals: {
        Row: {
          id: string;
          title: string;
          value: number | null;
          stage_id: string | null;
          contact_id: string | null;
          company_id: string | null;
          owner_id: string | null;
          status: 'open' | 'won' | 'lost';
          close_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          value?: number | null;
          stage_id?: string | null;
          contact_id?: string | null;
          company_id?: string | null;
          owner_id?: string | null;
          status?: 'open' | 'won' | 'lost';
          close_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          value?: number | null;
          stage_id?: string | null;
          contact_id?: string | null;
          company_id?: string | null;
          owner_id?: string | null;
          status?: 'open' | 'won' | 'lost';
          close_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      activities: {
        Row: {
          id: string;
          type: 'call' | 'email' | 'meeting' | 'note';
          subject: string;
          description: string | null;
          contact_id: string | null;
          company_id: string | null;
          deal_id: string | null;
          owner_id: string | null;
          due_date: string | null;
          completed_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: 'call' | 'email' | 'meeting' | 'note';
          subject: string;
          description?: string | null;
          contact_id?: string | null;
          company_id?: string | null;
          deal_id?: string | null;
          owner_id?: string | null;
          due_date?: string | null;
          completed_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: 'call' | 'email' | 'meeting' | 'note';
          subject?: string;
          description?: string | null;
          contact_id?: string | null;
          company_id?: string | null;
          deal_id?: string | null;
          owner_id?: string | null;
          due_date?: string | null;
          completed_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          status: 'todo' | 'in_progress' | 'done' | 'cancelled';
          priority: 'urgent' | 'high' | 'medium' | 'low';
          assignee_id: string | null;
          due_date: string | null;
          contact_id: string | null;
          company_id: string | null;
          deal_id: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          status?: 'todo' | 'in_progress' | 'done' | 'cancelled';
          priority?: 'urgent' | 'high' | 'medium' | 'low';
          assignee_id?: string | null;
          due_date?: string | null;
          contact_id?: string | null;
          company_id?: string | null;
          deal_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          status?: 'todo' | 'in_progress' | 'done' | 'cancelled';
          priority?: 'urgent' | 'high' | 'medium' | 'low';
          assignee_id?: string | null;
          due_date?: string | null;
          contact_id?: string | null;
          company_id?: string | null;
          deal_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
  // Also expose as 'crm' for reference
  crm: {
    Tables: Database['public']['Tables'];
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

// Convenience type aliases (using public schema key which supabase-js resolves)
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Company = Database['public']['Tables']['companies']['Row'];
export type Contact = Database['public']['Tables']['contacts']['Row'];
export type PipelineStage = Database['public']['Tables']['pipeline_stages']['Row'];
export type Deal = Database['public']['Tables']['deals']['Row'];
export type Activity = Database['public']['Tables']['activities']['Row'];
export type Task = Database['public']['Tables']['tasks']['Row'];

// Insert type helpers
export type CompanyInsert = Database['public']['Tables']['companies']['Insert'];
export type CompanyUpdate = Database['public']['Tables']['companies']['Update'];
export type ContactInsert = Database['public']['Tables']['contacts']['Insert'];
export type ContactUpdate = Database['public']['Tables']['contacts']['Update'];
export type PipelineStageInsert = Database['public']['Tables']['pipeline_stages']['Insert'];
export type PipelineStageUpdate = Database['public']['Tables']['pipeline_stages']['Update'];
export type DealInsert = Database['public']['Tables']['deals']['Insert'];
export type DealUpdate = Database['public']['Tables']['deals']['Update'];
export type ActivityInsert = Database['public']['Tables']['activities']['Insert'];
export type ActivityUpdate = Database['public']['Tables']['activities']['Update'];
export type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
export type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

// Enriched types with joined relations
export type ContactWithCompany = Contact & {
  companies: Pick<Company, 'id' | 'name'> | null;
};

export type DealWithRelations = Deal & {
  contacts: Pick<Contact, 'id' | 'first_name' | 'last_name'> | null;
  companies: Pick<Company, 'id' | 'name'> | null;
  pipeline_stages: Pick<PipelineStage, 'id' | 'name' | 'color' | 'position' | 'probability'> | null;
};

export type ActivityWithRelations = Activity & {
  contacts: Pick<Contact, 'id' | 'first_name' | 'last_name'> | null;
  companies: Pick<Company, 'id' | 'name'> | null;
  deals: Pick<Deal, 'id' | 'title'> | null;
};

export type TaskWithAssignee = Task & {
  profiles: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null;
};
