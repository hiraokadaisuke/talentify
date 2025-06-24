import Link from 'next/link'

export default function SitemapPage() {
  return (
    <main className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">サイトマップ</h1>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">共通ページ</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <Link href="/" className="text-blue-600 underline">
              ホーム
            </Link>
          </li>
          <li>
            <Link href="/sitemap" className="text-blue-600 underline">
              サイトマップ
            </Link>
          </li>
          <li>
            <Link href="/faq" className="text-blue-600 underline">
              よくある質問
            </Link>
          </li>
          <li>
            <Link href="/contact" className="text-blue-600 underline">
              お問い合わせ
            </Link>
          </li>
          <li>
            <Link href="/terms" className="text-blue-600 underline">
              利用規約
            </Link>
          </li>
          <li>
            <Link href="/privacy" className="text-blue-600 underline">
              プライバシーポリシー
            </Link>
          </li>
          <li>
            <Link href="/login" className="text-blue-600 underline">
              ログイン
            </Link>
          </li>
          <li>
            <Link href="/password-reset" className="text-blue-600 underline">
              パスワード再設定
            </Link>
          </li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">パチンコ店向けページ</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <Link href="/register?role=store" className="text-blue-600 underline">
              店舗登録
            </Link>
          </li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">演者向けページ</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <Link href="/register?role=performer" className="text-blue-600 underline">
              演者登録
            </Link>
          </li>
        </ul>
      </section>
    </main>
  );
}
