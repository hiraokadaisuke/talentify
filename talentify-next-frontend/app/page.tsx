export const dynamic = 'auto'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const branchCards = [
  {
    eyebrow: 'For Stores',
    title: '店舗向けLPへ',
    description:
      '出稿計画から当日の運用まで。選定・依頼・履歴管理を、ひとつの流れに。',
    href: '/register?role=store',
    cta: '店舗の方はこちら',
  },
  {
    eyebrow: 'For Talents',
    title: '演者向けLPへ',
    description:
      '活動の価値を、正しく伝える。案件機会と実績を積み上げるための舞台へ。',
    href: '/register?role=talent',
    cta: '演者の方はこちら',
  },
]

const faqItems = [
  {
    question: '利用料金はかかりますか？',
    answer:
      '基本機能は無料で開始できます。詳細なプランや運用設計は、各LPでご案内しています。',
  },
  {
    question: 'どう始めればよいですか？',
    answer:
      'まずは店舗または演者として登録し、プロフィールを整えるだけで準備が始まります。',
  },
  {
    question: 'どんな方が利用できますか？',
    answer:
      '店舗の担当者さま、出演活動を行う演者さまの双方にご利用いただけます。',
  },
  {
    question: '店舗・演者の両方で登録できますか？',
    answer:
      '可能です。用途に応じてアカウントを分けることで、最適な導線を選択できます。',
  },
]

