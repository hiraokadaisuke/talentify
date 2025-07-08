'use client'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">このサイトについて</h1>
      <p>
        Talentifyはパチンコ店と演者をマッチングするためのプラットフォームです。
        演者はプロフィールを公開し、店舗は条件に合った演者を検索して出演依頼を送信できます。
      </p>
      <p>
        サービスは現在も開発中で、機能改善を続けています。ご意見・ご要望がございましたら
        <Link href="/contact" className="text-blue-600 underline">お問い合わせ</Link>
        よりお知らせください。
      </p>
    </main>
  )
}
