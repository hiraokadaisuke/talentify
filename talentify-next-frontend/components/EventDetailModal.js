'use client'
import React from 'react'
import Modal from './Modal'
import Link from 'next/link'

export default function EventDetailModal({ event, open, onClose }) {
  if (!event) return null
  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-lg font-semibold mb-2">{event.title}</h2>
      <p className="text-sm mb-1">店舗: {event.storeName}</p>
      <p className="text-sm mb-1">場所: {event.location}</p>
      <p className="text-sm mb-1">開始: {new Date(event.start).toLocaleString()}</p>
      <p className="text-sm mb-3">終了: {new Date(event.end).toLocaleString()}</p>
      <p className="text-sm mb-3">ステータス: {event.status}</p>
      <Link href={`/events/${event._id}`} className="text-blue-600 underline">
        詳細ページへ
      </Link>
    </Modal>
  )
}
