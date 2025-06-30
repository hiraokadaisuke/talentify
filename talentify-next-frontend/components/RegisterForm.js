'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000'

export default function RegisterForm() {
  const searchParams = useSearchParams()
  const roleParam = searchParams.get('role')
  const initialRole = roleParam === 'performer' || roleParam === 'store' ? roleParam : null
  const [role, setRole] = useState(initialRole)
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(null)

  const renderCommonFields = () => (
    <>
      <div>
        <label className="block mb-1">メールアドレス</label>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block mb-1">パスワード</label>
        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <p className="text-xs text-gray-500 mt-1">8文字以上、大文字小文字、数字を含めてください</p>
      </div>
      <div>
        <label className="block mb-1">パスワード（確認用）</label>
        <input
          type="password"
          name="confirm"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
    </>
  )

  const renderStoreFields = () => (
    <>
      <div>
        <label className="block mb-1">店舗名</label>
        <input type="text" className="w-full p-2 border rounded" required />
      </div>
      <div>
        <label className="block mb-1">担当者名</label>
        <input type="text" className="w-full p-2 border rounded" required />
      </div>
      <div>
        <label className="block mb-1">電話番号</label>
        <input type="tel" className="w-full p-2 border rounded" required />
      </div>
      <div>
        <label className="block mb-1">所在地（都道府県）</label>
        <input type="text" className="w-full p-2 border rounded" required />
      </div>
    </>
  )

  const renderPerformerFields = () => (
    <>
      <div>
        <label className="block mb-1">氏名</label>
        <input type="text" className="w-full p-2 border rounded" required />
      </div>
      <div>
        <label className="block mb-1">芸名・活動名（任意）</label>
        <input type="text" className="w-full p-2 border rounded" />
      </div>
      <div>
        <label className="block mb-1">生年月日</label>
        <input type="date" className="w-full p-2 border rounded" />
      </div>
      <div>
        <label className="block mb-1">電話番号</label>
        <input type="tel" className="w-full p-2 border rounded" required />
      </div>
      <div>
        <label className="block mb-1">活動地域（都道府県）</label>
        <input type="text" className="w-full p-2 border rounded" required />
      </div>
      <div>
        <label className="block mb-1">得意なジャンル</label>
        <input type="text" className="w-full p-2 border rounded" placeholder="パチンコライター, YouTuber 等" />
      </div>
    </>
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('パスワードが一致しません')
      return
    }
    try {
      const csrfRes = await fetch(`${API_BASE}/api/csrf-token`, {
        credentials: 'include',
      })
      const { csrfToken } = await csrfRes.json()
      const res = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, role }),
      })
      if (!res.ok) throw new Error('register failed')
      await res.json()
      router.push('/login')
    } catch (err) {
      setError('登録に失敗しました')
    }
  }

  return (
    <main className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">新規登録</h1>
      <p className="mb-6">アカウントを作成して、サービスを開始しましょう</p>

      {!role && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">アカウント種別をお選びください</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => setRole('store')} className="p-6 border rounded hover:bg-gray-50 text-left">
              <span className="block text-xl font-semibold mb-2">パチンコ店の方はこちら</span>
              <span className="text-sm text-gray-600">演者を検索し、オファーを送る</span>
            </button>
            <button onClick={() => setRole('performer')} className="p-6 border rounded hover:bg-gray-50 text-left">
              <span className="block text-xl font-semibold mb-2">演者の方はこちら</span>
              <span className="text-sm text-gray-600">店舗からのオファーを受け取る</span>
            </button>
          </div>
        </div>
      )}

      {role && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {renderCommonFields()}
          {role === 'store' ? renderStoreFields() : renderPerformerFields()}

          <div className="flex items-center">
            <input id="terms" type="checkbox" className="mr-2" required />
            <label htmlFor="terms" className="text-sm">
              <Link href="/terms" className="text-blue-600 underline mr-1">利用規約</Link>と
              <Link href="/privacy" className="text-blue-600 underline ml-1">プライバシーポリシー</Link>に同意する
            </label>
          </div>

          {error && <p className="text-red-600">{error}</p>}

          <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            登録する
          </button>
        </form>
      )}

      <div className="mt-6 text-sm">
        すでにアカウントをお持ちの方は{' '}
        <Link href="/login" className="text-blue-600 underline">ログインはこちら</Link>
      </div>
    </main>
  )
}
