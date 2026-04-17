export const dynamic = 'auto'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const branchCards = [
  {
    eyebrow: 'For Stores',
    title: '店舗向け',
    description: '来店演者を探し、条件を整理して依頼し、運用まで一元管理したい方向けです。',
    href: '/store',
    cta: '店舗向けページを見る',
    benefits: ['演者を探したい', '条件を整理して依頼したい', '管理をまとめたい'],
  },
  {
    eyebrow: 'For Talents',
    title: '演者向け',
    description: '案件との出会いを増やし、実績を積み上げて次の依頼につなげたい方向けです。',
    href: '/talent',
    cta: '演者向けページを見る',
    benefits: ['見つけてもらいたい', '実績を積み上げたい', '次の案件につなげたい'],
  },
]

const featureItems = [
  {
    title: 'マッチング',
    description: '店舗と演者を、条件ベースでつなぐ。',
  },
  {
    title: 'オファー',
    description: '依頼の条件を整理し、認識ずれを減らす。',
  },
  {
    title: '履歴管理',
    description: 'やり取りと実績を残し、次の判断に活かす。',
  },
]

const lpImages = {
  heroMain: '/images/hero-bg.png',
  concept: '/images/hero-bg.png',
  matchingOverview: '/images/point1.png',
}

export default function HomePage() {
  return (
    <main className="bg-white pt-16 text-zinc-900">
      <section className="relative isolate min-h-[72vh] overflow-hidden">
        <Image src={lpImages.heroMain} alt="店舗と演者が活躍する現場イメージ" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-black/55" />

        <div className="relative mx-auto flex min-h-[72vh] w-full max-w-6xl items-end px-6 pb-12 pt-24 sm:pb-20 sm:pt-28">
          <div className="max-w-3xl text-white">
            <p className="text-xs uppercase tracking-[0.24em] text-white/70">Talentify Brand Top</p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-6xl sm:leading-[1.1]">
              店舗と演者をつなぐ。
              <br />
              次の一歩を、ここで選ぶ。
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/90 sm:text-lg sm:leading-8">
              Talentifyは、来店演者マッチングのためのサービスです。まずはあなたの立場に合うページから進んでください。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/store">
                <Button className="h-12 w-full rounded-full bg-white px-8 text-sm font-semibold text-zinc-900 hover:bg-white/90 sm:w-auto">
                  店舗向けページを見る
                </Button>
              </Link>
              <Link href="/talent">
                <Button
                  variant="outline"
                  className="h-12 w-full rounded-full border-white/70 bg-transparent px-8 text-sm font-semibold text-white hover:bg-white/10 sm:w-auto"
                >
                  演者向けページを見る
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-20">
        <p className="max-w-4xl text-2xl font-semibold leading-tight sm:text-4xl">ブランドの思想はシンプル。良い出会いを、再現できる仕組みにする。</p>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-zinc-700 sm:text-base sm:leading-8">
          店舗は依頼しやすく、演者は選ばれやすく。Talentifyは、双方の成果につながる導線を整えます。
        </p>
        <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 sm:p-4">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
            <Image src={lpImages.concept} alt="ブランドコンセプトを表すイメージ" fill className="object-cover" />
          </div>
        </div>
      </section>

      <section className="bg-[#f8f7f4] py-16 sm:py-20">
        <div className="mx-auto w-full max-w-6xl px-6">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Feature Highlights</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">必要な価値だけ、短く伝える。</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {featureItems.map((item) => (
              <article key={item.title} className="border border-zinc-200 bg-white p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{item.title}</p>
                <p className="mt-3 text-sm leading-7 text-zinc-700 sm:text-base">{item.description}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 sm:p-4">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
              <Image src={lpImages.matchingOverview} alt="マッチングの概要イメージ" fill className="object-contain p-3 sm:p-4" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-zinc-950 py-20 text-white sm:py-24" id="branch">
        <div className="mx-auto w-full max-w-6xl px-6">
          <p className="text-xs uppercase tracking-[0.24em] text-white/60">Branch</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">どちらに進むかを、ここで決める。</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/80 sm:text-base sm:leading-8">
            詳しい説明は各ページにまとめています。あなたに合う入口から進んでください。
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {branchCards.map((card) => (
              <article key={card.title} className="border border-white/15 bg-white/[0.06] p-7 backdrop-blur-sm sm:p-9">
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">{card.eyebrow}</p>
                <h3 className="mt-3 text-2xl font-semibold">{card.title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/85">{card.description}</p>
                <ul className="mt-5 space-y-2 text-sm text-white/90">
                  {card.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2">
                      <span aria-hidden className="mt-1 text-[10px] text-white/60">●</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Link href={card.href} className="mt-6 inline-block">
                  <Button className="h-11 rounded-full bg-white px-6 text-sm font-semibold text-zinc-950 hover:bg-white/90">
                    {card.cta}
                  </Button>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-24">
        <div className="border border-zinc-200 bg-[#faf9f7] px-6 py-12 text-center sm:px-12 sm:py-14">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Final CTA</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">まずは自分に合うページから。</h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-zinc-700 sm:text-base sm:leading-8">
            詳しい使い方や登録の流れは、それぞれのページで確認できます。
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <Link href="/store">
              <Button className="h-12 w-full rounded-full bg-zinc-900 px-8 text-sm font-semibold text-white hover:bg-zinc-800 sm:w-auto">
                店舗向けページを見る
              </Button>
            </Link>
            <Link href="/talent">
              <Button variant="outline" className="h-12 w-full rounded-full border-zinc-400 px-8 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 sm:w-auto">
                演者向けページを見る
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
