import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Building2, JapaneseYen, Mic, Smartphone, UsersRound } from 'lucide-react'

export function ServiceConnections() {
  return (
    <section id="ecosystem" className="raiten-connections" aria-labelledby="raiten-connections-title">
      <div className="raiten-connections-inner">
        <div className="raiten-connections-overview">
          <p className="raiten-small-heading">来店ナビの利用者</p>
          <h2 id="raiten-connections-title">店舗・演者が利用し、<br />来店情報を一般公開。</h2>
          <p className="raiten-connections-description">店舗と演者は、依頼や条件の相談に利用できます。<br className="hidden sm:block" />一般ユーザーは、公開された来店情報を検索・閲覧できます。</p>
          <div className="raiten-network" role="img" aria-label="店舗と演者が来店ナビでやり取りし、来店ナビから一般ユーザーへ確定情報を公開する関係図">
            <svg className="raiten-network-lines-desktop" viewBox="0 0 600 270" preserveAspectRatio="none" aria-hidden="true">
              <defs><marker id="raiten-network-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10" fill="none" stroke="#FF8A00" strokeWidth="2" /></marker></defs>
              <path d="M 178 52 H 212" fill="none" stroke="#FF8A00" strokeWidth="2" markerStart="url(#raiten-network-arrow)" markerEnd="url(#raiten-network-arrow)" />
              <path d="M 388 52 H 422" fill="none" stroke="#FF8A00" strokeWidth="2" markerStart="url(#raiten-network-arrow)" markerEnd="url(#raiten-network-arrow)" />
              <path d="M 300 105 V 172" fill="none" stroke="#FF8A00" strokeWidth="2" markerEnd="url(#raiten-network-arrow)" />
            </svg>
            <svg className="raiten-network-lines-mobile" viewBox="0 0 300 470" preserveAspectRatio="none" aria-hidden="true">
              <defs><marker id="raiten-network-mobile-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10" fill="none" stroke="#FF8A00" strokeWidth="2" /></marker></defs>
              <path d="M 150 96 V 123" fill="none" stroke="#FF8A00" strokeWidth="2" markerStart="url(#raiten-network-mobile-arrow)" markerEnd="url(#raiten-network-mobile-arrow)" />
              <path d="M 150 222 V 249" fill="none" stroke="#FF8A00" strokeWidth="2" markerStart="url(#raiten-network-mobile-arrow)" markerEnd="url(#raiten-network-mobile-arrow)" />
              <path d="M 234 172 H 262 Q 278 172 278 188 V 408 Q 278 424 262 424 H 234" fill="none" stroke="#FF8A00" strokeWidth="2" markerEnd="url(#raiten-network-mobile-arrow)" />
            </svg>
            <div className="raiten-network-node raiten-network-store"><Building2 size={30} /><strong>店舗</strong></div>
            <div className="raiten-network-node raiten-network-hub"><Image src="/brand/raiten-navi-icon.svg" alt="" width={36} height={36} /><strong>来店ナビ</strong></div>
            <div className="raiten-network-node raiten-network-talent"><Mic size={30} /><strong>演者</strong></div>
            <div className="raiten-network-node raiten-network-public"><UsersRound size={30} /><strong>一般ユーザー</strong></div>
            <span className="raiten-network-publish">確定情報を公開</span>
          </div>
        </div>
        <div className="raiten-start-overview">
          <p className="raiten-small-heading">ご利用について</p>
          <h2>まずは無料で<br className="sm:hidden" />始められます。</h2>
          <div className="raiten-start-points">
            <div><JapaneseYen size={37} /><h3>登録無料</h3><p>まずはアカウントを<br />作成してスタート。</p></div>
            <div><UsersRound size={37} /><h3>店舗・演者で利用</h3><p>役割に合った<br />専用画面をご用意。</p></div>
            <div><Smartphone size={37} /><h3>スマホにも対応</h3><p>必要な情報を<br />いつでも確認。</p></div>
          </div>
          <Link className="raiten-start-guide" href="/guide">使い方をガイドで確認<ArrowRight size={16} /></Link>
        </div>
      </div>
    </section>
  )
}

export function ServiceFinalCTA() {
  return (
    <section id="register" className="raiten-closing" aria-labelledby="raiten-closing-title">
      <Image src="/lp/hero/hero-bg.webp" alt="" fill sizes="100vw" className="raiten-closing-background" />
      <div className="raiten-closing-shade" />
      <div className="raiten-closing-inner">
        <div className="raiten-closing-copy">
          <p>新規登録</p>
          <h2 id="raiten-closing-title">店舗・演者の<br className="raiten-closing-break" />無料登録はこちら。</h2>
          <span>店舗の方は演者の検索・来店依頼に、<br />演者の方はプロフィールの掲載・依頼の受付にご利用ください。</span>
        </div>
        <div className="raiten-closing-actions">
          <Link className="raiten-closing-button" href="/register?role=store">店舗として無料登録<ArrowRight size={16} /></Link>
          <Link className="raiten-closing-button raiten-closing-button-light" href="/register?role=talent">演者として無料登録<ArrowRight size={16} /></Link>
          <Link className="raiten-closing-button raiten-closing-button-outline" href="/login">ログイン<ArrowRight size={16} /></Link>
        </div>
      </div>
    </section>
  )
}
