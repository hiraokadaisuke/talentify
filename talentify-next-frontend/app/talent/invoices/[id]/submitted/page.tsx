'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import InvoiceSubmittedSummary, { type SubmittedInvoice } from '@/components/invoices/InvoiceSubmittedSummary'

const supabase = createClient()


export default function TalentInvoiceSubmittedPage() {
  const params = useParams()
  const id = params?.id as string

  const [invoice, setInvoice] = useState<SubmittedInvoice | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadInvoice = async () => {
      if (!id) {
        setLoading(false)
        return
      }
      const { data, error } = await supabase
        .from('invoices')
        .select(
          'id,offer_id,amount,transport_fee,extra_fee,notes,invoice_number,due_date,status,payment_status,created_at'
        )
        .eq('id', id)
        .maybeSingle()

      if (error) {
        console.error(error)
        setInvoice(null)
      } else {
        setInvoice((data as SubmittedInvoice | null) ?? null)
      }
      setLoading(false)
    }

    loadInvoice()
  }, [id])

  if (loading) {
    return <div className='p-6 lg:mx-auto lg:max-w-5xl lg:rounded-2xl lg:border lg:border-slate-200 lg:bg-white lg:p-8 lg:text-center lg:text-slate-500 lg:shadow-[0_8px_24px_rgba(15,23,42,.05)]'>読み込み中...</div>
  }

  if (!invoice) {
    return <div className='p-6 lg:mx-auto lg:max-w-5xl lg:rounded-2xl lg:border lg:border-slate-200 lg:bg-white lg:p-8 lg:text-center lg:text-slate-500 lg:shadow-[0_8px_24px_rgba(15,23,42,.05)]'>見積書が見つかりませんでした。</div>
  }

  return <InvoiceSubmittedSummary invoice={invoice} />
}
