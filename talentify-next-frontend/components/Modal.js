'use client'
import React from 'react'

export default function Modal({ open, onClose, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-4 max-w-md w-full relative">
        <button
          className="absolute top-2 right-2 text-gray-500"
          onClick={onClose}
        >
          ×
        </button>
        {children}
      </div>
    </div>
  )
}
