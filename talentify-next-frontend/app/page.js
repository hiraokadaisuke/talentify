'use client';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex flex-col items-center">
      <section
        className="w-full text-center text-white py-20 bg-gradient-to-r from-blue-700 to-green-600"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          パチンコ店と人気演者を繋ぐ、新しいマッチングプラットフォーム
        </h1>
        <p className="mb-6">イベント成功のための最適なパートナーを見つけましょう</p>
        <div className="flex justify-center space-x-4">
          <Link
            href="/register?role=store"
            className="px-5 py-3 bg-blue-600 rounded text-white hover:bg-blue-700"
          >
            店舗として登録する
          </Link>
          <Link
            href="/register?role=performer"
            className="px-5 py-3 bg-green-600 rounded text-white hover:bg-green-700"
          >
            演者として登録する
          </Link>
        </div>
      </section>

      <section id="about" className="py-12 max-w-3xl w-full px-4">
        <h2 className="text-2xl font-bold text-center mb-6">パチンコ店様へ</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>最適な演者と出会える</li>
          <li>イベント告知の規制に配慮したサポート</li>
          <li>契約・決済をスムーズに</li>
        </ul>
        <div className="text-center mt-4">
          <Link href="/register?role=store" className="text-blue-600 underline">
            店舗として利用開始する
          </Link>
        </div>
      </section>

      <section className="py-12 bg-gray-50 max-w-3xl w-full px-4">
        <h2 className="text-2xl font-bold text-center mb-6">演者の皆様へ</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>安定した仕事機会の獲得</li>
          <li>自身のブランド力向上</li>
          <li>適切なギャラ交渉をサポート</li>
        </ul>
        <div className="text-center mt-4">
          <Link href="/register?role=performer" className="text-blue-600 underline">
            演者として利用開始する
          </Link>
        </div>
      </section>

      <section className="py-12 max-w-3xl w-full px-4">
        <h2 className="text-2xl font-bold text-center mb-6">よくある質問</h2>
        <p className="text-center">
          <Link href="/faq" className="text-blue-600 underline">
            FAQページへ
          </Link>
        </p>
      </section>

      <section className="py-12 bg-gray-50 max-w-3xl w-full px-4">
        <h2 className="text-2xl font-bold text-center mb-6">お問い合わせ</h2>
        <p className="text-center">
          <Link href="/contact" className="text-blue-600 underline">
            お問い合わせページへ
          </Link>
        </p>
      </section>
    </main>
  );
}
