import Link from 'next/link'

export default function GuidePage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-24 text-slate-900">
      <header className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">ご利用ガイド</h1>
        <p className="mt-2 text-sm text-slate-600">Talentifyの使い方を役割ごとに整理したご案内ページです。</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          { title: 'Talentifyとは', body: 'パチンコ店と演者をつなぐマッチングプラットフォームです。案件作成から契約後のやり取りまでオンラインで管理できます。' },
          { title: '店舗の方へ', body: '演者検索、オファー送信、進行管理、請求対応までを一つの画面で運用できます。' },
          { title: '演者の方へ', body: 'オファー確認、スケジュール調整、メッセージ、請求提出などを効率よく進められます。' },
          { title: '基本的な利用の流れ', body: '登録 → プロフィール設定 → 案件作成/応募 → 調整 → 契約・実施という流れで利用できます。' },
        ].map((item) => (
          <section key={item.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
          </section>
        ))}
      </div>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">関連ページ</h2>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          {[
            { href: '/faq', label: 'FAQ' },
            { href: '/news', label: 'お知らせ' },
            { href: '/pricing', label: '料金' },
            { href: '/company', label: '会社概要' },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="rounded-md border border-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-50">
              {item.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
