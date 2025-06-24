'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      // 実際のログイン処理は未実装
      console.log('login', email)
    } catch (err) {
      setError('メールアドレスまたはパスワードが間違っています')
    }
  }

  return (
    <main className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">ログイン</h1>
      <p className="mb-6">アカウントにアクセスして、サービスを続けましょう</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">メールアドレス / ID</label>
          <input
            type="email"
            className="w-full p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="メールアドレスを入力"
          />
        </div>
        <div>
          <label className="block mb-1">パスワード</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full p-2 border rounded pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="パスワードを入力"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-sm"
            >
              {showPassword ? '非表示' : '表示'}
            </button>
          </div>
        </div>
        {error && <p className="text-red-600">{error}</p>}
        <div className="text-right">
          <Link href="/password-reset" className="text-sm text-blue-600 underline">
            パスワードをお忘れですか？
          </Link>
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ログイン
        </button>
      </form>
      <div className="mt-6 text-sm text-center">
        アカウントをお持ちでない方は{' '}
        <Link href="/register" className="text-blue-600 underline">
          新規登録はこちら
        </Link>
      </div>
      <div className="mt-8 text-center">
        <div className="mb-2 text-sm text-gray-600">SNSアカウントでログイン (準備中)</div>
        <div className="flex justify-center space-x-2">
          <button disabled className="px-3 py-1 border rounded text-gray-400">Google</button>
          <button disabled className="px-3 py-1 border rounded text-gray-400">Facebook</button>
          <button disabled className="px-3 py-1 border rounded text-gray-400">X</button>
        </div>
      </div>
    </main>
  )
}

