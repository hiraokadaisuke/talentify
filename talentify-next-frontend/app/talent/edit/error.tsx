'use client'

export default function ErrorPage({ error }: { error: Error & { digest?: string } }) {
  console.error(error)
  return (
    <main className="p-4 lg:mx-auto lg:max-w-2xl lg:rounded-2xl lg:border lg:border-red-200 lg:bg-white lg:p-8 lg:shadow-[0_8px_24px_rgba(15,23,42,.05)]">
      <h1 className="text-xl font-bold mb-2">エラーが発生しました</h1>
      <p>申し訳ありません。ページの表示中に問題が発生しました。</p>
    </main>
  )
}
