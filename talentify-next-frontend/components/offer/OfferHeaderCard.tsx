import Link from 'next/link'
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
  /** action in progress to control loading state of buttons */
  actionLoading?: 'accept' | 'decline' | null
  /** link and text for invoice action button */
  invoiceLink?: string
  invoiceText?: string
}

export default function OfferHeaderCard({
  offer,
  role,
  onAccept,
  onDecline,
  actionLoading = null,
  invoiceLink,
  invoiceText,
}: OfferHeaderCardProps) {
  const renderStatusBadge = () => {
    if (offer.status === 'pending') return null
    if (offer.status === 'confirmed') {
      return <Badge>承諾済み</Badge>
    }
    if (offer.status === 'rejected') {
      return <Badge variant="secondary">辞退済み</Badge>
    }
    return <Badge>{offer.status}</Badge>
  }

  return (
    <Card>
      <CardHeader className="flex items-center">
        <CardTitle>オファー詳細</CardTitle>
        <div className="ml-auto flex items-center gap-2">
          {invoiceLink && (
            <Button variant="default" size="sm" asChild>
              <Link href={invoiceLink}>{invoiceText}</Link>
            </Button>
          )}
          {renderStatusBadge()}
        </div>
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
