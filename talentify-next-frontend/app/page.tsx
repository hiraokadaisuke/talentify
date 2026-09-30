export const dynamic = 'auto'

import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  FileText,
  MessageCircle,
  Mic,
  Search,
  Send,
  Sparkles,
  Star,
  Store,
} from 'lucide-react'

export const metadata = {
  title: 'Talentify｜店舗と演者の来店案件を、ひとつの流れに',
  description:
    'Talentifyは、パチンコ店と演者をつなぎ、演者検索・日程確認・オファー・メッセージ・請求・レビューまでを一つにまとめる案件管理プラットフォームです。',
}

const journey = [
  {
    no: '01',
    icon: Search,
    title: '探す',
    description: 'プロフィールや条件から演者を探し、候補を比較。',
    accent: 'from-pink-500 to-rose-500',
  },
  {
    no: '02',
    icon: Send,
    title: '依頼する',
    description: '日程・報酬・内容を整理して、そのままオファー。',
    accent: 'from-orange-400 to-amber-400',
  },
  {
    no: '03',
    icon: MessageCircle,
    title: '進める',
    description: 'メッセージとスケジュールを案件と一緒に管理。',
    accent: 'from-sky-400 to-blue-500',
  },
  {
    no: '04',
    icon: CheckCircle2,
    title: '完了する',
    description: '請求・支払い確認・レビューまで同じ流れで完結。',
    accent: 'from-violet-500 to-fuchsia-500',
  },
]

