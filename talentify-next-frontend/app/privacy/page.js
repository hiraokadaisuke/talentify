import Link from 'next/link'
import PublicPageHero from '@/components/public/PublicPageHero'

export const metadata = {
  title: 'プライバシーポリシー | 来店ナビ',
  description: '来店ナビにおける個人情報および利用情報の取扱いについて説明します。',
}

const sections = [
  {
    id: 'section1',
    title: '1. 基本方針',
    body: (
      <p>
        来店ナビ運営者（以下「運営者」といいます。）は、
        本サービスの提供にあたり取り扱う個人情報その他の利用者情報を適切に管理し、
        個人情報の保護に関する法律その他の関係法令を遵守します。
      </p>
    ),
  },
  {
    id: 'section2',
    title: '2. 取得する情報',
    body: (
      <>
        <p>運営者は、本サービスの提供に必要な範囲で、主に次の情報を取得します。</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>メールアドレス、電話番号、認証情報その他アカウント登録に必要な情報</li>
          <li>氏名・活動名、プロフィール、画像、活動地域、出演条件、連絡方法等の演者情報</li>
          <li>店舗名、店舗プロフィール、担当者が入力した情報等の店舗情報</li>
          <li>オファー、見積、契約、請求、支払い状況、キャンセル、無断不履行、レビュー等の案件情報</li>
          <li>メッセージ本文、添付ファイル、既読情報等のコミュニケーション情報</li>
          <li>お問い合わせ内容および対応履歴</li>
          <li>IPアドレス、Cookie、端末・ブラウザ情報、アクセス日時、操作ログ等の技術情報</li>
        </ul>
      </>
    ),
  },
  {
    id: 'section3',
    title: '3. 利用目的',
    body: (
      <>
        <p>取得した情報は、主に次の目的で利用します。</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>本人確認、アカウント作成、ログインその他認証機能の提供</li>
          <li>演者検索、プロフィール表示、予定確認、オファー送受信その他マッチング機能の提供</li>
          <li>見積、契約、請求、支払い状況、レビュー等の案件管理機能の提供</li>
          <li>メッセージ、添付ファイル、通知等の連絡機能の提供</li>
          <li>お問い合わせへの回答、不具合対応、本人確認、サポート</li>
          <li>不正利用の防止、セキュリティ確保、障害調査、監査</li>
          <li>利用状況の分析、サービス品質およびUI・UXの改善</li>
          <li>規約変更、重要な機能変更、障害その他サービス運営上必要な案内</li>
          <li>法令上の義務への対応、紛争・トラブルへの対応、権利の保全</li>
        </ul>
      </>
    ),
  },
  {
    id: 'section4',
    title: '4. 他の利用者への情報表示',
    body: (
      <>
        <p>
          マッチングおよび案件遂行のため、利用者が登録した情報の一部を相手方利用者へ表示します。
          たとえば、店舗には演者の公開プロフィールや案件に必要な情報を、
          演者には依頼元店舗や案件に必要な情報を表示します。
        </p>
        <p>
          電話番号等の連絡先は、本サービスの設定および案件上の必要性に応じて表示範囲を制御します。
          演者の電話番号については、演者が電話連絡を許可した案件等、
          本サービス上で表示条件を満たす場合に相手方店舗へ表示します。
        </p>
      </>
    ),
  },
  {
    id: 'section5',
    title: '5. 第三者提供および業務委託',
    body: (
      <>
        <p>
          運営者は、法令に基づく場合、本人の同意がある場合、
          または本サービス上で相手方利用者への提供が明示されている場合等を除き、
          個人データを第三者へ提供しません。
        </p>
        <p>
          運営者は、ホスティング、データベース、ストレージ、認証、メール配信、
          システム保守その他本サービスの提供に必要な業務を外部事業者へ委託することがあります。
          この場合、必要な範囲で情報を取り扱わせ、委託先の選定・契約・監督等を通じて適切な管理に努めます。
        </p>
      </>
    ),
  },
  {
    id: 'section6',
    title: '6. Cookie・アクセスログ',
    body: (
      <>
        <p>
          本サービスでは、ログイン状態の維持、セキュリティ確保、利用状況の把握、
          機能改善等のためにCookie、ローカルストレージ、アクセスログその他の技術を利用することがあります。
        </p>
        <p>
          ブラウザの設定によりCookieを制限できますが、
          認証その他本サービスの一部機能が正常に利用できなくなる場合があります。
        </p>
      </>
    ),
  },
  {
    id: 'section7',
    title: '7. 安全管理措置',
    body: (
      <p>
        運営者は、アクセス制御、認証、通信の暗号化、保存先のアクセス権限管理、
        ログ確認その他、本サービスの規模および取り扱う情報に応じた合理的な安全管理措置を講じます。
        また、必要に応じて委託先の安全管理状況を確認します。
      </p>
    ),
  },
  {
    id: 'section8',
    title: '8. 保存期間および削除',
    body: (
      <>
        <p>
          運営者は、利用目的の達成に必要な期間、法令上必要な期間、
          または契約・請求・支払い・トラブル対応等のため合理的に必要な期間、情報を保存します。
        </p>
        <p>
          退会後も、契約書類、請求・支払い記録、メッセージその他、
          取引の証跡として保存が必要な情報を一定期間保持する場合があります。
          保存の必要がなくなった情報は、合理的な方法で削除または匿名化します。
        </p>
      </>
    ),
  },
  {
    id: 'section9',
    title: '9. 開示・訂正・利用停止等の請求',
    body: (
      <>
        <p>
          本人は、法令に基づき、保有個人データの利用目的の通知、開示、訂正、追加、削除、
          利用停止、消去、第三者提供の停止等を請求できる場合があります。
        </p>
        <p>
          ご希望の場合は
          <Link href="/contact" className="mx-1 text-[#FF5A1F] underline underline-offset-2">
            お問い合わせフォーム
          </Link>
          からご連絡ください。本人確認のうえ、法令に従って対応します。
        </p>
      </>
    ),
  },
  {
    id: 'section10',
    title: '10. 本ポリシーの変更',
    body: (
      <p>
        運営者は、法令、本サービスの内容または取り扱う情報の変更等に応じて、
        本ポリシーを変更することがあります。
        重要な変更については、本サービス上その他合理的な方法で案内します。
      </p>
    ),
  },
  {
    id: 'section11',
    title: '11. お問い合わせ窓口',
    body: (
      <p>
        個人情報の取扱いに関するお問い合わせは、
        <Link href="/contact" className="mx-1 text-[#FF5A1F] underline underline-offset-2">
          お問い合わせフォーム
        </Link>
        からご連絡ください。
      </p>
    ),
  },
]

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#F7F9FC] pt-16 text-slate-950">
      <PublicPageHero
        eyebrow="PRIVACY POLICY"
        title="プライバシーポリシー"
        description="来店ナビで取り扱う個人情報・案件情報・メッセージ等の利用目的と管理方法を説明します。"
      >
        <p className="text-xs font-bold text-white/50">最終改定日：2026年10月1日</p>
      </PublicPageHero>

      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:py-12">
      <nav className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-sm font-semibold text-slate-900">目次</h2>
        <ol className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
          {sections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`} className="hover:text-[#FF5A1F] hover:underline">
                {section.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-8 space-y-8">
        {sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <h2 className="text-lg font-semibold text-slate-950">{section.title}</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-700">
              {section.body}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-orange-200 bg-orange-50 p-5 text-sm leading-7 text-slate-800">
        アカウントの退会をご希望の場合も
        <Link href="/contact" className="mx-1 font-semibold underline underline-offset-2">
          お問い合わせフォーム
        </Link>
        からご連絡ください。退会と、法令上の個人データの削除等の請求は、
        内容に応じてそれぞれ確認のうえ対応します。
      </div>
      </div>
    </main>
  )
}
