import Link from 'next/link'
import { ArrowRight, Building2, CalendarDays, ClipboardList, Search, UserRound } from 'lucide-react'
import PublicPageHero from '@/components/public/PublicPageHero'

export const metadata = {
  title: 'このサイトについて | 来店ナビ',
  description: '来店ナビのサービス内容、利用できる方、来店案件の基本的な流れについてご案内します。',
}

const audiences = [
  {
    icon: Search,
    title: '来店情報を探す方',
    text: '公開されている来店予定を、日付・地域・店舗・演者から探せます。会員登録をしなくても閲覧できます。',
    links: [
      ['/events', '来店情報を見る'],
      ['/areas', '地域から探す'],
      ['/stores', '店舗から探す'],
      ['/performers', '演者から探す'],
    ],
  },
  {
    icon: Building2,
    title: '店舗の方',
    text: '演者の検索、出演依頼、条件調整、見積確認、案件管理、来店情報の公開などを来店ナビ上で行えます。',
    links: [
      ['/service', 'サービス紹介を見る'],
      ['/guide', 'ご利用ガイドを見る'],
    ],
  },
  {
    icon: UserRound,
    title: '演者の方',
    text: 'プロフィールや出演可能日の登録、オファーの確認、見積書の提出、案件管理などを行えます。',
    links: [
      ['/service', 'サービス紹介を見る'],
      ['/guide', 'ご利用ガイドを見る'],
    ],
  },
]

const flow = [
  '店舗から演者へオファー',
  '条件を確認・相談',
  '演者が見積書を提出',
  '店舗が見積内容を承認',
  '締結書兼請求書を発行',
  '来店・支払い確認',
  '取引完了後にレビュー',
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#F7F9FC] pt-16 text-slate-950">
      <PublicPageHero
        eyebrow="ABOUT RAITEN NAVI"
        title="このサイトについて"
        description="来店ナビは、パチンコ店の来店予定を一般ユーザー向けに掲載するとともに、店舗と演者の間で行う出演依頼や見積、案件管理を支援するサービスです。"
      />

      <div className="mx-auto w-full max-w-[1120px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <section>
          <p className="text-xs font-black tracking-[0.16em] text-[#FF5A1F]">SERVICE</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">来店ナビでできること</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            来店ナビには、一般ユーザー向けの来店情報ページと、店舗・演者向けの業務機能があります。
            利用する目的に応じて、それぞれのページをご利用ください。
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {audiences.map((item) => {
              const Icon = item.icon
              return (
                <article
                  key={item.title}
                  className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,.04)] sm:p-6"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-[#C2410C]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-black text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.text}</p>
                  <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
                    {item.links.map(([href, label]) => (
                      <Link
                        key={href + label}
                        href={href}
                        className="flex items-center justify-between gap-3 text-sm font-bold text-slate-700 transition hover:text-[#C2410C]"
                      >
                        <span>{label}</span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" />
                      </Link>
                    ))}
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="mt-10 rounded-[24px] border border-slate-200 bg-white p-5 sm:p-7">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-[#0B1F3B]">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-black tracking-[0.16em] text-[#FF5A1F]">FLOW</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight">来店案件の基本的な流れ</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                店舗と演者の間では、以下の流れを基本として案件を進めます。
                条件の相談は、案件メッセージや電話などで行えます。
              </p>
            </div>
          </div>

          <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {flow.map((item, index) => (
              <li key={item} className="rounded-xl border border-slate-200 bg-[#FBFCFE] p-4">
                <span className="text-[11px] font-black text-[#FF5A1F]">STEP {index + 1}</span>
                <p className="mt-1 text-sm font-black leading-6 text-slate-800">{item}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-2">
          <article className="rounded-[22px] border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-[#C2410C]" />
              <h2 className="text-lg font-black">公開される来店情報について</h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              来店情報として公開された案件は、来店日、店舗名、演者名などを一般向けページに掲載します。
              来店予定は変更・中止になる場合があるため、お出かけ前には店舗や演者からの最新情報もあわせてご確認ください。
            </p>
          </article>

          <article className="rounded-[22px] border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="text-lg font-black">登録・利用について</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              来店情報の閲覧に会員登録は必要ありません。
              店舗・演者として案件の依頼や管理を行う場合は、それぞれのアカウント登録が必要です。
              詳しい操作方法はご利用ガイドをご確認ください。
            </p>
          </article>
        </section>

        <section className="mt-10 rounded-[22px] border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-black">お問い合わせ</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            サービスの利用方法、不具合、ご意見・ご要望については、お問い合わせフォームからご連絡ください。
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link
              href="/guide"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0B1F3B] px-4 text-sm font-black text-white hover:bg-[#132F53]"
            >
              ご利用ガイド <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/faq"
              className="inline-flex h-11 items-center rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              よくある質問
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-11 items-center rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              お問い合わせ
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
