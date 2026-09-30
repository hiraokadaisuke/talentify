import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Calendar, CheckCircle2, FileText, MessageCircle, Search, Send, Store } from 'lucide-react'

export const metadata = {
  title: '店舗向け｜Talentify',
  description:
    '演者探し・日程確認・オファー・メッセージ・案件管理・請求確認まで。店舗の来店案件をTalentifyで一つにまとめます。',
}

const problems = [
  '誰に依頼すればいいか、候補探しに時間がかかる',
  '空き日程や条件確認のやり取りが増えやすい',
  '案件ごとの連絡や進行状況がバラバラになる',
  '過去の依頼や評価が担当者の中だけに残りやすい',
]

const steps = [
  { icon: Search, title: '演者を探す', text: 'プロフィール・ジャンル・エリアなどから候補を確認。' },
  { icon: Calendar, title: '日程を確認', text: '空き状況を見ながら、依頼したい日を決める。' },
  { icon: Send, title: 'オファーを送る', text: '報酬・時間・内容をまとめて依頼。' },
  { icon: MessageCircle, title: '案件を進める', text: 'メッセージと予定を案件単位で管理。' },
  { icon: CheckCircle2, title: '実施後まで管理', text: '請求・支払い状況・レビューまで確認。' },
]

const features = [
  {
    eyebrow: 'SEARCH',
    title: '候補を比較して、演者を探す。',
    text: 'プロフィールや活動情報を見ながら、店舗の企画に合う演者を探せます。',
    image: '/images/ui/ui-talent-list.png',
  },
  {
    eyebrow: 'OFFER',
    title: '条件を整理したまま、依頼する。',
    text: '日程・報酬・時間・依頼内容をオファーにまとめ、承諾・辞退まで同じ画面で追えます。',
    image: '/images/ui/ui-offer-create.png',
  },
  {
    eyebrow: 'COMMUNICATION',
    title: '案件のやり取りを、一か所に残す。',
    text: 'メッセージや進行状況が案件とつながるため、後から見ても経緯を追いやすくなります。',
    image: '/images/ui/ui-message.png',
  },
]

const benefits = [
  '候補探しから依頼までの往復を減らせる',
  '案件の条件とやり取りを同じ場所に残せる',
  '担当者が変わっても経緯を確認しやすい',
  'レビューや履歴を次の依頼判断に使える',
]

