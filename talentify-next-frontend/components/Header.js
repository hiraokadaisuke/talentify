import Link from 'next/link';

export default function Header() {
  return (
    <header className="flex items-center justify-between p-4 bg-white shadow">
      <Link href="/" className="text-2xl font-bold">
        Talentify
      </Link>
      <nav className="space-x-4 text-sm">
        <a href="#about" className="hover:underline">このサイトについて</a>
        <Link href="/performers" className="hover:underline">演者検索</Link>
        <Link href="/dashboard" className="hover:underline">ダッシュボード</Link>
        <Link href="/offers" className="hover:underline">オファー管理</Link>
        <Link href="/faq" className="hover:underline">FAQ</Link>
        <Link href="/contact" className="hover:underline">お問い合わせ</Link>
        <Link href="/manage" className="hover:underline">管理ページ</Link>
        <Link href="/login" className="font-semibold hover:underline">ログイン</Link>
        <Link
          href="/register"
          className="ml-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          新規登録
        </Link>
      </nav>
    </header>
  );
}
