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
      artists: {
        Row: {
          bio: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          default_rate: number | null
          genre_tags: string[] | null
          id: string
          instagram_url: string | null
          media_url: string | null
          name: string
          org_id: string
          photo_url: string | null
          spotify_url: string | null
          tech_rider: string | null
          vetted: boolean
        }
        Insert: {
          bio?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          default_rate?: number | null
          genre_tags?: string[] | null
          id?: string
          instagram_url?: string | null
          media_url?: string | null
          name: string
          org_id: string
          photo_url?: string | null
          spotify_url?: string | null
          tech_rider?: string | null
          vetted?: boolean
        }
        Update: {
          bio?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          default_rate?: number | null
          genre_tags?: string[] | null
          id?: string
          instagram_url?: string | null
          media_url?: string | null
          name?: string
          org_id?: string
          photo_url?: string | null
          spotify_url?: string | null
          tech_rider?: string | null
          vetted?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "artists_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      attendees: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          phone: string | null
          source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          phone?: string | null
          source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          phone?: string | null
          source?: string | null
        }
        Relationships: []
      }
      event_artists: {
        Row: {
          agreed_pay: number | null
          artist_id: string
          booking_status: Database["public"]["Enums"]["artist_booking_status"]
          created_at: string
          event_id: string
          id: string
          pay_status: Database["public"]["Enums"]["payment_status"]
          set_order: number | null
        }
        Insert: {
          agreed_pay?: number | null
          artist_id: string
          booking_status?: Database["public"]["Enums"]["artist_booking_status"]
          created_at?: string
          event_id: string
          id?: string
          pay_status?: Database["public"]["Enums"]["payment_status"]
          set_order?: number | null
        }
        Update: {
          agreed_pay?: number | null
          artist_id?: string
          booking_status?: Database["public"]["Enums"]["artist_booking_status"]
          created_at?: string
          event_id?: string
          id?: string
          pay_status?: Database["public"]["Enums"]["payment_status"]
          set_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "event_artists_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_artists_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          capacity: number | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          door_price: number | null
          doors_open: string | null
          event_date: string
          featured: boolean
          id: string
          media_url: string | null
          name: string
          org_id: string
          rsvp_count: number
          rsvp_limit: number | null
          show_start: string | null
          slug: string | null
          status: Database["public"]["Enums"]["event_status"]
          venue_id: string | null
        }
        Insert: {
          capacity?: number | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          door_price?: number | null
          doors_open?: string | null
          event_date: string
          featured?: boolean
          id?: string
          media_url?: string | null
          name: string
          org_id: string
          rsvp_count?: number
          rsvp_limit?: number | null
          show_start?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          venue_id?: string | null
        }
        Update: {
          capacity?: number | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          door_price?: number | null
          doors_open?: string | null
          event_date?: string
          featured?: boolean
          id?: string
          media_url?: string | null
          name?: string
          org_id?: string
          rsvp_count?: number
          rsvp_limit?: number | null
          show_start?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["expense_category"]
          created_at: string
          description: string | null
          event_id: string
          id: string
        }
        Insert: {
          amount: number
          category: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          description?: string | null
          event_id: string
          id?: string
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          description?: string | null
          event_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          plan: Database["public"]["Enums"]["org_plan"]
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          plan?: Database["public"]["Enums"]["org_plan"]
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          plan?: Database["public"]["Enums"]["org_plan"]
          slug?: string
        }
        Relationships: []
      }
      revenue: {
        Row: {
          amount: number
          created_at: string
          event_id: string
          id: string
          notes: string | null
          source: Database["public"]["Enums"]["revenue_source"]
        }
        Insert: {
          amount: number
          created_at?: string
          event_id: string
          id?: string
          notes?: string | null
          source: Database["public"]["Enums"]["revenue_source"]
        }
        Update: {
          amount?: number
          created_at?: string
          event_id?: string
          id?: string
          notes?: string | null
          source?: Database["public"]["Enums"]["revenue_source"]
        }
        Relationships: [
          {
            foreignKeyName: "revenue_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      rsvps: {
        Row: {
          attendee_id: string
          checked_in: boolean
          checked_in_at: string | null
          confirmation_code: string
          created_at: string
          event_id: string
          id: string
          party_size: number
          reminder_2hr_sent: boolean
          reminder_48hr_sent: boolean
          status: Database["public"]["Enums"]["rsvp_status"]
        }
        Insert: {
          attendee_id: string
          checked_in?: boolean
          checked_in_at?: string | null
          confirmation_code?: string
          created_at?: string
          event_id: string
          id?: string
          party_size?: number
          reminder_2hr_sent?: boolean
          reminder_48hr_sent?: boolean
          status?: Database["public"]["Enums"]["rsvp_status"]
        }
        Update: {
          attendee_id?: string
          checked_in?: boolean
          checked_in_at?: string | null
          confirmation_code?: string
          created_at?: string
          event_id?: string
          id?: string
          party_size?: number
          reminder_2hr_sent?: boolean
          reminder_48hr_sent?: boolean
          status?: Database["public"]["Enums"]["rsvp_status"]
        }
        Relationships: [
          {
            foreignKeyName: "rsvps_attendee_id_fkey"
            columns: ["attendee_id"]
            isOneToOne: false
            referencedRelation: "attendees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string
          id: string
          org_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          active: boolean
          address: string | null
          capacity: number | null
          city: string | null
          cover_image_url: string | null
          created_at: string
          google_maps_embed: string | null
          id: string
          instagram_url: string | null
          name: string
          org_id: string
          state: string | null
          vibe_tags: string[] | null
        }
        Insert: {
          active?: boolean
          address?: string | null
          capacity?: number | null
          city?: string | null
          cover_image_url?: string | null
          created_at?: string
          google_maps_embed?: string | null
          id?: string
          instagram_url?: string | null
          name: string
          org_id: string
          state?: string | null
          vibe_tags?: string[] | null
        }
        Update: {
          active?: boolean
          address?: string | null
          capacity?: number | null
          city?: string | null
          cover_image_url?: string | null
          created_at?: string
          google_maps_embed?: string | null
          id?: string
          instagram_url?: string | null
          name?: string
          org_id?: string
          state?: string | null
          vibe_tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "venues_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_event_pnl: {
        Args: { p_event_id: string }
        Returns: {
          artist_costs: number
          net: number
          total_expenses: number
          total_revenue: number
        }[]
      }
      my_org_id: { Args: never; Returns: string }
    }
    Enums: {
      artist_booking_status: "invited" | "confirmed" | "declined"
      event_status:
        | "draft"
        | "pending"
        | "confirmed"
        | "completed"
        | "cancelled"
      expense_category: "venue" | "artist" | "promo" | "equipment" | "other"
      org_plan: "portfolio" | "starter" | "pro"
      payment_status: "pending" | "paid"
      revenue_source: "door" | "bar_split" | "sponsorship" | "merch" | "other"
      rsvp_status: "confirmed" | "cancelled"
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
      artist_booking_status: ["invited", "confirmed", "declined"],
      event_status: ["draft", "pending", "confirmed", "completed", "cancelled"],
      expense_category: ["venue", "artist", "promo", "equipment", "other"],
      org_plan: ["portfolio", "starter", "pro"],
      payment_status: ["pending", "paid"],
      revenue_source: ["door", "bar_split", "sponsorship", "merch", "other"],
      rsvp_status: ["confirmed", "cancelled"],
    },
  },
} as const
