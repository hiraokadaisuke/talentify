'use client'

import { useState } from 'react'

export default function TutorialResetButton() {
  const [done, setDone] = useState(false)

  const reset = () => {
    window.localStorage.removeItem('talentify:getting-started-dismissed:store')
    window.localStorage.removeItem('talentify:getting-started-dismissed:talent')
    setDone(true)
  }

  return (
    <button
      type="button"
      onClick={reset}
      className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-black text-white/75 transition hover:bg-white/5"
    >
      {done ? '再表示する設定にしました' : '初回ナビをもう一度表示'}
    </button>
  )
}
