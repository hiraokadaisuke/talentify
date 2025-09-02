"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface OfferPaymentStatusCardProps {
  paid: boolean
  paidAt?: string | null
  invoice?: {
    id: string
    invoiceUrl?: string | null
  } | null
}

export default function OfferPaymentStatusCard({ paid, paidAt, invoice }: OfferPaymentStatusCardProps) {
  const router = useRouter()
  const paidAtFormatted = paidAt ? format(new Date(paidAt), 'yyyy/MM/dd', { locale: ja }) : null

  const handlePay = async () => {
    if (!invoice) return
    const res = await fetch(`/api/invoices/${invoice.id}/pay`, {
      method: 'POST',
    })
    if (res.ok) {
      toast.success('支払いを記録しました')
      router.refresh()
    } else {
      toast.error('支払いの記録に失敗しました')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>支払い状況</CardTitle>
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
          <div className="flex flex-col gap-2 pt-2">
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
              <Button onClick={handlePay}>支払い完了にする</Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
