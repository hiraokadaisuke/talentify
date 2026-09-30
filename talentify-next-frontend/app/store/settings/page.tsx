import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function StoreSettingsPage() {
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="mb-6 text-3xl font-bold tracking-tight">設定</h1>
        <div className="space-y-4">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">店舗プロフィール</h2>
            <p className="mt-2 text-sm text-gray-600">店舗名・紹介文・画像などを変更します。</p>
            <Button asChild className="mt-4">
              <Link href="/store/edit">店舗情報を編集</Link>
            </Button>
          </section>
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">パスワード</h2>
            <p className="mt-2 text-sm text-gray-600">登録メールアドレスへ安全な再設定リンクを送信します。</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/password-reset">パスワードを再設定</Link>
            </Button>
          </section>
        </div>
      </div>
    </main>
  )
}
