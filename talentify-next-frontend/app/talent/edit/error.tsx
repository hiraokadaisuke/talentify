'use client'

export default function ErrorPage({ error }: { error: Error & { digest?: string } }) {
  console.error(error)
  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-2">エラーが発生しました</h1>
      <p>申し訳ありません。ページの表示中に問題が発生しました。</p>
    </main>
  )
}
