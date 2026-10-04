import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import PublicPageHero from '@/components/public/PublicPageHero'

export const metadata = {
  title: 'このサイトについて | 来店ナビ',
  description: '来店ナビが目指す、来店イベントの検索・依頼・管理・告知をつなぐ考え方をご紹介します。',
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

const capabilities = [
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
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#F7F9FC] pt-16 text-slate-950">
      <PublicPageHero
        eyebrow="ABOUT RAITEN NAVI"
        title="このサイトについて"
        description="来店ナビは、パチンコ店と演者をつなぎ、来店イベントを探す・依頼する・管理する・告知するためのプラットフォームです。現場の進め方を無理に変えず、案件の流れと記録をひとつにつなぎます。"
      />

      <div className="mx-auto w-full max-w-[1120px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <section>
          <div className="mb-6">
            <p className="text-xs font-black tracking-[0.18em] text-[#FF5A1F]">OUR PRINCIPLES</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">来店ナビが大切にしていること</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {principles.map((item, index) => (
              <article
                key={item.title}
                className="relative overflow-hidden rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,.04)] sm:p-6"
              >
                <span className="text-[11px] font-black tracking-[0.16em] text-[#FF5A1F]">
                  0{index + 1}
                </span>
                <h3 className="mt-3 text-lg font-black text-slate-950">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
                <span aria-hidden="true" className="absolute bottom-0 left-0 h-1 w-16 bg-gradient-to-r from-[#FF3B2E] via-[#FF8A00] to-[#FFC400]" />
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-[24px] border border-slate-200 bg-white p-5 sm:p-7">
          <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:items-start">
            <div>
              <p className="text-xs font-black tracking-[0.18em] text-[#FF5A1F]">FEATURES</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight">現在提供している主な機能</h2>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                探すところから来店後まで、案件を進めるために必要な情報を分散させないことを重視しています。
              </p>
            </div>
            <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {capabilities.map((item) => (
                <div key={item} className="flex items-start gap-2.5 border-b border-slate-100 pb-3 text-sm font-bold text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#FF5A1F]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 overflow-hidden rounded-[24px] bg-[#0B1F3B] p-6 text-white shadow-[0_18px_50px_rgba(8,20,38,.14)] sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-xs font-black tracking-[0.18em] text-[#FFC400]">KEEP IMPROVING</p>
              <h2 className="mt-2 text-2xl font-black">現場の声に合わせて改善を続けます</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
                分かりにくい点、不便な点、現場の運用と合わない点があればお知らせください。実際の利用に合わせて改善を続けます。
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Link href="/guide" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#FF5A1F] px-4 text-sm font-black text-white hover:bg-[#E94F18]">
                ご利用ガイド <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/faq" className="inline-flex h-11 items-center rounded-xl border border-white/15 px-4 text-sm font-bold text-white/80 hover:bg-white/5">
                FAQ
              </Link>
              <Link href="/contact" className="inline-flex h-11 items-center rounded-xl border border-white/15 px-4 text-sm font-bold text-white/80 hover:bg-white/5">
                お問い合わせ
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
