import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const painPoints = [
  '営業しないと案件につながりにくい',
  '自分に合う案件が見つけづらい',
  '実績をうまく伝えられない',
  '条件確認ややり取りが煩雑',
  '単発で終わり、次につながりにくい',
  '活動履歴が積み上がらない',
]

const solutions = [
  '店舗に見つけてもらえる',
  'プロフィールで強みを伝えられる',
  '条件を整理してやり取りできる',
  '実績が積み上がる',
  '次の依頼につながりやすくなる',
]

const benefits = ['露出が増える', '営業負担が減る', '実績が残る', '信頼が積み上がる', '次の案件につながる']

const featureCards = [
  {
    label: 'プロフィール',
    title: '自分の強みを、きちんと伝える。',
    description: '活動領域・得意ジャンル・過去実績を整理して、初見でも伝わる状態をつくります。',
    image: '/images/point1.png',
    alt: 'プロフィールを整理するUIイメージ',
  },
  {
    label: 'オファー確認',
    title: '条件を整理して、迷わず進める。',
    description: '日程・報酬・条件をまとめて確認。認識違いを減らし、判断を早くできます。',
    image: '/images/point2.png',
    alt: 'オファー条件を確認するUIイメージ',
  },
  {
    label: '実績管理',
    title: '活動の履歴を、次の案件につなげる。',
    description: '毎回の活動を記録として残し、積み上がる信頼を次の機会に変えていけます。',
    image: '/images/point3.png',
    alt: '実績履歴を蓄積するUIイメージ',
  },
]

const steps = [
  '① プロフィールを登録',
  '② オファーを受け取る / 案件を確認する',
  '③ 条件を整理して進める',
  '④ 実施・実績を蓄積',
]

export default function TalentLandingPage() {
  return (
    <main className="bg-[#f6f5f2] pt-16 text-zinc-900">
      <section className="relative isolate overflow-hidden">
        <Image src="/images/hero-bg.png" alt="演者の活動現場イメージ" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-black/55" />

        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <div className="max-w-3xl text-white">
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">For Talents</p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-6xl">
              見つけてもらえる活動へ。
            </h1>
            <p className="mt-5 text-base leading-relaxed text-white/90 sm:text-xl">
              プロフィール、実績、やり取りを一つにまとめて、次の案件につながる導線をつくる。
            </p>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/85 sm:text-base sm:leading-8">
              Talentifyは、店舗と演者をつなぐ無料のマッチングサービスです。
              案件との出会いから条件確認、実績の蓄積まで、活動を続けるための基盤として使えます。
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/register?role=talent" className="inline-flex">
                <Button className="h-12 rounded-full bg-white px-8 text-sm font-semibold text-zinc-900 hover:bg-white/90 sm:h-14 sm:text-base">
                  無料で演者登録
                </Button>
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-white/90">
              <Link href="/" className="underline-offset-4 hover:underline">トップへ戻る</Link>
              <Link href="/store" className="underline-offset-4 hover:underline">店舗向け</Link>
              <Link href="/login" className="underline-offset-4 hover:underline">ログイン</Link>
              <Link href="/register?role=talent" className="underline-offset-4 hover:underline">無料登録</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">課題提示</p>
        <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">こんな悩みありませんか？</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {painPoints.map((item) => (
            <div key={item} className="border border-zinc-200 bg-white p-5 text-sm leading-7 sm:text-base">・{item}</div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto w-full max-w-6xl px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">解決</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">Talentifyなら、活動がつながる。</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {solutions.map((item) => (
              <div key={item} className="border border-zinc-200 bg-[#f7f7f5] p-5 text-sm leading-7 sm:text-base">・{item}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">ベネフィット</p>
        <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">活動の価値が、正しく積み上がる。</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {benefits.map((item) => (
            <div key={item} className="border-t-2 border-zinc-900 bg-white p-5 text-sm font-medium leading-7 sm:text-base">{item}</div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto w-full max-w-6xl px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">機能</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">必要な機能だけ、明確に。</h2>
          <div className="mt-10 space-y-10">
            {featureCards.map((feature) => (
              <div key={feature.label} className="grid gap-6 border border-zinc-200 p-4 sm:p-6 lg:grid-cols-[0.95fr_1.2fr] lg:items-center">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{feature.label}</p>
                  <h3 className="mt-3 text-2xl font-semibold sm:text-3xl">{feature.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-zinc-700 sm:text-base">{feature.description}</p>
                </div>
                <Image
                  src={feature.image}
                  alt={feature.alt}
                  width={1400}
                  height={900}
                  className="h-[220px] w-full border border-zinc-200 object-cover sm:h-[320px]"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">フロー</p>
        <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">使い方はシンプル</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step} className="border border-zinc-200 bg-white p-5 text-base font-medium leading-7">{step}</div>
          ))}
        </div>
      </section>

      <section className="bg-[#111111] py-16 text-white sm:py-24">
        <div className="mx-auto w-full max-w-6xl px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">信頼 / 将来性</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">活動を続けるほど、信頼は積み上がる。</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="border border-white/20 p-5">
              <p className="text-2xl font-semibold">活動基盤になる</p>
              <p className="mt-2 text-sm text-white/80">単発で終わらない導線をつくり、継続案件につながる状態へ。</p>
            </div>
            <div className="border border-white/20 p-5">
              <p className="text-2xl font-semibold">実績が資産になる</p>
              <p className="mt-2 text-sm text-white/80">プロフィールと履歴が残ることで、次の案件で選ばれやすくなります。</p>
            </div>
            <div className="border border-white/20 p-5">
              <p className="text-2xl font-semibold">見つけてもらえる</p>
              <p className="mt-2 text-sm text-white/80">営業だけに頼らず、継続的に機会へ届く導線を保てます。</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16 text-center sm:py-20">
        <h2 className="text-3xl font-semibold sm:text-4xl">まずは無料で始める。</h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-zinc-600 sm:text-base">
          プロフィールを整えるだけでも、次の案件につながる準備になります。
        </p>
        <Link href="/register?role=talent" className="mt-6 inline-flex">
          <Button className="h-12 rounded-full px-8 text-sm font-semibold sm:text-base">無料で演者登録</Button>
        </Link>
      </section>

      <section className="bg-zinc-950 px-6 py-20 text-white sm:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-semibold leading-tight sm:text-5xl">見つけてもらえる活動は、ここから始まる。</h2>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
            営業だけに頼らず、プロフィール・実績・信頼を積み上げる活動へ。
          </p>
          <Link href="/register?role=talent" className="mt-8 inline-flex">
            <Button className="h-12 rounded-full bg-white px-8 text-sm font-semibold text-zinc-900 hover:bg-white/90 sm:h-14 sm:text-base">
              無料で演者登録
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
