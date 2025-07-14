'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useUserRole } from '@/utils/useRole'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'

const supabase = createClient()

export default function Header() {
  const { role } = useUserRole()
  const [isOpen, setIsOpen] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) return

      let nameToDisplay = 'ユーザー'

      if (role === 'store') {
        const { data, error } = await supabase
          .from('stores')
          .select('display_name')
          .eq('user_id', user.id)
          .single()
        if (error) console.error('store error:', error)
        nameToDisplay = data?.display_name ?? '店舗ユーザー'

      } else if (role === 'talent') {
        const { data, error } = await supabase
          .from('talents')
          .select('stage_name')
          .eq('user_id', user.id)
          .single()
        if (error) console.error('talent error:', error)
        nameToDisplay = data?.stage_name ?? 'タレント'

      } else if (role === 'company') {
        const { data, error } = await supabase
          .from('companies')
          .select('display_name')
          .eq('user_id', user.id)
          .single()
        if (error) console.error('company error:', error)
        nameToDisplay = data?.display_name ?? '会社ユーザー'
      }

      setUserName(nameToDisplay)
    }

    fetchSession()
  }, [role])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const profileEditPath =
    role === 'store'
      ? '/store/edit'
      : role === 'talent'
      ? '/talent/edit'
      : role === 'company'
      ? '/company/edit'
      : '/profile/edit'

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
      <div className="max-w-5xl mx-auto flex items-center justify-between p-4">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          Talentify
        </Link>

        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-gray-800">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* PCメニュー */}
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
            <Link href="/talent/edit" className="text-blue-600 font-semibold hover:underline">
              プロフィール編集
            </Link>
          )}

          {userName ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="font-semibold cursor-pointer">
                {userName} ▼
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Link href="/dashboard">ダッシュボード</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href={profileEditPath}>プロフィール</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>ログアウト</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login" className="font-semibold hover:underline">ログイン</Link>
              <Button asChild><Link href="/register">新規登録</Link></Button>
            </>
          )}
        </nav>
      </div>

      {/* モバイルメニュー */}
      {isOpen && (
        <nav className="md:hidden px-4 pb-4 space-y-2 text-sm font-medium">
          <Link href="/about" className="block">このサイトについて</Link>
          <Link href="/talents" className="block">演者検索</Link>
          <Link href="/dashboard" className="block">ダッシュボード</Link>
          <Link href="/faq" className="block">FAQ</Link>
          <Link href="/contact" className="block">お問い合わせ</Link>

          {role === 'store' && <Link href="/manage" className="block">管理ページ</Link>}
          {role === 'talent' && <Link href="/talent/edit" className="block text-blue-600">プロフィール編集</Link>}

          {userName ? (
            <>
              <Link href={profileEditPath} className="block">プロフィール</Link>
              <button onClick={handleLogout} className="block text-left w-full">ログアウト</button>
            </>
          ) : (
            <>
              <Link href="/login" className="block">ログイン</Link>
              <Link href="/register" className="block w-fit px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                新規登録
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  )
}
