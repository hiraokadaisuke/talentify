import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { getOfferProgress } from '@/utils/offerProgress'

const exampleOffers = [
  { date: '2026/10/12', talent: '演者 A', status: 'pending', invoiceStatus: 'submitted' as const, statusLabel: '保留中' },
  { date: '2026/10/14', talent: '演者 B', status: 'confirmed', invoiceStatus: 'submitted' as const, statusLabel: '承諾済' },
  { date: '2026/10/18', talent: '演者 C', status: 'pending', invoiceStatus: 'not_submitted' as const, statusLabel: '保留中' },
].map(offer => ({ ...offer, progress: getOfferProgress({ ...offer, paid: false }) }))

function ProgressExample({ offer }: { offer: typeof exampleOffers[number] }) {
  return <div className="raiten-management-progress"><b>{offer.progress.badge.label}</b><div>{offer.progress.steps.map(step => <span key={step.key} className={step.status} />)}</div></div>
}

export function ServiceAbout() {
  return (
    <section id="about" className="raiten-about" aria-labelledby="raiten-about-title">
      <div className="raiten-about-inner">
        <div>
          <p className="raiten-small-heading">ABOUT RAITEN NAVI</p>
          <h2 id="raiten-about-title">外はワクワク。<br />中は分かりやすく。</h2>
        </div>
        <div className="raiten-about-copy">
          <p>来店イベントの準備も、その先の告知も。<br />店舗と演者の仕事をすっきり整理し、<br className="sm:hidden" />確定した予定をファンへ届けます。</p>
          <div><span>OUTSIDE = EXCITEMENT</span><span>INSIDE = CLARITY</span></div>
        </div>
      </div>
    </section>
  )
}

export function ServiceManagement() {
  return (
    <section id="management" className="raiten-management" aria-labelledby="raiten-management-title">
      <Image src="/lp/backgrounds/minimal-tech-bg.webp" alt="" fill sizes="100vw" className="raiten-management-background" />
      <div className="raiten-management-inner">
        <div className="raiten-management-copy">
          <p className="raiten-small-heading">わかりやすく、使いやすい</p>
          <h2 id="raiten-management-title">シンプルで直感的な<br />管理画面。</h2>
          <ul className="raiten-management-functions" aria-label="管理できる業務"><li>オファー管理</li><li>スケジュール</li><li>メッセージ</li><li>見積・請求</li></ul>
          <p className="raiten-management-description">来店イベントに必要な情報を、案件ごとにまとめて管理。PCでもスマートフォンでも、必要な情報へすぐにたどり着けます。</p>
          <Link href="/guide" className="raiten-start-guide">画面の使い方を確認する<ArrowRight size={16} /></Link>
        </div>
        <figure className="raiten-management-preview">
          <div className="raiten-management-window" aria-hidden="true">
            <div className="raiten-management-topbar"><Image src="/brand/raiten-navi-icon.svg" alt="" width={22} height={22} /><b>来店ナビ</b><span>店舗アカウント</span></div>
            <div className="raiten-management-workspace">
              <div className="raiten-management-sidebar">
                {['演者を探す', 'お気に入り', 'ダッシュボード', 'オファー管理', 'スケジュール', 'レビュー管理', 'メッセージ', '通知', '見積・請求'].map(label => <span key={label} className={label === 'オファー管理' ? 'active' : undefined}>{label}</span>)}
              </div>
              <div className="raiten-management-content">
                <strong className="raiten-management-screen-title">オファー管理</strong>
                <p className="raiten-management-screen-intro">来店予定・進捗状況を一覧で確認できます。</p>
                <div className="raiten-management-tabs"><b>進行中 <span>3</span></b><span>履歴</span><span>キャンセル</span></div>
                <div className="raiten-management-filter">絞り込み・並び替え<ChevronDown size={12} /></div>
                <table className="raiten-management-table">
                  <thead><tr>{['来店日', '演者名', '現在ステータス', '進捗', '最終更新'].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead>
                  <tbody>{exampleOffers.map(offer => <tr key={offer.talent}><td>{offer.date}</td><td>{offer.talent}</td><td><span className="raiten-management-status">{offer.statusLabel}</span></td><td><ProgressExample offer={offer} /></td><td>2026/10/04</td></tr>)}</tbody>
                </table>
                <div className="raiten-management-mobile-cards">{exampleOffers.map(offer => <div key={offer.talent}><div><b>{offer.talent}</b><span className="raiten-management-status">{offer.statusLabel}</span></div><p>{offer.date}</p><ProgressExample offer={offer} /></div>)}</div>
              </div>
            </div>
          </div>
          <figcaption>オファー管理画面をもとにした表示例（サンプルデータ）</figcaption>
        </figure>
      </div>
    </section>
  )
}
