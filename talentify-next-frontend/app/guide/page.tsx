import Link from 'next/link'

import { RoleCard } from './components/RoleCard'
import { StepFlow } from './components/StepFlow'

const storeSteps = ['演者を探す', 'プロフィールを確認', 'オファーを送る', '条件・日程を調整', '実施・管理']

const talentSteps = ['登録', 'プロフィール設定', 'オファー確認', '条件・日程調整', '実施・請求対応']

const relatedLinks = [
  { href: '/faq', label: 'FAQ' },
  { href: '/news', label: 'お知らせ' },
  { href: '/pricing', label: '料金' },
  { href: '/company', label: '会社概要' },
  { href: '/contact', label: 'お問い合わせ' },
]

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-[#f3f4f6] py-14 md:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <section className="rounded-2xl border border-[#d7dce3] bg-white p-6 shadow-sm md:p-8">
          <h1 className="text-3xl font-bold tracking-tight text-[#0f172a] md:text-4xl">ご利用ガイド</h1>
          <p className="mt-3 text-sm text-[#334155] md:text-base">はじめてでも迷わない、役割別の使い方ガイドです。</p>

          <div className="mt-10">
            <h2 className="text-xl font-semibold text-[#0f172a]">あなたはどちらですか？</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <RoleCard
                href="#store-flow"
                title="店舗の方はこちら"
                description="演者検索、オファー送信、進行管理まで一括で行えます"
              />
              <RoleCard
                href="#talent-flow"
                title="演者の方はこちら"
                description="オファー確認、日程調整、メッセージ、請求対応まで行えます"
              />
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-[#d7dce3] bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-semibold text-[#0f172a]">Talentifyとは</h2>
          <p className="mt-3 text-sm leading-7 text-[#334155] md:text-base">
            店舗と演者をつなぎ、案件作成から実施後のやりとりまで管理できるプラットフォームです。
          </p>
        </section>

        <div className="mt-8 space-y-6">
          <StepFlow id="store-flow" title="店舗の流れ" steps={storeSteps} />
          <StepFlow id="talent-flow" title="演者の流れ" steps={talentSteps} />
        </div>

        <section className="mt-8 rounded-2xl border border-[#d7dce3] bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-semibold text-[#0f172a]">関連ページ</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {relatedLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl border border-[#d7dce3] bg-white px-4 py-3 text-sm font-semibold text-[#334155] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#c89211] hover:text-[#b8820f] hover:shadow-sm"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
