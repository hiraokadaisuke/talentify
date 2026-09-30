import Link from 'next/link'
import { ArrowRight, CheckCircle2, Mic, Store } from 'lucide-react'

export const metadata = {
  title: 'ご利用ガイド｜Talentify',
  description: '店舗・演者それぞれのTalentify利用フローを案内します。',
}

const storeSteps = [
  '店舗プロフィールを登録',
  '演者を検索して日程を確認',
  '条件をまとめてオファー',
  'メッセージ・スケジュールで進行',
  '実施後に請求・支払い確認・レビュー',
]

const talentSteps = [
  '演者プロフィールと予定を登録',
  '届いたオファーの条件を確認',
  '承諾・辞退を選択',
  'メッセージ・スケジュールで進行',
  '実施後に請求・支払い確認・レビュー',
]

function Flow({
  id,
  title,
  description,
  steps,
  accent,
}: {
  id: string
  title: string
  description: string
  steps: string[]
  accent: string
}) {
  return (
    <section id={id} className="scroll-mt-24 rounded-[28px] border border-white/10 bg-white/[0.045] p-6 sm:p-8">
      <p className={'text-xs font-black tracking-[0.2em] ' + accent}>{title}</p>
      <h2 className="mt-3 text-2xl font-black sm:text-4xl">{description}</h2>
      <div className="mt-7 space-y-3">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-sm font-black">
              {index + 1}
            </span>
            <span className="text-sm font-bold leading-6 text-white/75 sm:text-base">{step}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-[#05050d] px-5 pb-20 pt-28 text-white sm:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="text-center">
          <p className="text-sm font-black tracking-[0.22em] text-pink-400">HOW TO USE</p>
          <h1 className="mt-3 text-4xl font-black sm:text-6xl">ご利用ガイド</h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm font-medium leading-7 text-white/65 sm:text-base">
            Talentifyは、店舗と演者で使う画面が分かれています。自分の役割に合わせて、案件完了までの流れを確認できます。
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Link href="#store-flow" className="group rounded-[24px] border border-orange-300/20 bg-orange-400/10 p-6 transition hover:border-orange-300/45">
            <div className="flex items-center gap-3 text-orange-200">
              <Store className="h-5 w-5" />
              <span className="text-xs font-black tracking-[0.18em]">FOR STORES</span>
            </div>
            <p className="mt-4 text-2xl font-black">店舗の流れを見る</p>
            <p className="mt-2 text-sm font-medium leading-7 text-white/60">演者検索からオファー、案件完了まで。</p>
            <ArrowRight className="mt-5 h-5 w-5 text-orange-300 transition group-hover:translate-x-1" />
          </Link>

          <Link href="#talent-flow" className="group rounded-[24px] border border-sky-300/20 bg-sky-400/10 p-6 transition hover:border-sky-300/45">
            <div className="flex items-center gap-3 text-sky-200">
              <Mic className="h-5 w-5" />
              <span className="text-xs font-black tracking-[0.18em]">FOR TALENTS</span>
            </div>
            <p className="mt-4 text-2xl font-black">演者の流れを見る</p>
            <p className="mt-2 text-sm font-medium leading-7 text-white/60">プロフィール登録から請求・レビューまで。</p>
            <ArrowRight className="mt-5 h-5 w-5 text-sky-300 transition group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Flow id="store-flow" title="STORE FLOW" description="店舗の利用フロー" steps={storeSteps} accent="text-orange-300" />
          <Flow id="talent-flow" title="TALENT FLOW" description="演者の利用フロー" steps={talentSteps} accent="text-sky-300" />
        </div>

        <section className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-pink-300" />
            <div>
              <h2 className="text-xl font-black">Talentifyの基本</h2>
              <p className="mt-2 text-sm font-medium leading-7 text-white/65">
                案件に必要な情報を一つのサービス内にまとめ、店舗と演者が同じ案件情報を見ながら進められることを重視しています。
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/store" className="rounded-full border border-orange-300/30 px-5 py-2.5 text-sm font-black text-orange-200 hover:bg-orange-400/10">
              店舗向けページ
            </Link>
            <Link href="/talent" className="rounded-full border border-sky-300/30 px-5 py-2.5 text-sm font-black text-sky-200 hover:bg-sky-400/10">
              演者向けページ
            </Link>
            <Link href="/faq" className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-black text-white/75 hover:bg-white/5">
              FAQ
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
