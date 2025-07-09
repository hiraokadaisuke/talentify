import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-12 border-t bg-gray-50/60 backdrop-blur py-6 text-center text-sm">
      <div className="max-w-5xl mx-auto px-4">
        <p className="mb-2">© 2025 Talentify</p>
        <nav className="space-x-4">
          <Link href="/terms" className="hover:underline">利用規約</Link>
          <Link href="/privacy" className="hover:underline">プライバシーポリシー</Link>
          <Link href="/sitemap" className="hover:underline">サイトマップ</Link>
        </nav>
      </div>
    </footer>
  );
}
