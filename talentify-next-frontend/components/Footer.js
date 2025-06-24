import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t text-center text-sm py-6 mt-12">
      <p className="mb-2">© 2025 Talentify</p>
      <nav className="space-x-4">
        <Link href="/terms" className="hover:underline">利用規約</Link>
        <Link href="/privacy" className="hover:underline">プライバシーポリシー</Link>
        <Link href="/" className="hover:underline">サイトマップ</Link>
      </nav>
    </footer>
  );
}
