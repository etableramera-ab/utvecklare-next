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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ad_clicks: {
        Row: {
          ad_id: string | null
          created_at: string | null
          id: string
          ip_hash: string | null
          page_url: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          ad_id?: string | null
          created_at?: string | null
          id?: string
          ip_hash?: string | null
          page_url?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          ad_id?: string | null
          created_at?: string | null
          id?: string
          ip_hash?: string | null
          page_url?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_clicks_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_impressions: {
        Row: {
          ad_id: string | null
          created_at: string | null
          id: string
          ip_hash: string | null
          page_url: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          ad_id?: string | null
          created_at?: string | null
          id?: string
          ip_hash?: string | null
          page_url?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          ad_id?: string | null
          created_at?: string | null
          id?: string
          ip_hash?: string | null
          page_url?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_impressions_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
      }
      ads: {
        Row: {
          advertiser_email: string | null
          advertiser_name: string
          clicks: number
          cost_amount: number | null
          cost_model: string | null
          created_at: string
          daily_budget: number | null
          description: string | null
          destination_url: string
          end_date: string
          format: string | null
          id: string
          image_url: string | null
          impressions: number
          is_active: boolean
          placement: string
          priority: number | null
          start_date: string
          target_categories: string[] | null
          target_pages: string[] | null
          title: string
          total_budget: number | null
          updated_at: string | null
        }
        Insert: {
          advertiser_email?: string | null
          advertiser_name: string
          clicks?: number
          cost_amount?: number | null
          cost_model?: string | null
          created_at?: string
          daily_budget?: number | null
          description?: string | null
          destination_url: string
          end_date: string
          format?: string | null
          id?: string
          image_url?: string | null
          impressions?: number
          is_active?: boolean
          placement: string
          priority?: number | null
          start_date: string
          target_categories?: string[] | null
          target_pages?: string[] | null
          title: string
          total_budget?: number | null
          updated_at?: string | null
        }
        Update: {
          advertiser_email?: string | null
          advertiser_name?: string
          clicks?: number
          cost_amount?: number | null
          cost_model?: string | null
          created_at?: string
          daily_budget?: number | null
          description?: string | null
          destination_url?: string
          end_date?: string
          format?: string | null
          id?: string
          image_url?: string | null
          impressions?: number
          is_active?: boolean
          placement?: string
          priority?: number | null
          start_date?: string
          target_categories?: string[] | null
          target_pages?: string[] | null
          title?: string
          total_budget?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      affiliate_clicks: {
        Row: {
          affiliate_link_id: string | null
          clicked_at: string
          id: string
          page_url: string | null
          session_id: string | null
          tool_id: string
          user_id: string | null
        }
        Insert: {
          affiliate_link_id?: string | null
          clicked_at?: string
          id?: string
          page_url?: string | null
          session_id?: string | null
          tool_id: string
          user_id?: string | null
        }
        Update: {
          affiliate_link_id?: string | null
          clicked_at?: string
          id?: string
          page_url?: string | null
          session_id?: string | null
          tool_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_clicks_affiliate_link_id_fkey"
            columns: ["affiliate_link_id"]
            isOneToOne: false
            referencedRelation: "affiliate_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_clicks_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_links: {
        Row: {
          affiliate_url: string
          category: string | null
          clicks: number | null
          commission_description: string | null
          commission_type: string | null
          commission_value: number | null
          conversions: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          revenue_total: number | null
          tool_description: string | null
          tool_logo_url: string | null
          tool_name: string
          tool_slug: string
        }
        Insert: {
          affiliate_url: string
          category?: string | null
          clicks?: number | null
          commission_description?: string | null
          commission_type?: string | null
          commission_value?: number | null
          conversions?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          revenue_total?: number | null
          tool_description?: string | null
          tool_logo_url?: string | null
          tool_name: string
          tool_slug: string
        }
        Update: {
          affiliate_url?: string
          category?: string | null
          clicks?: number | null
          commission_description?: string | null
          commission_type?: string | null
          commission_value?: number | null
          conversions?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          revenue_total?: number | null
          tool_description?: string | null
          tool_logo_url?: string | null
          tool_name?: string
          tool_slug?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          job_id: string
          linkedin_url: string | null
          message: string | null
          phone: string | null
          resume_url: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          job_id: string
          linkedin_url?: string | null
          message?: string | null
          phone?: string | null
          resume_url?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          job_id?: string
          linkedin_url?: string | null
          message?: string | null
          phone?: string | null
          resume_url?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      article_likes: {
        Row: {
          article_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_likes_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_avatar_url: string | null
          author_bio: string | null
          author_github_url: string | null
          author_linkedin_url: string | null
          author_name: string | null
          author_slug: string | null
          category: string
          content: string | null
          excerpt: string | null
          hero_image_alt: string | null
          hero_image_url: string | null
          id: string
          is_featured: boolean
          is_published: boolean
          likes_count: number
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          reading_time_minutes: number | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string | null
          views_count: number
        }
        Insert: {
          author_avatar_url?: string | null
          author_bio?: string | null
          author_github_url?: string | null
          author_linkedin_url?: string | null
          author_name?: string | null
          author_slug?: string | null
          category: string
          content?: string | null
          excerpt?: string | null
          hero_image_alt?: string | null
          hero_image_url?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          likes_count?: number
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          views_count?: number
        }
        Update: {
          author_avatar_url?: string | null
          author_bio?: string | null
          author_github_url?: string | null
          author_linkedin_url?: string | null
          author_name?: string | null
          author_slug?: string | null
          category?: string
          content?: string | null
          excerpt?: string | null
          hero_image_alt?: string | null
          hero_image_url?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          likes_count?: number
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          views_count?: number
        }
        Relationships: []
      }
      bookmarks: {
        Row: {
          article_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          article_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          article_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          article_id: string
          content: string
          created_at: string
          id: string
          is_edited: boolean | null
          parent_comment_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          article_id: string
          content: string
          created_at?: string
          id?: string
          is_edited?: boolean | null
          parent_comment_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          article_id?: string
          content?: string
          created_at?: string
          id?: string
          is_edited?: boolean | null
          parent_comment_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          industry: string | null
          is_verified: boolean
          location: string | null
          logo_url: string | null
          name: string
          plan: string
          plan_started_at: string | null
          size: string | null
          slug: string | null
          tech_stack: string[] | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          is_verified?: boolean
          location?: string | null
          logo_url?: string | null
          name: string
          plan?: string
          plan_started_at?: string | null
          size?: string | null
          slug?: string | null
          tech_stack?: string[] | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          is_verified?: boolean
          location?: string | null
          logo_url?: string | null
          name?: string
          plan?: string
          plan_started_at?: string | null
          size?: string | null
          slug?: string | null
          tech_stack?: string[] | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      company_follows: {
        Row: {
          company_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_follows_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_inquiries: {
        Row: {
          company: string
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          phone: string | null
        }
        Insert: {
          company: string
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          phone?: string | null
        }
        Update: {
          company?: string
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean | null
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean | null
          message: string
          name: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean | null
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      event_agenda: {
        Row: {
          created_at: string | null
          description: string | null
          event_id: string
          id: string
          sort_order: number | null
          speaker_id: string | null
          time_end: string | null
          time_start: string
          title: string
          type: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_id: string
          id?: string
          sort_order?: number | null
          speaker_id?: string | null
          time_end?: string | null
          time_start: string
          title: string
          type?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_id?: string
          id?: string
          sort_order?: number | null
          speaker_id?: string | null
          time_end?: string | null
          time_start?: string
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_agenda_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_agenda_speaker_id_fkey"
            columns: ["speaker_id"]
            isOneToOne: false
            referencedRelation: "event_speakers"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          company: string | null
          created_at: string
          dietary_requirements: string | null
          email: string | null
          event_id: string
          full_name: string | null
          id: string
          role: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          dietary_requirements?: string | null
          email?: string | null
          event_id: string
          full_name?: string | null
          id?: string
          role?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          dietary_requirements?: string | null
          email?: string | null
          event_id?: string
          full_name?: string | null
          id?: string
          role?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_speakers: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string | null
          event_id: string
          id: string
          linkedin_url: string | null
          name: string
          sort_order: number | null
          talk_description: string | null
          talk_title: string | null
          title: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          event_id: string
          id?: string
          linkedin_url?: string | null
          name: string
          sort_order?: number | null
          talk_description?: string | null
          talk_title?: string | null
          title?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          event_id?: string
          id?: string
          linkedin_url?: string | null
          name?: string
          sort_order?: number | null
          talk_description?: string | null
          talk_title?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_speakers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_sponsors: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          logo_url: string
          name: string
          sort_order: number | null
          tier: string | null
          website_url: string | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          logo_url: string
          name: string
          sort_order?: number | null
          tier?: string | null
          website_url?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          logo_url?: string
          name?: string
          sort_order?: number | null
          tier?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_sponsors_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          company_id: string | null
          created_at: string
          current_attendees: number
          date_end: string | null
          date_start: string
          description: string | null
          end_date: string | null
          event_type: string | null
          format: string | null
          hero_image_url: string | null
          id: string
          image_url: string | null
          is_canceled: boolean | null
          is_featured: boolean
          is_free: boolean | null
          is_online: boolean
          is_published: boolean | null
          location_address: string | null
          location_city: string | null
          location_lat: number | null
          location_lng: number | null
          location_name: string | null
          long_description: string | null
          max_attendees: number | null
          online_url: string | null
          organizer_logo_url: string | null
          organizer_name: string | null
          organizer_url: string | null
          organizer_user_id: string | null
          price: number
          registration_url: string | null
          slug: string
          start_date: string
          tags: string[] | null
          ticket_currency: string | null
          ticket_price: number | null
          ticket_url: string | null
          time_end: string | null
          time_start: string | null
          timezone: string | null
          title: string
          video_url: string | null
          views_count: number | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          current_attendees?: number
          date_end?: string | null
          date_start: string
          description?: string | null
          end_date?: string | null
          event_type?: string | null
          format?: string | null
          hero_image_url?: string | null
          id?: string
          image_url?: string | null
          is_canceled?: boolean | null
          is_featured?: boolean
          is_free?: boolean | null
          is_online?: boolean
          is_published?: boolean | null
          location_address?: string | null
          location_city?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_name?: string | null
          long_description?: string | null
          max_attendees?: number | null
          online_url?: string | null
          organizer_logo_url?: string | null
          organizer_name?: string | null
          organizer_url?: string | null
          organizer_user_id?: string | null
          price?: number
          registration_url?: string | null
          slug: string
          start_date?: string
          tags?: string[] | null
          ticket_currency?: string | null
          ticket_price?: number | null
          ticket_url?: string | null
          time_end?: string | null
          time_start?: string | null
          timezone?: string | null
          title: string
          video_url?: string | null
          views_count?: number | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          current_attendees?: number
          date_end?: string | null
          date_start?: string
          description?: string | null
          end_date?: string | null
          event_type?: string | null
          format?: string | null
          hero_image_url?: string | null
          id?: string
          image_url?: string | null
          is_canceled?: boolean | null
          is_featured?: boolean
          is_free?: boolean | null
          is_online?: boolean
          is_published?: boolean | null
          location_address?: string | null
          location_city?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_name?: string | null
          long_description?: string | null
          max_attendees?: number | null
          online_url?: string | null
          organizer_logo_url?: string | null
          organizer_name?: string | null
          organizer_url?: string | null
          organizer_user_id?: string | null
          price?: number
          registration_url?: string | null
          slug?: string
          start_date?: string
          tags?: string[] | null
          ticket_currency?: string | null
          ticket_price?: number | null
          ticket_url?: string | null
          time_end?: string | null
          time_start?: string | null
          timezone?: string | null
          title?: string
          video_url?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_comments: {
        Row: {
          content: string
          created_at: string
          downvotes: number | null
          id: string
          is_accepted_answer: boolean | null
          is_edited: boolean | null
          parent_comment_id: string | null
          post_id: string
          updated_at: string | null
          upvotes: number
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          downvotes?: number | null
          id?: string
          is_accepted_answer?: boolean | null
          is_edited?: boolean | null
          parent_comment_id?: string | null
          post_id: string
          updated_at?: string | null
          upvotes?: number
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          downvotes?: number | null
          id?: string
          is_accepted_answer?: boolean | null
          is_edited?: boolean | null
          parent_comment_id?: string | null
          post_id?: string
          updated_at?: string | null
          upvotes?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "forum_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          category: string
          comment_count: number
          content: string
          created_at: string
          downvotes: number | null
          id: string
          is_locked: boolean | null
          is_pinned: boolean
          is_published: boolean | null
          is_solved: boolean | null
          last_activity_at: string | null
          slug: string | null
          solved_comment_id: string | null
          tags: string[] | null
          title: string
          updated_at: string
          upvotes: number
          user_id: string
          views: number
        }
        Insert: {
          category: string
          comment_count?: number
          content: string
          created_at?: string
          downvotes?: number | null
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean
          is_published?: boolean | null
          is_solved?: boolean | null
          last_activity_at?: string | null
          slug?: string | null
          solved_comment_id?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          upvotes?: number
          user_id: string
          views?: number
        }
        Update: {
          category?: string
          comment_count?: number
          content?: string
          created_at?: string
          downvotes?: number | null
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean
          is_published?: boolean | null
          is_solved?: boolean | null
          last_activity_at?: string | null
          slug?: string | null
          solved_comment_id?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          upvotes?: number
          user_id?: string
          views?: number
        }
        Relationships: []
      }
      forum_votes: {
        Row: {
          comment_id: string | null
          created_at: string
          id: string
          post_id: string | null
          user_id: string
          vote_type: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          user_id: string
          vote_type: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_votes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "forum_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      job_alerts: {
        Row: {
          created_at: string
          email: string
          filters: Json
          id: string
          is_active: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          filters?: Json
          id?: string
          is_active?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          filters?: Json
          id?: string
          is_active?: boolean
          user_id?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          applications_count: number
          apply_url: string | null
          category: string
          company_id: string
          created_at: string
          description: string
          experience_level: string
          expires_at: string | null
          id: string
          is_active: boolean
          is_featured: boolean
          is_sponsored: boolean
          location: string
          salary_max: number | null
          salary_min: number | null
          slug: string
          tech_tags: string[] | null
          title: string
          views_count: number
          work_model: string
        }
        Insert: {
          applications_count?: number
          apply_url?: string | null
          category: string
          company_id: string
          created_at?: string
          description: string
          experience_level: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          is_sponsored?: boolean
          location: string
          salary_max?: number | null
          salary_min?: number | null
          slug: string
          tech_tags?: string[] | null
          title: string
          views_count?: number
          work_model: string
        }
        Update: {
          applications_count?: number
          apply_url?: string | null
          category?: string
          company_id?: string
          created_at?: string
          description?: string
          experience_level?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          is_sponsored?: boolean
          location?: string
          salary_max?: number | null
          salary_min?: number | null
          slug?: string
          tech_tags?: string[] | null
          title?: string
          views_count?: number
          work_model?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean
          source: string | null
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          source?: string | null
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          source?: string | null
          subscribed_at?: string
        }
        Relationships: []
      }
      pricing_plans: {
        Row: {
          cta_text: string
          features: Json
          id: string
          is_featured: boolean
          name: string
          price_monthly: number
          price_yearly: number | null
          sort_order: number
        }
        Insert: {
          cta_text?: string
          features?: Json
          id?: string
          is_featured?: boolean
          name: string
          price_monthly: number
          price_yearly?: number | null
          sort_order?: number
        }
        Update: {
          cta_text?: string
          features?: Json
          id?: string
          is_featured?: boolean
          name?: string
          price_monthly?: number
          price_yearly?: number | null
          sort_order?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          experience_level: string | null
          full_name: string | null
          github_url: string | null
          id: string
          is_public: boolean
          linkedin_url: string | null
          location: string | null
          portfolio_url: string | null
          role: string
          tech_stack: string[] | null
          title: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          experience_level?: string | null
          full_name?: string | null
          github_url?: string | null
          id: string
          is_public?: boolean
          linkedin_url?: string | null
          location?: string | null
          portfolio_url?: string | null
          role?: string
          tech_stack?: string[] | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          experience_level?: string | null
          full_name?: string | null
          github_url?: string | null
          id?: string
          is_public?: boolean
          linkedin_url?: string | null
          location?: string | null
          portfolio_url?: string | null
          role?: string
          tech_stack?: string[] | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reading_history: {
        Row: {
          article_id: string
          id: string
          read_at: string | null
          scroll_percentage: number | null
          user_id: string
        }
        Insert: {
          article_id: string
          id?: string
          read_at?: string | null
          scroll_percentage?: number | null
          user_id: string
        }
        Update: {
          article_id?: string
          id?: string
          read_at?: string | null
          scroll_percentage?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_history_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_log: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          reference_id: string | null
          reference_type: string | null
          source: string
        }
        Insert: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          source: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          source?: string
        }
        Relationships: []
      }
      review_helpful: {
        Row: {
          created_at: string | null
          id: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_helpful_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "tool_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_data: {
        Row: {
          city: string
          created_at: string
          currency: string | null
          data_source: string
          experience_level: string
          id: string
          role: string
          salary_max: number
          salary_median: number
          salary_min: number
          salary_p25: number | null
          salary_p75: number | null
          sample_size: number | null
          tech_stack: string[] | null
          updated_at: string | null
          year: number
        }
        Insert: {
          city: string
          created_at?: string
          currency?: string | null
          data_source?: string
          experience_level: string
          id?: string
          role: string
          salary_max: number
          salary_median: number
          salary_min: number
          salary_p25?: number | null
          salary_p75?: number | null
          sample_size?: number | null
          tech_stack?: string[] | null
          updated_at?: string | null
          year?: number
        }
        Update: {
          city?: string
          created_at?: string
          currency?: string | null
          data_source?: string
          experience_level?: string
          id?: string
          role?: string
          salary_max?: number
          salary_median?: number
          salary_min?: number
          salary_p25?: number | null
          salary_p75?: number | null
          sample_size?: number | null
          tech_stack?: string[] | null
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      salary_submissions: {
        Row: {
          bonus_amount: number | null
          city: string
          company_size: string | null
          company_type: string | null
          education: string | null
          experience_level: string
          experience_years: number
          id: string
          includes_bonus: boolean | null
          industry: string | null
          is_approved: boolean | null
          is_verified: boolean | null
          monthly_salary: number
          remote_policy: string | null
          role: string
          submitted_at: string | null
          user_id: string | null
        }
        Insert: {
          bonus_amount?: number | null
          city: string
          company_size?: string | null
          company_type?: string | null
          education?: string | null
          experience_level: string
          experience_years: number
          id?: string
          includes_bonus?: boolean | null
          industry?: string | null
          is_approved?: boolean | null
          is_verified?: boolean | null
          monthly_salary: number
          remote_policy?: string | null
          role: string
          submitted_at?: string | null
          user_id?: string | null
        }
        Update: {
          bonus_amount?: number | null
          city?: string
          company_size?: string | null
          company_type?: string | null
          education?: string | null
          experience_level?: string
          experience_years?: number
          id?: string
          includes_bonus?: boolean | null
          industry?: string | null
          is_approved?: boolean | null
          is_verified?: boolean | null
          monthly_salary?: number
          remote_policy?: string | null
          role?: string
          submitted_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      saved_jobs: {
        Row: {
          created_at: string
          id: string
          job_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      showcase_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "showcase_comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "showcase_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      showcase_projects: {
        Row: {
          category: string | null
          comment_count: number | null
          created_at: string | null
          demo_url: string | null
          description: string
          github_url: string | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          long_description: string | null
          screenshot_urls: string[] | null
          slug: string
          tech_stack: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          upvotes: number | null
          user_id: string
          views: number | null
        }
        Insert: {
          category?: string | null
          comment_count?: number | null
          created_at?: string | null
          demo_url?: string | null
          description: string
          github_url?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          long_description?: string | null
          screenshot_urls?: string[] | null
          slug: string
          tech_stack?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          upvotes?: number | null
          user_id: string
          views?: number | null
        }
        Update: {
          category?: string | null
          comment_count?: number | null
          created_at?: string | null
          demo_url?: string | null
          description?: string
          github_url?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          long_description?: string | null
          screenshot_urls?: string[] | null
          slug?: string
          tech_stack?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string
          views?: number | null
        }
        Relationships: []
      }
      showcase_votes: {
        Row: {
          created_at: string | null
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "showcase_votes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "showcase_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          company_id: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          monthly_price: number
          plan: string
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          updated_at: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          company_id?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          monthly_price: number
          plan: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          company_id?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          monthly_price?: number
          plan?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_comparisons: {
        Row: {
          created_at: string | null
          id: string
          slug: string
          tool_ids: string[]
          views_count: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          slug: string
          tool_ids: string[]
          views_count?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          slug?: string
          tool_ids?: string[]
          views_count?: number | null
        }
        Relationships: []
      }
      tool_reviews: {
        Row: {
          cons: string | null
          content: string | null
          created_at: string
          experience_level: string | null
          helpful_count: number | null
          id: string
          is_verified: boolean | null
          pros: string | null
          rating: number
          title: string | null
          tool_id: string
          updated_at: string | null
          use_case: string | null
          user_id: string
        }
        Insert: {
          cons?: string | null
          content?: string | null
          created_at?: string
          experience_level?: string | null
          helpful_count?: number | null
          id?: string
          is_verified?: boolean | null
          pros?: string | null
          rating: number
          title?: string | null
          tool_id: string
          updated_at?: string | null
          use_case?: string | null
          user_id: string
        }
        Update: {
          cons?: string | null
          content?: string | null
          created_at?: string
          experience_level?: string | null
          helpful_count?: number | null
          id?: string
          is_verified?: boolean | null
          pros?: string | null
          rating?: number
          title?: string | null
          tool_id?: string
          updated_at?: string | null
          use_case?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_reviews_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          affiliate_link_id: string | null
          affiliate_url: string | null
          alternatives: string[] | null
          avg_rating: number
          best_for: string | null
          category: string
          company_hq: string | null
          company_name: string | null
          cons: string[] | null
          created_at: string
          description: string | null
          founded_year: number | null
          id: string
          is_editors_choice: boolean | null
          is_featured: boolean
          is_published: boolean | null
          languages: string[] | null
          logo_url: string | null
          long_description: string | null
          name: string
          platforms: string[] | null
          pricing_details: string | null
          pricing_from: string | null
          pricing_model: string | null
          pros: string[] | null
          review_count: number
          screenshot_urls: string[] | null
          slug: string
          subcategory: string | null
          tagline: string | null
          tags: string[] | null
          updated_at: string | null
          views_count: number | null
          website_url: string | null
        }
        Insert: {
          affiliate_link_id?: string | null
          affiliate_url?: string | null
          alternatives?: string[] | null
          avg_rating?: number
          best_for?: string | null
          category: string
          company_hq?: string | null
          company_name?: string | null
          cons?: string[] | null
          created_at?: string
          description?: string | null
          founded_year?: number | null
          id?: string
          is_editors_choice?: boolean | null
          is_featured?: boolean
          is_published?: boolean | null
          languages?: string[] | null
          logo_url?: string | null
          long_description?: string | null
          name: string
          platforms?: string[] | null
          pricing_details?: string | null
          pricing_from?: string | null
          pricing_model?: string | null
          pros?: string[] | null
          review_count?: number
          screenshot_urls?: string[] | null
          slug: string
          subcategory?: string | null
          tagline?: string | null
          tags?: string[] | null
          updated_at?: string | null
          views_count?: number | null
          website_url?: string | null
        }
        Update: {
          affiliate_link_id?: string | null
          affiliate_url?: string | null
          alternatives?: string[] | null
          avg_rating?: number
          best_for?: string | null
          category?: string
          company_hq?: string | null
          company_name?: string | null
          cons?: string[] | null
          created_at?: string
          description?: string | null
          founded_year?: number | null
          id?: string
          is_editors_choice?: boolean | null
          is_featured?: boolean
          is_published?: boolean | null
          languages?: string[] | null
          logo_url?: string | null
          long_description?: string | null
          name?: string
          platforms?: string[] | null
          pricing_details?: string | null
          pricing_from?: string | null
          pricing_model?: string | null
          pros?: string[] | null
          review_count?: number
          screenshot_urls?: string[] | null
          slug?: string
          subcategory?: string | null
          tagline?: string | null
          tags?: string[] | null
          updated_at?: string | null
          views_count?: number | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tools_affiliate_link_id_fkey"
            columns: ["affiliate_link_id"]
            isOneToOne: false
            referencedRelation: "affiliate_links"
            referencedColumns: ["id"]
          },
        ]
      }
      user_reputation: {
        Row: {
          accepted_answers: number | null
          comments_count: number | null
          posts_count: number | null
          rank: string | null
          showcase_projects: number | null
          total_points: number | null
          updated_at: string | null
          upvotes_received: number | null
          user_id: string
        }
        Insert: {
          accepted_answers?: number | null
          comments_count?: number | null
          posts_count?: number | null
          rank?: string | null
          showcase_projects?: number | null
          total_points?: number | null
          updated_at?: string | null
          upvotes_received?: number | null
          user_id: string
        }
        Update: {
          accepted_answers?: number | null
          comments_count?: number | null
          posts_count?: number | null
          rank?: string | null
          showcase_projects?: number | null
          total_points?: number | null
          updated_at?: string | null
          upvotes_received?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      increment_ad_clicks: { Args: { p_ad_id: string }; Returns: undefined }
      increment_ad_impressions: {
        Args: { p_ad_id: string }
        Returns: undefined
      }
      increment_article_views: {
        Args: { article_id: string }
        Returns: undefined
      }
      increment_event_views: {
        Args: { p_event_id: string }
        Returns: undefined
      }
      increment_forum_post_views: {
        Args: { p_post_id: string }
        Returns: undefined
      }
      increment_tool_views: { Args: { p_tool_id: string }; Returns: undefined }
      owns_job: {
        Args: { _job_id: string; _user_id: string }
        Returns: boolean
      }
      upsert_reputation: { Args: { p_user_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