export default function HomePage() {
  return (
    <main className="bg-white text-zinc-900">
      {/* 想定画像（public/images/lp 配下に追加して差し替え）
        - hero-main.jpg
        - concept-scene.jpg
        - story-scene.jpg
        - atmosphere-1.jpg
        - atmosphere-2.jpg
        - ui-dashboard.jpg
      */}

      <section className="relative isolate min-h-[92vh] overflow-hidden">
        <Image
          src="/images/hero-bg.png"
          alt="店舗と演者が活躍する現場のイメージ"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-x-0 top-8 z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 text-xs tracking-[0.2em] text-white/80 sm:text-sm">
          <p>TALENTIFY</p>
          <p>COMMON TOP LP</p>
        </div>

        <div className="relative z-10 mx-auto flex min-h-[92vh] w-full max-w-6xl items-end px-6 pb-14 pt-28 sm:pb-20">
          <div className="max-w-3xl text-white">
            <p className="mb-4 text-xs uppercase tracking-[0.28em] text-white/75 sm:text-sm">Editorial Platform for Real Performances</p>
            <h1 className="text-4xl font-semibold leading-tight sm:text-6xl sm:leading-[1.1]">
              才能が、
              <br />
              価値として届く。
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-lg">
              Talentifyは、店舗と演者を結び、依頼から実績までをなめらかにつなぐマッチング基盤です。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/register?role=store">
                <Button className="h-12 rounded-full border border-white/30 bg-white px-8 text-sm text-zinc-900 hover:bg-white/90">
                  店舗の方はこちら
                </Button>
              </Link>
              <Link href="/register?role=talent">
                <Button
                  variant="outline"
                  className="h-12 rounded-full border-white/60 bg-transparent px-8 text-sm text-white hover:bg-white/10"
                >
                  演者の方はこちら
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
        <p className="max-w-4xl text-2xl font-medium leading-relaxed text-zinc-900 sm:text-4xl sm:leading-tight">
          予定を埋めるためではなく、
          <br className="hidden sm:block" />
          ブランドを育てるための出会いを。
        </p>
      </section>

      <section className="bg-[#f6f4ef] py-20 sm:py-28">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <Image
            src="/images/point1.png"
            alt="現場でのコミュニケーション"
            width={1400}
            height={1000}
            className="h-[340px] w-full object-cover sm:h-[460px]"
          />
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Concept</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl">非効率を、品位ある標準へ。</h2>
            <p className="mt-6 text-sm leading-loose text-zinc-700 sm:text-base">
              断片的な連絡、属人的な判断、積み上がらない実績。
              <br />
              Talentifyは、業界に残る“見えない摩擦”を減らし、店舗と演者の関係を次の時代の基盤へ整えます。
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl space-y-20 px-6 py-20 sm:space-y-28 sm:py-28">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="border-t border-zinc-300 pt-5">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">For Stores</p>
            <h3 className="mt-3 text-2xl font-semibold sm:text-4xl">選びたい人材に、迷わず届く。</h3>
            <p className="mt-4 text-sm leading-loose text-zinc-700 sm:text-base">
              依頼の条件整理、進行の可視化、履歴の蓄積。
              <br />
              担当者の経験値に頼らない、再現性ある運用を実現します。
            </p>
          </div>
          <Image
            src="/images/point2.png"
            alt="店舗側の価値を示すシーン"
            width={1400}
            height={1000}
            className="h-[280px] w-full object-cover sm:h-[380px]"
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
          <Image
            src="/images/point3.png"
            alt="演者側の価値を示すシーン"
            width={1400}
            height={1000}
            className="order-2 h-[280px] w-full object-cover sm:h-[380px] lg:order-1"
          />
          <div className="order-1 border-t border-zinc-300 pt-5 lg:order-2">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">For Talents</p>
            <h3 className="mt-3 text-2xl font-semibold sm:text-4xl">活動の価値が、正しく積み上がる。</h3>
            <p className="mt-4 text-sm leading-loose text-zinc-700 sm:text-base">
              条件の不透明さを減らし、交渉や調整の時間を最小化。
              <br />
              目の前の出演だけでなく、長期的な信頼と実績形成に集中できます。
            </p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-zinc-950 py-24 text-white sm:py-32">
        <Image
          src="/images/hero-bg.png"
          alt="夜の現場風景"
          fill
          className="object-cover opacity-30"
        />
        <div className="relative mx-auto grid w-full max-w-6xl gap-8 px-6 lg:grid-cols-[1fr_0.9fr] lg:items-end">
          <h2 className="text-3xl font-semibold leading-tight sm:text-5xl">曖昧なやり取りを、信頼の設計に変える。</h2>
          <p className="text-sm leading-loose text-zinc-200 sm:text-base">
            誰が、いつ、何を、どこまで合意したのか。
            <br />
            Talentifyは、日々のコミュニケーションを構造化し、案件ごとの品質を高め続けられる環境をつくります。
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-28">
        <div className="mb-10 max-w-3xl border-t border-zinc-300 pt-5 sm:mb-14">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Feature Highlights</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">必要な機能だけを、美しく。</h2>
        </div>
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <div className="space-y-7">
            {['Matching', 'Offer / Request', 'Condition Check', 'Schedule', 'Track Record'].map((item) => (
              <div key={item} className="border-b border-zinc-200 pb-5">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{item}</p>
                <p className="mt-2 text-sm text-zinc-700">
                  情報を散らさず、判断を速くするための基本動線を一体化。
                </p>
              </div>
            ))}
          </div>
          <div className="overflow-hidden border border-zinc-200 bg-[#f8f8f7] p-4 sm:p-7">
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-zinc-500">Product View</p>
            <Image
              src="/images/point2.png"
              alt="TalentifyのUIイメージ"
              width={1600}
              height={1100}
              className="h-[260px] w-full border border-zinc-200 object-cover sm:h-[430px]"
            />
            <p className="mt-4 text-xs leading-relaxed text-zinc-600">
              ※ ここは将来的に `public/images/lp/ui-dashboard.jpg` などの実際のUIスクリーンショットへ差し替えを想定しています。
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f7f6] py-20 sm:py-28">
        <div className="mx-auto w-full max-w-6xl px-6">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Trust / Network</p>
          <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight sm:text-5xl">
            参加者が増えるほど、
            <br className="hidden sm:block" />
            プラットフォームは賢くなる。
          </h2>
          <p className="mt-6 max-w-3xl text-sm leading-loose text-zinc-700 sm:text-base">
            店舗と演者の接点が重なるほど、適切なマッチングと透明な取引が育つ。
            <br />
            Talentifyは、単発のツールではなく、信頼のネットワークとして機能します。
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-28" id="branch">
        <div className="mb-10 sm:mb-12">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Choose Your Path</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">次の一歩を、ここで選ぶ。</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {branchCards.map((card) => (
            <article key={card.title} className="group border border-zinc-200 bg-white p-7 transition hover:border-zinc-400 sm:p-9">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{card.eyebrow}</p>
              <h3 className="mt-3 text-2xl font-semibold">{card.title}</h3>
              <p className="mt-4 min-h-16 text-sm leading-loose text-zinc-700">{card.description}</p>
              <Link href={card.href} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-zinc-900">
                {card.cta}
                <span className="transition group-hover:translate-x-1">→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#faf9f7] py-20 sm:py-24">
        <div className="mx-auto w-full max-w-5xl px-6">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">FAQ</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">よくある質問</h2>
          <div className="mt-10 space-y-4">
            {faqItems.map((item) => (
              <details key={item.question} className="border border-zinc-200 bg-white px-5 py-4 open:bg-zinc-50 sm:px-7">
                <summary className="cursor-pointer list-none text-base font-medium">{item.question}</summary>
                <p className="mt-3 text-sm leading-loose text-zinc-700">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
        <div className="border border-zinc-200 bg-white p-8 text-center sm:p-14">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Final CTA</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">Talentifyに参加する。</h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-loose text-zinc-700 sm:text-base">
            店舗としての成長も、演者としての挑戦も。
            <br />
            次のステージへ進む準備は、ここから始まります。
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/register?role=store">
              <Button className="h-12 rounded-full bg-zinc-900 px-8 text-sm text-white hover:bg-zinc-800">店舗としてはじめる</Button>
            </Link>
            <Link href="/register?role=talent">
              <Button variant="outline" className="h-12 rounded-full border-zinc-400 px-8 text-sm text-zinc-900 hover:bg-zinc-100">
                演者としてはじめる
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
