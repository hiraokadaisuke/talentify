'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

export default function Header() {
  const [role, setRole] = useState(null)

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      if (data?.role) {
        setRole(data.role)
      }
    }

    fetchRole()
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
      <div className="max-w-5xl mx-auto flex items-center justify-between p-4">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          Talentify
        </Link>

        <nav className="space-x-4 text-sm flex items-center">
          <Link href="/about" className="hover:underline">このサイトについて</Link>
          <Link href="/performers" className="hover:underline">演者検索</Link>
          <Link href="/dashboard" className="hover:underline">ダッシュボード</Link>
          <Link href="/faq" className="hover:underline">FAQ</Link>
          <Link href="/contact" className="hover:underline">お問い合わせ</Link>

        {role === 'store' && (
          <Link href="/manage" className="hover:underline">管理ページ</Link>
        )}

        {role === 'performer' && (
          <Link href="/performer/profile/edit" className="hover:underline text-blue-600 font-semibold">
            プロフィール編集
          </Link>
        )}

          <Link href="/login" className="font-semibold hover:underline">ログイン</Link>
          <Link
            href="/register"
            className="ml-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            新規登録
          </Link>
          <Link href="/logout" className="hover:underline">ログアウト</Link>
        </nav>
      </div>
    </header>
  )
}
