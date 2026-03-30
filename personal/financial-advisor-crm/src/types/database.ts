export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          settings: Json
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          settings?: Json
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          settings?: Json
          created_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          organization_id: string
          email: string
          full_name: string
          role: 'admin' | 'advisor'
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          organization_id: string
          email: string
          full_name: string
          role: 'admin' | 'advisor'
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          email?: string
          full_name?: string
          role?: 'admin' | 'advisor'
          avatar_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      pipeline_stages: {
        Row: {
          id: string
          organization_id: string
          name: string
          color: string
          position: number
          is_closed: boolean
          is_won: boolean
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          color: string
          position: number
          is_closed?: boolean
          is_won?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          color?: string
          position?: number
          is_closed?: boolean
          is_won?: boolean
          created_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          id: string
          organization_id: string
          assigned_to: string | null
          stage_id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          date_of_birth: string | null
          source: string | null
          financial_goals: string | null
          notes: string | null
          lead_score: number
          score_factors: Json
          last_scored_at: string | null
          created_at: string
          updated_at: string
          estimated_value: number
          last_contact_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          assigned_to?: string | null
          stage_id: string
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          date_of_birth?: string | null
          source?: string | null
          financial_goals?: string | null
          notes?: string | null
          lead_score?: number
          score_factors?: Json
          last_scored_at?: string | null
          created_at?: string
          updated_at?: string
          estimated_value?: number
          last_contact_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          assigned_to?: string | null
          stage_id?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          date_of_birth?: string | null
          source?: string | null
          financial_goals?: string | null
          notes?: string | null
          lead_score?: number
          score_factors?: Json
          last_scored_at?: string | null
          created_at?: string
          updated_at?: string
          estimated_value?: number
          last_contact_at?: string | null
        }
        Relationships: []
      }
      lead_activities: {
        Row: {
          id: string
          organization_id: string
          lead_id: string
          user_id: string | null
          activity_type: 'call' | 'email' | 'meeting' | 'note' | 'stage_change' | 'task_completed'
          subject: string | null
          description: string | null
          metadata: Json
          occurred_at: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          lead_id: string
          user_id?: string | null
          activity_type: 'call' | 'email' | 'meeting' | 'note' | 'stage_change' | 'task_completed'
          subject?: string | null
          description?: string | null
          metadata?: Json
          occurred_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          lead_id?: string
          user_id?: string | null
          activity_type?: 'call' | 'email' | 'meeting' | 'note' | 'stage_change' | 'task_completed'
          subject?: string | null
          description?: string | null
          metadata?: Json
          occurred_at?: string
          created_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          id: string
          organization_id: string
          lead_id: string | null
          assigned_to: string
          title: string
          description: string | null
          due_date: string
          priority: 'low' | 'medium' | 'high'
          status: 'pending' | 'done'
          task_type: 'follow_up' | 'renewal' | 'consultation' | 'document' | 'review' | 'meeting' | 'other'
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          lead_id?: string | null
          assigned_to: string
          title: string
          description?: string | null
          due_date: string
          priority?: 'low' | 'medium' | 'high'
          status?: 'pending' | 'done'
          task_type?: 'follow_up' | 'renewal' | 'consultation' | 'document' | 'review' | 'meeting' | 'other'
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          lead_id?: string | null
          assigned_to?: string
          title?: string
          description?: string | null
          due_date?: string
          priority?: 'low' | 'medium' | 'high'
          status?: 'pending' | 'done'
          task_type?: 'follow_up' | 'renewal' | 'consultation' | 'document' | 'review' | 'meeting' | 'other'
          created_at?: string
        }
        Relationships: []
      }
      activity_logs: {
        Row: {
          id: string
          organization_id: string
          lead_id: string
          user_id: string
          action_type: string
          description: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          lead_id: string
          user_id: string
          action_type: string
          description: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          lead_id?: string
          user_id?: string
          action_type?: string
          description?: string
          metadata?: Json
          created_at?: string
        }
        Relationships: []
      }
      invites: {
        Row: {
          id: string
          organization_id: string
          email: string
          role: 'admin' | 'advisor'
          token: string
          invited_by: string
          accepted_at: string | null
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          email: string
          role?: 'admin' | 'advisor'
          token: string
          invited_by: string
          accepted_at?: string | null
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          email?: string
          role?: 'admin' | 'advisor'
          token?: string
          invited_by?: string
          accepted_at?: string | null
          expires_at?: string
          created_at?: string
        }
        Relationships: []
      }
      policies: {
        Row: {
          id: string
          organization_id: string
          client_id: string
          created_by: string
          policy_type: 'life_insurance' | 'annuity' | 'ltc' | 'health' | 'disability' | 'other'
          policy_name: string
          policy_number: string | null
          carrier: string
          status: 'active' | 'pending' | 'grace_period' | 'lapsed' | 'cancelled' | 'matured'
          effective_date: string
          expiration_date: string | null
          renewal_date: string | null
          premium_amount: number
          premium_frequency: 'monthly' | 'quarterly' | 'semi_annual' | 'annual' | 'single_premium'
          coverage_amount: number | null
          beneficiaries: Json
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          client_id: string
          created_by: string
          policy_type: 'life_insurance' | 'annuity' | 'ltc' | 'health' | 'disability' | 'other'
          policy_name: string
          policy_number?: string | null
          carrier: string
          status?: 'active' | 'pending' | 'grace_period' | 'lapsed' | 'cancelled' | 'matured'
          effective_date: string
          expiration_date?: string | null
          renewal_date?: string | null
          premium_amount: number
          premium_frequency: 'monthly' | 'quarterly' | 'semi_annual' | 'annual' | 'single_premium'
          coverage_amount?: number | null
          beneficiaries?: Json
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          client_id?: string
          created_by?: string
          policy_type?: 'life_insurance' | 'annuity' | 'ltc' | 'health' | 'disability' | 'other'
          policy_name?: string
          policy_number?: string | null
          carrier?: string
          status?: 'active' | 'pending' | 'grace_period' | 'lapsed' | 'cancelled' | 'matured'
          effective_date?: string
          expiration_date?: string | null
          renewal_date?: string | null
          premium_amount?: number
          premium_frequency?: 'monthly' | 'quarterly' | 'semi_annual' | 'annual' | 'single_premium'
          coverage_amount?: number | null
          beneficiaries?: Json
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      policy_documents: {
        Row: {
          id: string
          organization_id: string
          policy_id: string | null
          uploaded_by: string
          category: string
          file_name: string
          file_type: string
          file_size: number
          storage_path: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          policy_id?: string | null
          uploaded_by: string
          category: string
          file_name: string
          file_type: string
          file_size: number
          storage_path: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          policy_id?: string | null
          uploaded_by?: string
          category?: string
          file_name?: string
          file_type?: string
          file_size?: number
          storage_path?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

// Convenience types
export type Organization = Database['public']['Tables']['organizations']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type PipelineStage = Database['public']['Tables']['pipeline_stages']['Row']
export type Lead = Database['public']['Tables']['leads']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type ActivityLog = Database['public']['Tables']['activity_logs']['Row']
export type Invite = Database['public']['Tables']['invites']['Row']
export type Policy = Database['public']['Tables']['policies']['Row']
export type PolicyDocument = Database['public']['Tables']['policy_documents']['Row']
export type LeadActivity = Database['public']['Tables']['lead_activities']['Row']

// Insert types
export type OrganizationInsert = Database['public']['Tables']['organizations']['Insert']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type PipelineStageInsert = Database['public']['Tables']['pipeline_stages']['Insert']
export type LeadInsert = Database['public']['Tables']['leads']['Insert']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type ActivityLogInsert = Database['public']['Tables']['activity_logs']['Insert']
export type InviteInsert = Database['public']['Tables']['invites']['Insert']
export type PolicyInsert = Database['public']['Tables']['policies']['Insert']
export type PolicyDocumentInsert = Database['public']['Tables']['policy_documents']['Insert']
export type LeadActivityInsert = Database['public']['Tables']['lead_activities']['Insert']

// Update types
export type OrganizationUpdate = Database['public']['Tables']['organizations']['Update']
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type PipelineStageUpdate = Database['public']['Tables']['pipeline_stages']['Update']
export type LeadUpdate = Database['public']['Tables']['leads']['Update']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']
export type ActivityLogUpdate = Database['public']['Tables']['activity_logs']['Update']
export type InviteUpdate = Database['public']['Tables']['invites']['Update']
export type PolicyUpdate = Database['public']['Tables']['policies']['Update']
export type PolicyDocumentUpdate = Database['public']['Tables']['policy_documents']['Update']
export type LeadActivityUpdate = Database['public']['Tables']['lead_activities']['Update']

// Extended types with relations
export interface LeadWithStage extends Lead {
  stage: PipelineStage
  assigned_user?: User
}

export interface TaskWithLead extends Task {
  lead?: Lead
}

export interface PolicyWithClient extends Policy {
  client: Lead
}

export interface Beneficiary {
  name: string
  percentage: number
}

export interface LeadActivityWithUser extends LeadActivity {
  user?: User
}
