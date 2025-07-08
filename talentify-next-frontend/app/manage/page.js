'use client'
import { useState, useEffect } from 'react'

const TABS = ['進行中の契約', 'スケジュール', '履歴', '支払い']

const ongoingContracts = [
  {
    id: 1,
    event: '7月10日 ○○店来店実践',
    performer: '○○さん',
    datetime: '2025/07/10 14:00',
    location: '○○ホール',
    status: '契約済',
    document: '署名済み',
  },
]

const scheduleEvents = [
  { date: '2025-07-10', label: '○○さん来店 14:00' },
  { date: '2025-07-22', label: '△△さん実践撮影 11:00' },
]

const history = [
  { id: 1, date: '2025/06/12', label: '○○さん来店＠○○ホール', reviewed: true },
  { id: 2, date: '2025/05/28', label: '△△さんトークイベント', reviewed: false },
]

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || ''

function usePayments() {
  const [payments, setPayments] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/payments`)
        if (!res.ok) throw new Error('failed')
        const data = await res.json()
        setPayments(data)
      } catch (e) {
        console.error(e)
      }
    }
    load()
  }, [])

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/api/payments`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (!res.ok) throw new Error('failed')
      const updated = await res.json()
      setPayments((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
      )
    } catch (e) {
      console.error(e)
    }
  }

  return { payments, updateStatus }
}

function TabButton({ current, tab, setTab }) {
  return (
    <button
      onClick={() => setTab(tab)}
      className={`px-3 py-1 rounded border whitespace-nowrap ${current === tab ? 'bg-blue-600 text-white' : 'bg-white'}`}
    >
      {tab}
    </button>
  )
}

function OngoingContracts() {
  return (
    <div className="space-y-4">
      {ongoingContracts.map(c => (
        <div key={c.id} className="border rounded p-4">
          <div className="flex flex-col md:flex-row md:justify-between">
            <div className="space-y-1">
              <div>{c.event}</div>
              <div>演者: {c.performer}</div>
              <div>日時: {c.datetime}</div>
              <div>場所: {c.location}</div>
            </div>
            <div className="space-y-1 md:text-right mt-2 md:mt-0">
              <div className="text-sm">状態: {c.status}</div>
              <div className="text-sm">書類: {c.document}</div>
            </div>
          </div>
          <div className="mt-2 flex space-x-2">
            <button className="px-3 py-1 border rounded">契約書確認</button>
            <button className="px-3 py-1 border rounded">メッセージ</button>
          </div>
        </div>
      ))}
    </div>
  )
}

function Schedule() {
  return (
    <div className="border rounded p-4">
      <h3 className="font-semibold mb-2">2025年7月</h3>
      <ul className="space-y-1">
        {scheduleEvents.map(e => (
          <li key={e.date}>{e.label}</li>
        ))}
      </ul>
      <button className="mt-4 px-3 py-1 border rounded">新しい依頼作成</button>
    </div>
  )
}

function History() {
  return (
    <div className="space-y-2">
      {history.map(h => (
        <div key={h.id} className="border rounded p-2 flex items-center justify-between">
          <div>{h.date} {h.label}</div>
          {h.reviewed ? (
            <span className="text-sm text-gray-500">★レビュー済</span>
          ) : (
            <button className="text-sm text-blue-600 underline">レビューを書く</button>
          )}
        </div>
      ))}
    </div>
  )
}

function Payments() {
  const { payments, updateStatus } = usePayments()

  return (
    <div className="space-y-2">
      {payments.map((p) => (
        <div
          key={p.id}
          className="border rounded p-2 flex items-center justify-between"
        >
          <div>
            {p.label} ¥{p.amount?.toLocaleString?.()}
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <span>{p.status}</span>
            {p.invoice_url && (
              <a href={p.invoice_url} className="text-blue-600 underline">
                請求書DL
              </a>
            )}
            {p.status !== '支払済' && (
              <button
                onClick={() => updateStatus(p.id, '支払済')}
                className="px-2 py-1 border rounded"
              >
                支払済にする
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ManagePage() {
  const [tab, setTab] = useState('進行中の契約')

  return (
    <main className="max-w-4xl mx-auto p-4">
      <div className="flex space-x-2 mb-4 overflow-x-auto">
        {TABS.map(t => (
          <TabButton key={t} tab={t} current={tab} setTab={setTab} />
        ))}
      </div>
      {tab === '進行中の契約' && <OngoingContracts />}
      {tab === 'スケジュール' && <Schedule />}
      {tab === '履歴' && <History />}
      {tab === '支払い' && <Payments />}
    </main>
  )
}
