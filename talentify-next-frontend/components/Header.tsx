'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Menu, Search } from 'lucide-react'
import Sidebar from './Sidebar'
import { Sheet, SheetTrigger, SheetContent } from './ui/sheet'
import { Button } from './ui/button'
import { createClient } from '@/utils/supabase/client'
import { getUserRoleInfo } from '@/lib/getUserRole'

const supabase = createClient()

export default function Header({ sidebarRole }: { sidebarRole?: 'talent' | 'store' }) {
  const [userName, setUserName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) {
        setIsLoading(false)
        return
      }

      const { name } = await getUserRoleInfo(supabase, user.id)
      let displayName = name

      if (!displayName) {
        const { data: profile } = await supabase
          .from('profiles' as any)
          .select('display_name')
          .eq('id', user.id)
          .maybeSingle()
        displayName = (profile as any)?.display_name ?? null
      }

      if (!displayName) {
        displayName = user.email?.split('@')[0] ?? 'ユーザー'
      }

      setUserName(displayName)
      setIsLoading(false)
    }

    fetchSessionAndProfile()

    // リアルタイムで反映させる
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) fetchSessionAndProfile()
      else {
        setUserName(null)
        setIsLoading(false)
      }
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const isLoggedIn = !!userName

  return (
    <header className="fixed top-0 w-full h-16 bg-white shadow-sm z-[var(--z-header)]">
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
                <Sidebar role={sidebarRole} collapsible />
              </SheetContent>
            </Sheet>
          )}
          <Link href="/" className="text-2xl font-bold tracking-tight">
            Talentify
          </Link>
        </div>
        {!isLoading && !isLoggedIn && (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="ml-auto md:hidden hover:bg-muted"
          >
            <Link href="/login">ログイン</Link>
          </Button>
        )}
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
                  <span className="flex items-baseline font-semibold">
                    <span className="text-base">{userName}</span>
                    <span className="ml-1 text-sm text-muted-foreground align-top">様</span>
                  </span>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
