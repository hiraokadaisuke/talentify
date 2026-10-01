import Link from 'next/link'

const serviceLinks = [
  { href: '/', label: 'サービス' },
  { href: '/#for-store', label: '店舗向け' },
  { href: '/#for-talent', label: '演者向け' },
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
    <footer className="mt-auto border-t border-slate-800 bg-[#05050d] text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="grid gap-7 sm:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <Link href="/" className="text-lg font-black tracking-tight text-white">
              Talentify
            </Link>
            <p className="mt-2 max-w-sm text-xs leading-6 text-white/50">
              パチンコ店と演者の出会いから、オファー・見積・契約・案件管理までをつなぐプラットフォーム。
            </p>
            <Link
              href="/login"
              className="mt-4 inline-flex text-xs font-semibold text-white/70 underline underline-offset-4 transition hover:text-white"
            >
              ログイン
            </Link>
          </div>

          <nav aria-label="サービス・サポート" className="grid grid-cols-2 gap-6 sm:contents">
            <div>
              <p className="text-xs font-semibold text-white/85">サービス</p>
              <ul className="mt-3 space-y-2">
                {serviceLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs text-white/55 transition hover:text-white hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold text-white/85">サポート・運営</p>
              <ul className="mt-3 space-y-2">
                {supportLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs text-white/55 transition hover:text-white hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>

        <div className="mt-7 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
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
          <p>© 2026 Talentify</p>
        </div>
      </div>
    </footer>
  )
}
