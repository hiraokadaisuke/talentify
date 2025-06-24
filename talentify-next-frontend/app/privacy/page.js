export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">プライバシーポリシー</h1>
      <p className="mb-2">個人情報の取り扱いについて</p>
      <p className="mb-6 text-sm">最終改定日: 2025年04月01日</p>

      <h2 className="text-xl font-semibold mb-2">目次</h2>
      <ul className="list-disc list-inside mb-6 space-y-1">
        <li>
          <a href="#section1" className="text-blue-600 underline">1. 個人情報の定義</a>
        </li>
        <li>
          <a href="#section2" className="text-blue-600 underline">2. 個人情報の収集方法</a>
        </li>
        <li>
          <a href="#section3" className="text-blue-600 underline">3. 個人情報の利用目的</a>
        </li>
        <li>
          <a href="#section4" className="text-blue-600 underline">4. 個人情報の第三者提供</a>
        </li>
        <li>
          <a href="#section5" className="text-blue-600 underline">5. 個人情報の安全管理</a>
        </li>
        <li>
          <a href="#section6" className="text-blue-600 underline">6. 個人情報の開示・訂正・削除</a>
        </li>
        <li>
          <a href="#section7" className="text-blue-600 underline">7. Cookieの使用について</a>
        </li>
        <li>
          <a href="#section8" className="text-blue-600 underline">8. アクセス解析ツール</a>
        </li>
        <li>
          <a href="#section9" className="text-blue-600 underline">9. 広告配信について</a>
        </li>
        <li>
          <a href="#section10" className="text-blue-600 underline">10. 免責事項</a>
        </li>
        <li>
          <a href="#section11" className="text-blue-600 underline">11. お問い合わせ窓口</a>
        </li>
      </ul>

      <section id="section1" className="mb-6">
        <h3 className="text-xl font-semibold mb-2">1. 個人情報の定義</h3>
        <p>
          本ポリシーにおける「個人情報」とは、氏名、住所、電話番号、メールアドレス
          など、特定の個人を識別できる情報を指します。
        </p>
      </section>

      <section id="section2" className="mb-6">
        <h3 className="text-xl font-semibold mb-2">2. 個人情報の収集方法</h3>
        <p>
          当社は、登録フォームへの入力、Cookie、アクセスログの取得等によりユーザー
          の個人情報を収集します。
        </p>
      </section>

      <section id="section3" className="mb-6">
        <h3 className="text-xl font-semibold mb-2">3. 個人情報の利用目的</h3>
        <p>収集した個人情報は以下の目的で利用します。</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>サービスの提供・運営</li>
          <li>利用状況の分析によるサービス改善</li>
          <li>問い合わせへの対応や重要なお知らせの送付</li>
          <li>マーケティングおよび広告配信</li>
        </ul>
      </section>

      <section id="section4" className="mb-6">
        <h3 className="text-xl font-semibold mb-2">4. 個人情報の第三者提供</h3>
        <p>
          法令に基づく場合を除き、本人の同意なく個人情報を第三者に提供することはあ
          りません。
        </p>
      </section>

      <section id="section5" className="mb-6">
        <h3 className="text-xl font-semibold mb-2">5. 個人情報の安全管理</h3>
        <p>個人情報への不正アクセスや漏えいを防ぐため、適切なセキュリティ対策を講じます。</p>
      </section>

      <section id="section6" className="mb-6">
        <h3 className="text-xl font-semibold mb-2">6. 個人情報の開示・訂正・削除</h3>
        <p>
          ユーザーからの求めがあった場合、合理的な範囲で速やかに開示・訂正・削除に
          応じます。
        </p>
      </section>

      <section id="section7" className="mb-6">
        <h3 className="text-xl font-semibold mb-2">7. Cookieの使用について</h3>
        <p>
          本サービスではユーザー体験向上のためCookieを利用することがあります。ブラ
          ウザ設定によりCookieの無効化が可能ですが、一部機能が利用できなくなる場合
          があります。
        </p>
      </section>

      <section id="section8" className="mb-6">
        <h3 className="text-xl font-semibold mb-2">8. アクセス解析ツール</h3>
        <p>
          当社はサイト利用状況を把握するため、Google Analytics等のアクセス解析ツー
          ルを使用することがあります。
        </p>
      </section>

      <section id="section9" className="mb-6">
        <h3 className="text-xl font-semibold mb-2">9. 広告配信について</h3>
        <p>
          第三者配信事業者による広告サービスを利用する場合があります。ユーザーは広
          告設定ページでパーソナライズ広告を無効にできます。
        </p>
      </section>

      <section id="section10" className="mb-6">
        <h3 className="text-xl font-semibold mb-2">10. 免責事項</h3>
        <p>
          不可抗力等、当社の責に帰さない事由によって生じた個人情報の漏えいについて
          当社は一切の責任を負いません。
        </p>
      </section>

      <section id="section11" className="mb-6">
        <h3 className="text-xl font-semibold mb-2">11. お問い合わせ窓口</h3>
        <p>
          プライバシーポリシーに関するご質問は、
          <a href="/contact" className="text-blue-600 underline">
            お問い合わせフォーム
          </a>
          よりご連絡ください。
        </p>
      </section>
    </main>
  );
}
