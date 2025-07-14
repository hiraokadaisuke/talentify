'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useUserRole } from '@/utils/useRole'

const supabase = createClient()

export default function Header() {
  const { role } = useUserRole()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
      <div className="max-w-5xl mx-auto flex items-center justify-between p-4">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          Talentify
        </Link>

        {/* ハンバーガーアイコン（モバイル） */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gray-800"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* メニュー（PC表示） */}
        <nav className="hidden md:flex space-x-4 text-sm items-center">
          <Link href="/about" className="hover:underline">このサイトについて</Link>
          <Link href="/talents" className="hover:underline">演者検索</Link>
          <Link href="/dashboard" className="hover:underline">ダッシュボード</Link>
          <Link href="/faq" className="hover:underline">FAQ</Link>
          <Link href="/contact" className="hover:underline">お問い合わせ</Link>

          {role === 'store' && (
            <Link href="/manage" className="hover:underline">管理ページ</Link>
          )}

{role === 'talent' && (
  <Link href="/talent/edit" className="hover:underline text-blue-600 font-semibold">
    プロフィール編集
  </Link>
)}

          <Link href="/login" className="font-semibold hover:underline">ログイン</Link>
          <Link
            href="/register"
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            新規登録
          </Link>
          <Link href="/logout" className="hover:underline">ログアウト</Link>
        </nav>
      </div>

      {/* メニュー（モバイル表示時に展開） */}
      {isOpen && (
        <nav className="md:hidden px-4 pb-4 space-y-2 text-sm font-medium">
          <Link href="/about" className="block">このサイトについて</Link>
          <Link href="/talents" className="block">演者検索</Link>
          <Link href="/dashboard" className="block">ダッシュボード</Link>
          <Link href="/faq" className="block">FAQ</Link>
          <Link href="/contact" className="block">お問い合わせ</Link>

          {role === 'store' && (
            <Link href="/manage" className="block">管理ページ</Link>
          )}

{role === 'talent' && (
  <Link href="/talent/edit" className="hover:underline text-blue-600 font-semibold">
    プロフィール編集
  </Link>
)}

          <Link href="/login" className="block">ログイン</Link>
          <Link
            href="/register"
            className="block w-fit px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            新規登録
          </Link>
          <Link href="/logout" className="block">ログアウト</Link>
        </nav>
      )}
    </header>
  )
}
