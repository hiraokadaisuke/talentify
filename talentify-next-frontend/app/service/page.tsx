export const dynamic = 'auto'

import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  FileText,
  LogIn,
  Megaphone,
  MessageSquareText,
  Mic,
  Search,
  Share2,
  Sparkles,
  Star,
} from 'lucide-react'

const brandGradient = 'from-[#FF3B2E] via-[#FF8A00] to-[#FFC400]'

const coreFeatures = [
  {
    icon: Search,
    title: '演者検索',
    description: 'プロフィール・活動エリア・ジャンルから、来店を依頼したい演者を探せます。',
  },
  {
    icon: CalendarDays,
    title: '日程確認',
    description: '出演可能日や案件予定を確認しながら、候補日をスムーズに整理できます。',
  },
  {
    icon: Megaphone,
    title: 'オファー管理',
    description: '日時・依頼内容・想定報酬などをまとめて送り、回答から進行まで管理できます。',
  },
  {
    icon: MessageSquareText,
    title: 'メッセージ・案件管理',
    description: '相談内容と案件の進行状況をひとつにまとめ、必要な対応を追いやすくします。',
  },
  {
    icon: FileText,
    title: '見積・請求・レビュー',
    description: '見積、締結、請求、支払い確認、レビューまで来店後の流れも一元管理します。',
  },
]

const storeBenefits = [
  '演者探しと日程確認をひとつに',
  '条件を整理して、そのままオファー',
  'メッセージ・見積・請求まで一元管理',
  '確定した来店情報を一般ユーザー向けに公開',
]

const talentBenefits = [
  'プロフィールで活動内容を伝えられる',
  '予定とオファー条件をまとめて確認',
  '案件ごとの連絡・請求を一元管理',
  '確定した来店予定を一般向けページから届けられる',
]

const faqItems = [
  {
    question: '店舗と演者、どちらが利用できますか？',
    answer:
      '店舗向け・演者向けそれぞれに専用画面があります。店舗は演者検索やオファー管理、演者はプロフィールや予定、届いた案件の確認・管理に利用できます。',
  },
  {
    question: 'オファーした後は、どこまで管理できますか？',
    answer:
      '条件確認、メッセージ、見積・締結、請求、支払い確認、レビューまで、案件ごとの情報をまとめて確認できる設計です。',
  },
  {
    question: '電話で相談する運用と併用できますか？',
    answer:
      '電話での相談を併用しながら、決まった条件や進行状況を来店ナビ上に残して管理する使い方を想定しています。',
  },
  {
    question: '一般ユーザーは何を見られますか？',
    answer:
      '確定した来店情報を、地域や店舗を起点に探せる一般向けページで確認できます。演者から探す導線も用意します。',
  },
  {
    question: 'スマートフォンでも利用できますか？',
    answer:
      '店舗・演者の管理画面、一般向け来店情報ページともにスマートフォンで確認しやすいレスポンシブ設計です。',
  },
]

function BrandButton({
  href,
  children,
  secondary = false,
}: {
  href: string
  children: React.ReactNode
  secondary?: boolean
}) {
  return (
    <Link
      href={href}
      className={
        secondary
          ? 'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/8 px-5 text-sm font-black text-white transition hover:border-white/35 hover:bg-white/12'
          : `inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${brandGradient} px-5 text-sm font-black text-[#081426] shadow-[0_12px_34px_rgba(255,138,0,.24)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(255,138,0,.32)]`
      }
    >
      {children}
    </Link>
  )
}

