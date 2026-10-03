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

const futureFeatures = [
  {
    icon: Sparkles,
    label: 'AI CREATIVE',
    title: 'AIポスター作成',
    description: '演者・店舗・日付などの情報から、来店告知に使えるポスター制作を支援。',
  },
  {
    icon: Share2,
    label: 'SNS SUPPORT',
    title: 'SNS配信支援',
    description: '作ったイベント情報を、手間を減らしながらファンへ届けやすくする仕組み。',
  },
  {
    icon: Star,
    label: 'EVENT PR',
    title: 'イベントPR強化',
    description: '一般ユーザー向けイベントページで、注目の来店情報を見つけてもらいやすく。',
  },
]

const storeBenefits = [
  '演者探しと日程確認をひとつに',
  '条件を整理して、そのままオファー',
  'メッセージと進行状況を一元管理',
  '見積・請求・レビューまで履歴に残る',
]

const talentBenefits = [
  'プロフィールで活動内容を伝えられる',
  '予定とオファー条件をまとめて確認',
  '案件ごとの連絡・請求を一元管理',
  '実績とレビューを次の案件につなげる',
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
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(8,20,38,.15)]">
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
                AIポスターやSNS配信支援へつながる、来店PR機能も順次拡張予定。
              </p>
              <span className="mt-3 inline-flex rounded-full bg-[#0B1F3B] px-3 py-1.5 text-[9px] font-black text-white">
                COMING SOON
              </span>
            </div>
          </div>
        </div>
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
              もっと
              <span className={`bg-gradient-to-r ${brandGradient} bg-clip-text text-transparent`}>目立たせる。</span>
              <br />
              もっと盛り上げる。
            </h1>

            <p className="mt-6 max-w-xl text-sm font-medium leading-7 text-white/68 sm:text-base sm:leading-8 lg:text-lg lg:leading-9">
              演者探し、日程確認、オファー、案件管理、見積・請求まで。
              パチンコ店と演者をつなぎ、来店イベントの準備からその先の告知までをひとつに。
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
              一般向けの来店情報を見る
              <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold text-white/50">
              <span className="inline-flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-[#FFC400]" />案件の流れを一元管理</span>
              <span className="inline-flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-[#FFC400]" />電話での相談も併用可能</span>
              <span className="inline-flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-[#FFC400]" />店舗・演者それぞれ専用画面</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[680px]">
            <div className="absolute -inset-4 rounded-[40px] bg-gradient-to-br from-[#FF3B2E]/25 via-[#FF8A00]/12 to-transparent blur-2xl" />
            <div className="relative overflow-hidden rounded-[32px] border border-white/12 bg-white/[0.055] p-3 shadow-[0_34px_100px_rgba(0,0,0,.45)] backdrop-blur">
              <div className="relative min-h-[440px] overflow-hidden rounded-[24px] bg-[#0B1F3B] sm:min-h-[540px]">
                <img
                  src="/images/lp/talent.png"
                  alt="来店イベントで活動する演者のイメージ"
                  className="absolute inset-0 h-full w-full object-cover object-top opacity-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#081426] via-[#081426]/25 to-transparent" />
                <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#081426]/60 to-transparent" />

                <div className="absolute left-4 top-4 rounded-2xl border border-white/15 bg-[#081426]/75 px-4 py-3 backdrop-blur-md sm:left-6 sm:top-6">
                  <p className="text-[10px] font-black tracking-[0.15em] text-[#FFC400]">NEXT EVENT</p>
                  <p className="mt-1 text-lg font-black">10.12 SAT</p>
                </div>

                <div className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#FF3B2E] to-[#FFC400] text-[#081426] shadow-[0_0_24px_rgba(255,138,0,.45)] sm:right-6 sm:top-6">
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

      <section id="about" className="scroll-mt-24 bg-white px-4 py-16 text-slate-950 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto grid w-full max-w-[1380px] items-center gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-16">
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

            <div className="mt-7 space-y-3">
              {[
                '演者を探すところから、来店後まで同じ案件で追える',
                '電話文化を無理に変えず、重要な条件だけ記録に残せる',
                '将来のポスター・SNS・イベントPRまで一つにつなげる',
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

      <section id="features" className="scroll-mt-24 bg-[#F8FAFC] px-4 py-16 text-slate-950 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto w-full max-w-[1380px]">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-black tracking-[0.2em] text-[#FF5A1F]">CORE FUNCTIONS</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">来店案件に必要な流れを、ひとつに。</h2>
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
                  className="group rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,.05)] transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_18px_40px_rgba(255,90,31,.10)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#0B1F3B] text-[#FFC400]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-black text-slate-300">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-black text-slate-950">{feature.title}</h3>
                  <p className="mt-2 text-sm font-medium leading-7 text-slate-600">{feature.description}</p>
                </article>
              )
            })}
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
        <div className="mx-auto w-full max-w-[1380px]">
          <div className="grid items-end gap-6 lg:grid-cols-[1fr_.6fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#FFC400]/25 bg-[#FFC400]/8 px-3 py-2 text-[11px] font-black tracking-[0.14em] text-[#FFC400]">
                NEXT RAITEN NAVI
              </div>
              <h2 className="mt-5 max-w-4xl text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                管理するだけじゃない。
                <br />
                来店イベントを、もっと多くの人へ。
              </h2>
            </div>
            <p className="text-sm font-medium leading-7 text-white/58 sm:text-base">
              一般ユーザーにも見てもらえるイベント情報を軸に、店舗が「告知にお金を使う価値」を感じられる集客支援機能を順次構想しています。
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {futureFeatures.map((feature) => {
              const Icon = feature.icon
              return (
                <article key={feature.title} className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.055] p-6 backdrop-blur">
                  <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-[#FF8A00]/10 blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#FF3B2E] to-[#FFC400] text-[#081426]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-[9px] font-black tracking-[0.14em] text-white/55">
                        COMING SOON
                      </span>
                    </div>
                    <p className="mt-5 text-[10px] font-black tracking-[0.16em] text-orange-200">{feature.label}</p>
                    <h3 className="mt-2 text-2xl font-black">{feature.title}</h3>
                    <p className="mt-3 text-sm font-medium leading-7 text-white/58">{feature.description}</p>
                  </div>
                </article>
              )
            })}
          </div>

          <p className="mt-5 text-xs font-medium leading-6 text-white/35">
            ※ 上記の集客支援機能は構想・開発予定を含みます。提供内容・提供時期は今後変更になる場合があります。
          </p>
        </div>
      </section>

      <section className="bg-white px-4 py-16 text-slate-950 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto grid w-full max-w-[1380px] gap-6 lg:grid-cols-2">
          <article id="for-store" className="scroll-mt-24 overflow-hidden rounded-[30px] border border-slate-200 bg-[#F8FAFC]">
            <div className="relative h-[230px] overflow-hidden sm:h-[290px]">
              <img src="/images/lp/tentyou.png" alt="店舗担当者" className="h-full w-full object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3B] via-[#0B1F3B]/25 to-transparent" />
              <div className="absolute bottom-5 left-5">
                <span className="rounded-full bg-[#FF5A1F] px-3 py-1.5 text-[10px] font-black tracking-[0.14em] text-white">FOR STORES</span>
                <h2 className="mt-3 text-3xl font-black text-white">店舗担当者の方へ</h2>
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <h3 className="text-2xl font-black">依頼業務を、もっとスムーズに。</h3>
              <div className="mt-5 grid gap-3">
                {storeBenefits.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#FF5A1F]" />
                    <p className="text-sm font-bold leading-6 text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
              <Link href="/register?role=store" className={`mt-7 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-gradient-to-r ${brandGradient} px-5 text-sm font-black text-[#081426]`}>
                店舗として無料登録
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>

          <article id="for-talent" className="scroll-mt-24 overflow-hidden rounded-[30px] border border-slate-200 bg-[#F8FAFC]">
            <div className="relative h-[230px] overflow-hidden sm:h-[290px]">
              <img src="/images/lp/talent.png" alt="演者" className="h-full w-full object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3B] via-[#0B1F3B]/25 to-transparent" />
              <div className="absolute bottom-5 left-5">
                <span className="rounded-full bg-[#0B1F3B] px-3 py-1.5 text-[10px] font-black tracking-[0.14em] text-[#FFC400]">FOR TALENTS</span>
                <h2 className="mt-3 text-3xl font-black text-white">演者の方へ</h2>
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <h3 className="text-2xl font-black">活動と案件管理を、ひとつに。</h3>
              <div className="mt-5 grid gap-3">
                {talentBenefits.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#FF5A1F]" />
                    <p className="text-sm font-bold leading-6 text-slate-700">{item}</p>
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

      <section id="register" className="scroll-mt-24 relative overflow-hidden border-t border-white/10 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[70%] -translate-x-1/2 rounded-full bg-[#FF8A00]/10 blur-3xl" />
        <div className="relative mx-auto max-w-4xl text-center">
          <img src="/brand/raiten-navi-icon.svg" alt="" className="mx-auto h-16 w-16 rounded-[20px] shadow-[0_16px_50px_rgba(255,90,31,.2)]" />
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
            <Link href="/faq" className="hover:text-white">よくある質問</Link>
            <Link href="/contact" className="hover:text-white">お問い合わせ</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
