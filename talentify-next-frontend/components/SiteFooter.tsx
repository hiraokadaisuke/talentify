import Link from 'next/link'

const footerLinks = [
  { href: '/', label: 'サービス' },
  { href: '/#for-store', label: '店舗向け' },
  { href: '/#for-talent', label: '演者向け' },
  { href: '/guide', label: 'ご利用ガイド' },
  { href: '/faq', label: 'よくある質問' },
  { href: '/login', label: 'ログイン' },
  { href: '/privacy', label: 'プライバシーポリシー' },
]

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-[#05050d] text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-white hover:underline">
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-white/40">© Talentify</p>
      </div>
    </footer>
  )
}
