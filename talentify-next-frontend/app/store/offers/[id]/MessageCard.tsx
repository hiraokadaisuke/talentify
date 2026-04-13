'use client'

import OfferChatThread from '@/components/offer/OfferChatThread'

type MessageCardProps = {
  offerId: string
  currentUserId: string
  storeName: string
  talentName: string
}

export default function MessageCard({ offerId, currentUserId, storeName, talentName }: MessageCardProps) {
  return (
    <div id="offer-messages" className="h-full">
      <OfferChatThread
        offerId={offerId}
        currentUserId={currentUserId}
        currentRole="store"
        storeName={storeName}
        talentName={talentName}
        className="lg:max-h-[calc(100vh-3rem)]"
      />
    </div>
  )
}
