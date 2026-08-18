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
      admin_activity_log: {
        Row: {
          action: string
          created_at: string
          detail: Json
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          created_at?: string
          detail?: Json
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          created_at?: string
          detail?: Json
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      artist_applications: {
        Row: {
          artist_name: string
          artwork_image_urls: string[]
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
          artwork_image_urls?: string[]
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
          artwork_image_urls?: string[]
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
          artist_split_rate: number
          avatar_url: string | null
          awards: string
          bank_account_number: string
          bank_name: string
          bio: string
          career: string
          commission_accepting: boolean
          commission_lead_time: string
          commission_media: string[]
          commission_price_range: string
          created_at: string
          exhibitions: string
          hue: number
          id: string
          name: string
          name_en: string
          slug: string
          style_tags: string[]
          tagline: string
        }
        Insert: {
          artist_split_rate?: number
          avatar_url?: string | null
          awards?: string
          bank_account_number?: string
          bank_name?: string
          bio?: string
          career?: string
          commission_accepting?: boolean
          commission_lead_time?: string
          commission_media?: string[]
          commission_price_range?: string
          created_at?: string
          exhibitions?: string
          hue?: number
          id?: string
          name: string
          name_en?: string
          slug: string
          style_tags?: string[]
          tagline?: string
        }
        Update: {
          artist_split_rate?: number
          avatar_url?: string | null
          awards?: string
          bank_account_number?: string
          bank_name?: string
          bio?: string
          career?: string
          commission_accepting?: boolean
          commission_lead_time?: string
          commission_media?: string[]
          commission_price_range?: string
          created_at?: string
          exhibitions?: string
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
          edition_info: string
          edition_type: string
          exhibition_featured_at: string | null
          hue: number
          id: string
          image_urls: string[]
          medium_type_code: string
          merch_enabled: boolean
          price: number
          size: string
          slug: string
          sold: boolean
          title: string
          variant: number
          view_count: number
          year: number
        }
        Insert: {
          artist_id: string
          created_at?: string
          description?: string
          edition_info?: string
          edition_type?: string
          exhibition_featured_at?: string | null
          hue?: number
          id?: string
          image_urls?: string[]
          medium_type_code: string
          merch_enabled?: boolean
          price: number
          size: string
          slug: string
          sold?: boolean
          title: string
          variant?: number
          view_count?: number
          year: number
        }
        Update: {
          artist_id?: string
          created_at?: string
          description?: string
          edition_info?: string
          edition_type?: string
          exhibition_featured_at?: string | null
          hue?: number
          id?: string
          image_urls?: string[]
          medium_type_code?: string
          merch_enabled?: boolean
          price?: number
          size?: string
          slug?: string
          sold?: boolean
          title?: string
          variant?: number
          view_count?: number
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
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
      customer_notifications: {
        Row: {
          artwork_id: string | null
          customer_id: string
          id: string
          sent_at: string
          subject: string
        }
        Insert: {
          artwork_id?: string | null
          customer_id: string
          id?: string
          sent_at?: string
          subject?: string
        }
        Update: {
          artwork_id?: string | null
          customer_id?: string
          id?: string
          sent_at?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_notifications_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_notifications_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          email: string
          id: string
          marketing_opt_in: boolean
          name: string
          phone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string
          id?: string
          marketing_opt_in?: boolean
          name?: string
          phone: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          marketing_opt_in?: boolean
          name?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
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
          artwork_id: string | null
          courier_name: string | null
          courier_phone: string | null
          created_at: string
          delay_reason: string
          design_image_url: string | null
          edition_number: number | null
          email: string
          expected_ship_date: string | null
          id: string
          name: string
          order_number: string
          payment_method: string
          phone: string
          product_id: string
          quantity: number
          royalty_amount: number
          settled_at: string | null
          shipping_address: string
          shipping_method: string | null
          staff_note: string
          status: string
          tracking_carrier: string | null
          tracking_number: string | null
          unit_price: number
          user_id: string | null
          variant_id: string | null
          vehicle_number: string | null
        }
        Insert: {
          amount: number
          artwork_id?: string | null
          courier_name?: string | null
          courier_phone?: string | null
          created_at?: string
          delay_reason?: string
          design_image_url?: string | null
          edition_number?: number | null
          email?: string
          expected_ship_date?: string | null
          id?: string
          name?: string
          order_number: string
          payment_method: string
          phone: string
          product_id: string
          quantity?: number
          royalty_amount: number
          settled_at?: string | null
          shipping_address: string
          shipping_method?: string | null
          staff_note?: string
          status?: string
          tracking_carrier?: string | null
          tracking_number?: string | null
          unit_price: number
          user_id?: string | null
          variant_id?: string | null
          vehicle_number?: string | null
        }
        Update: {
          amount?: number
          artwork_id?: string | null
          courier_name?: string | null
          courier_phone?: string | null
          created_at?: string
          delay_reason?: string
          design_image_url?: string | null
          edition_number?: number | null
          email?: string
          expected_ship_date?: string | null
          id?: string
          name?: string
          order_number?: string
          payment_method?: string
          phone?: string
          product_id?: string
          quantity?: number
          royalty_amount?: number
          settled_at?: string | null
          shipping_address?: string
          shipping_method?: string | null
          staff_note?: string
          status?: string
          tracking_carrier?: string | null
          tracking_number?: string | null
          unit_price?: number
          user_id?: string | null
          variant_id?: string | null
          vehicle_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "merch_orders_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
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
          artist_id: string | null
          artwork_id: string | null
          category: string
          cover_hue: number
          cover_variant: number
          created_at: string
          description: string
          edition_size: number | null
          fulfillment: string
          has_variants: boolean
          id: string
          image_urls: string[]
          is_template: boolean
          price: number
          royalty_rate: number
          slug: string
          title: string
        }
        Insert: {
          active?: boolean
          artist_id?: string | null
          artwork_id?: string | null
          category: string
          cover_hue?: number
          cover_variant?: number
          created_at?: string
          description?: string
          edition_size?: number | null
          fulfillment: string
          has_variants?: boolean
          id?: string
          image_urls?: string[]
          is_template?: boolean
          price: number
          royalty_rate?: number
          slug: string
          title: string
        }
        Update: {
          active?: boolean
          artist_id?: string | null
          artwork_id?: string | null
          category?: string
          cover_hue?: number
          cover_variant?: number
          created_at?: string
          description?: string
          edition_size?: number | null
          fulfillment?: string
          has_variants?: boolean
          id?: string
          image_urls?: string[]
          is_template?: boolean
          price?: number
          royalty_rate?: number
          slug?: string
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
        }
        Insert: {
          id?: string
          label: string
          price_delta?: number
          product_id: string
        }
        Update: {
          id?: string
          label?: string
          price_delta?: number
          product_id?: string
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
          artist_payout_amount: number | null
          artwork_id: string
          courier_name: string | null
          courier_phone: string | null
          created_at: string
          delay_reason: string
          email: string
          expected_ship_date: string | null
          id: string
          insured: boolean
          name: string
          order_number: string
          payment_method: string
          phone: string
          settled_at: string | null
          shipping_address: string
          shipping_method: string | null
          staff_note: string
          status: string
          tracking_carrier: string | null
          tracking_number: string | null
          user_id: string | null
          vehicle_number: string | null
        }
        Insert: {
          amount: number
          artist_payout_amount?: number | null
          artwork_id: string
          courier_name?: string | null
          courier_phone?: string | null
          created_at?: string
          delay_reason?: string
          email?: string
          expected_ship_date?: string | null
          id?: string
          insured?: boolean
          name?: string
          order_number: string
          payment_method: string
          phone: string
          settled_at?: string | null
          shipping_address: string
          shipping_method?: string | null
          staff_note?: string
          status?: string
          tracking_carrier?: string | null
          tracking_number?: string | null
          user_id?: string | null
          vehicle_number?: string | null
        }
        Update: {
          amount?: number
          artist_payout_amount?: number | null
          artwork_id?: string
          courier_name?: string | null
          courier_phone?: string | null
          created_at?: string
          delay_reason?: string
          email?: string
          expected_ship_date?: string | null
          id?: string
          insured?: boolean
          name?: string
          order_number?: string
          payment_method?: string
          phone?: string
          settled_at?: string | null
          shipping_address?: string
          shipping_method?: string | null
          staff_note?: string
          status?: string
          tracking_carrier?: string | null
          tracking_number?: string | null
          user_id?: string | null
          vehicle_number?: string | null
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
          address: string
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
          address?: string
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
          address?: string
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
      reviews: {
        Row: {
          artwork_id: string | null
          body: string
          created_at: string
          id: string
          order_id: string | null
          product_id: string | null
          rating: number
          user_id: string
        }
        Insert: {
          artwork_id?: string | null
          body?: string
          created_at?: string
          id?: string
          order_id?: string | null
          product_id?: string | null
          rating: number
          user_id: string
        }
        Update: {
          artwork_id?: string | null
          body?: string
          created_at?: string
          id?: string
          order_id?: string | null
          product_id?: string | null
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "merch_products"
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
      wishlists: {
        Row: {
          artwork_id: string | null
          created_at: string
          id: string
          product_id: string | null
          user_id: string
        }
        Insert: {
          artwork_id?: string | null
          created_at?: string
          id?: string
          product_id?: string | null
          user_id: string
        }
        Update: {
          artwork_id?: string | null
          created_at?: string
          id?: string
          product_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "merch_products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_order: {
        Args: { p_kind: string; p_order_id: string; p_phone?: string }
        Returns: undefined
      }
      get_artwork_orders_by_phone: {
        Args: { p_phone: string }
        Returns: {
          amount: number
          artist_name: string
          artist_payout_amount: number
          artwork_id: string
          artwork_title: string
          courier_name: string
          courier_phone: string
          created_at: string
          email: string
          hue: number
          id: string
          image_urls: string[]
          insured: boolean
          name: string
          order_number: string
          payment_method: string
          phone: string
          shipping_address: string
          shipping_method: string
          status: string
          tracking_carrier: string
          tracking_number: string
          variant: number
          vehicle_number: string
        }[]
      }
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
      increment_artwork_view: {
        Args: { p_artwork_id: string }
        Returns: undefined
      }
      is_username_available: { Args: { p_username: string }; Returns: boolean }
      purchase_artwork: {
        Args: {
          p_artwork_id: string
          p_email?: string
          p_insured: boolean
          p_marketing_opt_in?: boolean
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
          p_artwork_id?: string
          p_design_image_url?: string
          p_email?: string
          p_marketing_opt_in?: boolean
          p_name?: string
          p_payment_method: string
          p_phone: string
          p_product_id: string
          p_quantity: number
          p_shipping_address: string
          p_variant_id: string
        }
        Returns: {
          amount: number
          order_number: string
        }[]
      }
      review_artist_application: {
        Args: { p_application_id: string; p_decision: string }
        Returns: {
          artist_id: string
        }[]
      }
      submit_review: {
        Args: {
          p_artwork_id: string
          p_body: string
          p_product_id: string
          p_rating: number
        }
        Returns: string
      }
      toggle_exhibition_featured_artwork: {
        Args: { p_artwork_id: string; p_featured: boolean }
        Returns: undefined
      }
      update_order_shipping: {
        Args: {
          p_courier_name?: string
          p_courier_phone?: string
          p_delay_reason?: string
          p_expected_ship_date?: string
          p_kind: string
          p_order_id: string
          p_shipping_method?: string
          p_status: string
          p_tracking_carrier?: string
          p_tracking_number?: string
          p_vehicle_number?: string
        }
        Returns: undefined
      }
      upsert_customer: {
        Args: {
          p_email: string
          p_marketing_opt_in?: boolean
          p_name: string
          p_phone: string
        }
        Returns: undefined
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
