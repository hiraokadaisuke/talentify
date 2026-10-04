export const dynamic = 'auto'

import './service.css'
import Link from 'next/link'
import Image from 'next/image'
import { HeroScene, ServiceFeatures } from '@/components/lp/ServiceVisuals'
import { ServiceWorkflow, ServiceAudiences } from '@/components/lp/ServiceJourney'
import { ServiceConnections, ServiceFinalCTA } from '@/components/lp/ServiceClosing'
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Building2,
  CheckCircle2,
  FileText,
  LogIn,
  Megaphone,
  MessageSquareText,
  Mic,
  Search,
  Share2,
  Sparkles,
} from 'lucide-react'

const brandGradient = 'from-[#FF3B2E] via-[#FF8A00] to-[#FFC400]'

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
    <main className="raiten-service overflow-x-hidden bg-[#081426] text-white">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#081426]/92 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] w-full max-w-[1480px] items-center justify-between px-4 sm:h-[80px] sm:px-6 lg:px-8">
          <Link href="#top" className="flex items-center">
            <img src="/brand/raiten-navi-logo.svg" alt="来店ナビ" className="h-10 w-auto sm:h-11 md:h-12" />
          </Link>

          <nav className="hidden items-center gap-4 text-xs font-bold text-white/70 lg:flex xl:gap-6 xl:text-sm">
            <Link href="/events" className="whitespace-nowrap transition hover:text-[#FFC400]">来店情報</Link>
            <Link href="#features" className="whitespace-nowrap transition hover:text-[#FFC400]">サービスの特徴</Link>
            <Link href="#promotion" className="whitespace-nowrap transition hover:text-[#FFC400]">ご利用の流れ</Link>
            <Link href="#for-store" className="whitespace-nowrap transition hover:text-[#FFC400]">店舗向け</Link>
            <Link href="#for-talent" className="whitespace-nowrap transition hover:text-[#FFC400]">演者向け</Link>
            <Link href="#faq" className="whitespace-nowrap transition hover:text-[#FFC400]">FAQ</Link>
            <Link href="/guide" className="whitespace-nowrap transition hover:text-[#FFC400]">ガイド</Link>
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

        <nav className="border-t border-white/8 bg-[#081426]/96 lg:hidden">
          <div className="mx-auto flex h-10 w-full max-w-[1480px] items-center gap-5 overflow-x-auto px-4 text-[11px] font-black text-white/62 [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden">
            <Link href="/events" className="shrink-0 whitespace-nowrap text-[#FFC400]">来店情報</Link>
            <Link href="#features" className="shrink-0 whitespace-nowrap transition hover:text-white">特徴</Link>
            <Link href="#promotion" className="shrink-0 whitespace-nowrap transition hover:text-white">ご利用の流れ</Link>
            <Link href="#for-store" className="shrink-0 whitespace-nowrap transition hover:text-white">店舗向け</Link>
            <Link href="#for-talent" className="shrink-0 whitespace-nowrap transition hover:text-white">演者向け</Link>
            <Link href="#faq" className="shrink-0 whitespace-nowrap transition hover:text-white">FAQ</Link>
            <Link href="/guide" className="shrink-0 whitespace-nowrap transition hover:text-white">ガイド</Link>
          </div>
        </nav>
      </header>

      <section id="top" className="raiten-service-hero">
        <Image src="/lp/hero/hero-bg.webp" alt="" fill priority sizes="100vw" className="raiten-service-hero-bg" />
        <div className="raiten-service-hero-shade" />
        <div className="raiten-service-hero-inner">
          <div className="raiten-service-hero-copy">
            <p className="raiten-service-hero-concept"><span />外はワクワク。中は分かりやすく。</p>
            <h1>来店イベントの<br /><em>依頼から公開</em>まで、<br />これひとつ。</h1>
            <p className="raiten-service-hero-description">
              店舗は演者を探してオファー。演者は予定と条件を管理。<br />
              確定した来店情報は、そのまま一般向けページに公開できます。
            </p>
            <div className="raiten-service-hero-actions">
              <Link href="/register?role=store" className="raiten-hero-register"><Building2 size={16} />店舗として無料登録<ArrowRight size={16} /></Link>
              <Link href="/register?role=talent" className="raiten-hero-register raiten-hero-register-secondary"><Mic size={16} />演者として無料登録<ArrowRight size={16} /></Link>
            </div>
            <Link href="/events" className="raiten-hero-public-link">一般向け来店情報を見る<ArrowRight size={14} /></Link>
            <div className="raiten-hero-benefits">
              <span><BadgeCheck size={14} />案件を一元管理</span>
              <span><BadgeCheck size={14} />電話での相談も併用可能</span>
            </div>
          </div>
          <HeroScene />
        </div>
      </section>

      <section id="about" className="scroll-mt-24 relative overflow-hidden bg-[radial-gradient(circle_at_80%_20%,rgba(255,138,0,.07),transparent_28%),linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)] px-4 py-16 text-slate-950 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <img loading="lazy" decoding="async"
          src="/lp/backgrounds/minimal-tech-bg.webp"
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

      <ServiceFeatures />

      <ServiceWorkflow />

      <ServiceAudiences />

      <section className="relative overflow-hidden bg-white px-4 py-16 text-slate-950 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <img loading="lazy" decoding="async"
          src="/lp/ui/glossy-ui-elements.webp"
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
            <img loading="lazy" decoding="async"
              src="/lp/ui/device-mockup.webp"
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

      <ServiceConnections />

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

      <ServiceFinalCTA />
    </main>
  )
}
