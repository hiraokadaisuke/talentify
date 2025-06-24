'use client'
import React, { useState } from 'react'
import Modal from './Modal'

export default function AvailabilityModal({ date, open, onClose, onSave }) {
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [area, setArea] = useState('')

  const handleSubmit = e => {
    e.preventDefault()
    onSave({ date, startTime, endTime, area })
  }

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-lg font-semibold mb-4">{date?.toLocaleDateString()} の空き登録</h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="time"
          value={startTime}
          onChange={e => setStartTime(e.target.value)}
          className="border p-1 rounded w-full"
          required
        />
        <input
          type="time"
          value={endTime}
          onChange={e => setEndTime(e.target.value)}
          className="border p-1 rounded w-full"
          required
        />
        <input
          type="text"
          value={area}
          onChange={e => setArea(e.target.value)}
          placeholder="エリア(任意)"
          className="border p-1 rounded w-full"
        />
        <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded w-full">
          登録
        </button>
      </form>
    </Modal>
  )
}
