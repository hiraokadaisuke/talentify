import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import TalentCard from '@/components/talent-search/TalentCard'
import { Button } from '@/components/ui/button'
import type { PublicTalent } from '@/types/talent'

type FavoriteRow = {
  talent_id: string
  created_at: string
}

export default async function StoreFavoritesPage() {
  const supabase = createClient()
  const { user } = await getCurrentUser()

  if (!user) {
    redirect('/login?redirect=/store/favorites')
  }

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (storeError || !store) {
    redirect('/dashboard')
  }

  const db = supabase as any
  const { data: favoriteRows, error: favoritesError } = await db
    .from('store_favorite_talents')
    .select('talent_id,created_at')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false })

  if (favoritesError) {
    throw new Error(`お気に入りの取得に失敗しました: ${favoritesError.message}`)
  }

  const favorites = (favoriteRows ?? []) as FavoriteRow[]
  const talentIds = favorites.map(row => row.talent_id)
  let talents: PublicTalent[] = []

  if (talentIds.length > 0) {
    const { data, error } = await db
      .from('public_talent_profiles')
      .select('id,stage_name,genre,area,avatar_url,rate,rating,bio,display_name')
      .in('id', talentIds)

    if (error) {
      throw new Error(`演者情報の取得に失敗しました: ${error.message}`)
    }

    const talentMap = new Map(
      ((data ?? []) as PublicTalent[]).map(talent => [talent.id, talent]),
    )

    talents = talentIds
      .map(talentId => talentMap.get(talentId))
      .filter((talent): talent is PublicTalent => Boolean(talent))
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6">
      <div>
        <p className="text-sm font-semibold text-[#FF5A1F]">Favorites</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
          お気に入りの演者
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          気になる演者を保存して、あとからすぐに確認できます。
        </p>
      </div>

      {talents.length === 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
          <Heart className="mx-auto h-10 w-10 text-slate-300" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            まだお気に入りはありません
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            演者詳細の「お気に入り」から保存できます。
          </p>
          <Button asChild className="mt-5">
            <Link href="/search">演者を探す</Link>
          </Button>
        </section>
      ) : (
        <>
          <p className="text-sm text-slate-600">{talents.length}件保存しています</p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {talents.map(talent => (
              <TalentCard key={talent.id} talent={talent} />
            ))}
          </div>
        </>
      )}
    </main>
  )
}
