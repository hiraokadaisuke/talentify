"use client"

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Search } from 'lucide-react'
import FAQItem from '../../components/FAQItem'
import PublicPageHero from '@/components/public/PublicPageHero'

const FAQ_DATA = {
  'はじめに': [
    {
      question: '来店ナビでは何ができますか？',
      answer: '店舗は演者検索・オファー・案件管理を、演者はプロフィール・予定・オファー・見積・請求管理を行えます。オファーから契約、来店、支払い確認、レビューまで同じ案件情報を見ながら進められます。',
    },
    {
      question: '店舗と演者で使う画面は違いますか？',
      answer: 'はい。登録時に選んだ役割に合わせて、店舗向け画面と演者向け画面に分かれます。',
    },
    {
      question: '最初に何をすればいいですか？',
      answer: 'ログイン後のダッシュボードに「はじめにすること」が表示されます。不要な場合は閉じることができ、後からご利用ガイドを確認できます。',
    },
    {
      question: '初回ナビは消せますか？',
      answer: 'はい。右上の×で非表示にできます。ご利用ガイドから再表示する設定にも戻せます。',
    },
  ],
  '店舗向け': [
    {
      question: '演者はどうやって探しますか？',
      answer: '演者検索から、プロフィールや出演条件、予定などを確認できます。気になる演者はお気に入りに保存できます。',
    },
    {
      question: 'オファーを送る前に何を確認すればいいですか？',
      answer: '希望日、開始・終了時間、依頼内容、想定報酬などを確認してください。条件が未確定なら、オファー後にメッセージや電話で相談できます。',
    },
    {
      question: '電話で相談してもいいですか？',
      answer: 'はい。演者が電話対応を許可している場合は電話で相談できます。重要な条件は、最終的に見積や案件情報へ反映して双方が確認できる状態にしてください。',
    },
    {
      question: '見積を修正してほしい場合はどうしますか？',
      answer: 'メッセージや電話で修正したい内容を相談したうえで「見積修正を依頼」を行います。見積は下書きに戻り、演者が修正して再提出します。',
    },
    {
      question: 'キャンセルしたい場合は？',
      answer: '案件詳細からキャンセル理由を入力して手続きします。キャンセルした記録は案件に残ります。',
    },
    {
      question: '演者が来店しなかった場合は？',
      answer: '予定終了時刻を過ぎた案件では、店舗側から「来店なし」を記録できます。理由を入力し、案件記録として残します。',
    },
    {
      question: 'レビューはいつ投稿できますか？',
      answer: '来店完了と支払い完了後に投稿できます。実際の取引に基づいた内容を投稿してください。',
    },
  ],
  '演者向け': [
    {
      question: '登録後、まず何を設定すればいいですか？',
      answer: 'プロフィール、出演可能スケジュール、請求情報を順番に設定するのがおすすめです。ダッシュボードの初回ナビから各画面へ移動できます。',
    },
    {
      question: '店舗からのオファーはどこで確認できますか？',
      answer: '「オファー管理」から確認できます。進行中・履歴・中止などに分けて表示されます。',
    },
    {
      question: 'オファー内容について質問したい場合は？',
      answer: '案件内のメッセージで店舗へ確認できます。電話対応を許可している場合は電話で相談することもできます。',
    },
    {
      question: '見積は何度でも修正できますか？',
      answer: '契約成立前であれば、必要に応じて修正して再提出できます。店舗から修正依頼があった場合は見積が下書きに戻ります。',
    },
    {
      question: '請求情報や振込先はどこで設定しますか？',
      answer: '演者側の設定画面から登録できます。案件を進める前に設定しておくとスムーズです。',
    },
    {
      question: '自分の電話番号は常に店舗に表示されますか？',
      answer: 'いいえ。電話連絡を許可している案件など、表示条件を満たす場合にのみ店舗へ表示されます。',
    },
  ],
  'オファー・契約': [
    {
      question: 'オファーを送った時点で契約になりますか？',
      answer: 'いいえ。オファーは出演依頼の開始です。条件調整と見積提出を経て、店舗が見積を承認し契約成立として記録された時点で契約が成立します。',
    },
    {
      question: '契約後に日時を変更できますか？',
      answer: '契約前は変更できます。見積提出後など条件確定が進んだ後は、必要に応じて見積修正を行い、双方で再確認してください。',
    },
    {
      question: '契約内容はどこで確認できますか？',
      answer: '見積承認後に作成される締結書兼請求書から確認できます。契約時点の日時・報酬・案件内容などが記録されます。',
    },
    {
      question: 'キャンセル後に記録は消えますか？',
      answer: 'いいえ。キャンセル理由や日時など、取引の証跡として必要な情報は案件に残ります。',
    },
  ],
  'メッセージ': [
    {
      question: 'メッセージと電話はどちらを使うべきですか？',
      answer: 'どちらでも構いません。急ぎや細かな相談は電話、記録を残したい内容はメッセージが便利です。契約条件に関わる内容は見積や案件情報にも反映してください。',
    },
    {
      question: 'よく使う文章を毎回入力する必要がありますか？',
      answer: '案件メッセージには「よく使うメッセージ」を用意しています。選ぶと入力欄へ入るだけなので、必要に応じて編集してから送信できます。',
    },
    {
      question: 'ファイルを添付できますか？',
      answer: 'はい。対応形式の画像・PDF・Officeファイル等を1メッセージ最大3件、1件10MBまで添付できます。',
    },
    {
      question: '送信に失敗した場合、入力内容は消えますか？',
      answer: '送信に失敗しても入力内容は残ります。そのまま再送できます。',
    },
  ],
  '支払い・レビュー': [
    {
      question: '支払い状況はどこで確認できますか？',
      answer: '請求・案件詳細から確認できます。支払い完了後は演者側にも通知されます。',
    },
    {
      question: '支払い前にレビューできますか？',
      answer: 'いいえ。現在は来店完了と支払い完了の両方を満たした案件のみレビューできます。',
    },
    {
      question: 'レビューを後から確認できますか？',
      answer: 'はい。店舗側・演者側それぞれのレビュー画面から確認できます。',
    },
  ],
  'アカウント': [
    {
      question: 'パスワードを忘れた場合は？',
      answer: 'ログイン画面の「パスワードをお忘れですか？」から再設定できます。',
    },
    {
      question: '退会したい場合は？',
      answer: '現在、退会は運営側で確認のうえ処理します。お問い合わせフォームからご連絡ください。',
    },
    {
      question: 'プロフィール情報を変更できますか？',
      answer: 'はい。店舗・演者ともプロフィール編集画面から変更できます。',
    },
    {
      question: '利用できない状態になった場合は？',
      answer: '運営上の確認が必要な場合、アカウントを一時的に利用停止することがあります。画面の案内に従ってお問い合わせください。',
    },
  ],
}

