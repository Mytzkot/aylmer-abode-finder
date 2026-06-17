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
      addon_requests: {
        Row: {
          addon_id: string | null
          addon_name: string | null
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          phone: string | null
          quantity: number
        }
        Insert: {
          addon_id?: string | null
          addon_name?: string | null
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          phone?: string | null
          quantity?: number
        }
        Update: {
          addon_id?: string | null
          addon_name?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "addon_requests_addon_id_fkey"
            columns: ["addon_id"]
            isOneToOne: false
            referencedRelation: "addons"
            referencedColumns: ["id"]
          },
        ]
      }
      addons: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          description_fr: string | null
          id: string
          image_url: string | null
          name: string
          name_fr: string | null
          price: number | null
          price_unit: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          description_fr?: string | null
          id?: string
          image_url?: string | null
          name: string
          name_fr?: string | null
          price?: number | null
          price_unit?: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          description_fr?: string | null
          id?: string
          image_url?: string | null
          name?: string
          name_fr?: string | null
          price?: number | null
          price_unit?: string
          sort_order?: number
        }
        Relationships: []
      }
      applications: {
        Row: {
          additional_information: string | null
          additional_occupants: Json | null
          country_of_origin: string | null
          created_at: string
          current_landlord_name: string | null
          current_landlord_phone: string | null
          date_of_birth: string | null
          desired_move_in_date: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          employer_address: string | null
          employer_name: string | null
          employer_phone: string | null
          employment_duration: string | null
          first_name: string | null
          first_time_renter: boolean | null
          id: string
          is_student: boolean | null
          monthly_income: number | null
          present_address: string | null
          present_occupation: string | null
          program_of_study: string | null
          reason_for_moving: string | null
          reference_1_name: string | null
          reference_1_phone: string | null
          reference_2_name: string | null
          reference_2_phone: string | null
          reference_name: string | null
          reference_phone: string | null
          room_id: string | null
          school_name: string | null
          source_of_income: string | null
          status: string
          stay_type: string | null
          student_document_path: string | null
          study_start_date: string | null
          surname: string | null
          telephone: string | null
        }
        Insert: {
          additional_information?: string | null
          additional_occupants?: Json | null
          country_of_origin?: string | null
          created_at?: string
          current_landlord_name?: string | null
          current_landlord_phone?: string | null
          date_of_birth?: string | null
          desired_move_in_date?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employer_address?: string | null
          employer_name?: string | null
          employer_phone?: string | null
          employment_duration?: string | null
          first_name?: string | null
          first_time_renter?: boolean | null
          id?: string
          is_student?: boolean | null
          monthly_income?: number | null
          present_address?: string | null
          present_occupation?: string | null
          program_of_study?: string | null
          reason_for_moving?: string | null
          reference_1_name?: string | null
          reference_1_phone?: string | null
          reference_2_name?: string | null
          reference_2_phone?: string | null
          reference_name?: string | null
          reference_phone?: string | null
          room_id?: string | null
          school_name?: string | null
          source_of_income?: string | null
          status?: string
          stay_type?: string | null
          student_document_path?: string | null
          study_start_date?: string | null
          surname?: string | null
          telephone?: string | null
        }
        Update: {
          additional_information?: string | null
          additional_occupants?: Json | null
          country_of_origin?: string | null
          created_at?: string
          current_landlord_name?: string | null
          current_landlord_phone?: string | null
          date_of_birth?: string | null
          desired_move_in_date?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employer_address?: string | null
          employer_name?: string | null
          employer_phone?: string | null
          employment_duration?: string | null
          first_name?: string | null
          first_time_renter?: boolean | null
          id?: string
          is_student?: boolean | null
          monthly_income?: number | null
          present_address?: string | null
          present_occupation?: string | null
          program_of_study?: string | null
          reason_for_moving?: string | null
          reference_1_name?: string | null
          reference_1_phone?: string | null
          reference_2_name?: string | null
          reference_2_phone?: string | null
          reference_name?: string | null
          reference_phone?: string | null
          room_id?: string | null
          school_name?: string | null
          source_of_income?: string | null
          status?: string
          stay_type?: string | null
          student_document_path?: string | null
          study_start_date?: string | null
          surname?: string | null
          telephone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      card_payment_requests: {
        Row: {
          address_or_room: string | null
          amount: number | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          message: string | null
          name: string
          status: string
        }
        Insert: {
          address_or_room?: string | null
          amount?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          message?: string | null
          name: string
          status?: string
        }
        Update: {
          address_or_room?: string | null
          amount?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          message?: string | null
          name?: string
          status?: string
        }
        Relationships: []
      }
      monthly_expenses: {
        Row: {
          cleaning: number
          created_at: string
          electricity: number
          gas: number
          id: string
          insurance: number
          internet: number
          labor_fees: number
          maintenance: number
          property_id: string
          rent_mortgage: number
          updated_at: string
          year_month: string
        }
        Insert: {
          cleaning?: number
          created_at?: string
          electricity?: number
          gas?: number
          id?: string
          insurance?: number
          internet?: number
          labor_fees?: number
          maintenance?: number
          property_id: string
          rent_mortgage?: number
          updated_at?: string
          year_month: string
        }
        Update: {
          cleaning?: number
          created_at?: string
          electricity?: number
          gas?: number
          id?: string
          insurance?: number
          internet?: number
          labor_fees?: number
          maintenance?: number
          property_id?: string
          rent_mortgage?: number
          updated_at?: string
          year_month?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_expenses_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          unsubscribe_token: string
          unsubscribed_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          unsubscribe_token?: string
          unsubscribed_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          unsubscribe_token?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      payment_ledger: {
        Row: {
          amount: number
          created_at: string
          id: string
          method: string | null
          notes: string | null
          paid_on: string
          tenant_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          method?: string | null
          notes?: string | null
          paid_on?: string
          tenant_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          method?: string | null
          notes?: string | null
          paid_on?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_ledger_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address: string
          airbnb_url: string | null
          city: string
          created_at: string
          description: string | null
          google_maps_url: string | null
          id: string
          image_urls: string[] | null
          short_name: string | null
          slug: string | null
          square_location_id: string | null
          youtube_url: string | null
        }
        Insert: {
          address: string
          airbnb_url?: string | null
          city?: string
          created_at?: string
          description?: string | null
          google_maps_url?: string | null
          id?: string
          image_urls?: string[] | null
          short_name?: string | null
          slug?: string | null
          square_location_id?: string | null
          youtube_url?: string | null
        }
        Update: {
          address?: string
          airbnb_url?: string | null
          city?: string
          created_at?: string
          description?: string | null
          google_maps_url?: string | null
          id?: string
          image_urls?: string[] | null
          short_name?: string | null
          slug?: string | null
          square_location_id?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      rent_reminders: {
        Row: {
          amount_due: number | null
          channel: string
          contact: string | null
          id: string
          month_start: string
          notes: string | null
          sent_at: string
          sent_by: string | null
          tenant_id: string
        }
        Insert: {
          amount_due?: number | null
          channel: string
          contact?: string | null
          id?: string
          month_start: string
          notes?: string | null
          sent_at?: string
          sent_by?: string | null
          tenant_id: string
        }
        Update: {
          amount_due?: number | null
          channel?: string
          contact?: string | null
          id?: string
          month_start?: string
          notes?: string | null
          sent_at?: string
          sent_by?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rent_reminders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          active: boolean
          created_at: string
          id: string
          rating: number
          review_date: string
          review_text: string
          reviewer_name: string
          sort_order: number
          source: string
          verified: boolean
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          rating: number
          review_date?: string
          review_text: string
          reviewer_name: string
          sort_order?: number
          source?: string
          verified?: boolean
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          rating?: number
          review_date?: string
          review_text?: string
          reviewer_name?: string
          sort_order?: number
          source?: string
          verified?: boolean
        }
        Relationships: []
      }
      rooms: {
        Row: {
          airbnb_listing_url: string | null
          available_from: string | null
          base_rate: number | null
          bed_type: string | null
          booked_until: string | null
          created_at: string
          current_status: string
          description_en: string | null
          description_fr: string | null
          externally_managed: boolean
          features: string[] | null
          id: string
          image_urls: string[] | null
          manual_available: boolean
          name: string | null
          notes: string | null
          property_id: string | null
          rate_monthly: number | null
          rate_nightly: number | null
          rate_weekly: number | null
          room_number: string | null
          slug: string | null
          square_item_id: string | null
          square_variation_id: string | null
          youtube_video_url: string | null
        }
        Insert: {
          airbnb_listing_url?: string | null
          available_from?: string | null
          base_rate?: number | null
          bed_type?: string | null
          booked_until?: string | null
          created_at?: string
          current_status?: string
          description_en?: string | null
          description_fr?: string | null
          externally_managed?: boolean
          features?: string[] | null
          id?: string
          image_urls?: string[] | null
          manual_available?: boolean
          name?: string | null
          notes?: string | null
          property_id?: string | null
          rate_monthly?: number | null
          rate_nightly?: number | null
          rate_weekly?: number | null
          room_number?: string | null
          slug?: string | null
          square_item_id?: string | null
          square_variation_id?: string | null
          youtube_video_url?: string | null
        }
        Update: {
          airbnb_listing_url?: string | null
          available_from?: string | null
          base_rate?: number | null
          bed_type?: string | null
          booked_until?: string | null
          created_at?: string
          current_status?: string
          description_en?: string | null
          description_fr?: string | null
          externally_managed?: boolean
          features?: string[] | null
          id?: string
          image_urls?: string[] | null
          manual_available?: boolean
          name?: string | null
          notes?: string | null
          property_id?: string | null
          rate_monthly?: number | null
          rate_nightly?: number | null
          rate_weekly?: number | null
          room_number?: string | null
          slug?: string | null
          square_item_id?: string | null
          square_variation_id?: string | null
          youtube_video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rooms_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      site_stats: {
        Row: {
          id: string
          updated_at: string
          visitor_count: number
        }
        Insert: {
          id: string
          updated_at?: string
          visitor_count?: number
        }
        Update: {
          id?: string
          updated_at?: string
          visitor_count?: number
        }
        Relationships: []
      }
      tenant_messages: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          location: string
          message: string
          phone: string | null
          room_number: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          location: string
          message: string
          phone?: string | null
          room_number?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          location?: string
          message?: string
          phone?: string | null
          room_number?: string | null
        }
        Relationships: []
      }
      tenants: {
        Row: {
          application_id: string | null
          created_at: string
          deposit_amount: number | null
          deposit_returned: boolean
          email: string | null
          first_name: string | null
          id: string
          lease_end: string | null
          lease_start: string | null
          monthly_rent: number | null
          move_in_date: string | null
          notes: string | null
          payment_status: string
          room_id: string | null
          status: string
          surname: string | null
          telephone: string | null
        }
        Insert: {
          application_id?: string | null
          created_at?: string
          deposit_amount?: number | null
          deposit_returned?: boolean
          email?: string | null
          first_name?: string | null
          id?: string
          lease_end?: string | null
          lease_start?: string | null
          monthly_rent?: number | null
          move_in_date?: string | null
          notes?: string | null
          payment_status?: string
          room_id?: string | null
          status?: string
          surname?: string | null
          telephone?: string | null
        }
        Update: {
          application_id?: string | null
          created_at?: string
          deposit_amount?: number | null
          deposit_returned?: boolean
          email?: string | null
          first_name?: string | null
          id?: string
          lease_end?: string | null
          lease_start?: string | null
          monthly_rent?: number | null
          move_in_date?: string | null
          notes?: string | null
          payment_status?: string
          room_id?: string | null
          status?: string
          surname?: string | null
          telephone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenants_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
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
      approve_application: {
        Args: {
          application_id: string
          lease_term_months?: number
          room_id: string
        }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_site_visitors: { Args: never; Returns: number }
    }
    Enums: {
      app_role: "admin" | "staff" | "user"
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
      app_role: ["admin", "staff", "user"],
    },
  },
} as const
