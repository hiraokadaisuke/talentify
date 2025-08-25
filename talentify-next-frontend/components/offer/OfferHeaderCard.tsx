import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import OfferSummary from './OfferSummary'

interface OfferHeaderCardProps {
  offer: {
    id: string
    status: string
    performerName: string
    performerAvatarUrl?: string | null
    storeName: string
    date: string
    message: string
    invoiceStatus?: 'not_submitted' | 'submitted' | 'paid'
  }
  role: 'store' | 'talent'
  onAccept?: () => void
  onDecline?: () => void
  onCancel?: () => void
}

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-gray-100 text-gray-800',
  canceled: 'bg-red-100 text-red-800',
}

export default function OfferHeaderCard({
  offer,
  role,
  onAccept,
  onDecline,
  onCancel,
}: OfferHeaderCardProps) {
  const status = statusColor[offer.status] || 'bg-gray-100 text-gray-800'
  const statusLabel =
    offer.status === 'pending'
      ? '返答待ち'
      : offer.status === 'declined'
        ? '辞退'
        : offer.status

  return (
    <Card>
      <CardHeader className="flex items-center">
        <CardTitle>オファー詳細</CardTitle>
        <Badge className={`${status} ml-auto mr-2`}>{statusLabel}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <OfferSummary
          performerName={offer.performerName}
          performerAvatarUrl={offer.performerAvatarUrl}
          storeName={offer.storeName}
          date={offer.date}
          message={offer.message}
          invoiceStatus={offer.invoiceStatus}
        />
        <div className="flex flex-wrap gap-2">
          {role === 'store' && (
            <>
              <Button variant="outline" size="sm" onClick={onCancel}>
                オファーをキャンセル
              </Button>
            </>
          )}
          {role === 'talent' && (
            <>
              <Button variant="default" size="sm" onClick={onAccept}>
                承諾
              </Button>
              <Button variant="outline" size="sm" onClick={onDecline}>
                辞退
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
