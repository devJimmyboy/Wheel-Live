yarn run v1.22.19
$ /home/jimmy/static-apps/src/wheel-live/node_modules/.bin/supabase gen types typescript --project-id bieydyoyhczpohqvxxkd
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      channel: {
        Row: {
          id: number
          user_id: string | null
        }
        Insert: {
          id?: number
          user_id?: string | null
        }
        Update: {
          id?: number
          user_id?: string | null
        }
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
      }
      segments: {
        Row: {
          id: number
          name: string | null
          user_id: string | null
          weight: number | null
        }
        Insert: {
          id?: number
          name?: string | null
          user_id?: string | null
          weight?: number | null
        }
        Update: {
          id?: number
          name?: string | null
          user_id?: string | null
          weight?: number | null
        }
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
Done in 1.25s.
