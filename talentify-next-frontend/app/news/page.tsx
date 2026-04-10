const newsItems = [
  {
    date: '2026-04-10',
    title: '公開サイトと業務アプリ導線の整理を開始しました',
    body: '公開ページを見ながら必要なときに業務画面へ移動できる構成への移行を進めています。',
  },
  {
    date: '2026-04-07',
    title: 'ご利用ガイドページを公開しました',
    body: 'よくある利用フローや関連ページへの導線を集約した仮ページを公開しました。',
  },
  {
    date: '2026-04-01',
    title: 'フッター導線を追加しました',
    body: 'FAQ・お知らせ・料金・会社概要へアクセスしやすい共通フッターを追加しました。',
  },
]

export default function NewsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-24 text-slate-900">
      <header className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">お知らせ</h1>
        <p className="mt-2 text-sm text-slate-600">Talentifyからのお知らせを掲載します。</p>
      </header>
      <div className="space-y-3">
        {newsItems.map((item) => (
          <article key={item.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-500">{item.date}</p>
            <h2 className="mt-1 text-lg font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
