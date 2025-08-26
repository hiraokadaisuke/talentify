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
  /** action in progress to control loading state of buttons */
  actionLoading?: 'accept' | 'decline' | null
}

export default function OfferHeaderCard({
  offer,
  role,
  onAccept,
  onDecline,
  onCancel,
  actionLoading = null,
}: OfferHeaderCardProps) {
  const renderStatusBadge = () => {
    if (offer.status === 'pending') return null
    if (offer.status === 'confirmed') {
      return <Badge className="ml-auto mr-2">承諾済み</Badge>
    }
    if (offer.status === 'rejected') {
      return (
        <Badge variant="secondary" className="ml-auto mr-2">
          辞退済み
        </Badge>
      )
    }
    return <Badge className="ml-auto mr-2">{offer.status}</Badge>
  }

  return (
    <Card>
      <CardHeader className="flex items-center">
        <CardTitle>オファー詳細</CardTitle>
        {renderStatusBadge()}
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
            <Button variant="outline" size="sm" onClick={onCancel}>
              オファーをキャンセル
            </Button>
          )}
          {role === 'talent' && offer.status === 'pending' && (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={onAccept}
                disabled={actionLoading !== null}
              >
                {actionLoading === 'accept' ? '承諾中...' : '承諾'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDecline}
                disabled={actionLoading !== null}
              >
                {actionLoading === 'decline' ? '辞退中...' : '辞退'}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
