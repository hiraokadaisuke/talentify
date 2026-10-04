'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

type FAQItemProps = {
  question: string
  answer: string
}

export default function FAQItem({ question, answer }: FAQItemProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="overflow-hidden rounded-[18px] border border-slate-200 bg-white">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-16 w-full items-center gap-4 px-4 py-4 text-left sm:px-5"
      >
        <span className="flex-1 text-[15px] font-black leading-6 text-slate-900 sm:text-base">
          {question}
        </span>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-slate-200 bg-slate-50 text-slate-500">
          <Plus className={'h-4 w-4 transition-transform duration-200 ' + (open ? 'rotate-45' : '')} />
        </span>
      </button>
      {open ? (
        <div className="border-t border-slate-100 bg-[#FBFCFE] px-4 py-4 text-sm leading-7 text-slate-600 sm:px-5">
          {answer}
        </div>
      ) : null}
    </div>
  )
}
