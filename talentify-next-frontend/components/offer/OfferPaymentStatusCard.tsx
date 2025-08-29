import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface OfferPaymentStatusCardProps {
  paid: boolean
  paidAt?: string | null
}

export default function OfferPaymentStatusCard({ paid, paidAt }: OfferPaymentStatusCardProps) {
  const paidAtFormatted = paidAt ? format(new Date(paidAt), 'yyyy/MM/dd', { locale: ja }) : null
  return (
    <Card>
      <CardHeader>
        <CardTitle>支払い状況</CardTitle>
      </CardHeader>
      <CardContent>
        {paid ? (
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500 text-white">支払い完了</Badge>
            {paidAtFormatted && (
              <span className="text-sm text-muted-foreground">{paidAtFormatted}</span>
            )}
          </div>
        ) : (
          <Badge className="bg-red-500 text-white">支払い未完了</Badge>
        )}
      </CardContent>
    </Card>
  )
}
