import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const painPoints = [
  '誰に依頼すればいいかわからない',
  '毎回やり取りがバラバラ',
  '条件確認に時間がかかる',
  '履歴が残らない',
]

const solutions = [
  '演者を一覧で探せる',
  '条件を整理して依頼できる',
  'やり取りをまとめて管理できる',
  '履歴と実績が自動で残る',
]

const benefits = [
  {
    title: '依頼の手間が減る',
    description: '条件整理と連絡の流れが揃い、準備時間を短縮できます。',
  },
  {
    title: 'ミスが減る',
    description: '必要情報がまとまり、確認漏れや認識違いを防げます。',
  },
  {
    title: '再現性が生まれる',
    description: '案件履歴が残るため、担当が変わっても同じ品質で運用できます。',
  },
  {
    title: '成果につながる',
    description: '改善の判断材料が蓄積され、次の施策に活かせます。',
  },
]

const featureCards = [
  {
    label: 'マッチング',
    title: '最適な演者が見つかる',
    description: '条件に合う候補を一覧で比較。感覚ではなく情報で選べます。',
    image: '/images/point1.png',
    alt: '演者候補を比較するダミー画面',
  },
  {
    label: 'オファー',
    title: '条件を整理して依頼できる',
    description: '日程・予算・要件を整理して送信。確認の往復を減らせます。',
    image: '/images/point2.png',
    alt: '依頼条件をまとめるダミー画面',
  },
  {
    label: '管理',
    title: 'やり取りを一元化',
    description: '誰が何を合意したかを見える化。引き継ぎもスムーズです。',
    image: '/images/point3.png',
    alt: '案件管理のダミー画面',
  },
]

const lpImages = {
  heroMain: '/images/hero-bg.png',
  operation: '/images/hero-bg.png',
}

export default function StoreLandingPage() {
  return (
    <main className="bg-[#f5f4f1] text-zinc-900">
      <section className="relative isolate overflow-hidden">
        <Image
          src={lpImages.heroMain}
          alt="来店イベントの現場イメージ"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/38 to-black/18" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <div className="max-w-3xl text-white">
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">For Pachinko Stores</p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-6xl">
              来店演者の依頼を、
              <br />
              もっとスムーズに。
            </h1>
            <p className="mt-5 text-base leading-relaxed text-white/90 sm:text-xl">
              探す・依頼する・管理するまで、すべて一つに。
            </p>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/85 sm:text-base sm:leading-8">
              Talentifyは、店舗と演者をつなぐ無料のマッチングサービスです。
              依頼条件の整理からやり取り、実績管理まで一元化できます。
            </p>
            <Link href="/register?role=store" className="mt-8 inline-flex">
              <Button className="h-12 rounded-full bg-white px-8 text-sm font-semibold text-zinc-900 hover:bg-white/90 sm:h-14 sm:text-base">
                無料で店舗登録
              </Button>
            </Link>
            <div className="mt-4">
              <Link href="/" className="text-sm text-white/90 underline-offset-4 hover:underline">
                ブランドトップへ戻る
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">課題提示</p>
        <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">こんな悩みありませんか？</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {painPoints.map((item) => (
            <div key={item} className="border border-zinc-200 bg-white p-5 text-sm leading-7 sm:text-base">
              ・{item}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto w-full max-w-6xl px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">解決</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">Talentifyならすべて解決</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {solutions.map((item) => (
              <div key={item} className="border border-zinc-200 bg-[#f7f7f5] p-5 text-sm leading-7 sm:text-base">
                ・{item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">ベネフィット</p>
        <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">運用の質が変わる</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((item, index) => (
            <div
              key={item.title}
              className="rounded-xl border border-zinc-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-7"
            >
              <p className="text-xs font-semibold tracking-[0.16em] text-zinc-500">POINT {index + 1}</p>
              <p className="mt-3 text-lg font-semibold leading-8 text-zinc-900">{item.title}</p>
              <p className="mt-3 text-sm leading-7 text-zinc-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto w-full max-w-6xl px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">機能</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">必要な機能だけ、明確に。</h2>
          <div className="mt-10 space-y-10">
            {featureCards.map((feature) => (
              <div key={feature.label} className="grid gap-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:p-6 lg:grid-cols-[0.95fr_1.2fr] lg:items-center">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{feature.label}</p>
                  <h3 className="mt-3 text-2xl font-semibold sm:text-3xl">{feature.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-zinc-700 sm:text-base">{feature.description}</p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-2 sm:p-3">
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                    <Image src={feature.image} alt={feature.alt} fill className="object-contain p-3 sm:p-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">フロー</p>
        <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">使い方はシンプル</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {['① 演者を探す', '② 条件を決めてオファー', '③ 成約・実施'].map((step) => (
            <div key={step} className="border border-zinc-200 bg-white p-5 text-base font-medium leading-7">
              {step}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#111111] py-16 text-white sm:py-24">
        <div className="mx-auto w-full max-w-6xl px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">信頼</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">導入の不安を、数字と運用で解消。</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="border border-white/20 p-5">
              <p className="text-3xl font-semibold">導入相談 無料</p>
              <p className="mt-2 text-sm text-white/80">初期費用0円。まずは運用に合うか確認できます。</p>
            </div>
            <div className="border border-white/20 p-5">
              <p className="text-3xl font-semibold">履歴を蓄積</p>
              <p className="mt-2 text-sm text-white/80">案件ごとの条件・評価が残るため、次回判断が早くなります。</p>
            </div>
            <div className="border border-white/20 p-5">
              <p className="text-3xl font-semibold">運用基盤化</p>
              <p className="mt-2 text-sm text-white/80">担当者変更があっても、同じ品質で依頼を継続できます。</p>
            </div>
          </div>
          <div className="mt-6 rounded-2xl border border-white/20 bg-white/5 p-3 sm:p-4">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-white/20 bg-zinc-900/60">
              <Image src={lpImages.operation} alt="店舗運用のイメージ写真" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-20 text-center sm:py-24">
        <p className="text-sm text-zinc-600">準備できた店舗から、成果の差が生まれています。</p>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-zinc-600 sm:text-base">
          まずは無料で始めて、運用の変化を確認できます。
        </p>
        <Link href="/register?role=store" className="mt-5 inline-flex">
          <Button className="h-[54px] rounded-full px-9 text-sm font-semibold sm:h-14 sm:px-10 sm:text-base">無料で店舗登録</Button>
        </Link>
      </section>

      <section className="bg-zinc-950 px-6 py-20 text-white sm:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-semibold leading-snug sm:text-5xl sm:leading-tight">
            今までのやり方を続けますか。
            <span className="block sm:inline sm:pl-2">それとも、もっと効率的な運用に変えますか。</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
            依頼の属人化を終わらせるなら、最初の一歩は登録です。無料ですぐに始められます。
          </p>
          <Link href="/register?role=store" className="mt-8 inline-flex">
            <Button className="h-12 rounded-full bg-white px-8 text-sm font-semibold text-zinc-900 hover:bg-white/90 sm:h-14 sm:text-base">
              無料で店舗登録
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
