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
    <div id="offer-messages">
      <OfferChatThread
        offerId={offerId}
        currentUserId={currentUserId}
        currentRole="talent"
        storeName={storeName}
        talentName={talentName}
        className="lg:max-h-[540px]"
      />
    </div>
  )
}

