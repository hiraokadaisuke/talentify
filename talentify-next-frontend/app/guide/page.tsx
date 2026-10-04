import Image from 'next/image'
import Link from 'next/link'
import { ArrowDown, ArrowRight, BookOpen, Check, CheckCircle2, FileCheck2, FileText, HelpCircle, MessageSquareText, Mic, Phone, Store } from 'lucide-react'
import TutorialResetButton from '@/components/TutorialResetButton'
import './guide.css'

export const metadata = {
  title: 'ご利用ガイド｜来店ナビ',
  description: '店舗・演者それぞれの登録からオファー、見積・契約、来店完了までをわかりやすくご案内します。',
}

const storeSteps = [
  {
    title: '店舗プロフィールを登録',
    text: '店舗名などの基本情報を整えます。初回ナビからすぐ編集できます。',
  },
  {
    title: '演者を検索',
    text: 'プロフィール、出演条件、予定を見ながら候補を探します。気になる演者はお気に入り保存もできます。',
  },
  {
    title: 'オファーを送る',
    text: '希望日・時間・依頼内容などを入力して送信します。送信時点ではまだ契約ではありません。',
  },
  {
    title: '条件を相談する',
    text: '案件内メッセージや電話で、日程・内容・金額などを相談します。重要な条件は見積や案件情報にも反映します。',
  },
  {
    title: '見積を確認・承認',
    text: '演者から提出された見積を確認します。修正が必要なら相談後に修正依頼を行い、再提出してもらいます。',
  },
  {
    title: '契約成立',
    text: '見積承認後、締結書兼請求書が作成されます。契約時点の条件が記録されます。',
  },
  {
    title: '来店・支払い・レビュー',
    text: '来店完了後、支払い状況を確認し、完了後にレビューを投稿できます。',
  },
]

const talentSteps = [
  {
    title: '演者プロフィールを登録',
    text: '活動名、プロフィール、出演条件、連絡方法など、店舗が判断しやすい情報を整えます。',
  },
  {
    title: 'スケジュールを設定',
    text: '基本は受付可能です。受付できない日だけ設定し、店舗はオファー前に予定を確認できます。',
  },
  {
    title: '請求情報を準備',
    text: '見積や請求に必要な情報を設定しておくと、案件進行がスムーズです。',
  },
  {
    title: 'オファーを確認',
    text: '届いた依頼内容を確認し、不明点はメッセージや電話で相談します。',
  },
  {
    title: '見積を提出',
    text: '報酬、交通費、メモなどを確認して提出します。修正依頼があれば下書きに戻るので再編集できます。',
  },
  {
    title: '契約内容を確認',
    text: '店舗が見積を承認すると契約成立です。締結書兼請求書から条件を確認できます。',
  },
  {
    title: '来店・支払い確認',
    text: '出演後、来店完了と支払い状況を確認します。レビューが投稿されるとレビュー画面から確認できます。',
  },
]

function Flow({ role, steps }: { role: 'store' | 'talent'; steps: { title: string; text: string }[] }) {
  const isStore = role === 'store'
  return <section id={`${role}-flow`} className="guide-flow">
    <div className="guide-flow-heading">
      <span className="guide-role-icon">{isStore ? <Store /> : <Mic />}</span>
      <div><p className="guide-eyebrow">{isStore ? '店舗向け' : '演者向け'}</p><h2>{isStore ? '店舗' : '演者'}のご利用フロー</h2></div>
    </div>
    <p className="guide-flow-intro">{isStore ? '演者の検索から、来店後の支払い・レビューまで。' : 'プロフィールの登録から、依頼の受付・来店まで。'}</p>
    <ol className="guide-steps">{steps.map((step, index) => <li key={step.title}>
      <span className="guide-step-number">{String(index + 1).padStart(2, '0')}</span>
      <div>{index === 0 && <span className="guide-phase">まずは準備</span>}{index === (isStore ? 2 : 3) && <span className="guide-phase">依頼・相談を進める</span>}{index === 4 && <span className="guide-phase">見積から契約へ</span>}{index === 6 && <span className="guide-phase">来店後の確認</span>}
      <h3>{step.title}</h3><p>{step.text}</p>
      {index === 5 && <div className="guide-step-note"><CheckCircle2 size={16} />店舗の見積承認で、契約が成立します。</div>}
      </div>
    </li>)}</ol>
    <Link className="guide-role-link" href={isStore ? '/register?role=store' : '/register?role=talent'}>{isStore ? '店舗' : '演者'}として登録する<ArrowRight size={18} /></Link>
  </section>
}

function ScreenExample() {
  return <figure className="guide-screen">
    <div className="guide-screen-bar"><span><span className="guide-screen-dot" />来店ナビ</span><span>操作イメージ・サンプル</span></div>
    <div className="guide-screen-body"><div className="guide-screen-title"><div><small>案件の進行をまとめて確認</small><h3>オファー管理</h3></div><span className="guide-status">進行中</span></div>
      <div className="guide-screen-tabs"><b>進行中</b><span>履歴</span><span>キャンセル</span></div>
      <div className="guide-screen-row"><Image src="/lp/people/performer-card-01.webp" width={48} height={48} alt="" /><div><b>サンプル演者</b><small>来店日・条件を案件ごとに確認</small></div><span className="guide-status">見積確認待ち</span></div>
      <div className="guide-screen-progress">{['オファー・相談', '見積', '締結・請求', '来店実施', '支払い', 'レビュー'].map((label, i) => <div key={label} className={i < 2 ? 'is-current' : ''}><span>{i === 0 ? <Check size={12} /> : i + 1}</span><small>{label}</small></div>)}</div>
      <div className="guide-screen-next"><FileText size={22} /><div><b>次は、見積の確認</b><p>金額・条件を確認してから承認します。</p></div></div>
    </div><figcaption>実際の機能・進行ステップをもとにした説明用の画面です。</figcaption>
  </figure>
}

