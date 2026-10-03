import TalentSearchPage from '@/components/talent-search/TalentSearchPage'
import { createClient } from '@/lib/supabase/server'
import type { PublicTalent } from '@/types/talent'
import type { SupabaseClient } from '@supabase/supabase-js'

export default async function SearchTalentsPage() {
  const supabase = createClient() as SupabaseClient<any>
  const { data, error } = await supabase
    .from('public_talent_profiles')
    .select('id, stage_name, genre, area, avatar_url, rate, rating, bio, display_name, twitter_url, instagram_url, youtube_url, social_tiktok')
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
