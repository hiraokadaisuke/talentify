"use client"

import { useMemo, useState } from 'react'
import Link from 'next/link'
import FAQItem from '../../components/FAQItem'

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
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold tracking-[0.18em] text-[#FF5A1F]">FAQ</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">よくある質問</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          登録前の疑問から、オファー・見積・契約・メッセージ・支払いまで、利用中に迷いやすい内容をまとめています。
        </p>
      </header>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <input
          type="search"
          placeholder="例：見積修正、電話、キャンセル"
          value={query}
          onChange={event => setQuery(event.target.value)}
          className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#FF8A00] focus:ring-2 focus:ring-orange-100"
        />

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${
                category === cat
                  ? 'border-[#FF5A1F] bg-[#FF5A1F] text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <div className="mt-6 space-y-3">
        {filteredItems.map((item, index) => (
          <div key={`${item.group}-${item.question}`}>
            {(index === 0 || filteredItems[index - 1]?.group !== item.group) && (
              <h2 className="mb-2 mt-6 text-sm font-bold text-slate-500">{item.group}</h2>
            )}
            <FAQItem question={item.question} answer={item.answer} />
          </div>
        ))}
        {filteredItems.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-sm text-slate-600">該当する質問は見つかりませんでした。</p>
          </div>
        )}
      </div>

      <section className="mt-8 rounded-2xl border border-orange-200 bg-orange-50 p-5 text-sm leading-7 text-slate-800">
        <p className="font-semibold">まだ解決しない場合</p>
        <p className="mt-1">
          <Link href="/guide" className="font-semibold underline underline-offset-2">ご利用ガイド</Link>
          {' '}を確認するか、
          <Link href="/contact" className="font-semibold underline underline-offset-2">お問い合わせ</Link>
          からご連絡ください。
        </p>
      </section>
    </main>
  )
}
