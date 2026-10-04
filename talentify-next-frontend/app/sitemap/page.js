import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import PublicPageHero from '@/components/public/PublicPageHero'

const groups = [
  {
    title: '来店情報を探す',
    description: '一般ユーザー向けの来店情報ページ',
    links: [
      ['/', '来店情報トップ'],
      ['/areas', '地域から探す'],
      ['/stores', '店舗から探す'],
      ['/events', '来店情報一覧'],
      ['/performers', '演者から探す'],
    ],
  },
  {
    title: 'サービス・サポート',
    description: '来店ナビの使い方やサービス案内',
    links: [
      ['/service', 'サービス紹介'],
      ['/guide', 'ご利用ガイド'],
      ['/faq', 'よくある質問'],
      ['/pricing', '料金'],
      ['/news', 'お知らせ'],
      ['/about', 'このサイトについて'],
      ['/contact', 'お問い合わせ'],
    ],
  },
  {
    title: 'アカウント',
    description: '登録・ログインに関するページ',
    links: [
      ['/register?role=store', '店舗として登録'],
      ['/register?role=talent', '演者として登録'],
      ['/login', 'ログイン'],
      ['/password-reset', 'パスワード再設定'],
    ],
  },
  {
    title: '規約・ポリシー',
    description: 'ご利用にあたっての重要事項',
    links: [
      ['/terms', '利用規約'],
      ['/privacy', 'プライバシーポリシー'],
    ],
  },
]

export default function SitemapPage() {
  return (
    <main className="min-h-screen bg-[#F7F9FC] pt-16 text-slate-950">
      <PublicPageHero
        eyebrow="SITEMAP"
        title="サイトマップ"
        description="来店ナビの主なページを目的別にご案内します。"
      />

      <div className="mx-auto grid w-full max-w-[1120px] gap-4 px-4 py-8 sm:px-6 sm:py-12 md:grid-cols-2 lg:px-8">
        {groups.map((group) => (
          <section
            key={group.title}
            className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,.04)] sm:p-6"
          >
            <p className="text-xs font-black tracking-[0.14em] text-[#FF5A1F]">{group.title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">{group.description}</p>
            <ul className="mt-5 divide-y divide-slate-100">
              {group.links.map(([href, label]) => (
                <li key={href + label}>
                  <Link
                    href={href}
                    className="group flex min-h-12 items-center justify-between gap-3 py-3 text-sm font-bold text-slate-700 transition hover:text-[#C2410C]"
                  >
                    <span>{label}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#FF5A1F]" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  )
}
