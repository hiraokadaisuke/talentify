'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import { Sheet, SheetTrigger, SheetContent } from './ui/sheet'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

export default function Header({ sidebarRole }: { sidebarRole?: 'talent' | 'store' }) {
  const [userName, setUserName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) {
        setIsLoading(false)
        return
      }

      let nameToDisplay = 'ユーザー'

      // role 推定
      const store = await supabase.from('stores').select('display_name').eq('user_id', user.id).single()
      if (store.data) {
        nameToDisplay = store.data.display_name ?? '店舗ユーザー'
      } else {
        const talent = await supabase.from('talents').select('stage_name').eq('user_id', user.id).single()
        if (talent.data) {
          nameToDisplay = talent.data.stage_name ?? 'タレント'
        } else {
          const company = await supabase.from('companies').select('display_name').eq('user_id', user.id).single()
          if (company.data) {
            nameToDisplay = company.data.display_name ?? '会社ユーザー'
          }
        }
      }

      setUserName(nameToDisplay)
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
