import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface OfferSummaryProps {
  performerName: string
  performerAvatarUrl?: string | null
  storeName: string
  date: string // ISO string
  message: string
  invoiceStatus?: 'not_created' | 'draft' | 'submitted' | 'approved' | 'paid'
}

const invoiceLabel: Record<string, { label: string; className: string }> = {
  not_created: { label: '未作成', className: 'bg-gray-200 text-gray-800' },
  draft: { label: '見積作成中', className: 'bg-slate-200 text-slate-800' },
  submitted: { label: '見積確認待ち', className: 'bg-yellow-200 text-yellow-800' },
  approved: { label: '締結済み', className: 'bg-green-200 text-green-800' },
  paid: { label: '支払済', className: 'bg-green-200 text-green-800' },
}

export default function OfferSummary({
  performerName,
  performerAvatarUrl,
  storeName,
  date,
  message,
  invoiceStatus = 'not_submitted',
}: OfferSummaryProps) {
  const formattedDate = format(new Date(date), 'yyyy/MM/dd (EEE) HH:mm', {
    locale: ja,
  })
  const invoice = invoiceLabel[invoiceStatus]

  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-center gap-2">
        {performerAvatarUrl && (
          <Image
            src={performerAvatarUrl}
            alt={performerName}
            width={32}
            height={32}
            className="rounded-full"
          />
        )}
        <span>{performerName}</span>
        <span className="text-muted-foreground">/</span>
        <span>{storeName}</span>
      </div>
      <div>{formattedDate}</div>
      <div className="whitespace-pre-wrap break-words">{message}</div>
      {invoice && (
        <Badge className={invoice.className}>{invoice.label}</Badge>
      )}
    </div>
  )
}