export default function GuidePage() {
  return <main className="raiten-guide">
    <section className="guide-hero">
      <Image className="guide-hero-bg" src="/lp/hero/hero-bg.webp" alt="" fill priority sizes="100vw" />
      <div className="guide-container guide-hero-content"><p className="guide-eyebrow">来店ナビの使い方</p><h1>ご利用ガイド</h1><p className="guide-hero-lead">登録から来店後の確認までの手順</p><p className="guide-hero-copy">店舗・演者それぞれの利用手順と、<br />見積・契約の進め方をご案内します。</p>
      <div className="guide-roles">{([{role:'store',label:'店舗',en:'店舗向け',text:'演者を探して、来店を依頼する。',image:'store-manager.webp',Icon:Store},{role:'talent',label:'演者',en:'演者向け',text:'依頼を確認して、見積を提出する。',image:'performer-stage.webp',Icon:Mic}] as const).map(({role,label,en,text,image,Icon}) => <a key={role} href={`#${role}-flow`} className={`guide-role-card guide-role-${role}`}><Image src={`/lp/people/${image}`} alt={`${label}のイメージ写真`} fill sizes="(max-width: 640px) 90vw, 540px" /><div className="guide-role-card-content"><span className="guide-eyebrow"><Icon size={16} />{en}</span><h2>{label}の方へ</h2><p>{text}</p><span className="guide-card-action">利用の流れを見る<ArrowDown size={17} /></span></div></a>)}</div>
      </div>
    </section>
    <nav className="guide-nav" aria-label="ガイド内のナビゲーション"><div className="guide-container"><a href="#getting-started">はじめに</a><a href="#store-flow">店舗の流れ</a><a href="#talent-flow">演者の流れ</a><a href="#agreement">見積・契約</a><a href="#communication">やり取りの基本</a><a href="#help">困ったとき</a></div></nav>
    <div className="guide-container">
      <section id="getting-started" className="guide-start"><div className="guide-start-icon"><BookOpen /></div><div><p className="guide-eyebrow">初めてご利用の方へ</p><h2>登録後はダッシュボードを確認</h2><p>登録後は「はじめにすること」に沿って、必要な情報を準備しましょう。初回ナビは閉じても、ここから再表示できます。</p></div><div className="guide-reset"><TutorialResetButton /><small>設定後、ダッシュボードで確認できます。</small></div></section>
      <div className="guide-flows"><Flow role="store" steps={storeSteps} /><Flow role="talent" steps={talentSteps} /></div>
    </div>
    <section id="agreement" className="guide-agreement"><div className="guide-container guide-agreement-grid"><div><p className="guide-eyebrow">見積と契約について</p><h2>店舗が見積を承認すると、<br />契約が成立します。</h2><p className="guide-section-copy">オファーを送った時点では、まだ契約ではありません。条件を相談し、演者が提出した見積を店舗が承認すると、契約が成立します。</p><div className="guide-agreement-points"><div><MessageSquareText /><span><b>相談する</b><small>日程・内容・金額をすり合わせる</small></span></div><div><FileText /><span><b>見積を確認する</b><small>修正があれば、再提出後に確認する</small></span></div><div><FileCheck2 /><span><b>承認して契約成立</b><small>締結書兼請求書に条件が残る</small></span></div></div></div><ScreenExample /></div></section>
    <section id="communication" className="guide-container guide-communication"><p className="guide-eyebrow">連絡・条件の確認</p><h2>やり取りの際に確認すること</h2><div className="guide-tips">{[
      {Icon:Phone,title:'電話対応の可否を確認する',text:'電話対応が可能な演者とは、電話でも相談できます。相手の連絡方法を確認してから進めましょう。'},
      {Icon:FileCheck2,title:'決まった条件を記録する',text:'電話で決めた日時・金額・交通費も、見積や案件情報へ反映。お互いが同じ条件を確認できるようにします。'},
      {Icon:MessageSquareText,title:'定型文を確認・編集して送信する',text:'「よく使うメッセージ」は入力欄に入るだけで、自動送信されません。内容を確認・編集してから送信できます。'},
      {Icon:CheckCircle2,title:'進行状況は案件詳細で確認する',text:'現在の進行ステップと、次に必要な対応を確認できます。見積や契約内容も、案件ごとに確認できます。'},
    ].map(({Icon,title,text}) => <article key={title}><span className="guide-tip-icon"><Icon /></span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section id="help" className="guide-help"><div className="guide-container guide-help-inner"><div><HelpCircle size={30} /><p className="guide-eyebrow">ヘルプ・お問い合わせ</p><h2>操作でお困りの方へ</h2><p>操作や進め方で迷ったら、<br />よくある質問・お問い合わせをご利用ください。</p></div><div className="guide-help-links"><Link href="/faq"><span><b>よくある質問</b><small>登録・操作・案件進行の疑問を確認</small></span><ArrowRight /></Link><Link href="/contact"><span><b>お問い合わせ</b><small>解決しない場合はこちらから</small></span><ArrowRight /></Link><Link className="guide-back" href="/service">来店ナビのサービス紹介へ<ArrowRight size={16} /></Link></div></div></section>
  </main>
}
