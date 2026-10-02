import TalentSearchPage from '@/components/talent-search/TalentSearchPage'
import { createClient } from '@/lib/supabase/server'
import type { PublicTalent } from '@/types/talent'

export default async function SearchTalentsPage() {
  const supabase = createClient() as any
  const { data, error } = await supabase
    .from('public_talent_profiles')
    .select('id, stage_name, genre, area, avatar_url, rate, rating, bio, display_name')
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
