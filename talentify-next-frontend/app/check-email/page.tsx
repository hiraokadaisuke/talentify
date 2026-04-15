import { Suspense } from 'react'
import ResendConfirmationCard from './ResendConfirmationCard'

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <h1 className="mb-4 text-2xl font-bold text-gray-800">仮登録が完了しました</h1>
      <p className="mb-6 text-center text-gray-600">
        ご入力いただいたメールアドレス宛に確認メールをお送りしました。
        <br />
        メールに記載されたURLをクリックして、本登録を完了してください。
      </p>
      <p className="text-sm text-gray-500">
        ※メールが届かない場合は、迷惑メールフォルダをご確認ください。
      </p>

      <Suspense fallback={null}>
        <ResendConfirmationCard />
      </Suspense>
    </div>
  )
}
