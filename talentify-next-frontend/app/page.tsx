export const dynamic = 'auto'

import Link from 'next/link'
import { FileText, MessageCircle, Building2, Mic } from "lucide-react";

const heroMiniCards = [
  {
    icon: "▦",
    title: "案件・スケジュール管理",
    description: "来店・収録・イベントを一元管理！",
    border: "border-pink-400",
    titleColor: "text-pink-600",
    color: "from-pink-400 to-fuchsia-500",
    softBg: "bg-pink-50/95",
  },
  {
    icon: "✹",
    title: "ファンとのつながり強化",
    description: "お知らせ・レポートで熱量UP！",
    border: "border-orange-400",
    titleColor: "text-orange-600",
    color: "from-orange-400 to-yellow-400",
    softBg: "bg-orange-50/95",
  },
  {
    icon: "▥",
    title: "データで売上・集客を最大化",
    description: "分析結果を、施策に活用！",
    border: "border-sky-400",
    titleColor: "text-sky-600",
    color: "from-sky-400 to-blue-500",
    softBg: "bg-sky-50/95",
  },
]

const featureCards = [
  {
    no: '01',
    title: 'タレント管理',
    description: 'プロフィール・出演履歴・スケジュールを一元管理',
    border: 'border-pink-400',
    badge: 'bg-pink-500',
    bg: 'bg-pink-50',
    mock: 'list',
  },
  {
    no: '02',
    title: 'スケジュール管理',
    description: '来店・収録・イベントの調整を簡単に',
    border: 'border-orange-400',
    badge: 'bg-orange-500',
    bg: 'bg-orange-50',
    mock: 'calendar',
  },
  {
    no: '03',
    title: 'ファンへのお知らせ配信',
    description: 'プッシュ通知・SNS連携で即時に届く',
    border: 'border-yellow-400',
    badge: 'bg-yellow-400 text-slate-900',
    bg: 'bg-yellow-50',
    mock: 'notify',
  },
  {
    no: '04',
    title: 'データ分析・レポート',
    description: '集客・稼働・ファン動向を可視化し、施策に活用',
    border: 'border-cyan-400',
    badge: 'bg-cyan-500',
    bg: 'bg-cyan-50',
    mock: 'chart',
  },
  {
    no: '05',
    title: '店舗ページ・特設ページ',
    description: 'イベント情報を魅力的に見せる専用ページを作成',
    border: 'border-violet-400',
    badge: 'bg-violet-500',
    bg: 'bg-violet-50',
    mock: 'special',
  },
]

const ctaCards = [
  {
    icon: '📄',
    title: '資料ダウンロード',
    subtitle: 'まずは3分でわかる！',
    href: '/contact?type=document',
    className: 'from-yellow-300 via-yellow-400 to-orange-400 text-slate-900',
  },
  {
    icon: '💬',
    title: '無料で相談してみる',
    subtitle: '導入のご相談はこちら',
    href: '/contact',
    className: 'from-white to-white text-pink-600 border-2 border-pink-400',
  },
  {
    icon: '🏢',
    title: '店舗登録はこちら',
    subtitle: '店舗として始める',
    href: '/store/register',
    className: 'from-orange-400 to-rose-500 text-white',
  },
  {
    icon: '🎤',
    title: 'タレント登録はこちら',
    subtitle: 'タレントとして始める',
    href: '/talent/register',
    className: 'from-sky-400 to-blue-600 text-white',
  },
]