export default function StoreLandingPage() {
  return (
    <main className="overflow-hidden bg-[#05050d] pt-16 text-white">
      <section className="relative isolate min-h-[640px] overflow-hidden">
        <Image src="/images/lp/store/store-hero-main.png" alt="来店イベントの店舗イメージ" fill priority className="object-cover object-center" />
        <div className="absolute inset-0 bg-black/58" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_35%,rgba(249,115,22,.26),transparent_34%),linear-gradient(to_bottom,transparent,#05050d_98%)]" />

        <div className="relative mx-auto flex min-h-[640px] w-full max-w-[1400px] items-center px-5 py-16 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-300/25 bg-orange-400/10 px-4 py-2 text-xs font-black tracking-[0.18em] text-orange-200 backdrop-blur">
              <Store className="h-4 w-4" />
              FOR PACHINKO STORES
            </div>
            <h1 className="mt-6 text-[40px] font-black leading-[1.08] tracking-[-0.04em] sm:text-6xl lg:text-[68px]">
              来店演者の依頼を、
              <br />
              <span className="bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-500 bg-clip-text text-transparent">
                もっとスムーズに。
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base font-bold leading-8 text-white/90 sm:text-xl">
              探す・日程を確認する・オファーする・進める。
              <br className="hidden sm:block" />
              店舗の来店案件を、一つの流れで管理できます。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/register?role=store" className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 px-8 text-sm font-black shadow-[0_0_26px_rgba(249,115,22,.28)] transition hover:scale-[1.02]">
                店舗として登録
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/guide#store-flow" className="inline-flex h-14 items-center justify-center rounded-full border border-white/25 bg-black/25 px-8 text-sm font-black backdrop-blur transition hover:bg-white/10">
                利用の流れを見る
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto w-full max-w-[1300px]">
          <p className="text-sm font-black tracking-[0.22em] text-orange-300">STORE PROBLEMS</p>
          <h2 className="mt-3 text-3xl font-black sm:text-5xl">来店案件、こんなところで止まりやすい。</h2>
          <div className="mt-9 grid gap-4 md:grid-cols-2">
            {problems.map((problem) => (
              <div key={problem} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-5">
                <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-orange-400/15 text-orange-300">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <p className="text-sm font-bold leading-7 text-white/75 sm:text-base">{problem}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#090914] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto w-full max-w-[1300px]">
          <p className="text-sm font-black tracking-[0.22em] text-pink-400">WORKFLOW</p>
          <h2 className="mt-3 text-3xl font-black sm:text-5xl">店舗側の流れを、5ステップに。</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <article key={step.title} className="rounded-[24px] border border-white/10 bg-white/[0.045] p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black tracking-[0.15em] text-white/40">0{index + 1}</span>
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-orange-400 to-pink-500">
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <h3 className="mt-6 text-xl font-black">{step.title}</h3>
                  <p className="mt-3 text-sm font-medium leading-7 text-white/60">{step.text}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto w-full max-w-[1300px]">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black tracking-[0.22em] text-yellow-300">KEY FEATURES</p>
            <h2 className="mt-3 text-3xl font-black sm:text-5xl">店舗が使う機能を、案件の流れに沿って。</h2>
          </div>

          <div className="mt-12 space-y-6">
            {features.map((feature, index) => (
              <article key={feature.eyebrow} className="grid overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045] lg:grid-cols-2 lg:items-center">
                <div className={'p-7 sm:p-9 ' + (index % 2 === 1 ? 'lg:order-2' : '')}>
                  <p className="text-xs font-black tracking-[0.2em] text-orange-300">{feature.eyebrow}</p>
                  <h3 className="mt-3 text-2xl font-black sm:text-4xl">{feature.title}</h3>
                  <p className="mt-4 max-w-xl text-sm font-medium leading-7 text-white/65 sm:text-base">{feature.text}</p>
                </div>
                <div className={'bg-white p-4 sm:p-6 ' + (index % 2 === 1 ? 'lg:order-1' : '')}>
                  <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-slate-50">
                    <Image src={feature.image} alt="" fill className="object-contain p-3 sm:p-5" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-[#090914] to-[#05050d] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto w-full max-w-[1300px]">
          <p className="text-sm font-black tracking-[0.22em] text-sky-300">WHAT CHANGES</p>
          <h2 className="mt-3 text-3xl font-black sm:text-5xl">案件を「人の記憶」だけで回さない。</h2>
          <div className="mt-9 grid gap-4 sm:grid-cols-2">
            {benefits.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-sky-300" />
                <span className="text-sm font-bold text-white/75 sm:text-base">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-white/10 px-5 py-20 text-center sm:px-8 lg:px-12 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(249,115,22,.18),transparent_48%)]" />
        <div className="relative mx-auto max-w-4xl">
          <FileText className="mx-auto h-9 w-9 text-orange-300" />
          <h2 className="mt-5 text-3xl font-black sm:text-5xl">来店案件の管理を、ここから一本化。</h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm font-medium leading-7 text-white/65 sm:text-base">
            まずは店舗プロフィールを登録して、演者検索から始められます。
          </p>
          <Link href="/register?role=store" className="mt-8 inline-flex h-14 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 px-9 text-sm font-black shadow-[0_0_26px_rgba(249,115,22,.25)] transition hover:scale-[1.02]">
            店舗として登録
            <ArrowRight className="h-5 w-5" />
          </Link>
          <div className="mt-6">
            <Link href="/talent" className="text-sm font-bold text-white/55 underline-offset-4 hover:text-white hover:underline">
              演者向けページを見る
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
