export type PublicTalent = {
  id: string
  stage_name: string | null
  genre: string | null
  area: string | null
  avatar_url: string | null
  rating: number | null
  rate: number | null
  bio: string | null
  display_name?: string | null
  affiliation?: string | null
  agency?: string | null
  company_name?: string | null
  capabilities?: string[] | null
  skills?: string[] | null
  twitter_followers?: number | null
  twitter_followers_updated_at?: string | null
  instagram_followers?: number | null
  instagram_followers_updated_at?: string | null
  youtube_followers?: number | null
  youtube_followers_updated_at?: string | null
  tiktok_followers?: number | null
  tiktok_followers_updated_at?: string | null
}
