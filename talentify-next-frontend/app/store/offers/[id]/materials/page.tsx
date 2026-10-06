import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/server'
import { getProtectedRequestUserId } from '@/lib/auth/getProtectedRequestUserId'
import MaterialGallery from './MaterialGallery'

type PageProps = {
  params: { id: string }
}

function getPhotos(avatarUrl: string | null, photos: unknown) {
  const values = [
    avatarUrl,
    ...(Array.isArray(photos) ? photos.filter((item): item is string => typeof item === 'string') : []),
  ].filter((item): item is string => Boolean(item && item.trim()))

  return Array.from(new Set(values))
}

export default async function PromotionMaterialsPage({ params }: PageProps) {
  const supabase = createClient()

  const [userResult, offerResult] = await Promise.all([
    getProtectedRequestUserId(supabase),
    supabase
      .from('offers')
      .select(
        `
          id,status,date,
          talents(stage_name,display_name,avatar_url,photos),
          store:stores!offers_store_id_fkey(id,store_name,user_id)
        `
      )
      .eq('id', params.id)
      .maybeSingle(),
  ])

  const userId = userResult.userId
  const data = offerResult.data as any

  if (!userId || !data || data.store?.user_id !== userId) {
    notFound()
  }

  const performerName =
    data.talents?.display_name || data.talents?.stage_name || '演者名未設定'
  const storeName = data.store?.store_name || '店舗名未設定'
  const photos = getPhotos(data.talents?.avatar_url ?? null, data.talents?.photos)
  const available = ['accepted', 'confirmed', 'completed'].includes(String(data.status))
  const visitDate = data.date
    ? format(new Date(data.date), 'yyyy/MM/dd (EEE)', { locale: ja })
    : '日付未設定'

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-4">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,.05)]">
        <div className="p-4 sm:p-5">
          <Link
            href={`/store/offers/${params.id}`}
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 transition hover:text-[#C2410C]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            オファー詳細へ
          </Link>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[10px] font-black tracking-[0.15em] text-[#C2410C]">
                PROMOTION MATERIALS
              </p>
              <h1 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                告知素材
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {performerName} / {storeName}
              </p>
            </div>
            <div className="text-sm font-bold text-slate-600 sm:text-right">
              <span className="block text-xs font-medium text-slate-400">来店日</span>
              {visitDate}
            </div>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-[#FF3B2E] via-[#FF8A00] to-[#FFC400]" />
      </section>

      {!available ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-black text-amber-950">締結後に利用できます</h2>
          <p className="mt-2 text-sm leading-6 text-amber-800">
            見積が承認され、取引が締結された案件から店内掲示・SNS用の告知素材を作成できます。
          </p>
        </section>
      ) : (
        <>
          <section className="flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#C2410C]" />
            <div>
              <p className="text-sm font-black text-slate-950">主催表記は自動で固定表示します</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                すべての素材に「主催：来店ナビ（RAITEN NAVI）」を表示します。店舗側で消す操作はありません。
              </p>
            </div>
          </section>

          <MaterialGallery
            offerId={params.id}
            photos={photos}
            performerName={performerName}
            storeName={storeName}
            visitDate={data.date}
          />

          <Link
            href={`/store/offers/${params.id}`}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-black text-slate-800 shadow-sm transition hover:bg-slate-50 sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            オファー詳細へ戻る
          </Link>
        </>
      )}
    </div>
  )
}
