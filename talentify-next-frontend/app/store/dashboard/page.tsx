// /app/store/dashboard/page.tsx
export default function StoreDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📊 店舗用ダッシュボード</h1>
      <p className="text-gray-700 mb-2">これはダミーUIです。ここに演者の検索、依頼一覧、スケジュール管理などが入ります。</p>
      <div className="border rounded p-4 bg-white shadow">
        <p>✔ 現在の出演依頼数: <strong>4件</strong></p>
        <p>✔ 今月の契約完了数: <strong>2件</strong></p>
      </div>
    </div>
  )
}
