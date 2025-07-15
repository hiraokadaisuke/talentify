import { getContractsForStore } from '@/lib/contracts'

export default async function StoreContractsPage() {
  const contracts = await getContractsForStore()

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">契約書一覧</h1>
      {contracts.length === 0 ? (
        <p>契約書はまだありません。</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left">
              <th className="p-2 border-b">オファーID</th>
              <th className="p-2 border-b">演者名</th>
              <th className="p-2 border-b">出演日</th>
              <th className="p-2 border-b">金額</th>
              <th className="p-2 border-b">PDF</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((c) => (
              <tr key={c.offer_id} className="border-t">
                <td className="p-2">{c.offer_id}</td>
                <td className="p-2">{c.talent_name}</td>
                <td className="p-2">{c.performance_date}</td>
                <td className="p-2">{c.amount != null ? `¥${c.amount.toLocaleString()}` : '-'}</td>
                <td className="p-2">
                  {c.pdf_url ? (
                    <a href={c.pdf_url} target="_blank" className="text-blue-600 underline">ダウンロード</a>
                  ) : (
                    '---'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}
