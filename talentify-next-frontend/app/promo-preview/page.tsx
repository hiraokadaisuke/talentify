import { notFound } from 'next/navigation'
import MaterialGallery from '../store/offers/[id]/materials/MaterialGallery'

export const dynamic = 'force-dynamic'

export default function PromoPreview({ searchParams }: { searchParams: { none?: string; long?: string } }) {
  if (process.env.VERCEL_ENV !== 'preview') notFound()
  return <main className="mx-auto max-w-6xl px-4 pb-10 pt-24">
    <h1 className="mb-5 text-xl font-black">A4ポスター確認</h1>
    <MaterialGallery offerId="preview-only" performerName={searchParams.long ? '天川みさきと特別ゲスト' : '乃木憂助'}
      storeName={searchParams.long ? 'パチンコマックス新宿駅前本店' : 'パチンコマックス新宿店'} visitDate="2026-10-10T00:00:00+09:00"
      photos={searchParams.none ? [] : ['https://kbbnaxmnuizmakyhjyym.supabase.co/storage/v1/object/public/talent-photos/avatars/84cf0829-7151-45e5-9378-1291d81cffc3/avatar-1791087010617.jpg']} />
  </main>
}