export default function FAQPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('すべて')

  const categories = ['すべて', ...Object.keys(FAQ_DATA)]

  const filteredItems = useMemo(() => {
    const allItems = category === 'すべて'
      ? Object.entries(FAQ_DATA).flatMap(([group, items]) =>
          items.map(item => ({ ...item, group })),
        )
      : (FAQ_DATA[category] || []).map(item => ({ ...item, group: category }))

    const normalized = query.trim().toLowerCase()
    if (!normalized) return allItems

    return allItems.filter(item =>
      item.question.toLowerCase().includes(normalized) ||
      item.answer.toLowerCase().includes(normalized)
    )
  }, [category, query])

  return (
    <main className="min-h-screen bg-[#F7F9FC] pt-16 text-slate-950">
      <PublicPageHero
        eyebrow="FAQ"
        title="よくある質問"
        description="登録前の疑問から、オファー・見積・契約・メッセージ・支払いまで、利用中に迷いやすい内容をまとめています。"
      />

      <div className="mx-auto w-full max-w-[960px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <section className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,.04)] sm:p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="例：見積修正、電話、キャンセル"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-base font-medium outline-none transition placeholder:text-slate-400 focus:border-[#FF8A00] focus:bg-white focus:ring-2 focus:ring-orange-100 sm:text-sm"
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={
                  'min-h-10 rounded-xl border px-3 py-2 text-xs font-black transition sm:px-4 sm:text-sm ' +
                  (category === cat
                    ? 'border-[#FF5A1F] bg-[#FF5A1F] text-white shadow-[0_6px_16px_rgba(255,90,31,.14)]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:bg-orange-50/50')
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        <div className="mt-8">
          {filteredItems.map((item, index) => (
            <div key={[item.group, item.question].join('-')}>
              {index === 0 || filteredItems[index - 1]?.group !== item.group ? (
                <div className="mb-3 mt-7 flex items-center gap-3 first:mt-0">
                  <span className="h-px w-8 bg-[#FF5A1F]" />
                  <h2 className="text-sm font-black tracking-[0.04em] text-slate-500">{item.group}</h2>
                </div>
              ) : null}
              <div className="mb-3">
                <FAQItem question={item.question} answer={item.answer} />
              </div>
            </div>
          ))}

          {filteredItems.length === 0 ? (
            <div className="rounded-[22px] border border-slate-200 bg-white p-8 text-center">
              <p className="text-sm font-bold text-slate-600">該当する質問は見つかりませんでした。</p>
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  setCategory('すべて')
                }}
                className="mt-4 text-sm font-black text-[#C2410C] underline underline-offset-4"
              >
                検索条件をリセット
              </button>
            </div>
          ) : null}
        </div>

        <section className="mt-10 rounded-[22px] bg-[#0B1F3B] p-5 text-white sm:p-6">
          <p className="text-xs font-black tracking-[0.16em] text-[#FFC400]">NEED MORE HELP?</p>
          <h2 className="mt-2 text-xl font-black">まだ解決しない場合</h2>
          <p className="mt-2 text-sm leading-7 text-white/65">
            ご利用ガイドで操作の流れを確認するか、お問い合わせフォームからご連絡ください。
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/guide" className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-black text-[#0B1F3B]">
              ご利用ガイド <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/contact" className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/15 px-4 text-sm font-black text-white/85">
              お問い合わせ <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
