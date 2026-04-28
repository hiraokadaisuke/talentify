export const dynamic = 'auto'

import Link from 'next/link'

const heroMiniCards = [
  {
    title: 'タレント管理・スケジュール',
    description: '来店・収録・イベントを一元管理！',
    accent: 'from-pink-500 to-fuchsia-500',
  },
  {
    title: 'ファンとのつながり強化',
    description: 'お知らせ・レポート・SNS連携で熱量UP！',
    accent: 'from-orange-400 to-amber-400',
  },
  {
    title: 'データで売上・集客を最大化',
    description: '分析で効果を可視化し、施策に活用！',
    accent: 'from-sky-400 to-blue-500',
  },
]

const featureCards = [
  {
    no: '01',
    title: 'タレント管理',
    description: 'プロフィール・出演履歴・スケジュールを一元管理',
    border: 'border-pink-400',
    badge: 'bg-pink-500',
  },
  {
    no: '02',
    title: 'スケジュール管理',
    description: '来店・収録・イベントの調整を簡単に',
    border: 'border-orange-400',
    badge: 'bg-orange-500',
  },
  {
    no: '03',
    title: 'ファンへのお知らせ配信',
    description: 'プッシュ通知・メールマガ・SNS連携で即時に届く',
    border: 'border-yellow-400',
    badge: 'bg-yellow-500 text-slate-900',
  },
  {
    no: '04',
    title: 'データ分析・レポート',
    description: '集客・稼働・ファン動向を可視化し、施策に活用',
    border: 'border-cyan-400',
    badge: 'bg-cyan-500',
  },
  {
    no: '05',
    title: '店舗ページ・特設ページ',
    description: 'イベント情報を魅力的に見せる専用ページを作成',
    border: 'border-violet-400',
    badge: 'bg-violet-500',
  },
]

const stakeholderItems = [
  {
    title: 'タレント',
    description: '個性が光るタレントが多数！',
    color: 'from-pink-400 to-fuchsia-500',
  },
  {
    title: '店舗',
    description: '魅力的なイベント・来店で集客！',
    color: 'from-orange-400 to-amber-500',
  },
  {
    title: 'ファン',
    description: '推しに会える！楽しい体験！',
    color: 'from-sky-400 to-blue-500',
  },
]

const ctaCards = [
  {
    title: '資料ダウンロード',
    subtitle: '3分でわかる！',
    href: '/contact?type=document',
    body: 'サービス資料をすぐチェック',
    className: 'bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 text-slate-900',
  },
  {
    title: '無料で相談してみる',
    subtitle: 'まずは気軽に',
    href: '/contact',
    body: '導入前の不安をまとめて解消',
    className: 'border-2 border-pink-400 bg-white text-pink-600',
  },
  {
    title: '店舗登録はこちら',
    subtitle: '店舗として始める',
    href: '/store/register',
    body: '簡単3ステップで登録完了！',
    className: 'bg-gradient-to-r from-orange-400 to-rose-500 text-white',
  },
  {
    title: 'タレント登録はこちら',
    subtitle: 'タレントとして始める',
    href: '/talent/register',
    body: '活動の場を広げよう！',
    className: 'bg-gradient-to-r from-sky-400 to-blue-600 text-white',
  },
]

function NeonParticle({ className }: { className: string }) {
  return <span aria-hidden className={`absolute rounded-full blur-2xl ${className}`} />
}

