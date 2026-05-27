export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      events: {
        Row: {
          created_at: string
          description: string | null
          description_ar: string | null
          event_date: string | null
          event_time: string | null
          id: string
          key: string
          location: string | null
          maps_link: string | null
          sort_order: number
          title: string
          title_ar: string | null
          visible: boolean
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_ar?: string | null
          event_date?: string | null
          event_time?: string | null
          id?: string
          key: string
          location?: string | null
          maps_link?: string | null
          sort_order?: number
          title: string
          title_ar?: string | null
          visible?: boolean
        }
        Update: {
          created_at?: string
          description?: string | null
          description_ar?: string | null
          event_date?: string | null
          event_time?: string | null
          id?: string
          key?: string
          location?: string | null
          maps_link?: string | null
          sort_order?: number
          title?: string
          title_ar?: string | null
          visible?: boolean
        }
        Relationships: []
      }
      gallery: {
        Row: {
          created_at: string
          id: string
          image_url: string
          sort_order: number
          title: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          sort_order?: number
          title?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          sort_order?: number
          title?: string | null
        }
        Relationships: []
      }
      invites: {
        Row: {
          attendee_count: number
          created_at: string
          custom_message: string | null
          guest_name: string
          guest_type: string
          id: string
          notes: string | null
          phone: string | null
          plus_one: boolean
          rsvp_message: string | null
          rsvp_status: string
          show_church: boolean
          show_party: boolean
          table_number: string | null
          token: string
          updated_at: string
          vip: boolean
        }
        Insert: {
          attendee_count?: number
          created_at?: string
          custom_message?: string | null
          guest_name: string
          guest_type?: string
          id?: string
          notes?: string | null
          phone?: string | null
          plus_one?: boolean
          rsvp_message?: string | null
          rsvp_status?: string
          show_church?: boolean
          show_party?: boolean
          table_number?: string | null
          token: string
          updated_at?: string
          vip?: boolean
        }
        Update: {
          attendee_count?: number
          created_at?: string
          custom_message?: string | null
          guest_name?: string
          guest_type?: string
          id?: string
          notes?: string | null
          phone?: string | null
          plus_one?: boolean
          rsvp_message?: string | null
          rsvp_status?: string
          show_church?: boolean
          show_party?: boolean
          table_number?: string | null
          token?: string
          updated_at?: string
          vip?: boolean
        }
        Relationships: []
      }
      settings: {
        Row: {
          couple_names: string
          couple_names_ar: string | null
          hero_image_url: string | null
          hero_tagline: string | null
          hero_tagline_ar: string | null
          id: number
          music_url: string | null
          thank_you_message: string | null
          thank_you_message_ar: string | null
          wedding_date: string
        }
        Insert: {
          couple_names?: string
          couple_names_ar?: string | null
          hero_image_url?: string | null
          hero_tagline?: string | null
          hero_tagline_ar?: string | null
          id?: number
          music_url?: string | null
          thank_you_message?: string | null
          thank_you_message_ar?: string | null
          wedding_date?: string
        }
        Update: {
          couple_names?: string
          couple_names_ar?: string | null
          hero_image_url?: string | null
          hero_tagline?: string | null
          hero_tagline_ar?: string | null
          id?: number
          music_url?: string | null
          thank_you_message?: string | null
          thank_you_message_ar?: string | null
          wedding_date?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin"],
    },
  },
} as const
