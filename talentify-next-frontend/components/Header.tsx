'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { Sheet, SheetTrigger, SheetContent } from './ui/sheet'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from './ui/dropdown-menu'
import { createClient } from '@/utils/supabase/client'
import { getUserRoleInfo } from '@/lib/getUserRole'
import HeaderBellLink from './notifications/HeaderBellLink'
import MobileDrawerNav from './MobileDrawerNav'

const supabase = createClient()

export default function Header({ sidebarRole }: { sidebarRole?: 'talent' | 'store' }) {
  const [userName, setUserName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

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

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const isLoggedIn = !!userName

  return (
    <header className="fixed top-0 w-full h-16 bg-white shadow-sm z-[var(--z-header)]">
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between p-4">
        <div className="flex items-center gap-2">
          {sidebarRole && (
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button
                  className="md:hidden text-gray-800"
                  aria-label="メニュー"
                  aria-controls="mobile-menu"
                  aria-expanded={open}
                >
                  <Menu size={24} />
                </button>
              </SheetTrigger>
              <SheetContent
                id="mobile-menu"
                side="left"
                className="p-0"
                role="dialog"
                aria-modal="true"
              >
                <MobileDrawerNav role={sidebarRole} onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
          )}
          <Link href="/" className="text-2xl font-bold tracking-tight">
            Talentify
          </Link>
        </div>
        {!isLoading && (
          <>
            {sidebarRole ? (
              isLoggedIn && (
                <div className="ml-auto md:hidden">
                  <HeaderBellLink />
                </div>
              )
            ) : (
              <>
                {!isLoggedIn && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="ml-auto md:hidden hover:bg-muted"
                  >
                    <Link href="/login">ログイン</Link>
                  </Button>
                )}
                {isLoggedIn && (
                  <div className="ml-auto flex items-center gap-2 md:hidden">
                    <HeaderBellLink />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="text-sm font-semibold focus:outline-none">
                          {userName}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href="/terms">利用規約</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/privacy">プライバシーポリシー</Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </>
            )}
          </>
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
                  <HeaderBellLink />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-baseline font-semibold focus:outline-none">
                        <span className="text-base">{userName}</span>
                        <span className="ml-1 text-sm text-muted-foreground align-top">様</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href="/terms">利用規約</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/privacy">プライバシーポリシー</Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
