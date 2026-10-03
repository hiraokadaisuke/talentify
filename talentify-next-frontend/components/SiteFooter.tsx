import Link from 'next/link'

const serviceLinks = [
  { href: '/', label: '来店情報トップ' },
  { href: '/events', label: '来店情報一覧' },
  { href: '/service', label: '店舗・演者向けサービス' },
  { href: '/service#for-store', label: '店舗向け' },
  { href: '/service#for-talent', label: '演者向け' },
  { href: '/guide', label: 'ご利用ガイド' },
  { href: '/faq', label: 'よくある質問' },
  { href: '/pricing', label: '料金' },
]

const supportLinks = [
  { href: '/about', label: 'このサイトについて' },
  { href: '/news', label: 'お知らせ' },
  { href: '/contact', label: 'お問い合わせ' },
  { href: '/sitemap', label: 'サイトマップ' },
]

const legalLinks = [
  { href: '/terms', label: '利用規約' },
  { href: '/privacy', label: 'プライバシーポリシー' },
]

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-[#081426] text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:py-8">
        <div className="grid gap-4 sm:grid-cols-[1.2fr_1fr_1fr] sm:gap-7">
          <div>
            <Link href="/" className="inline-flex">
              <img src="/brand/raiten-navi-logo.svg" alt="来店ナビ" className="h-9 w-auto sm:h-10" />
            </Link>
            <p className="mt-1.5 max-w-sm text-[11px] leading-5 text-white/45 sm:mt-2 sm:text-xs sm:leading-6">
              一般ユーザー向けの来店情報と、店舗・演者の案件管理をひとつにつなぐ来店イベントプラットフォーム。
            </p>
            <Link
              href="/login"
              className="mt-2 inline-flex text-[11px] font-semibold text-white/70 underline underline-offset-4 transition hover:text-white sm:mt-4 sm:text-xs"
            >
              ログイン
            </Link>
          </div>

          <nav aria-label="サービス・サポート" className="grid grid-cols-2 gap-4 sm:contents sm:gap-6">
            <div>
              <p className="text-[11px] font-semibold text-white/85 sm:text-xs">サービス</p>
              <ul className="mt-2 space-y-1.5 sm:mt-3 sm:space-y-2">
                {serviceLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[11px] text-white/55 transition hover:text-white hover:underline sm:text-xs"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-white/85 sm:text-xs">サポート・運営</p>
              <ul className="mt-2 space-y-1.5 sm:mt-3 sm:space-y-2">
                {supportLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[11px] text-white/55 transition hover:text-white hover:underline sm:text-xs"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4 text-[10px] text-white/40 sm:mt-7 sm:gap-3 sm:pt-5 sm:text-xs sm:flex-row sm:items-center sm:justify-between">
          <nav aria-label="法務" className="flex flex-wrap gap-x-4 gap-y-2">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition hover:text-white hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <p>© 2026 来店ナビ</p>
        </div>
      </div>
    </footer>
  )
}