function DashboardPreview() {
  return (
    <div className="relative pb-8 sm:pb-12">
      <div className="pointer-events-none absolute -inset-x-5 top-10 h-56 rounded-full bg-gradient-to-r from-[#0B1F3B]/10 via-[#FF8A00]/10 to-[#FFC400]/10 blur-3xl" />

      <div className="absolute -top-4 right-3 z-20 hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] font-black tracking-[0.12em] text-slate-500 shadow-lg sm:flex">
        <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
        PC / TABLET / MOBILE
      </div>

      <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(8,20,38,.15)]">
        <div className="flex min-h-[420px]">
          <aside className="hidden w-[170px] shrink-0 bg-[#0B1F3B] p-4 text-white sm:block">
            <img src="/brand/raiten-navi-icon.svg" alt="" className="h-9 w-9 rounded-xl" />
            <p className="mt-5 text-[10px] font-bold tracking-[0.18em] text-white/45">STORE MENU</p>
            <div className="mt-3 space-y-2">
              {['ダッシュボード', '演者を探す', 'オファー管理', 'メッセージ', '見積・請求'].map((item, index) => (
                <div
                  key={item}
                  className={`rounded-xl px-3 py-2.5 text-xs font-bold ${
                    index === 0 ? 'bg-[#FF5A1F] text-white' : 'text-white/65'
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>
          </aside>

          <div className="min-w-0 flex-1 bg-[#F8FAFC] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black tracking-[0.16em] text-[#FF5A1F]">RAITEN NAVI</p>
                <p className="mt-1 text-lg font-black text-slate-950">ダッシュボード</p>
              </div>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-500">
                店舗アカウント
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
              {[
                ['進行中', '8件'],
                ['新着オファー', '3件'],
                ['今月の来店', '12件'],
                ['未確認', '2件'],
              ].map(([label, value], index) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white p-3">
                  <p className="text-[10px] font-bold text-slate-500">{label}</p>
                  <p className={`mt-1 text-xl font-black ${index === 1 ? 'text-[#FF5A1F]' : 'text-slate-950'}`}>{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 grid gap-3 lg:grid-cols-[1.35fr_.65fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black text-slate-950">直近の案件</p>
                  <span className="text-[10px] font-bold text-[#FF5A1F]">すべて見る →</span>
                </div>
                <div className="mt-3 space-y-2">
                  {[
                    ['10/08', '来店イベント A', '確認待ち'],
                    ['10/12', '来店イベント B', '進行中'],
                    ['10/19', '来店イベント C', '見積確認'],
                  ].map(([date, name, status], index) => (
                    <div key={name} className="grid grid-cols-[52px_1fr_auto] items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
                      <span className="text-[10px] font-black text-slate-500">{date}</span>
                      <span className="truncate text-xs font-bold text-slate-800">{name}</span>
                      <span className={`rounded-full px-2 py-1 text-[9px] font-black ${
                        index === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-orange-100 bg-gradient-to-b from-orange-50 to-white p-4">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#FF5A1F] text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
                <p className="mt-3 text-sm font-black text-slate-950">告知も、もっと簡単に。</p>
                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                  確定した来店予定は、一般ユーザー向けの来店情報ページとしてそのまま公開できます。
                </p>
                <span className="mt-3 inline-flex rounded-full bg-[#0B1F3B] px-3 py-1.5 text-[9px] font-black text-white">
                  PUBLIC EVENTS
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="raiten-device-float absolute -bottom-2 right-2 z-20 hidden w-[150px] rounded-[30px] border-[7px] border-[#0B1F3B] bg-[#0B1F3B] p-1 shadow-[0_20px_50px_rgba(8,20,38,.25)] md:block lg:right-[-18px]">
        <div className="overflow-hidden rounded-[20px] bg-white">
          <div className="flex items-center justify-between bg-[#F8FAFC] px-3 py-2">
            <img src="/brand/raiten-navi-icon.svg" alt="" className="h-5 w-5 rounded-md" />
            <span className="h-1.5 w-9 rounded-full bg-slate-200" />
          </div>
          <div className="p-3">
            <p className="text-[8px] font-black tracking-[0.12em] text-[#FF5A1F]">NEXT EVENT</p>
            <p className="mt-1 text-[15px] font-black text-slate-950">10.12 SAT</p>
            <div className="mt-3 rounded-xl bg-[#0B1F3B] p-3 text-white">
              <p className="text-[8px] font-black text-orange-200">来店予定</p>
              <p className="mt-1 text-[10px] font-black">イベント情報を公開</p>
              <div className="mt-2 h-1.5 w-14 rounded-full bg-[#FF8A00]" />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1">
              <span className="rounded-lg bg-slate-100 px-2 py-1 text-center text-[7px] font-bold text-slate-500">案件</span>
              <span className="rounded-lg bg-orange-50 px-2 py-1 text-center text-[7px] font-bold text-[#FF5A1F]">公開</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 pr-0 text-[10px] font-black text-slate-500 sm:mt-5 md:pr-36">
        {['白背景で見やすい', '案件単位で整理', 'スマホでも確認'].map((item) => (
          <span key={item} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <main className="overflow-x-hidden bg-[#081426] text-white">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#081426]/92 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] w-full max-w-[1480px] items-center justify-between px-4 sm:h-[80px] sm:px-6 lg:px-8">
          <Link href="#top" className="flex items-center">
            <img src="/brand/raiten-navi-logo.svg" alt="来店ナビ" className="h-10 w-auto sm:h-11 md:h-12" />
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-bold text-white/70 lg:flex">
            <Link href="/events" className="transition hover:text-[#FFC400]">来店情報</Link>
            <Link href="#about" className="transition hover:text-[#FFC400]">来店ナビとは</Link>
            <Link href="#features" className="transition hover:text-[#FFC400]">機能</Link>
            <Link href="#promotion" className="transition hover:text-[#FFC400]">集客支援</Link>
            <Link href="#for-store" className="transition hover:text-[#FFC400]">店舗向け</Link>
            <Link href="#for-talent" className="transition hover:text-[#FFC400]">演者向け</Link>
            <Link href="#faq" className="transition hover:text-[#FFC400]">よくある質問</Link>
            <Link href="/guide" className="transition hover:text-[#FFC400]">ご利用ガイド</Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="hidden min-h-10 items-center gap-2 rounded-xl border border-white/15 px-4 text-sm font-bold text-white/80 transition hover:bg-white/5 sm:inline-flex"
            >
              <LogIn className="h-4 w-4" />
              ログイン
            </Link>
            <Link
              href="#register"
              className={`inline-flex min-h-10 items-center rounded-xl bg-gradient-to-r ${brandGradient} px-4 text-xs font-black text-[#081426] sm:px-5 sm:text-sm`}
            >
              無料で始める
            </Link>
          </div>
        </div>
      </header>

      <section
        id="top"
        className="relative isolate overflow-hidden px-4 pb-14 pt-[104px] sm:px-6 sm:pb-20 sm:pt-[126px] lg:px-8 lg:pb-24"
        style={{
          background:
            'radial-gradient(circle at 82% 16%, rgba(255,196,0,.17), transparent 25%), radial-gradient(circle at 70% 48%, rgba(255,59,46,.20), transparent 28%), linear-gradient(135deg, #081426 0%, #0B1F3B 55%, #07111f 100%)',
        }}
      >
        <img
          src="/images/lp/materials/future-stage-bg.webp"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-55"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#081426]/95 via-[#081426]/78 to-[#081426]/38" />
        <div className="pointer-events-none absolute -left-24 top-24 h-64 w-64 rounded-full bg-[#FF3B2E]/10 blur-3xl" />
        <div className="pointer-events-none absolute right-[-5rem] top-28 h-80 w-80 rounded-full bg-[#FFC400]/10 blur-3xl" />

        <div className="relative mx-auto grid w-full max-w-[1480px] items-center gap-10 lg:grid-cols-[.92fr_1.08fr] lg:gap-14">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-300/25 bg-orange-300/8 px-3 py-2 text-[11px] font-black tracking-[0.14em] text-orange-200 sm:text-xs">
              <span className="h-2 w-2 rounded-full bg-[#FFC400] shadow-[0_0_14px_rgba(255,196,0,.8)]" />
              RAITEN EVENT PLATFORM
            </div>

            <h1 className="mt-5 text-[40px] font-black leading-[1.08] tracking-tight sm:text-[58px] lg:text-[68px] xl:text-[76px]">
              来店イベントを、
              <br />
              <span className={`bg-gradient-to-r ${brandGradient} bg-clip-text text-transparent`}>探す・依頼する。</span>
              <br />
              管理して、届ける。
            </h1>

            <p className="mt-6 max-w-xl text-sm font-medium leading-7 text-white/68 sm:text-base sm:leading-8 lg:text-lg lg:leading-9">
              演者探し、日程確認、オファー、案件管理、見積・請求、来店情報の一般公開まで。
              パチンコ店と演者の仕事をひとつにつなぐ、来店イベントの業務プラットフォームです。
            </p>

            <div className="mt-7 grid max-w-xl gap-3 sm:grid-cols-2">
              <BrandButton href="/register?role=store">
                <Building2 className="h-4 w-4" />
                店舗として無料登録
                <ArrowRight className="h-4 w-4" />
              </BrandButton>
              <BrandButton href="/register?role=talent" secondary>
                <Mic className="h-4 w-4" />
                演者として無料登録
              </BrandButton>
            </div>

            <Link
              href="/events"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-black text-[#FFC400] transition hover:text-white"
            >
              一般向け来店情報サイトを見る
              <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold text-white/50">
              <span className="inline-flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-[#FFC400]" />案件の流れを一元管理</span>
              <span className="inline-flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-[#FFC400]" />電話での相談も併用可能</span>
              <span className="inline-flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-[#FFC400]" />店舗・演者それぞれ専用画面</span>
            </div>
          </div>

          <div className="raiten-hero-visual relative mx-auto w-full max-w-[680px]">
            <div className="absolute -inset-4 rounded-[40px] bg-gradient-to-br from-[#FF3B2E]/25 via-[#FF8A00]/12 to-transparent blur-2xl" />
            <div className="relative overflow-hidden rounded-[32px] border border-white/12 bg-white/[0.055] p-3 shadow-[0_34px_100px_rgba(0,0,0,.45)] backdrop-blur">
              <div className="relative min-h-[440px] overflow-hidden rounded-[24px] bg-[#0B1F3B] sm:min-h-[540px]">
                <img
                  src="/images/lp/materials/hero-performer-red.webp"
                  alt="来店イベントで活動する演者のイメージ"
                  className="absolute inset-0 h-full w-full object-cover object-center opacity-95"
                />
                <img
                  src="/images/lp/materials/stage-light-particles.webp"
                  alt=""
                  aria-hidden="true"
                  className="raiten-hero-particles pointer-events-none absolute inset-0 h-full w-full object-cover mix-blend-screen opacity-35"
                />
                <img
                  src="/images/lp/materials/neon-hud-elements.webp"
                  alt=""
                  aria-hidden="true"
                  className="raiten-hero-hud pointer-events-none absolute inset-0 h-full w-full object-cover mix-blend-screen opacity-24"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#081426] via-[#081426]/20 to-transparent" />
                <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#081426]/60 to-transparent" />

                <div className="absolute left-4 top-4 rounded-2xl border border-white/15 bg-[#081426]/75 px-4 py-3 backdrop-blur-md sm:left-6 sm:top-6">
                  <p className="text-[10px] font-black tracking-[0.15em] text-[#FFC400]">NEXT EVENT</p>
                  <p className="mt-1 text-lg font-black">10.12 SAT</p>
                </div>

                <div className="raiten-hero-spark absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#FF3B2E] to-[#FFC400] text-[#081426] shadow-[0_0_24px_rgba(255,138,0,.45)] sm:right-6 sm:top-6">
                  <Sparkles className="h-5 w-5" />
                </div>

                <div className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6">
                  <div className="rounded-[22px] border border-white/12 bg-[#081426]/82 p-4 backdrop-blur-xl sm:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-black tracking-[0.14em] text-orange-200">FEATURED RAITEN EVENT</p>
                        <p className="mt-2 text-2xl font-black sm:text-3xl">話題の来店情報を、もっと見つけやすく。</p>
                      </div>
                      <Megaphone className="hidden h-7 w-7 shrink-0 text-[#FFC400] sm:block" />
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {[
                        ['探す', Search],
                        ['つなぐ', MessageSquareText],
                        ['広げる', Share2],
                      ].map(([label, Icon]) => {
                        const IconComponent = Icon as typeof Search
                        return (
                          <div key={label as string} className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-3 text-center">
                            <IconComponent className="mx-auto h-4 w-4 text-[#FFC400]" />
                            <p className="mt-1.5 text-[10px] font-black text-white/75">{label as string}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-2 hidden rounded-2xl border border-orange-200/20 bg-[#FF5A1F] px-4 py-3 shadow-xl sm:block">
              <p className="text-[10px] font-black tracking-[0.12em] text-white/70">FOR STORES</p>
              <p className="mt-1 text-sm font-black text-white">依頼から告知まで、もっとスムーズに。</p>
            </div>
          </div>
        </div>

        <div className="relative mx-auto mt-14 grid w-full max-w-[1180px] grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 lg:mt-20">
          {[
            ['演者検索', Search],
            ['日程・案件管理', CalendarDays],
            ['見積・請求', FileText],
            ['集客支援', Megaphone],
          ].map(([label, Icon]) => {
            const IconComponent = Icon as typeof Search
            return (
              <div key={label as string} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 backdrop-blur">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/8 text-[#FFC400]">
                  <IconComponent className="h-4 w-4" />
                </span>
                <span className="text-xs font-black text-white/75 sm:text-sm">{label as string}</span>
              </div>
            )
          })}
        </div>
      </section>

      <section id="about" className="scroll-mt-24 relative overflow-hidden bg-[radial-gradient(circle_at_80%_20%,rgba(255,138,0,.07),transparent_28%),linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)] px-4 py-16 text-slate-950 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <img
          src="/images/lp/materials/minimal-tech-bg.webp"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-42"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/96 via-white/90 to-white/78" />

        <div className="relative mx-auto grid w-full max-w-[1380px] items-center gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="text-xs font-black tracking-[0.2em] text-[#FF5A1F]">ABOUT RAITEN NAVI</p>
            <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              外はワクワク。
              <br />
              中は分かりやすく。
            </h2>
            <p className="mt-5 max-w-xl text-sm font-medium leading-7 text-slate-600 sm:text-base sm:leading-8">
              来店ナビは、イベントの期待感を伝える「告知」と、店舗・演者が毎日使う「業務管理」を同じサービスの中でつなぎます。
              見せる場所はしっかり目立たせ、仕事をする画面は白背景で迷わず使える。これが来店ナビの基本です。
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-[10px] font-black tracking-[0.12em] text-[#FF5A1F]">
                OUTSIDE = EXCITEMENT
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black tracking-[0.12em] text-[#0B1F3B] shadow-sm">
                INSIDE = CLARITY
              </span>
            </div>

            <div className="mt-6 space-y-3">
              {[
                '演者を探すところから、来店後まで同じ案件で追える',
                '電話文化を無理に変えず、重要な条件だけ記録に残せる',
                '確定した来店情報を、そのまま一般ユーザー向けページへ公開できる',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-orange-50 text-[#FF5A1F]">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <p className="text-sm font-bold leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <DashboardPreview />
        </div>
      </section>

      <section id="features" className="scroll-mt-24 relative overflow-hidden bg-[#F8FAFC] px-4 py-16 text-slate-950 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <img
          src="/images/lp/materials/white-orange-tech-bg.webp"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-55"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#F8FAFC]/84 via-[#F8FAFC]/76 to-[#F8FAFC]/92" />
        <div className="pointer-events-none absolute left-[-10%] top-8 h-64 w-64 rounded-full bg-[#FF5A1F]/8 blur-3xl" />
        <div className="pointer-events-none absolute right-[-6%] bottom-0 h-72 w-72 rounded-full bg-[#FFC400]/8 blur-3xl" />

        <div className="relative mx-auto w-full max-w-[1380px]">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full border border-orange-100 bg-white px-3 py-1.5 shadow-sm">
              <span className="raiten-energy-dot h-2 w-2 rounded-full bg-[#FF5A1F]" />
              <p className="text-[10px] font-black tracking-[0.2em] text-[#FF5A1F] sm:text-xs">CORE FUNCTIONS</p>
            </div>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">来店案件に必要な流れを、ひとつに。</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-600 sm:text-base">
              探す・相談する・条件を決める・実施する・支払いを確認する。バラバラになりやすい来店案件の情報をまとめます。
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {coreFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <article
                  key={feature.title}
                  className="raiten-feature-card group relative overflow-visible rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,.05)] transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_18px_40px_rgba(255,90,31,.12)]"
                >
                  <div className="absolute inset-x-0 top-0 h-[3px] overflow-hidden rounded-t-[24px] bg-slate-100">
                    <div className="raiten-card-energy h-full w-1/2 bg-gradient-to-r from-[#FF3B2E] via-[#FF8A00] to-[#FFC400]" />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="raiten-icon-pulse grid h-11 w-11 place-items-center rounded-2xl bg-[#0B1F3B] text-[#FFC400]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-black text-slate-300">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-black text-slate-950">{feature.title}</h3>
                  <p className="mt-2 text-sm font-medium leading-7 text-slate-600">{feature.description}</p>

                  {index < coreFeatures.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="raiten-flow-arrow pointer-events-none absolute -right-[18px] top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-orange-100 bg-white text-[#FF5A1F] shadow-[0_8px_20px_rgba(255,90,31,.14)] xl:flex"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </article>
              )
            })}
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-[11px] font-black tracking-[0.12em] text-slate-400">
            <span className="h-px w-8 bg-slate-200" />
            ONE FLOW, ONE PLATFORM
            <span className="h-px w-8 bg-slate-200" />
          </div>
        </div>
      </section>

      <section
        id="promotion"
        className="scroll-mt-24 relative overflow-hidden px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
        style={{
          background:
            'radial-gradient(circle at 15% 20%, rgba(255,90,31,.18), transparent 26%), radial-gradient(circle at 85% 80%, rgba(255,196,0,.11), transparent 25%), #081426',
        }}
      >
        <img
          src="/images/lp/materials/smartphone-light-trails.webp"
          alt=""
          aria-hidden="true"
          className="raiten-promotion-device pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-20 mix-blend-screen"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#081426]/92 via-[#081426]/78 to-[#081426]/55" />

        <div className="relative mx-auto grid w-full max-w-[1380px] items-center gap-10 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FFC400]/25 bg-[#FFC400]/8 px-3 py-2 text-[11px] font-black tracking-[0.14em] text-[#FFC400]">
              PUBLIC RAITEN INFORMATION
            </div>
            <h2 className="mt-5 max-w-3xl text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
              案件を管理するだけで終わらない。
              <br />
              確定した来店情報を、そのまま一般公開。
            </h2>
            <p className="mt-5 max-w-2xl text-sm font-medium leading-7 text-white/60 sm:text-base sm:leading-8">
              締結済みの案件は、店舗側から公開タイミングを決めて一般ユーザー向けの来店情報ページへ掲載できます。
              公開URLは店舗・演者の双方から確認でき、来店予定を届けるところまで来店ナビの中でつながります。
            </p>
            <Link
              href="/events"
              className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/8 px-4 text-sm font-black text-white transition hover:bg-white/12"
            >
              実際の来店情報を見る
              <ArrowRight className="h-4 w-4 text-[#FFC400]" />
            </Link>
          </div>

          <div className="relative min-h-[520px] overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.055] p-5 backdrop-blur sm:min-h-[560px] sm:p-7">
            <img
              src="/images/lp/materials/connection-hub.webp"
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-26"
            />
            <img
              src="/images/lp/materials/stage-light-particles.webp"
              alt=""
              aria-hidden="true"
              className="raiten-public-particles pointer-events-none absolute inset-0 h-full w-full object-cover mix-blend-screen opacity-20"
            />
            <img
              src="/images/lp/materials/orange-arrow-elements.webp"
              alt=""
              aria-hidden="true"
              className="raiten-public-arrows pointer-events-none absolute right-[-9%] top-[30%] hidden w-[310px] max-w-none mix-blend-screen opacity-20 sm:block"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#081426]/54 via-[#081426]/80 to-[#081426]/96" />

            <div className="relative z-10 flex items-center justify-between gap-4">
              <p className="text-[10px] font-black tracking-[0.16em] text-orange-200">FROM OFFER TO PUBLIC</p>
              <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[9px] font-black tracking-[0.12em] text-white/55">
                LIVE INFORMATION
              </span>
            </div>

            <div className="relative z-10 mt-6 grid items-end gap-6 sm:grid-cols-[1fr_180px]">
              <div className="space-y-2.5">
                {[
                  ['01', '演者を探す'],
                  ['02', '条件を確認'],
                  ['03', 'オファー・締結'],
                  ['04', '案件を管理'],
                  ['05', '一般公開'],
                ].map(([number, label], index) => (
                  <div
                    key={number}
                    className={`raiten-public-step flex items-center gap-3 rounded-2xl border px-4 py-3.5 ${
                      index === 4
                        ? 'border-[#FFC400]/35 bg-[#FFC400]/10'
                        : 'border-white/10 bg-white/[0.045]'
                    }`}
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#FF3B2E] to-[#FFC400] text-xs font-black text-[#081426]">
                      {number}
                    </span>
                    <span className="text-sm font-black text-white/82">{label}</span>
                    {index < 4 && <ArrowRight className="ml-auto h-4 w-4 text-white/25" />}
                    {index === 4 && <CheckCircle2 className="ml-auto h-4 w-4 text-[#FFC400]" />}
                  </div>
                ))}
              </div>

              <div className="raiten-public-phone mx-auto w-[170px] rounded-[32px] border-[7px] border-[#06111f] bg-[#06111f] p-1 shadow-[0_30px_80px_rgba(0,0,0,.45)]">
                <div className="overflow-hidden rounded-[22px] bg-white">
                  <div className="flex items-center justify-between bg-[#F8FAFC] px-3 py-2.5">
                    <img src="/brand/raiten-navi-icon.svg" alt="" className="h-5 w-5 rounded-md" />
                    <span className="h-1.5 w-10 rounded-full bg-slate-200" />
                  </div>
                  <div className="p-3">
                    <p className="text-[8px] font-black tracking-[0.13em] text-[#FF5A1F]">PUBLIC EVENT</p>
                    <p className="mt-1 text-[16px] font-black text-slate-950">10.12 SAT</p>
                    <div className="mt-3 overflow-hidden rounded-xl bg-[#0B1F3B]">
                      <div className="h-20 bg-gradient-to-br from-[#FF3B2E] via-[#FF8A00] to-[#FFC400] opacity-90" />
                      <div className="p-3 text-white">
                        <p className="text-[8px] font-black text-orange-200">来店予定</p>
                        <p className="mt-1 text-[10px] font-black leading-4">確定情報をそのまま公開</p>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-1">
                      <span className="flex-1 rounded-lg bg-slate-100 px-2 py-1.5 text-center text-[7px] font-bold text-slate-500">店舗</span>
                      <span className="flex-1 rounded-lg bg-orange-50 px-2 py-1.5 text-center text-[7px] font-bold text-[#FF5A1F]">演者</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-6 grid gap-2 sm:grid-cols-3">
              {[
                ['確定案件', '一元管理'],
                ['公開URL', 'すぐ確認'],
                ['一般ユーザー', 'そのまま閲覧'],
              ].map(([label, value], index) => (
                <div key={label} className="raiten-public-mini-card rounded-2xl border border-white/10 bg-[#081426]/55 px-4 py-3 backdrop-blur">
                  <p className="text-[9px] font-black tracking-[0.1em] text-white/35">{label}</p>
                  <p className={`mt-1 text-sm font-black ${index === 2 ? 'text-[#FFC400]' : 'text-white'}`}>{value}</p>
                </div>
              ))}
            </div>

            <div aria-hidden="true" className="raiten-public-line pointer-events-none absolute bottom-16 left-[24%] right-[16%] z-[5] h-px bg-gradient-to-r from-transparent via-[#FF8A00] to-transparent opacity-70" />
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 text-slate-950 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto grid w-full max-w-[1380px] gap-6 lg:grid-cols-2">
          <article id="for-store" className="scroll-mt-24 overflow-hidden rounded-[30px] border border-slate-200 bg-[#F8FAFC] shadow-[0_18px_50px_rgba(15,23,42,.06)]">
            <div className="relative h-[250px] overflow-hidden sm:h-[310px]">
              <img src="/images/lp/materials/office-leader-tablet.webp" alt="店舗担当者" className="h-full w-full object-cover object-center" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3B] via-[#0B1F3B]/28 to-[#0B1F3B]/5" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#081426]/80 to-transparent" />

              <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/15 bg-[#081426]/45 px-3 py-2 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-[#FFC400] shadow-[0_0_14px_rgba(255,196,0,.75)]" />
                <span className="text-[9px] font-black tracking-[0.14em] text-white/80">STORE SIDE</span>
              </div>

              <div className="raiten-store-chip absolute right-4 top-5 rounded-2xl border border-white/15 bg-white/90 px-3 py-2.5 shadow-xl backdrop-blur sm:right-5">
                <p className="text-[8px] font-black tracking-[0.12em] text-slate-400">SEARCH</p>
                <p className="mt-0.5 text-[11px] font-black text-slate-900">日程から演者を探す</p>
              </div>

              <div className="raiten-store-chip-secondary absolute right-7 top-[88px] rounded-2xl border border-orange-100 bg-[#FFF8F3]/95 px-3 py-2.5 shadow-xl backdrop-blur sm:right-9">
                <p className="text-[8px] font-black tracking-[0.12em] text-[#FF8A00]">OFFER</p>
                <p className="mt-0.5 text-[11px] font-black text-slate-900">条件をまとめて依頼</p>
              </div>

              <div className="absolute bottom-5 left-5">
                <span className="rounded-full bg-[#FF5A1F] px-3 py-1.5 text-[10px] font-black tracking-[0.14em] text-white">FOR STORES</span>
                <h2 className="mt-3 text-3xl font-black text-white">店舗担当者の方へ</h2>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black tracking-[0.16em] text-[#FF5A1F]">SEARCH → OFFER → MANAGE</p>
                  <h3 className="mt-2 text-2xl font-black">依頼業務を、もっとスムーズに。</h3>
                </div>
                <div className="rounded-2xl border border-orange-100 bg-orange-50 px-3 py-2 text-right">
                  <p className="text-[9px] font-black text-orange-500">POINT</p>
                  <p className="mt-0.5 text-[11px] font-black text-slate-800">案件ごとに情報を整理</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {storeBenefits.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#FF5A1F]" />
                    <p className="text-sm font-bold leading-6 text-slate-700">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2">
                {[
                  ['01', '探す'],
                  ['02', '依頼する'],
                  ['03', '管理する'],
                ].map(([number, label], index) => (
                  <div key={number} className="relative rounded-2xl border border-slate-200 bg-white px-3 py-3 text-center shadow-sm">
                    <span className="text-[9px] font-black tracking-[0.12em] text-slate-300">{number}</span>
                    <p className="mt-1 text-[11px] font-black text-slate-800">{label}</p>
                    {index < 2 && (
                      <ArrowRight className="absolute -right-[9px] top-1/2 z-10 h-4 w-4 -translate-y-1/2 rounded-full bg-[#F8FAFC] p-0.5 text-[#FF5A1F]" />
                    )}
                  </div>
                ))}
              </div>

              <Link href="/register?role=store" className={`mt-7 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-gradient-to-r ${brandGradient} px-5 text-sm font-black text-[#081426]`}>
                店舗として無料登録
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>

          <article id="for-talent" className="scroll-mt-24 overflow-hidden rounded-[30px] border border-slate-200 bg-[#F8FAFC] shadow-[0_18px_50px_rgba(15,23,42,.06)]">
            <div className="relative h-[250px] overflow-hidden sm:h-[310px]">
              <img src="/images/lp/materials/talent-stage.webp" alt="演者" className="h-full w-full object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3B] via-[#0B1F3B]/28 to-[#0B1F3B]/5" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#081426]/80 to-transparent" />

              <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/15 bg-[#081426]/45 px-3 py-2 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-[#FF8A00] shadow-[0_0_14px_rgba(255,138,0,.75)]" />
                <span className="text-[9px] font-black tracking-[0.14em] text-white/80">TALENT SIDE</span>
              </div>

              <div className="raiten-talent-chip absolute right-4 top-5 rounded-2xl border border-white/15 bg-white/90 px-3 py-2.5 shadow-xl backdrop-blur sm:right-5">
                <p className="text-[8px] font-black tracking-[0.12em] text-slate-400">PROFILE</p>
                <p className="mt-0.5 text-[11px] font-black text-slate-900">活動内容をプロフィールで発信</p>
              </div>

              <div className="raiten-talent-chip-secondary absolute right-7 top-[88px] rounded-2xl border border-orange-100 bg-[#FFF8F3]/95 px-3 py-2.5 shadow-xl backdrop-blur sm:right-9">
                <p className="text-[8px] font-black tracking-[0.12em] text-[#FF8A00]">OFFER</p>
                <p className="mt-0.5 text-[11px] font-black text-slate-900">届いた条件をまとめて確認</p>
              </div>

              <div className="absolute bottom-5 left-5">
                <span className="rounded-full bg-[#0B1F3B] px-3 py-1.5 text-[10px] font-black tracking-[0.14em] text-[#FFC400]">FOR TALENTS</span>
                <h2 className="mt-3 text-3xl font-black text-white">演者の方へ</h2>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black tracking-[0.16em] text-[#FF5A1F]">PROFILE → OFFER → MANAGE</p>
                  <h3 className="mt-2 text-2xl font-black">活動と案件管理を、ひとつに。</h3>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-right">
                  <p className="text-[9px] font-black text-slate-400">POINT</p>
                  <p className="mt-0.5 text-[11px] font-black text-slate-800">案件ごとの情報をまとめて確認</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {talentBenefits.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#FF5A1F]" />
                    <p className="text-sm font-bold leading-6 text-slate-700">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2">
                {[
                  ['01', '伝える'],
                  ['02', '確認する'],
                  ['03', '管理する'],
                ].map(([number, label], index) => (
                  <div key={number} className="relative rounded-2xl border border-slate-200 bg-white px-3 py-3 text-center shadow-sm">
                    <span className="text-[9px] font-black tracking-[0.12em] text-slate-300">{number}</span>
                    <p className="mt-1 text-[11px] font-black text-slate-800">{label}</p>
                    {index < 2 && (
                      <ArrowRight className="absolute -right-[9px] top-1/2 z-10 h-4 w-4 -translate-y-1/2 rounded-full bg-[#F8FAFC] p-0.5 text-[#FF5A1F]" />
                    )}
                  </div>
                ))}
              </div>

              <Link href="/register?role=talent" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-[#0B1F3B] px-5 text-sm font-black text-white">
                演者として無料登録
                <ArrowRight className="h-4 w-4 text-[#FFC400]" />
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="relative overflow-hidden bg-white px-4 py-16 text-slate-950 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <img
          src="/images/lp/materials/glossy-ui-elements.webp"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute right-[-7%] top-8 w-[520px] max-w-none opacity-15"
        />
        <div className="pointer-events-none absolute left-[-10%] bottom-[-10%] h-72 w-72 rounded-full bg-[#FF8A00]/8 blur-3xl" />
        <div className="relative mx-auto w-full max-w-[1180px]">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-black tracking-[0.2em] text-[#FF5A1F]">START SIMPLE</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              まずは無料登録から、必要なところをひとつずつ。
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-600 sm:text-base">
              店舗と演者それぞれの画面を分けながら、案件が動き始めたら必要な情報がひとつの流れにつながるように設計しています。
            </p>
          </div>

          <div className="relative mx-auto mt-9 max-w-3xl">
            <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-[#FF3B2E]/10 via-[#FF8A00]/12 to-[#FFC400]/10 blur-3xl" />
            <img
              src="/images/lp/materials/device-mockup.webp"
              alt="パソコン・タブレット・スマートフォンに対応した来店ナビのイメージ"
              className="relative mx-auto w-full max-w-[560px] drop-shadow-[0_24px_44px_rgba(15,23,42,.18)]"
            />
            <div className="relative -mt-3 flex flex-wrap justify-center gap-2">
              {['PC', 'TABLET', 'MOBILE'].map((item) => (
                <span key={item} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[9px] font-black tracking-[0.13em] text-slate-500 shadow-sm">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: BadgeCheck,
                label: 'ACCOUNT',
                title: '役割ごとの専用画面',
                text: '店舗と演者で必要な機能を分け、普段使う情報へ迷わずアクセスできる構成です。',
              },
              {
                icon: BarChart3,
                label: 'WORKFLOW',
                title: '案件単位で整理',
                text: 'オファー、連絡、見積・請求などを案件ごとにまとめ、今どこまで進んでいるかを追いやすくします。',
              },
              {
                icon: Share2,
                label: 'PUBLIC',
                title: '確定情報をそのまま公開',
                text: '確定した来店予定を一般向け情報へつなぎ、店舗・演者・ユーザーの情報差を減らします。',
              },
            ].map(({ icon: Icon, label, title, text }) => (
              <article key={title} className="group rounded-[26px] border border-slate-200 bg-[#F8FAFC]/95 p-6 shadow-[0_14px_40px_rgba(15,23,42,.05)] backdrop-blur transition hover:-translate-y-1 hover:border-orange-200 hover:bg-white hover:shadow-[0_18px_44px_rgba(255,90,31,.10)]">
                <div className="flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0B1F3B] text-[#FFC400]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-[9px] font-black tracking-[0.14em] text-slate-300">{label}</span>
                </div>
                <h3 className="mt-5 text-xl font-black text-slate-950">{title}</h3>
                <p className="mt-2 text-sm font-medium leading-7 text-slate-600">{text}</p>
              </article>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className={`inline-flex min-h-12 items-center gap-2 rounded-2xl bg-gradient-to-r ${brandGradient} px-5 text-sm font-black text-[#081426]`}
            >
              無料登録へ進む
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/guide" className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700">
              ご利用ガイドを見る
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section
        id="ecosystem"
        className="scroll-mt-24 relative overflow-hidden border-y border-white/10 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
        style={{ background: '#081426' }}
      >
        <img
          src="/images/lp/materials/data-network.webp"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-22 mix-blend-screen"
        />
        <img
          src="/images/lp/materials/neon-wave-bg.webp"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-14"
        />
        <img
          src="/images/lp/materials/light-ribbon.webp"
          alt=""
          aria-hidden="true"
          className="raiten-ecosystem-ribbon pointer-events-none absolute left-1/2 top-1/2 w-[1100px] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-30 mix-blend-screen"
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,138,0,.13),transparent_28%),linear-gradient(180deg,rgba(8,20,38,.18),rgba(8,20,38,.82))]" />

        <div className="relative mx-auto w-full max-w-[1180px]">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-black tracking-[0.2em] text-[#FFC400]">ONE CONNECTED FLOW</p>
            <h2 className="mt-4 text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
              店舗・演者・一般ユーザーを、
              <br className="hidden sm:block" />
              ひとつにつなぐ。
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm font-medium leading-7 text-white/55 sm:text-base">
              店舗が探して依頼し、演者が確認して案件が確定。確定した来店情報は、そのまま一般ユーザーへ届けられます。
            </p>
          </div>

          <div className="relative mx-auto mt-12 max-w-5xl">
            <img
              src="/images/lp/materials/timeline-glow.webp"
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-[44%] hidden w-[82%] -translate-x-1/2 -translate-y-1/2 opacity-38 mix-blend-screen lg:block"
            />

            <div className="relative grid gap-4 lg:grid-cols-[1fr_1.15fr_1fr] lg:items-center">
              <div className="rounded-[26px] border border-white/10 bg-white/[0.055] p-5 backdrop-blur">
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-[#FFC400]">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <span className="text-[10px] font-black tracking-[0.14em] text-white/30">STORE</span>
                </div>
                <h3 className="mt-5 text-xl font-black text-white">店舗</h3>
                <p className="mt-2 text-sm font-medium leading-7 text-white/55">
                  地域・日程・演者から探し、条件をまとめてオファー。案件ごとの進行状況も一か所で確認。
                </p>
              </div>

              <div className="raiten-ecosystem-hub relative overflow-hidden rounded-[30px] border border-[#FF8A00]/30 bg-[#0B1F3B]/90 p-6 text-center shadow-[0_0_70px_rgba(255,90,31,.16)] backdrop-blur sm:p-8">
                <div className="pointer-events-none absolute inset-x-5 top-5 flex items-center justify-center gap-2 text-[8px] font-black tracking-[0.14em] text-white/35">
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/15" />
                  STORE ↔ TALENT ↔ PUBLIC
                  <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/15" />
                </div>
                <img
                  src="/images/lp/materials/connection-hub.webp"
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-24"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0B1F3B]/45 via-[#0B1F3B]/72 to-[#081426]/92" />
                <div className="relative">
                  <img
                    src="/images/lp/materials/orange-ui-hub.webp"
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-7 w-[250px] max-w-none -translate-x-1/2 opacity-38 mix-blend-screen"
                  />
                  <img
                    src="/brand/raiten-navi-icon.svg"
                    alt=""
                    className="relative mx-auto h-16 w-16 rounded-[20px] shadow-[0_0_35px_rgba(255,138,0,.28)]"
                  />
                  <p className="mt-4 text-[10px] font-black tracking-[0.18em] text-[#FFC400]">RAITEN NAVI</p>
                  <h3 className="mt-2 text-2xl font-black text-white">来店ナビ</h3>
                  <p className="mt-3 text-sm font-medium leading-7 text-white/55">
                    探す・依頼する・決める・管理する・公開するまでをひとつの流れに。
                  </p>
                </div>
              </div>

              <div className="rounded-[26px] border border-white/10 bg-white/[0.055] p-5 backdrop-blur">
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-[#FFC400]">
                    <Mic className="h-5 w-5" />
                  </span>
                  <span className="text-[10px] font-black tracking-[0.14em] text-white/30">TALENT</span>
                </div>
                <h3 className="mt-5 text-xl font-black text-white">演者</h3>
                <p className="mt-2 text-sm font-medium leading-7 text-white/55">
                  プロフィール・対応可能日を整え、届いたオファーを確認。案件情報をまとめて管理。
                </p>
              </div>
            </div>

            <div className="relative mx-auto mt-4 max-w-xl rounded-[26px] border border-[#FFC400]/20 bg-[#FFC400]/[0.06] p-5 backdrop-blur sm:p-6">
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#FF3B2E] to-[#FFC400] text-[#081426]">
                  <Search className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h3 className="text-xl font-black text-white">一般ユーザー</h3>
                    <span className="text-[9px] font-black tracking-[0.12em] text-[#FFC400]">PUBLIC</span>
                  </div>
                  <p className="mt-2 text-sm font-medium leading-7 text-white/55">
                    地域や店舗を起点に来店予定を探し、気になるイベントを確認。演者から探す導線も用意します。
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap justify-center gap-2">
              {['店舗から演者へ依頼', '確定情報を一元管理', '一般ユーザーへ公開'].map((item, index) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-2 text-[10px] font-black text-white/60"
                >
                  <span className="mr-1.5 text-[#FF8A00]">0{index + 1}</span>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-24 bg-white px-4 py-16 text-slate-950 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto grid w-full max-w-[1180px] gap-10 lg:grid-cols-[.72fr_1.28fr] lg:gap-14">
          <div>
            <p className="text-xs font-black tracking-[0.2em] text-[#FF5A1F]">FAQ</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">よくある質問</h2>
            <p className="mt-4 max-w-md text-sm font-medium leading-7 text-slate-600">
              来店ナビを使い始める前に、よく確認される内容をまとめています。
            </p>
            <Link href="/guide" className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#FF5A1F]">
              詳しい使い方を見る
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, index) => (
              <details
                key={item.question}
                className="group rounded-[22px] border border-slate-200 bg-[#F8FAFC] px-5 py-1 open:bg-white open:shadow-[0_16px_40px_rgba(15,23,42,.06)] sm:px-6"
              >
                <summary className="flex cursor-pointer list-none items-center gap-4 py-5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#0B1F3B] text-[10px] font-black text-[#FFC400]">
                    Q{index + 1}
                  </span>
                  <span className="flex-1 text-sm font-black text-slate-900 sm:text-base">{item.question}</span>
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-lg font-light text-slate-400 transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="border-t border-slate-200 pb-5 pl-12 pt-4 text-sm font-medium leading-7 text-slate-600 sm:pl-12">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="register" className="scroll-mt-24 relative overflow-hidden border-t border-white/10 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <img
          src="/images/lp/materials/lens-flare.webp"
          alt=""
          aria-hidden="true"
          className="raiten-final-flare pointer-events-none absolute inset-0 h-full w-full object-cover mix-blend-screen opacity-28"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#081426]/45 via-[#081426]/68 to-[#081426]/92" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[70%] -translate-x-1/2 rounded-full bg-[#FF8A00]/10 blur-3xl" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="relative mx-auto h-28 w-28">
            <img
              src="/images/lp/materials/energy-ring.webp"
              alt=""
              aria-hidden="true"
              className="raiten-final-ring pointer-events-none absolute inset-0 h-full w-full object-contain opacity-90"
            />
            <img
              src="/brand/raiten-navi-icon.svg"
              alt=""
              className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-[20px] shadow-[0_16px_50px_rgba(255,90,31,.28)]"
            />
          </div>
          <p className="mt-5 text-xs font-black tracking-[0.2em] text-[#FFC400]">START RAITEN NAVI</p>
          <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
            来店案件を、もっと進めやすく。
            <br />
            来店イベントを、もっと広げやすく。
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm font-medium leading-7 text-white/55 sm:text-base">
            店舗も演者も、まずは無料登録から。すでにアカウントをお持ちの方はログインして続きから利用できます。
          </p>

          <div className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
            <BrandButton href="/register?role=store">
              <Building2 className="h-4 w-4" />
              店舗登録
            </BrandButton>
            <BrandButton href="/register?role=talent" secondary>
              <Mic className="h-4 w-4" />
              演者登録
            </BrandButton>
            <BrandButton href="/login" secondary>
              <LogIn className="h-4 w-4" />
              ログイン
            </BrandButton>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-bold text-white/42">
            <Link href="/guide" className="hover:text-white">ご利用ガイド</Link>
            <Link href="#faq" className="hover:text-white">よくある質問</Link>
            <Link href="/events" className="hover:text-white">来店情報</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
