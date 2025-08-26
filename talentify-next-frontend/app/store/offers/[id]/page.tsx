import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OfferHeaderCard from '@/components/offer/OfferHeaderCard'
import OfferChatThread from '@/components/offer/OfferChatThread'
import CancelOfferSection from './CancelOfferSection'

type PageProps = {
  params: { id: string }
}

export default async function StoreOfferPage({ params }: PageProps) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('offers')
    .select(
      'id,status,date,message,talent_id,user_id,canceled_at, talents(stage_name,avatar_url), stores(store_name)'
    )
    .eq('id', params.id)
    .single()

  if (!data || !user) {
    notFound()
  }

  const offer = {
    id: data.id as string,
    status: data.status as string,
    date: data.date as string,
    message: data.message as string,
    performerName: data.talents?.stage_name || '',
    performerAvatarUrl: data.talents?.avatar_url || null,
    storeName: data.stores?.store_name || '',
  }

  return (
    <div className="flex flex-col gap-4 h-full p-4">
      <OfferHeaderCard offer={offer} role="store" />
      <CancelOfferSection
        offerId={offer.id}
        initialStatus={data.status}
        initialCanceledAt={data.canceled_at}
      />
      <div id="chat" className="flex-1 min-h-0">
        <OfferChatThread
          offerId={offer.id}
          currentUserId={user.id}
          currentRole="store"
        />
      </div>
    </div>
  )
}