export default function HomePage() {
  return (
    <main className="relative overflow-hidden bg-[#06060e] pt-16 text-white">
      <div className="pointer-events-none absolute inset-0">
        <NeonParticle className="left-[-10%] top-20 h-56 w-56 bg-fuchsia-500/35" />
        <NeonParticle className="right-[-5%] top-40 h-64 w-64 bg-cyan-400/30" />
        <NeonParticle className="left-1/4 top-[42rem] h-72 w-72 bg-purple-500/25" />
        <NeonParticle className="bottom-32 right-1/4 h-72 w-72 bg-orange-500/20" />
      </div>

      <section className="sticky top-16 z-20 border-b border-white/10 bg-black/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-xl font-black italic tracking-tight">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 via-pink-500 to-blue-500 shadow-[0_0_22px_rgba(236,72,153,.7)]" />
            Talentify
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-semibold lg:flex">
            {[
              ['#top', 'TOP'],
              ['#about', 'Talentifyとは'],
              ['#features', '機能紹介'],
              ['#benefits', '導入メリット'],
              ['#pricing', '料金プラン'],
            ].map(([href, label]) => (
              <a key={href} href={href} className="text-white/85 transition hover:text-white">
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/contact?type=document" className="hidden rounded-full bg-blue-500 px-4 py-2 text-xs font-bold shadow-[0_0_18px_rgba(59,130,246,.6)] transition hover:bg-blue-400 sm:inline-block">
              資料ダウンロード
            </Link>
            <Link href="/contact" className="rounded-full bg-pink-500 px-4 py-2 text-xs font-bold shadow-[0_0_18px_rgba(236,72,153,.6)] transition hover:bg-pink-400 sm:text-sm">
              お問い合わせ
            </Link>
          </div>
        </div>
      </section>

      <section id="top" className="relative isolate overflow-hidden pb-16 pt-10 sm:pt-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(236,72,153,.30),transparent_35%),radial-gradient(circle_at_75%_15%,rgba(56,189,248,.28),transparent_38%),radial-gradient(circle_at_55%_65%,rgba(250,204,21,.16),transparent_45%),linear-gradient(180deg,#05050b_0%,#0b0a16_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[conic-gradient(from_180deg_at_50%_0%,rgba(255,255,255,.35),transparent_26%,rgba(255,0,153,.18),transparent_40%,rgba(59,130,246,.2),transparent_65%)] opacity-70" />

        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.2fr_.95fr] lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-pink-300">Talentify</p>
            <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight drop-shadow-[0_6px_26px_rgba(0,0,0,.7)] sm:text-6xl lg:text-7xl">
              お店も、ファンも、
              <br />
              もっと
              <span className="inline-block -rotate-2 bg-gradient-to-r from-pink-500 via-orange-400 to-yellow-300 bg-clip-text pl-1 text-transparent [text-shadow:0_0_35px_rgba(255,90,120,.5)]">
                熱狂！
              </span>
            </h1>
            <p className="mt-5 text-lg font-semibold leading-relaxed text-white/90 sm:text-2xl">
              タレント × <span className="text-pink-400">店舗</span> × ファンをつなぐ
              <br />
              エンタメ<span className="text-pink-400">特化</span>型プラットフォーム
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {heroMiniCards.map((card) => (
                <article key={card.title} className="rounded-3xl border border-white/80 bg-white p-4 text-slate-900 shadow-[0_10px_32px_rgba(0,0,0,.35)]">
                  <div className={`mb-3 h-1.5 rounded-full bg-gradient-to-r ${card.accent}`} />
                  <p className="text-sm font-black">{card.title}</p>
                  <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-700">{card.description}</p>
                </article>
              ))}
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Link href="/contact?type=document" className="rounded-full bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-500 px-6 py-4 text-center text-lg font-black text-slate-900 shadow-[0_10px_30px_rgba(250,204,21,.45)] transition hover:scale-[1.02]">
                ⬇ 資料ダウンロード
              </Link>
              <Link href="/contact" className="rounded-full border-2 border-pink-400 bg-white px-6 py-4 text-center text-lg font-black text-pink-600 shadow-[0_10px_30px_rgba(236,72,153,.3)] transition hover:scale-[1.02]">
                💬 無料で相談してみる
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -left-6 -top-6 h-28 w-28 rounded-full bg-fuchsia-500/40 blur-2xl" />
            <div className="absolute -bottom-6 right-0 h-28 w-28 rounded-full bg-cyan-400/35 blur-2xl" />

            <div className="relative overflow-hidden rounded-[2.2rem] border border-white/20 bg-gradient-to-br from-fuchsia-900/70 via-indigo-900/60 to-slate-900 p-6 shadow-[0_18px_48px_rgba(0,0,0,.45)]">
              <div
                className="absolute inset-0 opacity-60"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 15% 20%, rgba(255,255,255,.25) 0%, transparent 35%), url('/images/lp/talentify/hero-stage-bg.png')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div className="relative">
                <p className="inline-block rounded-full bg-pink-500 px-4 py-1 text-sm font-black">本日来店！</p>
                <div className="mt-3 rounded-3xl border border-white/20 bg-gradient-to-br from-pink-500/30 to-blue-500/25 p-4">
                  <div
                    className="flex h-64 items-end justify-center rounded-2xl border border-white/20 bg-gradient-to-b from-white/20 to-white/5"
                    style={{ backgroundImage: "url('/images/lp/talentify/hero-cast.png')", backgroundPosition: 'center top', backgroundSize: 'cover' }}
                  >
                    <span className="mb-3 rounded-full bg-black/50 px-3 py-1 text-xs font-bold">演者ビジュアル（差し替え可）</span>
                  </div>
                </div>

                <div className="absolute -bottom-4 -right-3 w-56 rotate-[9deg] rounded-[2rem] border border-white/20 bg-[#0b0b14] p-4 shadow-2xl">
                  <p className="text-center text-4xl font-black text-pink-400">本日来店!</p>
                  <div className="mt-2 space-y-2">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="h-9 rounded-lg bg-white/10" />
                    ))}
                  </div>
                </div>

                <div className="absolute -right-6 top-24 rounded-full bg-yellow-300 px-4 py-5 text-center text-sm font-black text-slate-900 shadow-[0_10px_25px_rgba(250,204,21,.45)]">
                  ファンが集まり、
                  <br />
                  賑わいが続く
                  <br />
                  お店へ！
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="relative overflow-hidden border-y border-white/10 py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(236,72,153,.23),transparent_35%),radial-gradient(circle_at_5%_70%,rgba(56,189,248,.20),transparent_40%),linear-gradient(180deg,#100926_0%,#0b0818_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-12 bg-[repeating-radial-gradient(circle_at_bottom,rgba(255,255,255,.28)_0_3px,transparent_3px_16px)] opacity-20" />

        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.15fr_.95fr] lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-bold tracking-[0.16em] text-pink-300">ABOUT TALENTIFY</p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">
              エンタメの力で、
              <br />
              お店に“また来たい”をつくる。
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-white/90 sm:text-base">
              Talentifyは、タレントの来店・イベント・収録などの情報を一元管理し、
              ファンにリアルタイムで届けることで、お店の集客・稼働を最大化する
              エンタメ特化型プラットフォームです。
            </p>
          </div>

          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              {stakeholderItems.map((item, index) => (
                <div key={item.title} className="relative flex flex-1 flex-col items-center text-center">
                  {index < stakeholderItems.length - 1 && (
                    <span className="absolute left-[58%] top-12 hidden h-0.5 w-[90%] bg-gradient-to-r from-pink-300 to-cyan-300 sm:block" />
                  )}
                  <div className={`flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${item.color} p-1 shadow-[0_0_25px_rgba(255,255,255,.18)]`}>
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0a0818] text-lg font-black">{item.title}</div>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-white/90">{item.description}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 rotate-[-4deg] text-center text-2xl font-black text-transparent bg-gradient-to-r from-pink-400 via-yellow-300 to-blue-400 bg-clip-text sm:text-3xl">
              三方よしのエンタメエコシステムを実現！
            </p>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black tracking-tight sm:text-5xl">TALENTIFYの主な機能</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {featureCards.map((card) => (
            <article key={card.no} className={`rounded-3xl border-2 ${card.border} bg-white p-4 text-slate-900 shadow-[0_10px_28px_rgba(0,0,0,.28)]`}>
              <p className={`inline-flex rounded-full px-3 py-1 text-sm font-black text-white ${card.badge}`}>{card.no}</p>
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="h-2 w-1/2 rounded bg-slate-300" />
                <div className="mt-2 h-14 rounded bg-white" />
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <div className="h-6 rounded bg-slate-200" />
                  <div className="h-6 rounded bg-slate-200" />
                  <div className="h-6 rounded bg-slate-200" />
                </div>
              </div>
              <p className="mt-3 text-lg font-black">{card.title}</p>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-700">{card.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="benefits" className="relative mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-2">
          <article className="relative overflow-hidden rounded-[2rem] border border-pink-300/60 bg-white p-6 text-slate-900 shadow-[0_12px_35px_rgba(244,63,94,.25)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_20%,rgba(236,72,153,.15),transparent_35%)]" />
            <div className="relative">
              <p className="inline-block rounded-full bg-pink-500 px-4 py-1 text-sm font-black text-white">店舗担当者にとって</p>
              <h3 className="mt-4 text-4xl font-black leading-tight text-pink-600">集客・稼働UPで<br />売上最大化！</h3>
              <ul className="mt-5 space-y-2 text-sm font-semibold sm:text-base">
                <li>✓ タレント来店で集客力アップ</li>
                <li>✓ データに基づく施策で稼働向上</li>
                <li>✓ 業務効率化で運営コスト削減</li>
                <li>✓ レポートで効果を見える化</li>
              </ul>
              <div className="mt-5 rounded-2xl border-2 border-pink-200 bg-pink-50 p-4 font-bold">
                <p className="text-pink-500">導入店舗の声</p>
                来店イベントの集客が
                <br />
                <span className="text-3xl text-pink-600">1.6倍</span>になりました！
              </div>
              {/* 必要に応じて実数に差し替え */}
              <div className="absolute bottom-4 right-2 rounded-full bg-gradient-to-b from-yellow-300 to-orange-500 px-5 py-6 text-center font-black text-white shadow-lg sm:right-4">
                導入店舗数
                <br />
                <span className="text-4xl">300</span>店舗
                <br />
                突破！
              </div>
            </div>
          </article>

          <article className="relative overflow-hidden rounded-[2rem] border border-cyan-300/60 bg-white p-6 text-slate-900 shadow-[0_12px_35px_rgba(14,165,233,.25)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_18%,rgba(14,165,233,.18),transparent_35%)]" />
            <div className="relative">
              <p className="inline-block rounded-full bg-sky-500 px-4 py-1 text-sm font-black text-white">エンドユーザー（ファン）にとって</p>
              <h3 className="mt-4 text-4xl font-black leading-tight text-sky-600">推しに会える！<br />楽しいがいっぱい！</h3>
              <ul className="mt-5 space-y-2 text-sm font-semibold sm:text-base">
                <li>✓ 来店・イベント情報をすぐにキャッチ</li>
                <li>✓ 推しをフォローして最新情報を受け取り</li>
                <li>✓ 来店レポートや写真で一体感UP</li>
                <li>✓ ポイントや特典でさらに楽しい！</li>
              </ul>
              <div className="mt-5 rounded-2xl border-2 border-sky-200 bg-sky-50 p-4 font-bold">
                <p className="text-sky-600">ユーザーの声</p>
                推しに会えるから、
                <br />
                お店に行くのが楽しみ！
              </div>
              {/* 必要に応じて実数に差し替え */}
              <div className="absolute bottom-4 right-2 rounded-full bg-gradient-to-b from-cyan-400 to-blue-600 px-5 py-6 text-center font-black text-white shadow-lg sm:right-4">
                登録ユーザー
                <br />
                <span className="text-4xl">50,000</span>人
                <br />
                突破！
              </div>
            </div>
          </article>
        </div>
      </section>

      <section id="pricing" className="relative border-t border-white/10 py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(236,72,153,.25),transparent_40%),linear-gradient(180deg,#0b0a15_0%,#05050b_100%)]" />
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-black tracking-tight sm:text-5xl">さあ、Talentifyでお店をもっと盛り上げよう！</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {ctaCards.map((card) => (
              <Link key={card.title} href={card.href} className={`rounded-3xl p-5 shadow-[0_12px_28px_rgba(0,0,0,.35)] transition hover:scale-[1.02] ${card.className}`}>
                <p className="text-sm font-bold opacity-90">{card.subtitle}</p>
                <p className="mt-2 text-2xl font-black leading-tight">{card.title}</p>
                <p className="mt-3 text-sm font-semibold opacity-90">{card.body}</p>
              </Link>
            ))}
          </div>

          <div className="mt-10 rounded-[2rem] border border-white/20 bg-black/40 px-6 py-10 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-pink-300">Final CTA</p>
            <p className="mt-3 text-3xl font-black sm:text-5xl">熱狂が生まれる来店体験を、Talentifyで。</p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/contact?type=document" className="rounded-full bg-gradient-to-r from-yellow-300 to-orange-500 px-8 py-4 font-black text-slate-900">資料ダウンロード</Link>
              <Link href="/contact" className="rounded-full border-2 border-pink-400 bg-white px-8 py-4 font-black text-pink-600">無料で相談してみる</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
