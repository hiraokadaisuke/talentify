'use client'
import { useState } from 'react'
import StarRating from '../../components/StarRating'

const initialEvents = [
  { id: 1, date: '2025/06/10', title: '○○さん来店', venue: '○○ホール', reviewed: false },
  { id: 2, date: '2025/05/20', title: '△△さんイベント', venue: '△△ホール', reviewed: true, rating: 4.5 }
]

export default function ReviewsPage() {
  const [events, setEvents] = useState(initialEvents)
  const [filter, setFilter] = useState('all') // all | pending | done
  const [active, setActive] = useState(null)
  const [form, setForm] = useState({ rating: 0, comment: '', time: 0, attitude: 0, excitement: 0, repeat: 'yes' })

  const filtered = events.filter(e => {
    if (filter === 'pending') return !e.reviewed
    if (filter === 'done') return e.reviewed
    return true
  })

  const openForm = evt => {
    setActive(evt)
    setForm({
      rating: evt.rating || 0,
      comment: evt.comment || '',
      time: evt.time || 0,
      attitude: evt.attitude || 0,
      excitement: evt.excitement || 0,
      repeat: evt.repeat ? 'yes' : 'no'
    })
  }

  const submit = () => {
    setEvents(evts =>
      evts.map(e =>
        e.id === active.id
          ? {
              ...e,
              reviewed: true,
              rating: form.rating,
              comment: form.comment,
              time: form.time,
              attitude: form.attitude,
              excitement: form.excitement,
              repeat: form.repeat === 'yes'
            }
          : e
      )
    )
    setActive(null)
  }

  return (
    <main className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-2">レビュー管理</h1>
      <div className="flex space-x-2 mb-4">
        <button onClick={() => setFilter('all')} className={`px-3 py-1 border rounded ${filter==='all' ? 'bg-blue-600 text-white' : ''}`}>すべて</button>
        <button onClick={() => setFilter('pending')} className={`px-3 py-1 border rounded ${filter==='pending' ? 'bg-blue-600 text-white' : ''}`}>未レビューのみ</button>
        <button onClick={() => setFilter('done')} className={`px-3 py-1 border rounded ${filter==='done' ? 'bg-blue-600 text-white' : ''}`}>完了済み</button>
      </div>
      <ul className="space-y-2">
        {filtered.map(evt => (
          <li key={evt.id} className="border p-3 flex justify-between items-center">
            <div>
              <p>{`${evt.date}　${evt.title}　＠${evt.venue}`}</p>
              {evt.reviewed && <p className="text-sm text-gray-500">レビュー済：{evt.rating}⭐</p>}
            </div>
            <button onClick={() => openForm(evt)} className="px-4 py-2 bg-blue-600 text-white rounded">
              {evt.reviewed ? '編集' : 'レビューを書く'}
            </button>
          </li>
        ))}
        {filtered.length === 0 && <li className="p-4 text-center text-gray-500">該当するイベントがありません</li>}
      </ul>

      {active && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-full max-w-lg space-y-4">
            <h2 className="text-xl font-bold">{active.title} / {active.date}</h2>
            <div>
              <label className="block mb-1">総合評価</label>
              <StarRating value={form.rating} onChange={v => setForm({ ...form, rating: v })} />
            </div>
            <div>
              <label className="block mb-1">コメント</label>
              <textarea value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value.slice(0,300) })} className="w-full p-2 border rounded" rows={3}></textarea>
            </div>
            <div>
              <label className="block mb-1">時間厳守</label>
              <StarRating value={form.time} onChange={v => setForm({ ...form, time: v })} />
            </div>
            <div>
              <label className="block mb-1">接客態度</label>
              <StarRating value={form.attitude} onChange={v => setForm({ ...form, attitude: v })} />
            </div>
            <div>
              <label className="block mb-1">盛り上げ度</label>
              <StarRating value={form.excitement} onChange={v => setForm({ ...form, excitement: v })} />
            </div>
            <div>
              <label className="block mb-1">再依頼意向</label>
              <label className="mr-4"><input type="radio" checked={form.repeat==='yes'} onChange={() => setForm({ ...form, repeat: 'yes' })}/> あり</label>
              <label><input type="radio" checked={form.repeat==='no'} onChange={() => setForm({ ...form, repeat: 'no' })}/> なし</label>
            </div>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setActive(null)} className="px-4 py-2 border rounded">キャンセル</button>
              <button onClick={submit} disabled={!form.rating || !form.comment} className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300">送信</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
