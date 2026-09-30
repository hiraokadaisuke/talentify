'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('パスワードは8文字以上で入力してください')
      return
    }
    if (password !== confirm) {
      setError('確認用パスワードが一致しません')
      return
    }

    setSaving(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setError('パスワードの更新に失敗しました。再設定メールからやり直してください')
      setSaving(false)
      return
    }

    await supabase.auth.signOut()
    router.replace('/login?passwordReset=1')
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-[#05050d] px-5 pb-16 pt-28 text-white">
      <form onSubmit={submit} className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/[0.06] p-7">
        <h1 className="text-2xl font-black">新しいパスワードを設定</h1>
        <p className="mt-2 text-sm text-white/60">8文字以上の新しいパスワードを入力してください。</p>
        <label className="mt-6 block text-sm font-bold">
          新しいパスワード
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-2 w-full rounded-xl bg-white p-3 text-black" required />
        </label>
        <label className="mt-4 block text-sm font-bold">
          確認
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className="mt-2 w-full rounded-xl bg-white p-3 text-black" required />
        </label>
        {error && <p className="mt-4 text-sm font-bold text-red-300">{error}</p>}
        <button disabled={saving} className="mt-6 h-12 w-full rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 font-black disabled:opacity-50">
          {saving ? '更新中...' : 'パスワードを更新'}
        </button>
      </form>
    </main>
  )
}
