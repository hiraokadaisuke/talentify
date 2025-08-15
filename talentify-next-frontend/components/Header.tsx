// DO NOT fetch names/ids on the client. Use resolveActorContext() in layouts.
import Link from 'next/link'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import { Sheet, SheetTrigger, SheetContent } from './ui/sheet'
import { Button } from './ui/button'

export default function Header({
  sidebarRole,
  displayName,
}: {
  sidebarRole?: 'talent' | 'store'
  displayName?: string | null
}) {
  const isLoggedIn = !!displayName

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
                    <span className="text-base">{displayName}</span>
                    <span className="ml-1 text-sm text-muted-foreground align-top">様</span>
                  </span>
                </>
              )}
            </div>
        </nav>
      </div>
    </header>
  )
}
