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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      artist_applications: {
        Row: {
          artist_name: string
          bio: string
          commission_media: string[]
          created_at: string
          email: string
          id: string
          message: string
          name: string
          name_en: string
          phone: string
          portfolio_url: string
          sample_artwork_note: string
          sample_artwork_title: string
          status: string
          style_tags: string[]
          tagline: string
          user_id: string
        }
        Insert: {
          artist_name?: string
          bio?: string
          commission_media?: string[]
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          name_en?: string
          phone?: string
          portfolio_url?: string
          sample_artwork_note?: string
          sample_artwork_title?: string
          status?: string
          style_tags?: string[]
          tagline?: string
          user_id: string
        }
        Update: {
          artist_name?: string
          bio?: string
          commission_media?: string[]
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          name_en?: string
          phone?: string
          portfolio_url?: string
          sample_artwork_note?: string
          sample_artwork_title?: string
          status?: string
          style_tags?: string[]
          tagline?: string
          user_id?: string
        }
        Relationships: []
      }
      artists: {
        Row: {
          bio: string
          commission_accepting: boolean
          commission_lead_time: string
          commission_media: string[]
          commission_price_range: string
          created_at: string
          hue: number
          id: string
          name: string
          name_en: string
          slug: string
          style_tags: string[]
          tagline: string
        }
        Insert: {
          bio?: string
          commission_accepting?: boolean
          commission_lead_time?: string
          commission_media?: string[]
          commission_price_range?: string
          created_at?: string
          hue?: number
          id?: string
          name: string
          name_en?: string
          slug: string
          style_tags?: string[]
          tagline?: string
        }
        Update: {
          bio?: string
          commission_accepting?: boolean
          commission_lead_time?: string
          commission_media?: string[]
          commission_price_range?: string
          created_at?: string
          hue?: number
          id?: string
          name?: string
          name_en?: string
          slug?: string
          style_tags?: string[]
          tagline?: string
        }
        Relationships: []
      }
      artworks: {
        Row: {
          artist_id: string
          created_at: string
          description: string
          hue: number
          id: string
          medium_type_code: string
          merch_enabled: boolean
          price: number
          size: string
          slug: string
          sold: boolean
          title: string
          variant: number
          year: number
        }
        Insert: {
          artist_id: string
          created_at?: string
          description?: string
          hue?: number
          id?: string
          medium_type_code: string
          merch_enabled?: boolean
          price: number
          size: string
          slug: string
          sold?: boolean
          title: string
          variant?: number
          year: number
        }
        Update: {
          artist_id?: string
          created_at?: string
          description?: string
          hue?: number
          id?: string
          medium_type_code?: string
          merch_enabled?: boolean
          price?: number
          size?: string
          slug?: string
          sold?: boolean
          title?: string
          variant?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "artworks_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_inquiries: {
        Row: {
          artist_id: string
          budget_max: number | null
          budget_min: number | null
          collector_name: string
          created_at: string
          email: string
          id: string
          medium: string
          message: string
          phone: string
          reference_note: string
          size: string
          status: string
          timeline: string
        }
        Insert: {
          artist_id: string
          budget_max?: number | null
          budget_min?: number | null
          collector_name: string
          created_at?: string
          email?: string
          id?: string
          medium?: string
          message?: string
          phone?: string
          reference_note?: string
          size?: string
          status?: string
          timeline?: string
        }
        Update: {
          artist_id?: string
          budget_max?: number | null
          budget_min?: number | null
          collector_name?: string
          created_at?: string
          email?: string
          id?: string
          medium?: string
          message?: string
          phone?: string
          reference_note?: string
          size?: string
          status?: string
          timeline?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_inquiries_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      general_inquiries: {
        Row: {
          category: string
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string
          status: string
        }
        Insert: {
          category?: string
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string
          status?: string
        }
        Update: {
          category?: string
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string
          status?: string
        }
        Relationships: []
      }
      journal_posts: {
        Row: {
          author: string
          body: string
          category: string
          cover_hue: number
          cover_image_url: string | null
          cover_variant: number
          created_at: string
          excerpt: string
          id: string
          published_at: string
          read_minutes: number
          related_artist_id: string | null
          related_artwork_id: string | null
          related_medium_category_code: string | null
          slug: string
          title: string
        }
        Insert: {
          author?: string
          body: string
          category: string
          cover_hue?: number
          cover_image_url?: string | null
          cover_variant?: number
          created_at?: string
          excerpt: string
          id?: string
          published_at?: string
          read_minutes?: number
          related_artist_id?: string | null
          related_artwork_id?: string | null
          related_medium_category_code?: string | null
          slug: string
          title: string
        }
        Update: {
          author?: string
          body?: string
          category?: string
          cover_hue?: number
          cover_image_url?: string | null
          cover_variant?: number
          created_at?: string
          excerpt?: string
          id?: string
          published_at?: string
          read_minutes?: number
          related_artist_id?: string | null
          related_artwork_id?: string | null
          related_medium_category_code?: string | null
          slug?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_posts_related_artist_id_fkey"
            columns: ["related_artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_posts_related_artwork_id_fkey"
            columns: ["related_artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
        ]
      }
      merch_editions: {
        Row: {
          edition_number: number
          id: string
          product_id: string
          sold: boolean
        }
        Insert: {
          edition_number: number
          id?: string
          product_id: string
          sold?: boolean
        }
        Update: {
          edition_number?: number
          id?: string
          product_id?: string
          sold?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "merch_editions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "merch_products"
            referencedColumns: ["id"]
          },
        ]
      }
      merch_orders: {
        Row: {
          amount: number
          created_at: string
          edition_number: number | null
          email: string
          id: string
          name: string
          order_number: string
          payment_method: string
          phone: string
          product_id: string
          quantity: number
          royalty_amount: number
          shipping_address: string
          status: string
          unit_price: number
          variant_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          edition_number?: number | null
          email?: string
          id?: string
          name?: string
          order_number: string
          payment_method: string
          phone: string
          product_id: string
          quantity?: number
          royalty_amount: number
          shipping_address: string
          status?: string
          unit_price: number
          variant_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          edition_number?: number | null
          email?: string
          id?: string
          name?: string
          order_number?: string
          payment_method?: string
          phone?: string
          product_id?: string
          quantity?: number
          royalty_amount?: number
          shipping_address?: string
          status?: string
          unit_price?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "merch_orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "merch_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merch_orders_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "merch_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      merch_products: {
        Row: {
          active: boolean
          artist_id: string
          artwork_id: string
          category: string
          cover_hue: number
          cover_variant: number
          created_at: string
          description: string
          edition_size: number | null
          fulfillment: string
          has_variants: boolean
          id: string
          price: number
          royalty_rate: number
          slug: string
          stock_quantity: number | null
          title: string
        }
        Insert: {
          active?: boolean
          artist_id: string
          artwork_id: string
          category: string
          cover_hue?: number
          cover_variant?: number
          created_at?: string
          description?: string
          edition_size?: number | null
          fulfillment: string
          has_variants?: boolean
          id?: string
          price: number
          royalty_rate?: number
          slug: string
          stock_quantity?: number | null
          title: string
        }
        Update: {
          active?: boolean
          artist_id?: string
          artwork_id?: string
          category?: string
          cover_hue?: number
          cover_variant?: number
          created_at?: string
          description?: string
          edition_size?: number | null
          fulfillment?: string
          has_variants?: boolean
          id?: string
          price?: number
          royalty_rate?: number
          slug?: string
          stock_quantity?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "merch_products_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merch_products_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
        ]
      }
      merch_variants: {
        Row: {
          id: string
          label: string
          price_delta: number
          product_id: string
          stock_quantity: number
        }
        Insert: {
          id?: string
          label: string
          price_delta?: number
          product_id: string
          stock_quantity?: number
        }
        Update: {
          id?: string
          label?: string
          price_delta?: number
          product_id?: string
          stock_quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "merch_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "merch_products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number
          artwork_id: string
          created_at: string
          email: string
          id: string
          insured: boolean
          name: string
          order_number: string
          payment_method: string
          phone: string
          shipping_address: string
          status: string
        }
        Insert: {
          amount: number
          artwork_id: string
          created_at?: string
          email?: string
          id?: string
          insured?: boolean
          name?: string
          order_number: string
          payment_method: string
          phone: string
          shipping_address: string
          status?: string
        }
        Update: {
          amount?: number
          artwork_id?: string
          created_at?: string
          email?: string
          id?: string
          insured?: boolean
          name?: string
          order_number?: string
          payment_method?: string
          phone?: string
          shipping_address?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          artist_id: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string
          role: string
          username: string
        }
        Insert: {
          artist_id?: string | null
          created_at?: string
          email?: string
          id: string
          name?: string
          phone?: string
          role?: string
          username?: string
        }
        Update: {
          artist_id?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string
          role?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      site_assets: {
        Row: {
          key: string
          updated_at: string
          url: string | null
        }
        Insert: {
          key: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          key?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_merch_orders_by_phone: {
        Args: { p_phone: string }
        Returns: {
          amount: number
          cover_hue: number
          cover_variant: number
          created_at: string
          edition_number: number
          id: string
          order_number: string
          payment_method: string
          phone: string
          product_category: string
          product_id: string
          product_slug: string
          product_title: string
          quantity: number
          shipping_address: string
          status: string
          unit_price: number
          variant_label: string
        }[]
      }
      is_username_available: { Args: { p_username: string }; Returns: boolean }
      review_artist_application: {
        Args: { p_application_id: string; p_decision: string }
        Returns: {
          artist_id: string
        }[]
      }
      purchase_artwork: {
        Args: {
          p_artwork_id: string
          p_email?: string
          p_insured: boolean
          p_name?: string
          p_payment_method: string
          p_phone: string
          p_shipping_address: string
        }
        Returns: {
          amount: number
          order_number: string
        }[]
      }
      purchase_merch: {
        Args: {
          p_email?: string
          p_name?: string
          p_payment_method: string
          p_phone: string
          p_product_id: string
          p_quantity: number
          p_shipping_address: string
          p_variant_id: string | null
        }
        Returns: {
          amount: number
          order_number: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
