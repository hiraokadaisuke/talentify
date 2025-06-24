'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <main className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">お問い合わせ</h1>
      <p className="mb-6">ご質問、ご意見、ご要望など、お気軽にお問い合わせください。</p>
      <p className="mb-6 text-sm">緊急の場合は <a href="tel:XX-XXXX-XXXX" className="text-blue-600 underline">XX-XXXX-XXXX</a> までご連絡ください。</p>
      {submitted ? (
        <div className="bg-green-100 border border-green-300 p-4 rounded">
          お問い合わせを受け付けました。ご入力いただいたメールアドレスにご連絡いたします。
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">お問い合わせ種別</label>
            <select className="w-full p-2 border rounded" required>
              <option value="サービスについて">サービスについて</option>
              <option value="不具合報告">不具合報告</option>
              <option value="ご意見・ご要望">ご意見・ご要望</option>
              <option value="その他">その他</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">お名前</label>
            <input type="text" className="w-full p-2 border rounded" required />
          </div>
          <div>
            <label className="block mb-1">メールアドレス</label>
            <input type="email" className="w-full p-2 border rounded" required />
          </div>
          <div>
            <label className="block mb-1">電話番号 (任意)</label>
            <input type="tel" className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-1">件名</label>
            <input type="text" className="w-full p-2 border rounded" required />
          </div>
          <div>
            <label className="block mb-1">お問い合わせ内容</label>
            <textarea rows="5" className="w-full p-2 border rounded" required></textarea>
          </div>
          <div className="flex items-center">
            <input id="agree" type="checkbox" className="mr-2" required />
            <label htmlFor="agree" className="text-sm">
              <Link href="/privacy" className="text-blue-600 underline mr-1">
                プライバシーポリシー
              </Link>
              に同意する
            </label>
          </div>
          <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            送信する
          </button>
        </form>
      )}
      <div className="mt-6 text-sm">
        お問い合わせの前に<Link href="/faq" className="text-blue-600 underline mx-1">よくある質問</Link>もご確認ください。
      </div>
    </main>
  )
}
