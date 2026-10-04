import Image from 'next/image'
import Link from 'next/link'
import './site-footer.css'

const groups = [
  {
    title: '来店情報',
    links: [
      { href: '/', label: 'トップ' },
      { href: '/events', label: '来店情報一覧' },
      { href: '/areas', label: '地域から探す' },
      { href: '/stores', label: '店舗から探す' },
      { href: '/performers', label: '演者から探す' },
    ],
  },
  {
    title: '店舗・演者の方',
    links: [
      { href: '/service', label: 'サービス紹介' },
      { href: '/guide', label: 'ご利用ガイド' },
      { href: '/faq', label: 'よくある質問' },
      { href: '/login', label: 'ログイン' },
    ],
  },
  {
    title: 'サポート',
    links: [
      { href: '/about', label: 'このサイトについて' },
      { href: '/news', label: 'お知らせ' },
      { href: '/contact', label: 'お問い合わせ' },
      { href: '/sitemap', label: 'サイトマップ' },
    ],
  },
]

export default function SiteFooter() {
  return <footer className="raiten-site-footer">
    <div className="raiten-footer-inner">
      <div className="raiten-footer-main">
        <div className="raiten-footer-brand"><Link href="/" aria-label="来店ナビ トップ"><Image src="/brand/raiten-navi-logo.svg" alt="来店ナビ" width={124} height={38} /></Link><p>来店情報・イベント管理</p></div>
        <nav aria-label="フッターメニュー" className="raiten-footer-nav">{groups.map(group => <div key={group.title}><p>{group.title}</p><ul>{group.links.map(link => <li key={link.href}><Link href={link.href}>{link.label}</Link></li>)}</ul></div>)}</nav>
      </div>
      <div className="raiten-footer-bottom"><nav aria-label="法務"><Link href="/terms">利用規約</Link><Link href="/privacy">プライバシーポリシー</Link></nav><p>© 2026 来店ナビ</p></div>
    </div>
  </footer>
}
