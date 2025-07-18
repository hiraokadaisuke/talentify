'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import Sidebar from './Sidebar'
import { Sheet, SheetTrigger, SheetContent } from './ui/sheet'
import { createClient } from '@/utils/supabase/client'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

const supabase = createClient()

export default function Header({ sidebarRole }: { sidebarRole?: 'talent' | 'store' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) {
        setIsLoading(false)
        return
      }

      let detectedRole: string | null = null
      let nameToDisplay = 'ユーザー'

      // role 推定
      const store = await supabase.from('stores').select('display_name').eq('user_id', user.id).single()
      if (store.data) {
        detectedRole = 'store'
        nameToDisplay = store.data.display_name ?? '店舗ユーザー'
      } else {
        const talent = await supabase.from('talents').select('stage_name').eq('user_id', user.id).single()
        if (talent.data) {
          detectedRole = 'talent'
          nameToDisplay = talent.data.stage_name ?? 'タレント'
        } else {
          const company = await supabase.from('companies').select('display_name').eq('user_id', user.id).single()
          if (company.data) {
            detectedRole = 'company'
            nameToDisplay = company.data.display_name ?? '会社ユーザー'
          }
        }
      }

      setUserName(nameToDisplay)
      setRole(detectedRole)
      setIsLoading(false)
    }

    fetchSessionAndProfile()

    // リアルタイムで反映させる
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) fetchSessionAndProfile()
      else {
        setUserName(null)
        setRole(null)
        setIsLoading(false)
      }
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

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

  const isLoggedIn = !!userName

  return (
    <header className="fixed top-0 z-50 w-full h-16 bg-white shadow-sm">
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between p-4">
        <div className="flex items-center gap-2">
          {sidebarRole && (
            <Sheet>
              <SheetTrigger asChild>
                <button className="md:hidden text-gray-800">
                  <Menu size={24} />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-4">
                <Sidebar role={sidebarRole} />
              </SheetContent>
            </Sheet>
          )}
          <Link href="/" className="text-2xl font-bold tracking-tight">
            Talentify
          </Link>
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-gray-800">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {!isLoading && (
          <nav className="hidden md:flex justify-between items-center w-full text-sm">
            {/* 左メニュー */}
            <div className="flex space-x-6 ml-6">
              <Link href="/about" className="hover:underline">Talentifyについて</Link>
              <Link href="/faq" className="hover:underline">FAQ</Link>
              <Link href="/contact" className="hover:underline">お問い合わせ</Link>
            </div>

            {/* 右メニュー */}
            <div className="flex items-center space-x-2 ml-auto">
              {!isLoggedIn ? (
                <>
                  <span className="text-black text-sm font-normal mr-2">
                    今すぐ無料登録♬
                  </span>
                  <Link
                    href="/register?role=store"
                    className="rounded-full bg-[#daa520] text-white font-normal px-5 py-2 hover:brightness-110 transition"
                  >
                    店舗の方はこちら
                  </Link>
                  <Link
                    href="/register?role=talent"
                    className="rounded-full bg-[#daa520] text-white font-normal px-5 py-2 hover:brightness-110 transition"
                  >
                    演者の方はこちら
                  </Link>
                  <Link
                    href="/login"
                    className="border border-[#daa520] text-[#daa520] font-normal rounded-full px-5 py-2 hover:bg-[#fef8e7] transition"
                  >
                    ログイン
                  </Link>
                </>
              ) : (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <span className="cursor-pointer flex items-baseline font-semibold">
                        <span className="text-base">{userName}</span>
                        <span className="ml-1 text-sm text-muted-foreground align-top">様</span>
                        <span className="ml-1">▼</span>
                      </span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Link href={profileEditPath}>プロフィール</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout}>ログアウト</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </nav>
        )}
      </div>

      {/* モバイルメニュー */}
      {!isLoading && isOpen && (
        <nav className="md:hidden px-4 pb-4 space-y-2 text-sm font-medium">
          {!isLoggedIn ? (
            <>
              <Link href="/about" className="block">Talentifyについて</Link>
              <Link href="/faq" className="block">FAQ</Link>
              <Link href="/contact" className="block">お問い合わせ</Link>

              <Link
                href="/login"
                className="block border border-[#daa520] text-[#daa520] rounded-full px-4 py-2 text-center font-bold"
              >
                ログイン
              </Link>

              <div className="mt-2 text-black font-normal text-center">
                今すぐ無料登録
              </div>

              <Link
                href="/register?role=store"
                className="block bg-[#daa520] text-white rounded-full px-4 py-2 text-center font-normal shadow-md"
              >
                店舗の方はこちら
              </Link>
              <Link
                href="/register?role=talent"
                className="block bg-[#daa520] text-white rounded-full px-4 py-2 text-center font-normal shadow-md"
              >
                演者の方はこちら
              </Link>
            </>
          ) : (
            <>
              <Link href={profileEditPath} className="block">プロフィール</Link>
              <button onClick={handleLogout} className="block text-left w-full">ログアウト</button>
            </>
          )}
        </nav>
      )}
    </header>
  )
}