function FeatureMock({ type }: { type: string }) {
  if (type === 'calendar') {
    return (
      <div className="rounded-xl bg-white/75 p-3 shadow-inner">
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 14 }).map((_, i) => (
            <span key={i} className={`h-3 rounded ${i % 5 === 0 ? 'bg-orange-300' : 'bg-slate-200'}`} />
          ))}
        </div>
        <div className="mt-2 h-6 rounded-lg bg-orange-100" />
      </div>
    )
  }

  if (type === 'notify') {
    return (
      <div className="rounded-xl bg-white/75 p-3 shadow-inner">
        <div className="h-4 w-2/3 rounded bg-yellow-300" />
        <div className="mt-2 space-y-2">
          <div className="h-5 rounded bg-pink-100" />
          <div className="h-5 rounded bg-sky-100" />
        </div>
      </div>
    )
  }

  if (type === 'chart') {
    return (
      <div className="rounded-xl bg-white/75 p-3 shadow-inner">
        <div className="flex h-16 items-end gap-2">
          {[34, 58, 45, 76, 88].map((h, i) => (
            <span key={i} className="w-full rounded-t bg-cyan-300" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    )
  }

  if (type === 'special') {
    return (
      <div className="rounded-xl bg-white/75 p-3 shadow-inner">
        <div className="h-8 rounded-lg bg-gradient-to-r from-pink-400 to-violet-500" />
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="h-7 rounded bg-violet-100" />
          <div className="h-7 rounded bg-pink-100" />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-white/75 p-3 shadow-inner">
      <div className="h-4 w-1/2 rounded bg-pink-200" />
      <div className="mt-2 space-y-2">
        <div className="h-4 rounded bg-slate-200" />
        <div className="h-4 rounded bg-slate-200" />
        <div className="h-4 rounded bg-slate-200" />
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-[#05050d] text-white">
      {/* HEADER */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-xl">
  <div className="mx-auto flex h-[86px] max-w-[1500px] items-center justify-between px-6 lg:px-10">
    <Link href="#top" className="flex items-center gap-3">
      <img
        src="/images/lp/logo.png"
        alt="Talentify"
        className="h-12 w-auto"
      />
    </Link>

    <nav className="hidden items-center gap-8 text-sm font-black text-white lg:flex">
      <Link href="#top" className="hover:text-pink-300">TOP</Link>
      <Link href="#about" className="hover:text-pink-300">Talentifyとは</Link>
      <Link href="#features" className="hover:text-pink-300">機能紹介</Link>
      <Link href="#benefits" className="hover:text-pink-300">導入メリット</Link>
      <Link href="#pricing" className="hover:text-pink-300">料金プラン</Link>
    </nav>

    <div className="hidden items-center gap-4 lg:flex">
      <Link
        href="/contact?type=document"
        className="rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 px-7 py-4 text-sm font-black text-white shadow-[0_0_22px_rgba(14,165,233,.45)] transition hover:scale-105"
      >
        資料ダウンロード
      </Link>
      <Link
        href="/contact"
        className="rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-7 py-4 text-sm font-black text-white shadow-[0_0_22px_rgba(236,72,153,.45)] transition hover:scale-105"
      >
        お問い合わせ
      </Link>
    </div>
  </div>
</header>

      {/* HERO */}
      <section id="top" className="relative bg-black pt-[86px]">
        <div className="mx-auto w-full max-w-[1500px]">
          <img
            src="/images/lp/hero.png"
            alt="お店も、ファンも、もっと熱狂。Talentify"
            className="block h-auto w-full"
          />
        </div>

       {/* HERO内カード */}
<div className="absolute left-0 right-0 top-[72%] z-20 hidden pl-6 pr-6 lg:block">
  <div className="mx-auto max-w-[1500px]">
    <div className="max-w-[1060px]">
      <div className="grid grid-cols-3 gap-4">
        {heroMiniCards.map((card) => (
          <article
  key={card.title}
  className={`relative overflow-visible rounded-[22px] border-2 ${card.border} bg-white text-slate-900 shadow-[0_14px_32px_rgba(0,0,0,.45)]`}
>
  {/* 色付きヘッダー */}
  <div
    className={`relative rounded-t-[18px] bg-gradient-to-r ${card.color} py-3 pl-[72px] pr-4 text-white`}
  >
    {/* はみ出しアイコン */}
    <span
      className={`absolute -left-2 -top-3 grid h-16 w-16 place-items-center rounded-full border-[5px] ${card.border} bg-white text-3xl font-black ${card.titleColor} shadow-[0_8px_18px_rgba(0,0,0,.25)]`}
    >
      {card.icon}
    </span>

    <p className="text-lg font-black leading-tight text-white">
      {card.title}
    </p>
  </div>

  {/* 本文 */}
  <div className="flex min-h-[92px] items-center justify-center rounded-b-[20px] bg-white/95 px-5 py-5">
    <p className="text-center text-lg font-black leading-relaxed text-slate-900">
      {card.description}
    </p>
  </div>
</article>
        ))}
      </div>
    </div>
  </div>
</div>
</section>

{/* HEROカード：スマホ・タブレット用 */}
<section className="bg-black px-5 pb-4 pt-4 lg:hidden">
  <div className="grid gap-4 md:grid-cols-3">
    {heroMiniCards.map((card) => (
      <article
        key={card.title}
        className={`rounded-2xl border-2 ${card.border} bg-white p-4 text-slate-900 shadow-[0_16px_36px_rgba(0,0,0,.5)]`}
      >
        <div className="flex items-center gap-3">
          <span className={`grid h-10 w-10 place-items-center rounded-full bg-gradient-to-r ${card.color} text-xl font-black text-white`}>
            {card.icon}
          </span>
          <p className={`text-base font-black ${card.titleColor}`}>
            {card.title}
          </p>
        </div>
        <p className="mt-3 text-sm font-bold leading-relaxed text-slate-700">
          {card.description}
        </p>
      </article>
    ))}
  </div>
</section>

{/* HERO下CTA */}
<section className="relative z-30 -mt-24 bg-black px-5 pb-10 pt-0 lg:px-8">
  <div className="mx-auto max-w-[1500px]">
    <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-center gap-6 md:flex-row">
      <Link
        href="/contact?type=document"
        className="flex h-[82px] w-full max-w-[520px] items-center justify-center gap-5 rounded-full border-2 border-white bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 px-10 text-center font-black text-slate-900 shadow-[0_0_32px_rgba(250,204,21,.55)] transition hover:scale-[1.03]"
      >
        <span className="leading-tight">
          <span className="block text-base">＼3分でわかる！／</span>
          <span className="block text-2xl">資料ダウンロード</span>
        </span>
        <span className="text-4xl">⇩</span>
      </Link>

      <Link
        href="/contact"
        className="flex h-[82px] w-full max-w-[520px] items-center justify-center gap-5 rounded-full border-2 border-pink-400 bg-white px-10 text-center font-black text-pink-600 shadow-[0_0_30px_rgba(236,72,153,.45)] transition hover:scale-[1.03]"
      >
        <span className="text-2xl">無料で相談してみる</span>
        <span className="text-4xl">☏</span>
      </Link>
    </div>
  </div>
</section>

     {/* ABOUT + FEATURES */}
<section
  id="about"
  className="relative -mt-6 overflow-hidden bg-black px-5 pb-12 pt-6 lg:px-8"
>
  <div
    className="absolute inset-0 opacity-90"
    style={{
      backgroundImage: "url('/images/lp/about_bg.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center top',
    }}
  />
  <div className="absolute inset-0 bg-black/25" />

  <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10">
    {/* 上段 */}
    <div className="grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      {/* 左 */}
      <div className="max-w-[1060px] pt-2">
        <p className="text-sm font-black tracking-[0.22em] text-pink-400">
          ABOUT TALENTIFY
        </p>

        <h2 className="mt-4 text-[36px] font-black leading-[1.18] tracking-tight text-white sm:text-[44px] lg:text-[52px]">
  エンタメの力で、
  <br />
  <span className="whitespace-nowrap">
    お店に
    <span className="inline-block bg-gradient-to-r from-[#ffe14d] via-[#ff8a3c] to-[#ff4fa3] bg-clip-text text-transparent">
      “また来たい”
    </span>
    をつくる。
  </span>
</h2>

        <p className="mt-5 max-w-[700px] text-[20px] font-bold leading-[2] text-white">
          Talentifyは、タレントの来店・イベント・収録などの情報を一元管理し、
          ファンにリアルタイムで届けることで、お店の集客・稼働を最大化する
          エンタメ特化型プラットフォームです。
        </p>
      </div>

      {/* 右 */}
      <div className="flex items-start justify-center lg:justify-end">
        <img
          src="/images/lp/sanpou.png"
          alt="タレント・店舗・ファンをつなぐ三方よしのエンタメエコシステム"
          className="w-full max-w-[640px] drop-shadow-[0_0_30px_rgba(255,255,255,.18)]"
        />
      </div>
    </div>

    {/* 機能 */}
    <div id="features" className="mt-6">
  <div className="max-w-[720px]">
    <div className="flex items-center gap-3">
  <h2 className="whitespace-nowrap text-[30px] font-black tracking-tight text-white sm:text-[34px] lg:text-[38px]">
    TALENTIFYの主な機能
  </h2>
  <div className="h-[3px] flex-1 bg-gradient-to-r from-white/60 to-transparent" />
</div>
  </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {featureCards.map((card) => (
          <article
            key={card.no}
            className={`relative rounded-[22px] border-2 ${card.border} ${card.bg} p-4 pt-8 text-slate-900 shadow-[0_18px_42px_rgba(0,0,0,.45)] transition hover:-translate-y-1`}
          >
            <p
              className={`absolute -top-5 left-5 grid h-12 min-w-16 place-items-center rounded-2xl px-4 text-xl font-black text-white ${card.badge} shadow-[0_8px_18px_rgba(0,0,0,.25)]`}
            >
              {card.no}
            </p>

            <div className="overflow-hidden rounded-2xl bg-white p-2 shadow-inner">
              <div className="h-[120px] overflow-hidden rounded-xl bg-slate-100">
                <FeatureMock type={card.mock} />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span
                className={`grid h-7 w-7 place-items-center rounded-full text-xs font-black text-white ${card.badge}`}
              >
                {card.no}
              </span>
              <h3 className="text-[15px] font-black leading-tight">
                {card.title}
              </h3>
            </div>

            <p className="mt-3 text-sm font-bold leading-7 text-slate-800">
              {card.description}
            </p>
          </article>
        ))}
      </div>
    </div>
  </div>
</section>

      {/* BENEFITS */}
      <section
  id="benefits"
  className="relative -mt-2 bg-[#05050d] px-4 pb-10 pt-4 sm:px-6 lg:px-8"
>
  <div className="mx-auto max-w-[1500px]">
    <div className="grid gap-6 lg:grid-cols-2">
      <article className="relative min-h-[430px] overflow-hidden rounded-none bg-white text-slate-900 shadow-[0_18px_50px_rgba(236,72,153,.25)]">
        <div className="absolute left-0 top-0 z-30 h-14 w-[58%] bg-pink-500 [clip-path:polygon(0_0,100%_0,90%_100%,0_100%)]">
          <p className="pl-8 pt-4 text-sm font-black text-white">
            店舗担当者にとって
          </p>
        </div>

        <div className="absolute inset-y-0 right-0 w-[62%]">
          <img
            src="/images/lp/tentyou.png"
            alt="店舗担当者"
            className="h-full w-full object-cover object-center"
          />
        </div>

        <div className="absolute inset-y-0 right-[38%] z-10 w-[28%] bg-gradient-to-r from-white via-white/95 to-transparent" />

        <div className="relative z-20 w-[50%] px-8 pb-8 pt-20">
          <h3 className="text-4xl font-black leading-tight text-pink-600">
            集客・稼働UPで
            <br />
            売上最大化！
          </h3>

          <ul className="mt-5 space-y-2 text-sm font-bold leading-relaxed">
            <li>☑ タレント来店で集客力アップ</li>
            <li>☑ データに基づく施策で稼働向上</li>
            <li>☑ 業務効率化で運営コスト削減</li>
            <li>☑ レポートで効果を見える化</li>
          </ul>

          <div className="mt-6 rounded-2xl border-2 border-pink-200 bg-pink-50 p-4 text-sm font-black text-pink-600">
            導入店舗の声
            <br />
            <span className="text-2xl">来店イベントの集客が1.6倍に！</span>
          </div>
        </div>

        <div className="absolute bottom-8 right-8 z-30 grid h-32 w-32 place-items-center rounded-full bg-gradient-to-b from-yellow-300 to-orange-500 text-center text-lg font-black text-white shadow-[0_0_24px_rgba(251,146,60,.7)]">
          <span>
            導入店舗数
            <br />
            <b className="text-3xl">300</b>店舗
            <br />
            突破！
          </span>
        </div>
      </article>

      <article className="relative min-h-[430px] overflow-hidden rounded-none bg-white text-slate-900 shadow-[0_18px_50px_rgba(14,165,233,.25)]">
        <div className="absolute left-0 top-0 z-30 h-14 w-[62%] bg-sky-500 [clip-path:polygon(0_0,100%_0,90%_100%,0_100%)]">
          <p className="pl-8 pt-4 text-sm font-black text-white">
            エンドユーザー（ファン）にとって
          </p>
        </div>

        <div className="absolute inset-y-0 right-0 w-[62%]">
          <img
            src="/images/lp/talent.png"
            alt="ファンユーザー"
            className="h-full w-full object-cover object-center"
          />
        </div>

        <div className="absolute inset-y-0 right-[38%] z-10 w-[28%] bg-gradient-to-r from-white via-white/95 to-transparent" />

        <div className="relative z-20 w-[50%] px-8 pb-8 pt-20">
          <h3 className="text-4xl font-black leading-tight text-sky-600">
            推しに会える！
            <br />
            楽しいがいっぱい！
          </h3>

          <ul className="mt-5 space-y-2 text-sm font-bold leading-relaxed">
            <li>☑ 来店・イベント情報をすぐにキャッチ</li>
            <li>☑ 推しをフォローして最新情報を受け取り</li>
            <li>☑ 来店レポートや写真で一体感UP</li>
            <li>☑ ポイントや特典でさらに楽しい</li>
          </ul>

          <div className="mt-6 rounded-2xl border-2 border-sky-200 bg-sky-50 p-4 text-sm font-black text-sky-600">
            ユーザーの声
            <br />
            <span className="text-2xl">推しに会えるから、お店に行くのが楽しみ！</span>
          </div>
        </div>

        <div className="absolute bottom-8 right-8 z-30 grid h-32 w-32 place-items-center rounded-full bg-gradient-to-b from-cyan-400 to-blue-600 text-center text-lg font-black text-white shadow-[0_0_24px_rgba(14,165,233,.7)]">
          <span>
            登録ユーザー
            <br />
            <b className="text-3xl">50,000</b>人
            <br />
            突破！
          </span>
        </div>
      </article>
    </div>
  </div>
</section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-black px-5 py-14 lg:px-8">
  <div
    className="absolute inset-0 opacity-70"
    style={{
      backgroundImage: "url('/images/lp/about_bg.png')",
      backgroundSize: "cover",
      backgroundPosition: "center bottom",
    }}
  />
  <div className="absolute inset-0 bg-black/45" />

  <div className="relative mx-auto max-w-[1500px]">
    <h2 className="text-center text-[34px] font-black leading-tight text-white sm:text-[42px] lg:text-[52px]">
      さあ、<span className="italic">Talentify</span>でお店をもっと盛り上げよう！
    </h2>

    <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

      {/* 資料DL */}
      <Link
        href="/contact?type=document"
        className="group relative flex min-h-[150px] items-center justify-between overflow-hidden rounded-[2rem] border-2 border-white bg-gradient-to-r from-yellow-300 to-orange-400 px-7 py-6 text-slate-900 shadow-[0_0_28px_rgba(250,204,21,.45)] transition hover:-translate-y-1"
      >
        <div>
          <p className="text-sm font-black">＼まずは3分でわかる！／</p>
          <p className="mt-2 text-2xl font-black">資料ダウンロード</p>
        </div>

        <FileText className="absolute right-6 top-6 h-9 w-9 text-slate-900/80" />
      </Link>

      {/* 相談 */}
      <Link
        href="/contact"
        className="group relative flex min-h-[150px] items-center justify-between rounded-[2rem] border-2 border-pink-400 bg-white px-7 py-6 text-pink-600 shadow-[0_0_28px_rgba(236,72,153,.35)] transition hover:-translate-y-1"
      >
        <div>
          <p className="text-sm font-black">導入のご相談はこちら</p>
          <p className="mt-2 text-2xl font-black">無料で相談してみる</p>
        </div>

        <MessageCircle className="absolute right-6 top-6 h-9 w-9 text-pink-500/80" />
      </Link>

      {/* 店舗 */}
      <Link
        href="/register/store"
        className="group relative flex min-h-[150px] items-center justify-between rounded-[2rem] bg-gradient-to-r from-orange-400 to-rose-500 px-7 py-6 text-white shadow-[0_0_28px_rgba(249,115,22,.35)] transition hover:-translate-y-1"
      >
        <div>
          <p className="text-sm font-black">＼店舗として始める／</p>
          <p className="mt-2 text-2xl font-black">店舗登録はこちら</p>
          <p className="mt-3 border-t border-white/35 pt-2 text-sm font-bold">
            簡単3ステップで登録完了！
          </p>
        </div>

        <Building2 className="absolute right-6 top-6 h-9 w-9 text-white/90" />
      </Link>

      {/* タレント */}
      <Link
        href="/register/talent"
        className="group relative flex min-h-[150px] items-center justify-between rounded-[2rem] bg-gradient-to-r from-cyan-400 to-blue-600 px-7 py-6 text-white shadow-[0_0_28px_rgba(14,165,233,.35)] transition hover:-translate-y-1"
      >
        <div>
          <p className="text-sm font-black">＼タレントとして始める／</p>
          <p className="mt-2 text-2xl font-black">タレント登録はこちら</p>
          <p className="mt-3 border-t border-white/35 pt-2 text-sm font-bold">
            活動の場を広げよう！
          </p>
        </div>

        <Mic className="absolute right-6 top-6 h-9 w-9 text-white/90" />
      </Link>

    </div>
  </div>
</section>
    </main>
  )
}