import Image from 'next/image'
import { BadgeCheck, CalendarDays, Check, Search } from 'lucide-react'

/** Presentational HTML based on /search, /talent/schedule and the quotation flow. */
export function HeroScene() {
  return (
    <div className="raiten-hero-scene" aria-hidden="true">
      <span className="raiten-hero-wordmark">RAITEN NAVI</span>
      <div className="raiten-hero-stage">
        <Image src="/lp/hero/hero-stage.webp" alt="" fill sizes="(min-width: 1024px) 60vw, 100vw" />
      </div>
      <div className="raiten-hero-person">
        <Image
          src="/lp/people/performer-stage.webp"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 33vw, 65vw"
          className="object-cover object-top"
        />
      </div>

      <div className="raiten-hero-panel raiten-hero-search">
        <div className="raiten-preview-heading"><Search size={14} /><span>演者を探す</span></div>
        <div className="raiten-preview-filters"><span>活動エリア</span><span>ジャンル</span></div>
        <div className="raiten-preview-talents">
          {[1, 2, 3].map((index) => (
            <div className="raiten-preview-talent" key={index}>
              <Image src={`/lp/people/performer-card-0${index}.webp`} alt="" width={120} height={120} sizes="80px" />
              <strong>演者 {String.fromCharCode(64 + index)}</strong>
              <span>プロフィールを見る</span>
            </div>
          ))}
        </div>
        <p className="raiten-preview-caption">条件に合う演者を検索</p>
      </div>

      <div className="raiten-hero-panel raiten-hero-calendar">
        <div className="raiten-preview-heading"><CalendarDays size={13} /><span>出演スケジュール</span></div>
        <div className="raiten-preview-calendar">
          {['日', '月', '火', '水', '木', '金', '土'].map((day) => <b key={day}>{day}</b>)}
          {Array.from({ length: 21 }, (_, index) => (
            <span key={index} className={index === 17 ? 'unavailable' : index === 11 ? 'booked' : ''}>{index + 1}</span>
          ))}
        </div>
        <div className="raiten-preview-legend"><span>受付可能</span><span>来店予定あり</span><span>不可</span></div>
      </div>

      <div className="raiten-hero-panel raiten-hero-quotation">
        <div className="raiten-preview-heading"><BadgeCheck size={14} /><span>見積書の確認</span></div>
        <p>来店イベントの条件を確認</p>
        <div className="raiten-preview-condition"><span>日程・来店料</span><Check size={12} /></div>
        <div className="raiten-preview-condition"><span>交通費・依頼内容</span><Check size={12} /></div>
        <div className="raiten-preview-approval">承認して締結書兼請求書へ</div>
      </div>

      <div className="raiten-hero-light-path">
        <Image src="/lp/effects/light-swoosh.webp" alt="" fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-contain" />
      </div>
      <span className="raiten-hero-scene-note">画面・人物は表示イメージです</span>
    </div>
  )
}

const features = [
  ['演者を探す', '活動エリアやジャンルから、依頼したい演者を検索。'],
  ['日程を確認する', '出演可能日と来店予定を確認して、候補日を整理。'],
  ['オファーを送る', '日時・依頼内容・想定報酬をまとめてオファー。'],
  ['メッセージで調整する', '案件ごとに相談をまとめ、決まった条件を共有。'],
  ['見積・請求を管理する', '見積から承認・締結・請求、支払い確認まで管理。'],
]

// Centres in the 2048px source sheet; the five icons have different spacing.
const featureIconCenters = [248.5, 636, 1036, 1423, 1818.5]

export function ServiceFeatures() {
  return (
    <section id="features" className="raiten-core-section">
      <Image src="/lp/backgrounds/white-pattern.webp" alt="" fill sizes="100vw" className="raiten-core-background" />
      <div className="raiten-core-inner">
        <div className="raiten-section-heading">
          <p>ONE FLOW, ONE PLATFORM</p>
          <h2>来店ナビでできること</h2>
          <span>来店イベントに必要な業務を、ひとつのサービスでスムーズに。</span>
        </div>
        <div className="raiten-feature-track" tabIndex={0} role="region" aria-label="来店ナビの5つの機能。左右にスクロールできます">
          {features.map(([title, description], index) => (
            <article className="raiten-core-card" key={title}>
              <span className="raiten-core-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <div className="raiten-core-icon" aria-hidden="true">
                <Image
                  src="/lp/icons/function-icons.webp"
                  alt=""
                  width={960}
                  height={320}
                  sizes="600px"
                  style={{ left: `${50 - (featureIconCenters[index] / 2048) * 500}%` }}
                />
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
        <p className="raiten-feature-swipe-hint">左右にスワイプして5つの機能を見る <span aria-hidden="true">→</span></p>
      </div>
    </section>
  )
}
