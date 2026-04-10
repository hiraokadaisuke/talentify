export default function PricingPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-24 text-slate-900">
      <header className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">料金</h1>
        <p className="mt-2 text-sm text-slate-600">このページは仮公開中です。正式な料金情報は後日掲載します。</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">今後掲載予定の内容</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>初期費用 / 月額費用</li>
            <li>役割ごとの利用プラン</li>
            <li>オプション機能</li>
          </ul>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">注記</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            現在は情報設計を優先しており、ここではページ構成のみ先行して公開しています。
          </p>
        </section>
      </div>
    </div>
  )
}
