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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_auth_user_id: string
          created_at: string
          id: string
          metadata: Json
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_auth_user_id: string
          created_at?: string
          id?: string
          metadata?: Json
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_auth_user_id?: string
          created_at?: string
          id?: string
          metadata?: Json
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          auth_user_id: string
          created_at: string
          is_active: boolean
        }
        Insert: {
          auth_user_id: string
          created_at?: string
          is_active?: boolean
        }
        Update: {
          auth_user_id?: string
          created_at?: string
          is_active?: boolean
        }
        Relationships: []
      }
      contact_inquiries: {
        Row: {
          category: string
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          source_hash: string | null
          status: string
          subject: string
        }
        Insert: {
          category: string
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          source_hash?: string | null
          status?: string
          subject: string
        }
        Update: {
          category?: string
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          source_hash?: string | null
          status?: string
          subject?: string
        }
        Relationships: []
      }
      event_publications: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          offer_id: string
          public_note: string | null
          publish_at: string | null
          published_at: string | null
          show_time: boolean
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          offer_id: string
          public_note?: string | null
          publish_at?: string | null
          published_at?: string | null
          show_time?: boolean
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          offer_id?: string
          public_note?: string | null
          publish_at?: string | null
          published_at?: string | null
          show_time?: boolean
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_publications_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: true
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          contract_snapshot: Json | null
          created_at: string | null
          due_date: string | null
          extra_fee: number | null
          id: string
          invoice_number: string
          invoice_url: string | null
          notes: string | null
          offer_id: string | null
          paid_at: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          status: Database["public"]["Enums"]["status_type"] | null
          store_id: string | null
          talent_id: string | null
          transport_fee: number | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          contract_snapshot?: Json | null
          created_at?: string | null
          due_date?: string | null
          extra_fee?: number | null
          id?: string
          invoice_number?: string
          invoice_url?: string | null
          notes?: string | null
          offer_id?: string | null
          paid_at?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          status?: Database["public"]["Enums"]["status_type"] | null
          store_id?: string | null
          talent_id?: string | null
          transport_fee?: number | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          contract_snapshot?: Json | null
          created_at?: string | null
          due_date?: string | null
          extra_fee?: number | null
          id?: string
          invoice_number?: string
          invoice_url?: string | null
          notes?: string | null
          offer_id?: string | null
          paid_at?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          status?: Database["public"]["Enums"]["status_type"] | null
          store_id?: string | null
          talent_id?: string | null
          transport_fee?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_invoices_offer_id"
            columns: ["offer_id"]
            isOneToOne: true
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_invoices_store_id"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_invoices_talent_id"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "public_talent_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_invoices_talent_id"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "talents"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_idempotency_keys: {
        Row: {
          created_at: string
          endpoint: string
          expires_at: string
          key: string
          response_snapshot: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          expires_at: string
          key: string
          response_snapshot: Json
          user_id: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          expires_at?: string
          key?: string
          response_snapshot?: Json
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          actor_name: string | null
          body: string | null
          created_at: string | null
          data: Json | null
          entity_id: string | null
          entity_type: string | null
          expires_at: string | null
          group_key: string | null
          id: string
          is_read: boolean | null
          priority: string
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          actor_name?: string | null
          body?: string | null
          created_at?: string | null
          data?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          expires_at?: string | null
          group_key?: string | null
          id?: string
          is_read?: boolean | null
          priority?: string
          read_at?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          actor_name?: string | null
          body?: string | null
          created_at?: string | null
          data?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          expires_at?: string | null
          group_key?: string | null
          id?: string
          is_read?: boolean | null
          priority?: string
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      offer_messages: {
        Row: {
          attachments: Json | null
          body: string | null
          created_at: string
          id: string
          offer_id: string | null
          read_at: string | null
          receiver_user: string | null
          sender_role: string
          sender_user: string
        }
        Insert: {
          attachments?: Json | null
          body?: string | null
          created_at?: string
          id?: string
          offer_id?: string | null
          read_at?: string | null
          receiver_user?: string | null
          sender_role: string
          sender_user: string
        }
        Update: {
          attachments?: Json | null
          body?: string | null
          created_at?: string
          id?: string
          offer_id?: string | null
          read_at?: string | null
          receiver_user?: string | null
          sender_role?: string
          sender_user?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_messages_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_read_receipts: {
        Row: {
          id: string
          last_read_at: string
          offer_id: string
          user_id: string
        }
        Insert: {
          id?: string
          last_read_at?: string
          offer_id: string
          user_id: string
        }
        Update: {
          id?: string
          last_read_at?: string
          offer_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_read_receipts_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          accepted_at: string | null
          agreed: boolean | null
          canceled_at: string | null
          canceled_by_role: string | null
          canceled_by_user_id: string | null
          cancellation_reason: string | null
          cancellation_stage: string | null
          contract_url: string | null
          created_at: string | null
          date: string
          end_time: string
          event_name: string | null
          id: string
          invoice_amount: number | null
          invoice_date: string | null
          invoice_submitted: boolean | null
          invoice_url: string | null
          is_read_by_talent: boolean | null
          message: string | null
          no_show_at: string | null
          no_show_reason: string | null
          no_show_reported_by_user_id: string | null
          notes: string | null
          paid: boolean | null
          paid_at: string | null
          question_allowed: boolean | null
          respond_deadline: string | null
          reward: number | null
          start_time: string
          status: Database["public"]["Enums"]["status_type"] | null
          store_id: string | null
          talent_id: string | null
          time_range: string
          updated_at: string | null
          user_id: string | null
          visit_completed_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          agreed?: boolean | null
          canceled_at?: string | null
          canceled_by_role?: string | null
          canceled_by_user_id?: string | null
          cancellation_reason?: string | null
          cancellation_stage?: string | null
          contract_url?: string | null
          created_at?: string | null
          date: string
          end_time: string
          event_name?: string | null
          id?: string
          invoice_amount?: number | null
          invoice_date?: string | null
          invoice_submitted?: boolean | null
          invoice_url?: string | null
          is_read_by_talent?: boolean | null
          message?: string | null
          no_show_at?: string | null
          no_show_reason?: string | null
          no_show_reported_by_user_id?: string | null
          notes?: string | null
          paid?: boolean | null
          paid_at?: string | null
          question_allowed?: boolean | null
          respond_deadline?: string | null
          reward?: number | null
          start_time: string
          status?: Database["public"]["Enums"]["status_type"] | null
          store_id?: string | null
          talent_id?: string | null
          time_range: string
          updated_at?: string | null
          user_id?: string | null
          visit_completed_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          agreed?: boolean | null
          canceled_at?: string | null
          canceled_by_role?: string | null
          canceled_by_user_id?: string | null
          cancellation_reason?: string | null
          cancellation_stage?: string | null
          contract_url?: string | null
          created_at?: string | null
          date?: string
          end_time?: string
          event_name?: string | null
          id?: string
          invoice_amount?: number | null
          invoice_date?: string | null
          invoice_submitted?: boolean | null
          invoice_url?: string | null
          is_read_by_talent?: boolean | null
          message?: string | null
          no_show_at?: string | null
          no_show_reason?: string | null
          no_show_reported_by_user_id?: string | null
          notes?: string | null
          paid?: boolean | null
          paid_at?: string | null
          question_allowed?: boolean | null
          respond_deadline?: string | null
          reward?: number | null
          start_time?: string
          status?: Database["public"]["Enums"]["status_type"] | null
          store_id?: string | null
          talent_id?: string | null
          time_range?: string
          updated_at?: string | null
          user_id?: string | null
          visit_completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_offers_talent_id"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "public_talent_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_offers_talent_id"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "talents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          category_ratings: Json | null
          comment: string | null
          created_at: string | null
          id: string
          is_public: boolean | null
          offer_id: string | null
          rating: number | null
          store_id: string | null
          talent_id: string | null
        }
        Insert: {
          category_ratings?: Json | null
          comment?: string | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          offer_id?: string | null
          rating?: number | null
          store_id?: string | null
          talent_id?: string | null
        }
        Update: {
          category_ratings?: Json | null
          comment?: string | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          offer_id?: string | null
          rating?: number | null
          store_id?: string | null
          talent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_reviews_offer_id"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_reviews_store_id"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_reviews_talent_id"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "public_talent_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_reviews_talent_id"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "talents"
            referencedColumns: ["id"]
          },
        ]
      }
      store_favorite_talents: {
        Row: {
          created_at: string
          store_id: string
          talent_id: string
        }
        Insert: {
          created_at?: string
          store_id: string
          talent_id: string
        }
        Update: {
          created_at?: string
          store_id?: string
          talent_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_favorite_talents_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_favorite_talents_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "public_talent_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_favorite_talents_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "talents"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          avatar_url: string | null
          bio: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          is_profile_complete: boolean | null
          is_setup_complete: boolean | null
          store_address: string | null
          store_name: string | null
          store_prefect: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          is_profile_complete?: boolean | null
          is_setup_complete?: boolean | null
          store_address?: string | null
          store_name?: string | null
          store_prefect?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          is_profile_complete?: boolean | null
          is_setup_complete?: boolean | null
          store_address?: string | null
          store_name?: string | null
          store_prefect?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      talent_availability_dates: {
        Row: {
          created_at: string
          id: string
          source: string
          status: Database["public"]["Enums"]["availability_status"]
          the_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          source?: string
          status: Database["public"]["Enums"]["availability_status"]
          the_date: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          source?: string
          status?: Database["public"]["Enums"]["availability_status"]
          the_date?: string
          user_id?: string
        }
        Relationships: []
      }
      talent_availability_settings: {
        Row: {
          default_mode: Database["public"]["Enums"]["availability_default_mode"]
          effective_from: string
          timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          default_mode?: Database["public"]["Enums"]["availability_default_mode"]
          effective_from?: string
          timezone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          default_mode?: Database["public"]["Enums"]["availability_default_mode"]
          effective_from?: string
          timezone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      talent_billing_profiles: {
        Row: {
          billing_address: string | null
          billing_name: string | null
          invoice_registration_number: string | null
          talent_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_address?: string | null
          billing_name?: string | null
          invoice_registration_number?: string | null
          talent_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_address?: string | null
          billing_name?: string | null
          invoice_registration_number?: string | null
          talent_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "talent_billing_profiles_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: true
            referencedRelation: "public_talent_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "talent_billing_profiles_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: true
            referencedRelation: "talents"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_payout_accounts: {
        Row: {
          account_holder: string | null
          account_number: string | null
          account_type: string | null
          bank_name: string | null
          branch_name: string | null
          talent_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_holder?: string | null
          account_number?: string | null
          account_type?: string | null
          bank_name?: string | null
          branch_name?: string | null
          talent_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_holder?: string | null
          account_number?: string | null
          account_type?: string | null
          bank_name?: string | null
          branch_name?: string | null
          talent_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "talent_payout_accounts_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: true
            referencedRelation: "public_talent_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "talent_payout_accounts_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: true
            referencedRelation: "talents"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_social_connections: {
        Row: {
          access_token: string | null
          access_token_expires_at: string | null
          created_at: string
          external_user_id: string | null
          provider: string
          provider_username: string | null
          refresh_token: string | null
          refresh_token_expires_at: string | null
          scopes: string[]
          talent_id: string
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          access_token_expires_at?: string | null
          created_at?: string
          external_user_id?: string | null
          provider: string
          provider_username?: string | null
          refresh_token?: string | null
          refresh_token_expires_at?: string | null
          scopes?: string[]
          talent_id: string
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          access_token_expires_at?: string | null
          created_at?: string
          external_user_id?: string | null
          provider?: string
          provider_username?: string | null
          refresh_token?: string | null
          refresh_token_expires_at?: string | null
          scopes?: string[]
          talent_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "talent_social_connections_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "public_talent_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "talent_social_connections_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "talents"
            referencedColumns: ["id"]
          },
        ]
      }
      talents: {
        Row: {
          achievements: string | null
          agency_name: string | null
          area: string | null
          availability: string | null
          avatar_url: string | null
          bio: string | null
          bio_certifications: string | null
          bio_hobby: string | null
          bio_others: string | null
          birthdate: string | null
          birthplace: string | null
          created_at: string | null
          display_name: string | null
          experience_years: number | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          genre: string | null
          height_cm: number | null
          id: string
          instagram: string | null
          instagram_followers: number | null
          instagram_followers_updated_at: string | null
          instagram_url: string | null
          is_profile_complete: boolean | null
          is_setup_complete: boolean | null
          location: string | null
          media_appearance: string | null
          min_hours: string | null
          name: string
          notes: string | null
          phone_available_hours: string | null
          phone_contact_allowed: boolean
          photos: string[] | null
          preferred_contact_method: string
          profile: string | null
          rate: number | null
          rating: number | null
          residence: string | null
          skills: string[] | null
          social_links: string[] | null
          social_tiktok: string | null
          stage_name: string | null
          tiktok_followers: number | null
          tiktok_followers_updated_at: string | null
          transportation: string | null
          twitter: string | null
          twitter_followers: number | null
          twitter_followers_updated_at: string | null
          twitter_url: string | null
          updated_at: string | null
          user_id: string | null
          video_url: string | null
          youtube: string | null
          youtube_followers: number | null
          youtube_followers_updated_at: string | null
          youtube_url: string | null
        }
        Insert: {
          achievements?: string | null
          agency_name?: string | null
          area?: string | null
          availability?: string | null
          avatar_url?: string | null
          bio?: string | null
          bio_certifications?: string | null
          bio_hobby?: string | null
          bio_others?: string | null
          birthdate?: string | null
          birthplace?: string | null
          created_at?: string | null
          display_name?: string | null
          experience_years?: number | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          genre?: string | null
          height_cm?: number | null
          id?: string
          instagram?: string | null
          instagram_followers?: number | null
          instagram_followers_updated_at?: string | null
          instagram_url?: string | null
          is_profile_complete?: boolean | null
          is_setup_complete?: boolean | null
          location?: string | null
          media_appearance?: string | null
          min_hours?: string | null
          name: string
          notes?: string | null
          phone_available_hours?: string | null
          phone_contact_allowed?: boolean
          photos?: string[] | null
          preferred_contact_method?: string
          profile?: string | null
          rate?: number | null
          rating?: number | null
          residence?: string | null
          skills?: string[] | null
          social_links?: string[] | null
          social_tiktok?: string | null
          stage_name?: string | null
          tiktok_followers?: number | null
          tiktok_followers_updated_at?: string | null
          transportation?: string | null
          twitter?: string | null
          twitter_followers?: number | null
          twitter_followers_updated_at?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          video_url?: string | null
          youtube?: string | null
          youtube_followers?: number | null
          youtube_followers_updated_at?: string | null
          youtube_url?: string | null
        }
        Update: {
          achievements?: string | null
          agency_name?: string | null
          area?: string | null
          availability?: string | null
          avatar_url?: string | null
          bio?: string | null
          bio_certifications?: string | null
          bio_hobby?: string | null
          bio_others?: string | null
          birthdate?: string | null
          birthplace?: string | null
          created_at?: string | null
          display_name?: string | null
          experience_years?: number | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          genre?: string | null
          height_cm?: number | null
          id?: string
          instagram?: string | null
          instagram_followers?: number | null
          instagram_followers_updated_at?: string | null
          instagram_url?: string | null
          is_profile_complete?: boolean | null
          is_setup_complete?: boolean | null
          location?: string | null
          media_appearance?: string | null
          min_hours?: string | null
          name?: string
          notes?: string | null
          phone_available_hours?: string | null
          phone_contact_allowed?: boolean
          photos?: string[] | null
          preferred_contact_method?: string
          profile?: string | null
          rate?: number | null
          rating?: number | null
          residence?: string | null
          skills?: string[] | null
          social_links?: string[] | null
          social_tiktok?: string | null
          stage_name?: string | null
          tiktok_followers?: number | null
          tiktok_followers_updated_at?: string | null
          transportation?: string | null
          twitter?: string | null
          twitter_followers?: number | null
          twitter_followers_updated_at?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          video_url?: string | null
          youtube?: string | null
          youtube_followers?: number | null
          youtube_followers_updated_at?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          auth_user_id: string
          created_at: string
          email: string
          id: string
          legal_accepted_at: string | null
          phone: string | null
          privacy_version: string | null
          role: string | null
          status: Database["public"]["Enums"]["user_status"]
          terms_version: string | null
          updated_at: string
        }
        Insert: {
          auth_user_id: string
          created_at?: string
          email: string
          id?: string
          legal_accepted_at?: string | null
          phone?: string | null
          privacy_version?: string | null
          role?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          terms_version?: string | null
          updated_at?: string
        }
        Update: {
          auth_user_id?: string
          created_at?: string
          email?: string
          id?: string
          legal_accepted_at?: string | null
          phone?: string | null
          privacy_version?: string | null
          role?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          terms_version?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_talent_profiles: {
        Row: {
          area: string | null
          avatar_url: string | null
          bio: string | null
          display_name: string | null
          genre: string | null
          id: string | null
          instagram_url: string | null
          rate: number | null
          rating: number | null
          social_tiktok: string | null
          stage_name: string | null
          twitter_url: string | null
          youtube_url: string | null
        }
        Insert: {
          area?: string | null
          avatar_url?: string | null
          bio?: string | null
          display_name?: string | null
          genre?: string | null
          id?: string | null
          instagram_url?: string | null
          rate?: number | null
          rating?: number | null
          social_tiktok?: string | null
          stage_name?: string | null
          twitter_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          area?: string | null
          avatar_url?: string | null
          bio?: string | null
          display_name?: string | null
          genre?: string | null
          id?: string | null
          instagram_url?: string | null
          rate?: number | null
          rating?: number | null
          social_tiktok?: string | null
          stage_name?: string | null
          twitter_url?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_available_talents: {
        Args: { _date: string }
        Returns: {
          availability: Database["public"]["Enums"]["availability_status"]
          talent_id: string
        }[]
      }
      get_offer_store_names: {
        Args: { _offer_ids: string[] }
        Returns: {
          offer_id: string
          store_display_name: string
          store_id: string
        }[]
      }
      get_reviews_for_current_talent: {
        Args: never
        Returns: {
          comment: string
          created_at: string
          rating: number
          review_id: string
          store_id: string
          store_name: string
        }[]
      }
      is_offer_blocking: { Args: { _status: string }; Returns: boolean }
      is_self_talent: { Args: { _talent_id: string }; Returns: boolean }
      next_invoice_number: { Args: never; Returns: string }
      resolve_talent_availability: {
        Args: { _date: string; _talent_id: string }
        Returns: Database["public"]["Enums"]["availability_status"]
      }
    }
    Enums: {
      availability_default_mode: "default_ok" | "default_ng"
      availability_status: "ok" | "ng"
      gender_type: "male" | "female" | "other"
      invoice_status:
        | "draft"
        | "submitted"
        | "approved"
        | "rejected"
        | "pending"
      notification_type:
        | "offer_created"
        | "offer_updated"
        | "payment_created"
        | "invoice_submitted"
        | "review_received"
        | "message"
        | "offer"
        | "offer_accepted"
        | "schedule_fixed"
      payment_status: "pending" | "paid" | "cancelled" | "completed"
      status_type:
        | "draft"
        | "pending"
        | "approved"
        | "rejected"
        | "completed"
        | "offer_created"
        | "confirmed"
        | "canceled"
        | "no_show"
        | "submitted"
      user_status:
        | "pending_email_verification"
        | "onboarding"
        | "active"
        | "suspended"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      availability_default_mode: ["default_ok", "default_ng"],
      availability_status: ["ok", "ng"],
      gender_type: ["male", "female", "other"],
      invoice_status: ["draft", "submitted", "approved", "rejected", "pending"],
      notification_type: [
        "offer_created",
        "offer_updated",
        "payment_created",
        "invoice_submitted",
        "review_received",
        "message",
        "offer",
        "offer_accepted",
        "schedule_fixed",
      ],
      payment_status: ["pending", "paid", "cancelled", "completed"],
      status_type: [
        "draft",
        "pending",
        "approved",
        "rejected",
        "completed",
        "offer_created",
        "confirmed",
        "canceled",
        "no_show",
        "submitted",
      ],
      user_status: [
        "pending_email_verification",
        "onboarding",
        "active",
        "suspended",
      ],
    },
  },
} as const
