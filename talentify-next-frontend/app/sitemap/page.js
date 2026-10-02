import Link from 'next/link'

const commonLinks = [
  ['/', 'ホーム'],
  ['/guide', 'ご利用ガイド'],
  ['/faq', 'よくある質問'],
  ['/pricing', '料金'],
  ['/news', 'お知らせ'],
  ['/about', 'このサイトについて'],
  ['/contact', 'お問い合わせ'],
  ['/terms', '利用規約'],
  ['/privacy', 'プライバシーポリシー'],
  ['/login', 'ログイン'],
  ['/password-reset', 'パスワード再設定'],
]

export default function SitemapPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold tracking-[0.18em] text-[#FF5A1F]">SITEMAP</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">サイトマップ</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          来店ナビの主なページをご案内します。
        </p>
      </header>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
          <h2 className="text-base font-semibold text-slate-950">サービス・サポート</h2>
          <ul className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            {commonLinks.map(([href, label]) => (
              <li key={href}>
                <Link
                  href={href}
                  className="font-medium text-slate-700 transition hover:text-[#FF5A1F] hover:underline"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-950">新規登録</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link
                href="/register?role=store"
                className="font-medium text-slate-700 transition hover:text-[#FF5A1F] hover:underline"
              >
                店舗として登録
              </Link>
            </li>
            <li>
              <Link
                href="/register?role=talent"
                className="font-medium text-slate-700 transition hover:text-[#FF5A1F] hover:underline"
              >
                演者として登録
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </main>
  )
}
