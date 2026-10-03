import Link from 'next/link'
import { Building2, KeyRound, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function StoreSettingsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl space-y-5 py-2 sm:py-4 lg:max-w-5xl lg:space-y-6">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,.05)]">
        <div className="flex items-start gap-3 p-5 sm:p-6">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#0B1F3B] text-[#FFC400]">
            <Settings className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[11px] font-black tracking-[0.16em] text-[#C2410C]">SETTINGS</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950">設定</h1>
            <p className="mt-1 text-sm leading-6 text-slate-500">店舗情報やアカウント設定を管理します。</p>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-[#FF3B2E] via-[#FF8A00] to-[#FFC400]" />
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,.05)]">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-[#FF5A1F]">
            <Building2 className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-lg font-black text-slate-950">店舗プロフィール</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">店舗名・紹介文・画像など、店舗として表示される情報を変更します。</p>
          <Button asChild className="mt-5 rounded-xl bg-[#FF5A1F] font-bold text-white hover:bg-[#E94F18]">
            <Link href="/store/edit">店舗情報を編集</Link>
          </Button>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,.05)]">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-[#0B1F3B]">
            <KeyRound className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-lg font-black text-slate-950">パスワード</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">登録メールアドレスへ、安全な再設定リンクを送信します。</p>
          <Button asChild variant="outline" className="mt-5 rounded-xl border-slate-200 font-bold text-slate-700">
            <Link href="/password-reset">パスワードを再設定</Link>
          </Button>
        </section>
      </div>
    </main>
  )
}
