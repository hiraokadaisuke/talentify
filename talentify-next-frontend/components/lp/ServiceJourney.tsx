import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Check, ChevronDown, MapPin } from 'lucide-react'

const workflowSteps = [
  { title: '演者を探す', detail: '地域や活動内容から検索' },
  { title: '日程・条件を確認', detail: '出演予定と条件を確認' },
  { title: 'オファー・締結', detail: '見積を承認して締結' },
  { title: '案件を管理', detail: '連絡・請求を一元管理' },
  { title: '来店情報を公開', detail: '店舗が公開日時を設定' },
  { title: '一般ユーザーが見る', detail: '日付や地域から探せる' },
]

// /events の日付タブ・地域フィルター・一覧カードをLP用に再構成。
// 実データや操作可能な画面と誤認しないよう、表示例として扱う。
function PublicEventsPreview() {
  return (
    <div className="raiten-journey-scene">
      <div className="raiten-journey-stage" aria-hidden="true">
        <Image src="/lp/hero/hero-stage.webp" alt="" fill sizes="(min-width: 1024px) 400px, 360px" />
      </div>
      <div className="raiten-events-phone" aria-hidden="true">
        <div className="raiten-events-speaker" />
        <div className="raiten-events-screen">
          <div className="raiten-events-brand">
            <Image src="/brand/raiten-navi-icon.svg" alt="" width={22} height={22} />
            <b>来店ナビ</b><span>来店情報</span>
          </div>
          <div className="raiten-events-heading">
            <span>RAITEN INFORMATION</span>
            <strong>今日は、誰が来る？</strong>
            <div className="raiten-events-tabs"><span>今日</span><span>明日</span><b>今週</b></div>
          </div>
          <div className="raiten-events-list">
            <div className="raiten-events-filter"><MapPin size={12} /><span>すべての地域</span><ChevronDown size={12} /></div>
            <div className="raiten-events-list-title"><b>今週の来店</b><span>表示サンプル</span></div>
            {['A', 'B', 'C'].map((label, index) => (
              <div className="raiten-event-example" key={label}>
                <div className="raiten-event-date"><b>10/{12 + index}</b><span>{['月', '火', '水'][index]}</span></div>
                <Image src={`/lp/people/performer-card-0${index + 1}.webp`} alt="" width={46} height={54} sizes="46px" />
                <div className="raiten-event-copy"><strong>演者 {label}</strong><span>サンプル店舗</span><small>兵庫県 · 時間非公開</small></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="raiten-journey-scene-caption">一般向け来店情報ページの表示イメージ</p>
    </div>
  )
}

export function ServiceWorkflow() {
  return (
    <section id="promotion" className="raiten-journey" aria-labelledby="raiten-journey-title">
      <Image src="/lp/backgrounds/neon-wave-bg.webp" alt="" fill sizes="100vw" className="raiten-journey-background" />
      <div className="raiten-journey-inner">
        <div className="raiten-journey-copy">
          <p className="raiten-journey-eyebrow">FROM OFFER TO PUBLIC</p>
          <h2 id="raiten-journey-title">確定した来店情報を、<br className="raiten-journey-mobile-break" />そのまま一般公開。</h2>
          <p className="raiten-journey-intro">店舗と演者のやり取りから、一般ユーザーが見る来店情報まで。<br />ひとつの流れでつながります。</p>
          <ol className="raiten-workflow">
            {workflowSteps.map((step, index) => (
              <li key={step.title} className="raiten-workflow-step">
                <div className="raiten-workflow-icon" aria-hidden="true">
                  <Image src="/lp/icons/workflow-icons.webp" alt="" width={960} height={320} sizes="600px" style={{ left: `${-index * 100}%` }} />
                </div>
                <div className="raiten-workflow-description">
                  <span className="raiten-workflow-number">STEP {String(index + 1).padStart(2, '0')}</span>
                  <h3>{step.title}</h3>
                  <p>{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link href="/events" className="raiten-journey-link">実際の来店情報を見る<ArrowRight size={16} /></Link>
        </div>
        <PublicEventsPreview />
      </div>
    </section>
  )
}

const audiences = [
  {
    role: 'store', eyebrow: '店舗担当者の方へ', title: <>依頼業務を、<br />もっとスムーズに。</>,
    image: '/lp/people/store-manager.webp',
    benefits: ['演者を探せる', '日程と条件を確認', 'オファーを送れる', '案件ごとの連絡を管理', '見積・請求をまとめて確認', '確定した来店情報を公開'],
    action: '店舗として無料登録',
  },
  {
    role: 'talent', eyebrow: '演者の方へ', title: <>活動と案件管理を、<br />ひとつに。</>,
    image: '/lp/people/performer-stage.webp',
    benefits: ['プロフィールを掲載', 'スケジュールを管理', '届いたオファーを確認', 'メッセージでやり取り', '見積・請求を作成', '確定した来店予定を発信'],
    action: '演者として無料登録',
  },
]

export function ServiceAudiences() {
  return (
    <section className="raiten-audiences" aria-label="店舗・演者それぞれの使い方">
      <div className="raiten-audiences-inner">
        {audiences.map(audience => (
          <article key={audience.role} id={`for-${audience.role}`} className={`raiten-audience raiten-audience-${audience.role}`} aria-labelledby={`raiten-${audience.role}-title`}>
            <header className="raiten-audience-heading">
              <p>{audience.eyebrow}</p>
              <h2 id={`raiten-${audience.role}-title`}>{audience.title}</h2>
            </header>
            <div className="raiten-audience-photo" aria-hidden="true">
              <div><Image src={audience.image} alt="" fill sizes="(min-width: 1280px) 240px, (min-width: 1024px) 190px, (min-width: 640px) 250px, 90vw" /></div>
            </div>
            <div className="raiten-audience-details">
              <ul>{audience.benefits.map(benefit => <li key={benefit}><Check size={12} aria-hidden="true" /><span>{benefit}</span></li>)}</ul>
              <Link className="raiten-audience-register" href={`/register?role=${audience.role}`}>{audience.action}<ArrowRight size={16} /></Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
