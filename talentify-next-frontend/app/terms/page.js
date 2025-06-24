export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">利用規約</h1>
      <p className="mb-4">Talentify（以下、「当サービス」といいます。）のご利用にあたり、以下の通り本規約を定めます。</p>
      <p className="mb-6 text-sm">最終改定日: 2025年04月01日</p>

      <h2 className="text-xl font-semibold mb-2">目次</h2>
      <ul className="list-disc list-inside mb-6 space-y-1">
        <li>
          <a href="#article1" className="text-blue-600 underline">第1条 (適用)</a>
        </li>
        <li>
          <a href="#article2" className="text-blue-600 underline">第2条 (定義)</a>
        </li>
        <li>
          <a href="#article3" className="text-blue-600 underline">第3条 (登録)</a>
        </li>
        <li>
          <a href="#article4" className="text-blue-600 underline">第4条 (禁止事項)</a>
        </li>
        <li>
          <a href="#article5" className="text-blue-600 underline">第5条 (免責事項)</a>
        </li>
      </ul>

      <section id="article1" className="mb-6">
        <h3 className="text-xl font-semibold mb-2">第1条 (適用)</h3>
        <p>
          本規約は、当サービスの提供条件および当サービスの利用に関する当社と利用者との間の権利義務関係を定めるものです。
        </p>
      </section>

      <section id="article2" className="mb-6">
        <h3 className="text-xl font-semibold mb-2">第2条 (定義)</h3>
        <p>
          本規約において「利用者」とは、当サービスを利用するすべての個人および法人を指します。
        </p>
      </section>

      <section id="article3" className="mb-6">
        <h3 className="text-xl font-semibold mb-2">第3条 (登録)</h3>
        <p>
          利用希望者は本規約に同意の上、当社の定める方法により登録申請を行い、当社がこれを承認することによって、利用者として登録されるものとします。
        </p>
      </section>

      <section id="article4" className="mb-6">
        <h3 className="text-xl font-semibold mb-2">第4条 (禁止事項)</h3>
        <p>
          利用者は、以下に定める行為をしてはなりません。これに違反した場合、当社は利用者の利用停止、登録抹消その他必要な措置を講じることができます。
        </p>
      </section>

      <section id="article5" className="mb-6">
        <h3 className="text-xl font-semibold mb-2">第5条 (免責事項)</h3>
        <p>
          当社は、当サービスに関して利用者に生じた損害について、当社に故意又は重過失がない限り責任を負いません。
        </p>
      </section>
    </main>
  );
}
