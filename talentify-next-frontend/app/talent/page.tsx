import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Calendar, CheckCircle2, FileText, MessageCircle, Mic, Send, Star, UserRound } from 'lucide-react'

export const metadata = {
  title: '演者向け｜Talentify',
  description:
    'プロフィール登録・予定管理・オファー確認・メッセージ・請求・レビューまで。演者の活動をTalentifyで一つにまとめます。',
}

const problems = [
  '店舗に自分の活動や強みを伝える場所が分散している',
  '案件ごとに日程・条件・連絡を整理する手間がかかる',
  'オファー後のやり取りや請求が別々になりやすい',
  '過去の案件やレビューが次の仕事につながりにくい',
]

const steps = [
  { icon: UserRound, title: 'プロフィールを整える', text: '活動内容・得意ジャンル・実績をまとめる。' },
  { icon: Calendar, title: '予定を登録する', text: '対応できる日程を分かりやすく管理。' },
  { icon: Send, title: 'オファーを確認', text: '日程・報酬・依頼内容を見て判断。' },
  { icon: MessageCircle, title: '案件を進める', text: '連絡とスケジュールを一つにまとめる。' },
  { icon: FileText, title: '請求まで完了', text: '請求・支払い確認・レビューまで管理。' },
]

const features = [
  {
    eyebrow: 'PROFILE',
    title: '見つけてもらうための情報を、一つに。',
    text: '活動ジャンル・エリア・プロフィール・実績などを整理し、店舗が比較しやすい状態をつくれます。',
    image: '/images/ui/ui-profile.png',
  },
  {
    eyebrow: 'OFFER',
    title: '条件を見てから、承諾・辞退を判断。',
    text: '日程・報酬・時間・依頼内容を一つのオファーとして確認できるため、判断材料が散らかりません。',
    image: '/images/ui/ui-offer-received.png',
  },
  {
    eyebrow: 'HISTORY',
    title: '案件の履歴を、次の活動につなげる。',
    text: '実施した案件・請求・レビューが履歴として残り、活動を続けるほど情報が積み上がります。',
    image: '/images/ui/ui-history.png',
  },
]

const benefits = [
  'プロフィールを店舗に見つけてもらう入口をつくれる',
  '予定とオファー条件を同じサービス内で確認できる',
  '案件の連絡・請求をバラバラにしにくい',
  '実績とレビューを次の案件につなげやすい',
]

export default function TalentLandingPage() {
  return (
    <main className="overflow-hidden bg-[#05050d] pt-16 text-white">
      <section className="relative isolate min-h-[640px] overflow-hidden">
        <Image src="/images/lp/talent/talent-hero-main.png" alt="演者の活動イメージ" fill priority className="object-cover object-center" />
        <div className="absolute inset-0 bg-black/58" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-black/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_35%,rgba(14,165,233,.25),transparent_34%),linear-gradient(to_bottom,transparent,#05050d_98%)]" />

        <div className="relative mx-auto flex min-h-[640px] w-full max-w-[1400px] items-center px-5 py-16 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/25 bg-sky-400/10 px-4 py-2 text-xs font-black tracking-[0.18em] text-sky-200 backdrop-blur">
              <Mic className="h-4 w-4" />
              FOR TALENTS
            </div>
            <h1 className="mt-6 text-[40px] font-black leading-[1.08] tracking-[-0.04em] sm:text-6xl lg:text-[68px]">
              見つけてもらえる
              <br />
              <span className="bg-gradient-to-r from-sky-300 via-blue-400 to-pink-500 bg-clip-text text-transparent">
                活動へ。
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base font-bold leading-8 text-white/90 sm:text-xl">
              プロフィール、予定、オファー、連絡、請求。
              <br className="hidden sm:block" />
              案件を受けてから完了するまでを、一つにまとめます。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/register?role=talent" className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-pink-500 px-8 text-sm font-black shadow-[0_0_26px_rgba(14,165,233,.28)] transition hover:scale-[1.02]">
                演者として登録
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/guide#talent-flow" className="inline-flex h-14 items-center justify-center rounded-full border border-white/25 bg-black/25 px-8 text-sm font-black backdrop-blur transition hover:bg-white/10">
                利用の流れを見る
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto w-full max-w-[1300px]">
          <p className="text-sm font-black tracking-[0.22em] text-sky-300">TALENT PROBLEMS</p>
          <h2 className="mt-3 text-3xl font-black sm:text-5xl">活動情報も案件管理も、散らばりやすい。</h2>
          <div className="mt-9 grid gap-4 md:grid-cols-2">
            {problems.map((problem) => (
              <div key={problem} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-5">
                <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sky-400/15 text-sky-300">
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
          <h2 className="mt-3 text-3xl font-black sm:text-5xl">演者側の流れも、5ステップで。</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <article key={step.title} className="rounded-[24px] border border-white/10 bg-white/[0.045] p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black tracking-[0.15em] text-white/40">0{index + 1}</span>
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-sky-400 via-blue-500 to-pink-500">
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
            <h2 className="mt-3 text-3xl font-black sm:text-5xl">活動を続けるための情報を、一か所に。</h2>
          </div>

          <div className="mt-12 space-y-6">
            {features.map((feature, index) => (
              <article key={feature.eyebrow} className="grid overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045] lg:grid-cols-2 lg:items-center">
                <div className={'p-7 sm:p-9 ' + (index % 2 === 1 ? 'lg:order-2' : '')}>
                  <p className="text-xs font-black tracking-[0.2em] text-sky-300">{feature.eyebrow}</p>
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
          <p className="text-sm font-black tracking-[0.22em] text-violet-300">WHAT BUILDS UP</p>
          <h2 className="mt-3 text-3xl font-black sm:text-5xl">案件が終わっても、情報は残る。</h2>
          <div className="mt-9 grid gap-4 sm:grid-cols-2">
            {benefits.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <Star className="h-5 w-5 shrink-0 text-yellow-300" />
                <span className="text-sm font-bold text-white/75 sm:text-base">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-white/10 px-5 py-20 text-center sm:px-8 lg:px-12 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,.18),transparent_48%)]" />
        <div className="relative mx-auto max-w-4xl">
          <Mic className="mx-auto h-9 w-9 text-sky-300" />
          <h2 className="mt-5 text-3xl font-black sm:text-5xl">次の案件につながる準備を、ここから。</h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm font-medium leading-7 text-white/65 sm:text-base">
            まずはプロフィールと予定を整えて、店舗から見つけてもらえる状態をつくれます。
          </p>
          <Link href="/register?role=talent" className="mt-8 inline-flex h-14 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-pink-500 px-9 text-sm font-black shadow-[0_0_26px_rgba(14,165,233,.25)] transition hover:scale-[1.02]">
            演者として登録
            <ArrowRight className="h-5 w-5" />
          </Link>
          <div className="mt-6">
            <Link href="/store" className="text-sm font-bold text-white/55 underline-offset-4 hover:text-white hover:underline">
              店舗向けページを見る
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
