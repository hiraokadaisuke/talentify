export default function CompanyPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-24 text-slate-900">
      <header className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">会社概要</h1>
        <p className="mt-2 text-sm text-slate-600">このページは会社情報の仮ページです。後日正式情報に差し替えます。</p>
      </header>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <dl className="grid gap-3 text-sm sm:grid-cols-[180px_1fr]">
          <dt className="font-semibold text-slate-700">サービス名</dt>
          <dd className="text-slate-600">Talentify</dd>
          <dt className="font-semibold text-slate-700">ページ種別</dt>
          <dd className="text-slate-600">公開情報ページ（仮）</dd>
          <dt className="font-semibold text-slate-700">用途</dt>
          <dd className="text-slate-600">会社情報・運営情報の掲載。将来的に正式な企業情報へ置き換える想定です。</dd>
        </dl>
      </section>
    </div>
  )
}
