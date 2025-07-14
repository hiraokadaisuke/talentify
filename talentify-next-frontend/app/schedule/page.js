'use client'
import { useEffect, useState } from 'react'
import { API_BASE } from '@/lib/api'

export default function SchedulePage() {
  const [items, setItems] = useState([])
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/schedule`, {
          credentials: 'include',
        })
        if (!res.ok) throw new Error('failed')
        const data = await res.json()
        setItems(data)
      } catch (e) {
        console.error(e)
      }
    }
    fetchSchedule()
  }, [])

  const addItem = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_BASE}/api/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ date, description }),
      })
      if (!res.ok) throw new Error('failed')
      const newItem = await res.json()
      setItems([...items, newItem])
      setDate('')
      setDescription('')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <main className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">スケジュール</h1>
      <form onSubmit={addItem} className="space-y-2 mb-4">
        <input
          type="date"
          className="w-full p-2 border rounded"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <input
          type="text"
          className="w-full p-2 border rounded"
          placeholder="内容"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit" className="py-2 px-4 bg-blue-600 text-white rounded">
          追加
        </button>
      </form>
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it._id}>
            {new Date(it.date).toLocaleDateString()} - {it.description}
          </li>
        ))}
        {items.length === 0 && <li>予定はありません</li>}
      </ul>
    </main>
  )
}
