import { Suspense } from 'react'
import ResendConfirmationCard from './ResendConfirmationCard'

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#05050d] px-4 py-12 text-white">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/[0.06] p-7 text-center shadow-2xl sm:p-9">
        <img src="/images/lp/logo.png" alt="来店ナビ" className="mx-auto h-10 w-auto" />
        <p className="mt-6 text-xs font-black tracking-[0.18em] text-pink-300">RAITEN NAVI ACCOUNT</p>
        <h1 className="mt-2 text-2xl font-black">確認メールを送信しました</h1>
        <p className="mt-4 text-sm leading-7 text-white/70">
          来店ナビのアカウント確認メールを、ご入力いただいたメールアドレスへ送信しました。
          <br />
          メール内のボタンまたはURLからメールアドレスを確認してください。
        </p>
        <p className="mt-4 text-xs leading-6 text-white/50">
          メール確認後はダッシュボードへ進みます。プロフィール登録はあとから行えます。
        </p>
        <p className="mt-5 text-xs text-white/45">
          届かない場合は迷惑メールフォルダもご確認ください。
        </p>

        <div className="mt-6 text-left">
          <Suspense fallback={null}>
            <ResendConfirmationCard />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
