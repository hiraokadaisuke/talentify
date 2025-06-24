'use client'
import { useState } from 'react'

export default function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b py-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left flex justify-between items-center"
      >
        <span className="font-medium">{question}</span>
        <span className="ml-2">{open ? '-' : '+'}</span>
      </button>
      {open && <p className="mt-2 text-sm text-gray-700">{answer}</p>}
    </div>
  )
}
