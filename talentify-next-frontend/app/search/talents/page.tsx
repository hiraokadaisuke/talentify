import TalentSearchPage from '@/components/talent-search/TalentSearchPage'
import { createClient } from '@/lib/supabase/server'
import type { PublicTalent } from '@/types/talent'
import type { SupabaseClient } from '@supabase/supabase-js'

export default async function SearchTalentsPage() {
  const supabase = createClient() as SupabaseClient<any>
  const { data, error } = await supabase
    .from('public_talent_profiles')
    .select('id, stage_name, genre, area, avatar_url, rate, rating, bio, display_name, twitter_followers, twitter_followers_updated_at, instagram_followers, instagram_followers_updated_at, youtube_followers, youtube_followers_updated_at, tiktok_followers, tiktok_followers_updated_at')
    .returns<PublicTalent[]>()

  if (error) {
    console.error('failed to preload talents', error)
  }

  return (
    <TalentSearchPage
      initialTalents={data ?? []}
      initialLoadError={Boolean(error)}
    />
  )
}
