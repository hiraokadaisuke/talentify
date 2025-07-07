'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewTalentPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [profile, setProfile] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  try {
    const res = await fetch('/api/talents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, profile }),
    })

    if (res.ok) {
      router.push('/talents')
    } else {
      const error = await res.text()
      alert(`登録に失敗しました：${error}`)
    }
  } catch (err) {
    console.error('送信エラー:', err)
    alert('通信エラーが発生しました')
  }
}

}
