"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Loader2 } from 'lucide-react'

interface OfferPaymentStatusCardProps {
  paid: boolean
  paidAt?: string | null
  invoice?: {
    id: string
    invoiceUrl?: string | null
    amount?: number
    status?: string
  } | null
  offerId?: string
  title?: string
}

export default function OfferPaymentStatusCard({
  paid,
  paidAt,
  invoice,
  offerId,
  title = '支払い状況',
}: OfferPaymentStatusCardProps) {
  const router = useRouter()
  const paidAtFormatted = paidAt ? format(new Date(paidAt), 'yyyy/MM/dd', { locale: ja }) : null
  const [loading, setLoading] = useState(false)

  const statusLabel = (status?: string) => {
    switch (status) {
      case 'submitted':
        return '承認待ち'
      case 'approved':
        return '承認済み'
      case 'rejected':
        return '差し戻し済み'
      default:
        return '下書き'
    }
  }

  const handlePay = async () => {
    if (!invoice) return
    setLoading(true)
    const res = await fetch(`/api/invoices/${invoice.id}/pay`, { method: 'POST' })
    setLoading(false)
    if (res.ok) {
      toast.success('支払いを記録しました')
      router.refresh()
      if (offerId) {
        router.push(`/store/reviews/new?offerId=${offerId}`)
      }
    } else {
      toast.error('支払いの記録に失敗しました')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
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

        {invoice && (
          <div className="space-y-2 pt-2">
            {invoice.amount !== undefined && (
              <div>請求額: ¥{invoice.amount.toLocaleString('ja-JP')}</div>
            )}
            {invoice.status && (
              <div>
                ステータス: <Badge variant="outline">{statusLabel(invoice.status)}</Badge>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Button variant="outline" asChild>
                <Link href={`/store/invoices/${invoice.id}`}>請求書を見る</Link>
              </Button>
              {invoice.invoiceUrl && (
                <Button variant="outline" asChild>
                  <Link href={invoice.invoiceUrl} target="_blank">
                    PDFを開く
                  </Link>
                </Button>
              )}
              {!paid && (
                <Button onClick={handlePay} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  支払い完了にする
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
