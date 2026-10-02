import Link from 'next/link'
import { ArrowRight, CheckCircle2, MessageSquareText, Mic, Store } from 'lucide-react'
import TutorialResetButton from '@/components/TutorialResetButton'

export const metadata = {
  title: 'ご利用ガイド｜来店ナビ',
  description: '店舗・演者それぞれの来店ナビ利用フローを案内します。',
}

const storeSteps = [
  {
    title: '店舗プロフィールを登録',
    text: '店舗名などの基本情報を整えます。初回ナビからすぐ編集できます。',
  },
  {
    title: '演者を検索',
    text: 'プロフィール、出演条件、予定を見ながら候補を探します。気になる演者はお気に入り保存もできます。',
  },
  {
    title: 'オファーを送る',
    text: '希望日・時間・依頼内容などを入力して送信します。送信時点ではまだ契約ではありません。',
  },
  {
    title: '条件を相談する',
    text: '案件内メッセージや電話で、日程・内容・金額などを相談します。重要な条件は見積や案件情報にも反映します。',
  },
  {
    title: '見積を確認・承認',
    text: '演者から提出された見積を確認します。修正が必要なら相談後に修正依頼を行い、再提出してもらいます。',
  },
  {
    title: '契約成立',
    text: '見積承認後、締結書兼請求書が作成されます。契約時点の条件が記録されます。',
  },
  {
    title: '来店・支払い・レビュー',
    text: '来店完了後、支払い状況を確認し、完了後にレビューを投稿できます。',
  },
]

const talentSteps = [
  {
    title: '演者プロフィールを登録',
    text: '活動名、プロフィール、出演条件、連絡方法など、店舗が判断しやすい情報を整えます。',
  },
  {
    title: 'スケジュールを設定',
    text: '出演可能日・難しい日を登録します。店舗がオファー前に確認できます。',
  },
  {
    title: '請求情報を準備',
    text: '見積や請求に必要な情報を設定しておくと、案件進行がスムーズです。',
  },
  {
    title: 'オファーを確認',
    text: '届いた依頼内容を確認し、不明点はメッセージや電話で相談します。',
  },
  {
    title: '見積を提出',
    text: '報酬、交通費、メモなどを確認して提出します。修正依頼があれば下書きに戻るので再編集できます。',
  },
  {
    title: '契約内容を確認',
    text: '店舗が見積を承認すると契約成立です。締結書兼請求書から条件を確認できます。',
  },
  {
    title: '来店・支払い確認',
    text: '出演後、来店完了と支払い状況を確認します。レビューが投稿されるとレビュー画面から確認できます。',
  },
]

const tips = [
  {
    title: '電話を使ってもOK',
    text: '電話文化を無理に変える必要はありません。急ぎや細かな相談は電話でも構いません。',
  },
  {
    title: '重要な条件は記録に残す',
    text: '電話で決まった内容も、日時・金額・交通費など契約条件に関わるものは見積や案件情報へ反映してください。',
  },
  {
    title: '定型文は編集して使える',
    text: '案件メッセージの「よく使うメッセージ」は入力欄へ入るだけで、自動送信されません。',
  },
  {
    title: '困ったときは案件詳細を見る',
    text: '現在の進行ステップと次に必要な対応を案件詳細から確認できます。',
  },
]

function Flow({
  id,
  title,
  description,
  steps,
  accent,
}: {
  id: string
  title: string
  description: string
  steps: { title: string; text: string }[]
  accent: string
}) {
  return (
    <section id={id} className="scroll-mt-24 rounded-[28px] border border-white/10 bg-white/[0.045] p-6 sm:p-8">
      <p className={'text-xs font-black tracking-[0.2em] ' + accent}>{title}</p>
      <h2 className="mt-3 text-2xl font-black sm:text-4xl">{description}</h2>
      <div className="mt-7 space-y-3">
        {steps.map((step, index) => (
          <div key={step.title} className="flex gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-sm font-black">
              {index + 1}
            </span>
            <div>
              <p className="text-sm font-bold text-white sm:text-base">{step.title}</p>
              <p className="mt-1 text-sm font-medium leading-6 text-white/55">{step.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-[#05050d] px-5 pb-20 pt-28 text-white sm:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="text-center">
          <p className="text-sm font-black tracking-[0.22em] text-pink-400">HOW TO USE</p>
          <h1 className="mt-3 text-4xl font-black sm:text-6xl">ご利用ガイド</h1>
          <p className="mx-auto mt-5 max-w-3xl text-sm font-medium leading-7 text-white/65 sm:text-base">
            初回登録から案件完了まで、店舗と演者それぞれの流れを順番に確認できます。全部覚える必要はなく、必要になった時にこのページへ戻ってください。
          </p>
        </div>

        <section className="mt-8 rounded-[28px] border border-pink-300/20 bg-pink-400/10 p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-pink-300" />
            <div className="flex-1">
              <h2 className="text-xl font-black">初めての方へ</h2>
              <p className="mt-2 text-sm font-medium leading-7 text-white/65">
                ダッシュボードには「はじめにすること」が表示されます。不要ならいつでも閉じられます。閉じた後でも、下のボタンから再表示できます。
              </p>
              <div className="mt-4">
                <TutorialResetButton />
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Link href="#store-flow" className="group rounded-[24px] border border-orange-300/20 bg-orange-400/10 p-6 transition hover:border-orange-300/45">
            <div className="flex items-center gap-3 text-orange-200">
              <Store className="h-5 w-5" />
              <span className="text-xs font-black tracking-[0.18em]">FOR STORES</span>
            </div>
            <p className="mt-4 text-2xl font-black">店舗の流れを見る</p>
            <p className="mt-2 text-sm font-medium leading-7 text-white/60">演者検索から契約、来店、レビューまで。</p>
            <ArrowRight className="mt-5 h-5 w-5 text-orange-300 transition group-hover:translate-x-1" />
          </Link>

          <Link href="#talent-flow" className="group rounded-[24px] border border-[#FFC400]/20 bg-[#FFC400]/10 p-6 transition hover:border-[#FFC400]/45">
            <div className="flex items-center gap-3 text-[#FFE27A]">
              <Mic className="h-5 w-5" />
              <span className="text-xs font-black tracking-[0.18em]">FOR TALENTS</span>
            </div>
            <p className="mt-4 text-2xl font-black">演者の流れを見る</p>
            <p className="mt-2 text-sm font-medium leading-7 text-white/60">プロフィール準備から見積、契約、支払い確認まで。</p>
            <ArrowRight className="mt-5 h-5 w-5 text-[#FFC400] transition group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Flow id="store-flow" title="STORE FLOW" description="店舗の利用フロー" steps={storeSteps} accent="text-orange-300" />
          <Flow id="talent-flow" title="TALENT FLOW" description="演者の利用フロー" steps={talentSteps} accent="text-[#FFC400]" />
        </div>

        <section className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <MessageSquareText className="h-5 w-5 text-emerald-300" />
            <h2 className="text-xl font-black">やり取りの基本</h2>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {tips.map(tip => (
              <div key={tip.title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="font-bold">{tip.title}</p>
                <p className="mt-2 text-sm font-medium leading-6 text-white/60">{tip.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
          <h2 className="text-xl font-black">困ったとき</h2>
          <p className="mt-2 text-sm font-medium leading-7 text-white/65">
            よくある操作やトラブルはFAQにまとめています。解決しない場合はお問い合わせください。
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/faq" className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-black text-white/75 hover:bg-white/5">
              FAQを見る
            </Link>
            <Link href="/contact" className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-black text-white/75 hover:bg-white/5">
              お問い合わせ
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
