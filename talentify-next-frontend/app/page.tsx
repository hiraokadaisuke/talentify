export const dynamic = 'auto'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// 変更: Branch導線をCV重視のコピー + 3ベネフィット付きに再設計
const branchCards = [
  {
    eyebrow: 'For Stores',
    title: '店舗向け',
    description:
      '演者選定から依頼、当日の進行管理まで。店舗の運用を1つにまとめて、機会損失を減らします。',
    href: '/store',
    cta: '店舗向けページを見る',
    benefits: ['演者を探したい', '条件を整理して依頼したい', '管理をまとめたい'],
  },
  {
    eyebrow: 'For Talents',
    title: '演者向け',
    description:
      '案件との出会いを増やし、プロフィールと実績を蓄積。次の依頼につながる活動基盤をつくります。',
    href: '/register?role=talent',
    cta: '無料で演者登録',
    benefits: ['案件を増やしたい', '見つけてもらいたい', '実績を積みたい'],
  },
]

const featureItems = [
  {
    title: 'マッチング',
    description: '必要な相手に、すぐ届く。',
  },
  {
    title: 'オファー',
    description: '条件を整理して、依頼する。',
  },
  {
    title: '管理',
    description: 'やり取りを、一つに。',
  },
]

const faqItems = [
  {
    question: '利用料金はかかりますか？',
    answer:
      '店舗・演者ともに無料で登録できます。必要な情報を入力すれば、すぐに利用を開始できます。',
  },
  {
    question: 'どう始めればよいですか？',
    answer:
      '店舗または演者を選んで無料登録し、プロフィールを作成してください。登録後すぐにマッチングを始められます。',
  },
  {
    question: 'どんな方が利用できますか？',
    answer:
      '演者を探す店舗担当者さまと、案件を探す演者さまの双方にご利用いただけます。',
  },
  {
    question: '店舗・演者の両方で登録できますか？',
    answer:
      '可能です。用途に応じてアカウントを分けることで、導線と管理を最適化できます。',
  },
]

