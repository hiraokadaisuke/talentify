"use client"
import { useState } from 'react'
import Link from 'next/link'
import FAQItem from '../../components/FAQItem'

const FAQ_DATA = {
  '店舗向け': [
    { question: '演者の検索方法は？', answer: '登録後、ダッシュボードから条件を指定して検索できます。' },
    { question: '出演依頼はどのように行いますか？', answer: '演者のプロフィールページから直接オファーを送信できます。' }
  ],
  '演者向け': [
    { question: '店舗からの依頼はどこで確認できますか？', answer: 'ログイン後のマイページで受け取った依頼を確認できます。' },
    { question: 'ギャラの支払いはいつ行われますか？', answer: 'イベント終了後、規定の期日までに振り込まれます。' }
  ],
  'その他': [
    { question: '退会方法を教えてください。', answer: 'マイページの設定から退会手続きを行えます。' },
    { question: 'パスワードを忘れた場合は？', answer: 'ログイン画面の「パスワードをお忘れですか？」から再設定できます。' }
  ]
}

export default function FAQPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('すべて')

  const categories = ['すべて', ...Object.keys(FAQ_DATA)]

  const allItems = category === 'すべて'
    ? Object.values(FAQ_DATA).flat()
    : FAQ_DATA[category] || []

  const filteredItems = allItems.filter(item =>
    item.question.includes(query) || item.answer.includes(query)
  )

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">よくある質問</h1>

      <input
        type="text"
        placeholder="キーワード検索"
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      <div className="flex space-x-2 mb-4 overflow-x-auto">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1 rounded border whitespace-nowrap ${category === cat ? 'bg-blue-600 text-white' : 'bg-white'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filteredItems.map((item, idx) => (
          <FAQItem key={idx} question={item.question} answer={item.answer} />
        ))}
        {filteredItems.length === 0 && (
          <p className="text-sm text-gray-600">該当する質問は見つかりませんでした。</p>
        )}
      </div>

      <div className="mt-8 text-sm">
        解決しない場合は{' '}
        <Link href="/contact" className="text-blue-600 underline">お問い合わせ</Link>
        ください。
      </div>
    </main>
  )
}
