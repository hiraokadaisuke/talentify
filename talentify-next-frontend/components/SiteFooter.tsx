import Link from 'next/link'

const footerLinks = [
  { href: '/store', label: '店舗向け' },
  { href: '/register?role=talent', label: '演者向け' },
  { href: '/faq', label: 'よくある質問' },
  { href: '/login', label: 'ログイン' },
  { href: '/company', label: '会社概要' },
  { href: '/privacy', label: 'プライバシーポリシー' },
]

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-slate-900 hover:underline">
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-slate-500">© Talentify</p>
      </div>
    </footer>
  )
}
