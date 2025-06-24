'use client'
import { useState } from 'react'
import Link from 'next/link'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください')
      return
    }
    // ここでログイン処理を行う
    setError('')
  }

  return (
    <>
      <Header />
      <main className="max-w-xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">ログイン</h1>
        {error && <p className="mb-4 text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">メールアドレス / ID</label>
            <input
              type="email"
              className="w-full p-2 border rounded"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1">パスワード</label>
            <input
              type="password"
              className="w-full p-2 border rounded"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
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
            新規登録
          </Link>
        </div>
        <div className="mt-8">
          <p className="text-center text-sm text-gray-500 mb-2">ソーシャルログイン (準備中)</p>
          <div className="flex justify-center space-x-2">
            <button className="px-4 py-2 border rounded w-1/2">Google</button>
            <button className="px-4 py-2 border rounded w-1/2">Facebook</button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
