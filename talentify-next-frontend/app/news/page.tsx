import PublicPageHero from '@/components/public/PublicPageHero'

export const metadata = {
  title: 'お知らせ | 来店ナビ',
  description: '来店ナビからの更新情報やご案内を掲載します。',
}

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
    <main className="min-h-screen bg-[#F7F9FC] pt-16 text-slate-950">
      <PublicPageHero
        eyebrow="NEWS"
        title="お知らせ"
        description="来店ナビからの更新情報やご案内を掲載します。"
      />

      <div className="mx-auto w-full max-w-[960px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_36px_rgba(15,23,42,.04)]">
          {newsItems.map((item, index) => (
            <article
              key={item.title}
              className={'grid gap-3 p-5 sm:p-6 md:grid-cols-[128px_minmax(0,1fr)] md:gap-6 ' + (index !== newsItems.length - 1 ? 'border-b border-slate-100' : '')}
            >
              <time
                dateTime={item.date}
                className="inline-flex h-8 w-fit items-center rounded-lg bg-slate-50 px-3 text-xs font-black tracking-[0.04em] text-slate-500"
              >
                {item.date}
              </time>
              <div>
                <h2 className="text-lg font-black leading-7 text-slate-950 sm:text-xl">{item.title}</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}
