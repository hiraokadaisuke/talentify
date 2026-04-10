'use client'

import { useEffect, useState } from 'react'
import { getOffersForCompany, type CompanyOffer } from '@/utils/getOffersForCompany'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TableSkeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'

export default function CompanyOffersPage() {
  const [offers, setOffers] = useState<CompanyOffer[]>([])
  const [loading, setLoading] = useState(true)

  const [status, setStatus] = useState('all')
  const [keyword, setKeyword] = useState('')
  const [visitFrom, setVisitFrom] = useState('')
  const [visitTo, setVisitTo] = useState('')
  const [invoiceFrom, setInvoiceFrom] = useState('')
  const [invoiceTo, setInvoiceTo] = useState('')
  const [paidFrom, setPaidFrom] = useState('')
  const [paidTo, setPaidTo] = useState('')

  useEffect(() => {
    getOffersForCompany().then(d => {
      setOffers(d)
      setLoading(false)
    })
  }, [])

  const filtered = offers.filter(o => {
    if (status !== 'all' && o.status !== status) return false
    if (keyword) {
      const kw = keyword.toLowerCase()
      const tn = o.talent_name?.toLowerCase() ?? ''
      const sn = o.store_name?.toLowerCase() ?? ''
      if (!tn.includes(kw) && !sn.includes(kw)) return false
    }
    if (visitFrom && (!o.date || o.date < visitFrom)) return false
    if (visitTo && (!o.date || o.date > visitTo)) return false
    if (invoiceFrom && (!o.invoice_date || o.invoice_date < invoiceFrom)) return false
    if (invoiceTo && (!o.invoice_date || o.invoice_date > invoiceTo)) return false
    if (paidFrom && (!o.paid_at || o.paid_at < paidFrom)) return false
    if (paidTo && (!o.paid_at || o.paid_at > paidTo)) return false
    return true
  })

  const downloadCsv = () => {
    const headers = ['タレント名','店舗名','来店日','報酬金額','請求日','支払日','契約確認済み','備考']
    const rows = filtered.map(o => [
      o.talent_name ?? '',
      o.store_name ?? '',
      o.date ?? '',
      String(o.invoice_amount ?? o.reward ?? ''),
      o.invoice_date ?? '',
      o.paid_at ?? '',
      o.agreed ? '済' : '未',
      ''
    ])
    const bom = '\ufeff'
    const csv = bom + [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `offers_report_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const statusLabels: Record<string, string> = {
    pending: '保留中',
    confirmed: '承諾済み',
    rejected: '拒否',
    expired: '期限切れ',
  }

  return (
    <main className='space-y-4 bg-[#f8fafc] p-6'>
      <h1 className='text-xl font-bold text-[#334155]'>オファー管理</h1>
      <div className='flex flex-wrap items-end gap-2 text-sm text-[#334155]'>
        <div>
          <label className='block text-[#64748b]'>ステータス</label>
          <select value={status} onChange={e=>setStatus(e.target.value)} className='rounded border border-[#e2e8f0] bg-white p-1 text-[#334155]'>
            <option value='all'>すべて</option>
            <option value='pending'>保留中</option>
            <option value='confirmed'>承諾済み</option>
            <option value='rejected'>拒否</option>
            <option value='expired'>期限切れ</option>
          </select>
        </div>
        <div>
          <label className='block text-[#64748b]'>名前検索</label>
          <input type='text' value={keyword} onChange={e=>setKeyword(e.target.value)} className='rounded border border-[#e2e8f0] bg-white p-1 text-[#334155]'/>
        </div>
        <div>
          <label className='block text-[#64748b]'>来店日From</label>
          <input type='date' value={visitFrom} onChange={e=>setVisitFrom(e.target.value)} className='rounded border border-[#e2e8f0] bg-white p-1 text-[#334155]'/>
        </div>
        <div>
          <label className='block text-[#64748b]'>来店日To</label>
          <input type='date' value={visitTo} onChange={e=>setVisitTo(e.target.value)} className='rounded border border-[#e2e8f0] bg-white p-1 text-[#334155]'/>
        </div>
        <div>
          <label className='block text-[#64748b]'>請求日From</label>
          <input type='date' value={invoiceFrom} onChange={e=>setInvoiceFrom(e.target.value)} className='rounded border border-[#e2e8f0] bg-white p-1 text-[#334155]'/>
        </div>
        <div>
          <label className='block text-[#64748b]'>請求日To</label>
          <input type='date' value={invoiceTo} onChange={e=>setInvoiceTo(e.target.value)} className='rounded border border-[#e2e8f0] bg-white p-1 text-[#334155]'/>
        </div>
        <div>
          <label className='block text-[#64748b]'>支払日From</label>
          <input type='date' value={paidFrom} onChange={e=>setPaidFrom(e.target.value)} className='rounded border border-[#e2e8f0] bg-white p-1 text-[#334155]'/>
        </div>
        <div>
          <label className='block text-[#64748b]'>支払日To</label>
          <input type='date' value={paidTo} onChange={e=>setPaidTo(e.target.value)} className='rounded border border-[#e2e8f0] bg-white p-1 text-[#334155]'/>
        </div>
        <div className='ml-auto'>
          <Button size='sm' onClick={downloadCsv}>CSV出力</Button>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={3} />
      ) : filtered.length === 0 ? (
        <EmptyState title='該当するオファーがありません' />
      ) : (
        <Table className='overflow-hidden rounded-xl border border-[#e2e8f0] bg-white'>
          <TableHeader>
            <TableRow className='border-b border-[#e2e8f0] bg-white'>
              <TableHead className='text-[#334155]'>オファーID</TableHead>
              <TableHead className='text-[#334155]'>タレント名</TableHead>
              <TableHead className='text-[#334155]'>店舗名</TableHead>
              <TableHead className='text-[#334155]'>ステータス</TableHead>
              <TableHead className='text-[#334155]'>来店日</TableHead>
              <TableHead className='text-[#334155]'>報酬金額</TableHead>
              <TableHead className='text-[#334155]'>契約確認</TableHead>
              <TableHead className='text-[#334155]'>請求済</TableHead>
              <TableHead className='text-[#334155]'>支払済</TableHead>
              <TableHead className='text-[#334155]'>支払日</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(o => (
              <TableRow key={o.id} className='border-b border-[#e2e8f0] hover:bg-[#f8fafc]'>
                <TableCell className='text-[#334155]'>{o.id}</TableCell>
                <TableCell className='text-[#334155]'>{o.talent_name}</TableCell>
                <TableCell className='text-[#334155]'>{o.store_name}</TableCell>
                <TableCell className='text-[#334155]'>{statusLabels[o.status ?? 'pending']}</TableCell>
                <TableCell className='text-[#334155]'>{o.date ?? ''}</TableCell>
                <TableCell className='text-[#334155]'>¥{(o.invoice_amount ?? o.reward ?? 0).toLocaleString()}</TableCell>
                <TableCell>
                  {o.agreed ? <Badge className='border-[#2f4da0]/35 bg-[#eef2ff] text-[#2f4da0]' variant='outline'>確認済</Badge> : <Badge variant='outline' className='border-[#e2e8f0] bg-white text-[#64748b]'>未確認</Badge>}
                </TableCell>
                <TableCell>
                  {o.invoice_submitted ? (
                    <Badge className='border-[#2f4da0]/35 bg-[#eef2ff] text-[#2f4da0]' variant='outline'>請求済</Badge>
                  ) : (
                    <Badge variant='outline' className='border-[#e2e8f0] bg-white text-[#64748b]'>未請求</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {o.paid ? (
                    <Badge className='border-[#1f6b4f]/35 bg-[#ecfdf3] text-[#1f6b4f]' variant='outline'>支払済</Badge>
                  ) : (
                    <Badge variant='outline' className='border-[#e2e8f0] bg-white text-[#64748b]'>未支払</Badge>
                  )}
                </TableCell>
                <TableCell className='text-[#334155]'>{o.paid_at ?? ''}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </main>
  )
}