const features = [
  { icon: Search, title: '演者検索', description: 'プロフィール・活動エリア・ジャンルなどから候補を探せます。' },
  { icon: Calendar, title: '日程確認', description: '演者の予定を確認しながら、依頼したい日を決められます。' },
  { icon: Send, title: 'オファー管理', description: '日程・条件・報酬をまとめて送り、承諾・辞退まで管理できます。' },
  { icon: MessageCircle, title: 'メッセージ', description: '案件に関するやり取りをサービス内にまとめて残せます。' },
  { icon: FileText, title: '請求・支払い管理', description: '実施後の請求書作成・確認・支払い状況まで追えます。' },
  { icon: Star, title: 'レビュー・履歴', description: '案件と評価を履歴として残し、次の依頼・活動につなげられます。' },
]

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-[#05050d] pt-16 text-white">
      <section className="relative isolate min-h-[680px] overflow-hidden lg:min-h-[760px]">
        <Image
          src="/images/lp/common/common-hero-main.png"
          alt=""
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(236,72,153,.30),transparent_34%),radial-gradient(circle_at_82%_30%,rgba(14,165,233,.24),transparent_32%),linear-gradient(to_bottom,rgba(5,5,13,.08),#05050d_94%)]" />

        <div className="relative mx-auto flex min-h-[680px] w-full max-w-[1500px] items-center px-5 py-20 sm:px-8 lg:min-h-[760px] lg:px-12">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/35 px-4 py-2 text-xs font-bold tracking-[0.18em] text-white/85 backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-pink-400" />
              PACHINKO × TALENT MATCHING PLATFORM
            </div>

            <h1 className="mt-7 text-[42px] font-black leading-[1.08] tracking-[-0.04em] sm:text-6xl lg:text-[76px]">
              来店案件を、
              <br />
              <span className="bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-500 bg-clip-text text-transparent">
                ひとつの流れに。
              </span>
            </h1>

            <p className="mt-7 max-w-3xl text-base font-bold leading-8 text-white/90 sm:text-xl sm:leading-9">
              演者を探す。日程を確認する。オファーを送る。
              <br className="hidden sm:block" />
              やり取りから請求・レビューまで、Talentifyでまとめて進める。
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/store"
                className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 px-7 text-sm font-black text-white shadow-[0_0_30px_rgba(236,72,153,.32)] transition hover:scale-[1.02] sm:text-base"
              >
                店舗の方はこちら
                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </Link>
              <Link
                href="/talent"
                className="group inline-flex h-14 items-center justify-center gap-2 rounded-full border border-sky-300/60 bg-white/10 px-7 text-sm font-black text-white backdrop-blur-md transition hover:bg-white/15 sm:text-base"
              >
                演者の方はこちら
                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-white/65 sm:text-sm">
              <span>演者検索</span>
              <span>オファー</span>
              <span>メッセージ</span>
              <span>スケジュール</span>
              <span>請求・支払い</span>
              <span>レビュー</span>
            </div>
          </div>
        </div>
      </section>

      <section className="relative border-y border-white/10 bg-[#090914] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto w-full max-w-[1400px]">
          <p className="text-sm font-black tracking-[0.22em] text-pink-400">ONE WORKFLOW</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">
              探すところから、案件完了まで。
            </h2>
            <p className="max-w-xl text-sm font-medium leading-7 text-white/65 sm:text-base">
              機能をバラバラに増やすのではなく、来店案件に必要な流れそのものを一つにまとめています。
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {journey.map((item) => {
              const Icon = item.icon
              return (
                <article
                  key={item.no}
                  className="group relative overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.055] p-6 transition hover:-translate-y-1 hover:border-white/20"
                >
                  <div className={'absolute inset-x-0 top-0 h-1 bg-gradient-to-r ' + item.accent} />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black tracking-[0.18em] text-white/45">STEP {item.no}</span>
                    <span className={'grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br shadow-lg ' + item.accent}>
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <h3 className="mt-8 text-2xl font-black">{item.title}</h3>
                  <p className="mt-3 text-sm font-medium leading-7 text-white/65">{item.description}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section id="choose-role" className="relative overflow-hidden px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <Image src="/images/lp/about_bg.png" alt="" fill className="object-cover opacity-35" />
        <div className="absolute inset-0 bg-black/65" />

        <div className="relative mx-auto w-full max-w-[1400px]">
          <div className="text-center">
            <p className="text-sm font-black tracking-[0.22em] text-yellow-300">CHOOSE YOUR SIDE</p>
            <h2 className="mt-3 text-3xl font-black sm:text-5xl">あなたに合う使い方へ。</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-7 text-white/70 sm:text-base">
              店舗と演者では、Talentifyを使う目的が違います。必要な情報だけを、それぞれのページで詳しく案内します。
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <Link
              href="/store"
              className="group relative overflow-hidden rounded-[30px] border border-orange-300/25 bg-gradient-to-br from-orange-500/20 via-pink-500/10 to-white/[0.04] p-7 transition hover:-translate-y-1 hover:border-orange-300/50 sm:p-9"
            >
              <div className="flex items-start justify-between gap-5">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-orange-400/15 px-3 py-1.5 text-xs font-black text-orange-200">
                    <Store className="h-4 w-4" />
                    FOR STORES
                  </span>
                  <h3 className="mt-5 text-3xl font-black sm:text-4xl">来店演者の依頼を、もっとスムーズに。</h3>
                  <p className="mt-4 max-w-xl text-sm font-medium leading-7 text-white/70 sm:text-base">
                    演者探し・日程確認・条件整理・オファー・案件管理を、一つの流れに。
                  </p>
                </div>
                <ArrowRight className="mt-2 h-7 w-7 shrink-0 text-orange-300 transition group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/talent"
              className="group relative overflow-hidden rounded-[30px] border border-sky-300/25 bg-gradient-to-br from-sky-500/20 via-blue-500/10 to-white/[0.04] p-7 transition hover:-translate-y-1 hover:border-sky-300/50 sm:p-9"
            >
              <div className="flex items-start justify-between gap-5">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-sky-400/15 px-3 py-1.5 text-xs font-black text-sky-200">
                    <Mic className="h-4 w-4" />
                    FOR TALENTS
                  </span>
                  <h3 className="mt-5 text-3xl font-black sm:text-4xl">見つけてもらえる活動へ。</h3>
                  <p className="mt-4 max-w-xl text-sm font-medium leading-7 text-white/70 sm:text-base">
                    プロフィール・予定・オファー・連絡・請求をまとめて、次の案件につながる基盤に。
                  </p>
                </div>
                <ArrowRight className="mt-2 h-7 w-7 shrink-0 text-sky-300 transition group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#080811] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto w-full max-w-[1400px]">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black tracking-[0.22em] text-sky-400">ACTUAL FEATURES</p>
            <h2 className="mt-3 text-3xl font-black sm:text-5xl">今使える機能を、まっすぐに。</h2>
            <p className="mt-4 text-sm font-medium leading-7 text-white/65 sm:text-base">
              未実装の将来機能ではなく、現在のTalentifyで案件運用に使える機能を中心に案内します。
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <article key={feature.title} className="rounded-[24px] border border-white/10 bg-white/[0.045] p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10">
                    <Icon className="h-5 w-5 text-pink-300" />
                  </span>
                  <h3 className="mt-5 text-xl font-black">{feature.title}</h3>
                  <p className="mt-3 text-sm font-medium leading-7 text-white/65">{feature.description}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-white/10 px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(236,72,153,.18),transparent_45%)]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="text-sm font-black tracking-[0.22em] text-yellow-300">START TALENTIFY</p>
          <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">
            店舗にも、演者にも。
            <br />
            案件を進めやすい場所を。
          </h2>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/register?role=store"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 px-8 text-sm font-black shadow-[0_0_26px_rgba(236,72,153,.28)] transition hover:scale-[1.02]"
            >
              店舗として登録
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/register?role=talent"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-sky-300/60 bg-white/10 px-8 text-sm font-black transition hover:bg-white/15"
            >
              演者として登録
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <Link href="/guide" className="mt-6 inline-flex text-sm font-bold text-white/60 underline-offset-4 hover:text-white hover:underline">
            ご利用の流れを先に見る
          </Link>
        </div>
      </section>
    </main>
  )
}
