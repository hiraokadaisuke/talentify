export const dynamic = 'auto'

import './service.css'
import Link from 'next/link'
import Image from 'next/image'
import { HeroScene, ServiceFeatures } from '@/components/lp/ServiceVisuals'
import { ServiceWorkflow, ServiceAudiences } from '@/components/lp/ServiceJourney'
import { ServiceConnections, ServiceFinalCTA } from '@/components/lp/ServiceClosing'
import { ServiceAbout, ServiceManagement } from '@/components/lp/ServiceManagement'
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  LogIn,
  Mic,
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
      '条件確認、メッセージ、見積・締結、請求、支払い確認、レビューまで、案件ごとの情報をまとめて確認できます。',
  },
  {
    question: '電話で相談する運用と併用できますか？',
    answer:
      '電話対応が可能な演者とは、電話でも相談できます。決まった条件は見積や案件情報に記録してください。',
  },
  {
    question: '一般ユーザーは何を見られますか？',
    answer:
      '確定した来店情報を、地域や店舗から探せる一般向けページで確認できます。演者から探すこともできます。',
  },
  {
    question: 'スマートフォンでも利用できますか？',
    answer:
      'はい。演者の検索や案件の管理、来店情報の閲覧は、スマートフォンでも利用できます。',
  },
]

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
            <p className="raiten-service-hero-concept"><span />店舗と演者のための来店イベント管理サービス</p>
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

      <ServiceAbout />

      <ServiceFeatures />

      <ServiceWorkflow />

      <ServiceAudiences />

      <ServiceManagement />

      <ServiceConnections />

      <section id="faq" className="raiten-service-faq scroll-mt-24 bg-white px-4 py-16 text-slate-950 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
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