export default function HomePage() {
  return (
    <main className="bg-white text-zinc-900">
      {/* 変更: Heroを"何のサービスか / 誰向けか / 無料"が即伝わる構成へ */}
      <section className="relative isolate min-h-[92vh] overflow-hidden">
        <Image
          src="/images/hero-bg.png"
          alt="店舗と演者が活躍する現場のイメージ"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-x-0 top-8 z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 text-xs tracking-[0.2em] text-white/80 sm:text-sm">
          <p>TALENTIFY</p>
          <p>COMMON TOP LP</p>
        </div>

        <div className="relative z-10 mx-auto flex min-h-[92vh] w-full max-w-6xl items-end px-6 pb-12 pt-28 sm:pb-20">
          <div className="max-w-3xl text-white">
            <p className="mb-4 text-xs uppercase tracking-[0.28em] text-white/75 sm:text-sm">Editorial Platform for Real Performances</p>
            <h1 className="text-[2rem] font-semibold leading-tight sm:text-6xl sm:leading-[1.1]">
              才能が、
              <br />
              価値として届く。
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/95 sm:text-xl">
              来店・演者マッチングを、もっと自然に。
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/90 sm:text-lg sm:leading-8">
              Talentifyは、店舗と演者をつなぐ無料のマッチングサービスです。
              依頼条件の整理から連絡・実績管理まで、1つの流れで進められます。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/store">
                <Button className="h-12 w-full rounded-full bg-white px-8 text-sm font-semibold text-zinc-900 hover:bg-white/90 sm:w-auto">
                  店舗向けページを見る
                </Button>
              </Link>
              <Link href="/register?role=talent">
                <Button
                  variant="outline"
                  className="h-12 w-full rounded-full border-white/70 bg-transparent px-8 text-sm font-semibold text-white hover:bg-white/10 sm:w-auto"
                >
                  無料で演者登録
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 変更: 抽象コピー + 意味が伝わる一文をセット化 */}
      <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
        <p className="max-w-4xl text-2xl font-medium leading-relaxed text-zinc-900 sm:text-4xl sm:leading-tight">
          予定を埋めるためではなく、
          <br className="hidden sm:block" />
          ブランドを育てるための出会いを。
        </p>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-zinc-700 sm:text-base sm:leading-8">
          店舗は求める演者に出会いやすく、演者は自分に合う案件を見つけやすく。
          それぞれの成果につながる導線を整えます。
        </p>
      </section>

      {/* 変更: イラスト感を抑え、写真主導のトーンへ寄せる */}
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
            <p className="mt-6 text-sm leading-7 text-zinc-700 sm:text-base sm:leading-8">
              断片的な連絡、属人的な判断、積み上がらない実績。
              <br />
              Talentifyは、来店・演者マッチングの摩擦を減らし、依頼の質とスピードを同時に高めます。
            </p>
          </div>
        </div>
      </section>

      {/* 変更: Valueセクションも"伝わる一文"を明確化 */}
      <section className="mx-auto w-full max-w-6xl space-y-20 px-6 py-20 sm:space-y-28 sm:py-28">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="border-t border-zinc-300 pt-5">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">For Stores</p>
            <h3 className="mt-3 text-2xl font-semibold sm:text-4xl">選びたい演者に、迷わず届く。</h3>
            <p className="mt-4 text-sm leading-7 text-zinc-700 sm:text-base sm:leading-8">
              条件整理、依頼、進行確認を分断せずに管理。
              <br />
              担当者の経験だけに頼らない、再現性ある運用が可能になります。
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
            <h3 className="mt-3 text-2xl font-semibold sm:text-4xl">活動の価値が、次の案件につながる。</h3>
            <p className="mt-4 text-sm leading-7 text-zinc-700 sm:text-base sm:leading-8">
              条件確認からやり取りまでを見える化し、機会損失を抑える。
              <br />
              目の前の出演だけでなく、実績を積み上げる動線をつくれます。
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
          <p className="text-sm leading-7 text-zinc-200 sm:text-base sm:leading-8">
            誰が、いつ、何を、どこまで合意したのか。
            <br />
            日々のコミュニケーションを構造化し、案件品質を高め続けられる状態をつくります。
          </p>
        </div>
      </section>

      {/* 変更: Featureを1機能=1メッセージに短文化 + UIスクショ主役化 */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-28">
        <div className="mb-10 max-w-3xl border-t border-zinc-300 pt-5 sm:mb-14">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Feature Highlights</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">必要な機能だけを、迷わず使える形で。</h2>
          <p className="mt-4 text-sm leading-7 text-zinc-700 sm:text-base sm:leading-8">
            現場の判断を止めないために、必要な情報を必要な順番で見える化しています。
          </p>
        </div>
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.25fr] lg:items-start">
          <div className="space-y-7">
            {featureItems.map((item) => (
              <div key={item.title} className="border-b border-zinc-200 pb-5">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{item.title}</p>
                <p className="mt-2 text-lg font-medium leading-relaxed text-zinc-900">{item.description}</p>
              </div>
            ))}
          </div>
          <div className="overflow-hidden border border-zinc-200 bg-[#f8f8f7] p-4 sm:p-7">
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-zinc-500">UI Preview</p>
            <Image
              src="/images/point2.png"
              alt="TalentifyのUIイメージ"
              width={1600}
              height={1100}
              className="h-[260px] w-full border border-zinc-200 object-cover sm:h-[430px]"
            />
            <p className="mt-4 text-xs leading-relaxed text-zinc-600">
              ※ 本番では実際の管理画面スクリーンショットに差し替えることで、さらにCV向上を狙えます。
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
            マッチング精度は高くなる。
          </h2>
          <p className="mt-6 max-w-3xl text-sm leading-7 text-zinc-700 sm:text-base sm:leading-8">
            店舗と演者の接点が重なるほど、適切な依頼と透明な取引が育ちます。
            <br />
            Talentifyは、単発の募集ではなく、継続的な成果につながる基盤として機能します。
          </p>
        </div>
      </section>

      {/* 変更: Branchをコントラスト強化し、押す理由(3ベネフィット)を明示 */}
      <section className="bg-zinc-950 py-20 text-white sm:py-28" id="branch">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="mb-10 sm:mb-12">
            <p className="text-xs uppercase tracking-[0.24em] text-white/60">Choose Your Path</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">あなたに合う登録方法を選ぶ。</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/80 sm:text-base sm:leading-8">
              目的に合わせた導線を選ぶことで、登録後すぐにアクションを始められます。
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {branchCards.map((card) => (
              <article key={card.title} className="border border-white/15 bg-white/[0.06] p-7 backdrop-blur-sm transition hover:border-white/35 sm:p-9">
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

      <section className="bg-[#faf9f7] py-20 sm:py-24">
        <div className="mx-auto w-full max-w-5xl px-6">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">FAQ</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">よくある質問</h2>
          <div className="mt-10 space-y-4">
            {faqItems.map((item) => (
              <details key={item.question} className="border border-zinc-200 bg-white px-5 py-4 open:bg-zinc-50 sm:px-7">
                <summary className="cursor-pointer list-none text-base font-medium">{item.question}</summary>
                <p className="mt-3 text-sm leading-7 text-zinc-700 sm:leading-8">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 変更: 最下部CTAを大型化し、視線集中 + 無料登録訴求へ */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-28">
        <div className="border border-zinc-200 bg-white px-6 py-12 text-center sm:px-12 sm:py-16">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Final CTA</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">次の出会いは、ここから始まる。</h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-zinc-700 sm:text-base sm:leading-8">
            店舗も演者も、まずは無料で登録。
            <br />
            マッチングから管理まで、Talentifyで一貫して進められます。
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <Link href="/register?role=store">
              <Button className="h-14 w-full rounded-full bg-zinc-900 px-10 text-base font-semibold text-white hover:bg-zinc-800 sm:w-auto">
                無料で店舗登録
              </Button>
            </Link>
            <Link href="/register?role=talent">
              <Button variant="outline" className="h-14 w-full rounded-full border-zinc-400 px-10 text-base font-semibold text-zinc-900 hover:bg-zinc-100 sm:w-auto">
                無料で演者登録
              </Button>
            </Link>
          </div>
          <div className="mt-5 flex flex-col items-center gap-2 text-sm sm:flex-row sm:justify-center sm:gap-4">
            <Link href="/store" className="text-zinc-700 underline-offset-4 hover:underline">
              まず店舗向けページを見る
            </Link>
            <Link href="/register?role=talent" className="text-zinc-700 underline-offset-4 hover:underline">
              まず演者向けページを見る
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
