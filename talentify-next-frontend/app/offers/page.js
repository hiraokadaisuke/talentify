'use client'
import { useState } from 'react'
import { Dialog, DialogHeader, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogHeader } from '@/components/ui/alert-dialog'

const TABS = ['未対応', '承諾済', '辞退済', '履歴']

const initialPending = [
  {
    id: 1,
    store: '○○ホール',
    datetime: '7/15(日) 14:00〜18:00',
    location: '東京都渋谷区',
    summary: '来店実践＋サイン会',
    pay: '¥40,000',
    travel: '宿泊費あり／交通費応相談',
    message: 'ぜひご出演をお願いしたく…',
    deadline: Date.now() + 36 * 60 * 60 * 1000,
  },
]

const initialAccepted = []
const initialDeclined = []
const initialHistory = []

function timeLeft(deadline) {
  const diff = deadline - Date.now()
  if (diff <= 0) return '期限切れ'
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  if (days > 0) return `あと${days}日`
  return `あと${hours}時間`
}

function OfferCard({ offer, onAccept, onDecline }) {
  const [detailOpen, setDetailOpen] = useState(false)
  const [declineOpen, setDeclineOpen] = useState(false)
  const [reason, setReason] = useState('')
  return (
    <div className="border rounded p-4 grid gap-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
        <div className="space-y-1">
          <div>店舗: {offer.store}</div>
          <div>日時: {offer.datetime}</div>
          <div>場所: {offer.location}</div>
          <div>内容: {offer.summary}</div>
        </div>
        <div className="space-y-1">
          <div>ギャラ: {offer.pay}</div>
          <div>交通費等: {offer.travel}</div>
          <div>回答期限: {timeLeft(offer.deadline)}</div>
        </div>
      </div>
      <div className="text-sm">メッセージ: {offer.message}</div>
      <div className="mt-2 flex flex-wrap gap-2">
        <button className="px-3 py-1 border rounded" onClick={() => setDetailOpen(true)}>詳細を見る</button>
        {onAccept && <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={() => onAccept(offer.id)}>承諾する</button>}
        {onDecline && <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={() => setDeclineOpen(true)}>辞退する</button>}
        <button className="px-3 py-1 border rounded">メッセージを送る</button>
      </div>
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)}>
        <DialogHeader>オファー詳細</DialogHeader>
        <div className="space-y-2 text-sm">
          <div>店舗: {offer.store}</div>
          <div>日時: {offer.datetime}</div>
          <div>場所: {offer.location}</div>
          <div>内容: {offer.summary}</div>
          <div>ギャラ: {offer.pay}</div>
          <div>交通費等: {offer.travel}</div>
          <div>メッセージ: {offer.message}</div>
        </div>
        <DialogFooter>
          <button className="px-3 py-1 border rounded" onClick={() => setDetailOpen(false)}>閉じる</button>
        </DialogFooter>
      </Dialog>
      <AlertDialog
        open={declineOpen}
        onCancel={() => setDeclineOpen(false)}
        onConfirm={() => {
          onDecline(offer.id, reason)
          setReason('')
          setDeclineOpen(false)
        }}
      >
        <AlertDialogHeader>辞退理由を入力してください</AlertDialogHeader>
        <textarea
          className="w-full border rounded p-2 text-sm"
          rows={3}
          value={reason}
          onChange={e => setReason(e.target.value)}
        />
      </AlertDialog>
    </div>
  )
}

export default function OfferPage() {
  const [tab, setTab] = useState('未対応')
  const [pending, setPending] = useState(initialPending)
  const [accepted, setAccepted] = useState(initialAccepted)
  const [declined, setDeclined] = useState(initialDeclined)
  const [history, setHistory] = useState(initialHistory)

  const acceptOffer = id => {
    const off = pending.find(o => o.id === id)
    if (!off) return
    setPending(pending.filter(o => o.id !== id))
    setAccepted([...accepted, off])
  }

  const declineOffer = (id, reason) => {
    const off = pending.find(o => o.id === id)
    if (!off) return
    setPending(pending.filter(o => o.id !== id))
    setDeclined([...declined, { ...off, reason }])
  }

  return (
    <main className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex space-x-2 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1 rounded border whitespace-nowrap ${tab === t ? 'bg-blue-600 text-white' : 'bg-white'}`}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === '未対応' && (
        <div className="space-y-4">
          {pending.map(o => (
            <OfferCard key={o.id} offer={o} onAccept={acceptOffer} onDecline={declineOffer} />
          ))}
          {pending.length === 0 && <p className="text-sm text-gray-500">オファーはありません。</p>}
        </div>
      )}
      {tab === '承諾済' && (
        <div className="space-y-4">
          {accepted.map(o => (
            <OfferCard key={o.id} offer={o} />
          ))}
          {accepted.length === 0 && <p className="text-sm text-gray-500">承諾済みのオファーはありません。</p>}
        </div>
      )}
      {tab === '辞退済' && (
        <div className="space-y-4">
          {declined.map(o => (
            <OfferCard key={o.id} offer={o} />
          ))}
          {declined.length === 0 && <p className="text-sm text-gray-500">辞退済みのオファーはありません。</p>}
        </div>
      )}
      {tab === '履歴' && (
        <div className="space-y-4">
          {history.map(o => (
            <OfferCard key={o.id} offer={o} />
          ))}
          {history.length === 0 && <p className="text-sm text-gray-500">過去のオファーはありません。</p>}
        </div>
      )}
    </main>
  )
}

