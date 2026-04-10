const columns = [
  {
    date: '2026-04-10',
    title: '初めて依頼するときのポイント',
    summary: '初回オファー時に確認しておきたい日程・条件・連絡体制の基本を整理します。',
  },
  {
    date: '2026-04-03',
    title: '演者選定で見るべき点',
    summary: 'プロフィールと実績の見方、案件目的との相性の考え方を紹介します。',
  },
  {
    date: '2026-03-28',
    title: '案件進行をスムーズにする事前準備',
    summary: 'オファー前に決めるべき情報を整理し、やり取りの往復を減らすコツをまとめました。',
  },
]

export default function ColumnPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-24 text-slate-900">
      <header className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">コラム</h1>
        <p className="mt-2 text-sm text-slate-600">Talentifyの活用に役立つ読み物を順次掲載予定です。</p>
      </header>
      <div className="space-y-3">
        {columns.map((item) => (
          <article key={item.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-500">{item.date}</p>
            <h2 className="mt-1 text-lg font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.summary}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
