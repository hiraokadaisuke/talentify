import Link from 'next/link'

export const metadata = {
  title: 'このサイトについて | Talentify',
  description: 'Talentifyが目指す、店舗と演者の案件管理の考え方をご紹介します。',
}

const principles = [
  {
    title: '出会いだけで終わらせない',
    text: '演者を探して終わりではなく、オファー・相談・見積・契約・来店・支払い確認・レビューまで、一つの案件として進められることを大切にしています。',
  },
  {
    title: '電話文化も邪魔しない',
    text: 'すべてをチャットへ置き換えることが目的ではありません。電話の方が早い場面では電話を使い、重要な条件だけサービス上の記録へ戻せる設計を目指しています。',
  },
  {
    title: '次に何をすればいいか分かる',
    text: '案件ごとの現在ステップ、通知、初回ナビなどを通じて、初めて使う方でも次の行動に迷いにくい体験を目指しています。',
  },
  {
    title: '取引の記録を残す',
    text: '見積・契約条件・キャンセル・来店なし・支払い・レビューなど、後から確認が必要になりやすい情報を案件単位で残します。',
  },
]

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:py-14">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold tracking-[0.18em] text-blue-600">ABOUT TALENTIFY</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">このサイトについて</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
          Talentifyは、パチンコ店と演者をつなぎ、出演案件を最初の相談から完了まで管理するためのプラットフォームです。
          店舗は条件に合う演者を探してオファーを送り、演者はプロフィールや予定を公開し、届いた案件を管理できます。
        </p>
      </header>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        {principles.map(item => (
          <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">{item.title}</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">{item.text}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-xl font-semibold text-slate-950">現在提供している主な機能</h2>
        <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
          {[
            '演者検索・プロフィール・お気に入り',
            '出演可能スケジュール',
            'オファー送受信・案件進捗管理',
            '案件メッセージ・添付ファイル',
            '見積・修正依頼・契約記録',
            '締結書兼請求書',
            'キャンセル・来店なし記録',
            '支払い状況・レビュー',
            '通知・未読管理',
            '初回利用ナビ・ご利用ガイド',
          ].map(item => (
            <div key={item} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-6">
        <h2 className="text-xl font-semibold text-blue-950">まだ改善中のサービスです</h2>
        <p className="mt-2 text-sm leading-7 text-blue-900">
          Talentifyは実際の店舗・演者の運用に合わせて改善を続けています。
          分かりにくい点、不便な点、現場の運用と合わない点があれば、ぜひお知らせください。
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/guide" className="rounded-full bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">
            ご利用ガイド
          </Link>
          <Link href="/faq" className="rounded-full border border-blue-200 bg-white px-5 py-2.5 text-sm font-semibold text-blue-800 hover:bg-blue-100">
            FAQ
          </Link>
          <Link href="/contact" className="rounded-full border border-blue-200 bg-white px-5 py-2.5 text-sm font-semibold text-blue-800 hover:bg-blue-100">
            お問い合わせ
          </Link>
        </div>
      </section>
    </main>
  )
}
