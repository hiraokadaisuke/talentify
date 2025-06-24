'use client'
import { useEffect, useState } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000'

export default function PaymentsPage() {
  const [payments, setPayments] = useState([])
  const [account, setAccount] = useState({
    bankName: '',
    branchName: '',
    accountType: '普通',
    accountNumber: '',
    accountHolder: '',
  })
  const [banner, setBanner] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resPay = await fetch(`${API_BASE}/api/payments`)
        if (resPay.ok) {
          const data = await resPay.json()
          setPayments(data)
          setBanner(data.some(p => p.status === '未払い'))
        }
        const resAcc = await fetch(`${API_BASE}/api/bank-account`)
        if (resAcc.ok) {
          const acc = await resAcc.json()
          if (acc) setAccount(acc)
        }
      } catch (e) {
        console.error(e)
      }
    }
    fetchData()
  }, [])

  const handleChange = e => {
    setAccount({ ...account, [e.target.name]: e.target.value })
  }

  const saveAccount = async e => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_BASE}/api/bank-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(account),
      })
      if (!res.ok) throw new Error('failed')
      alert('保存しました')
    } catch (e) {
      console.error(e)
      alert('保存に失敗しました')
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-4 space-y-6">
      <h1 className="text-xl font-bold">決済管理</h1>
      {banner && (
        <div className="p-3 bg-yellow-100 border text-sm">
          未払いのイベント報酬があります。口座情報をご確認ください
        </div>
      )}
      <section>
        <h2 className="font-semibold mb-2">ギャラ受取履歴</h2>
        <ul className="space-y-2">
          {payments.map(p => (
            <li key={p._id} className="border p-2 flex justify-between">
              <div>
                <div>{new Date(p.eventDate).toLocaleDateString()} {p.venue}</div>
                <div className="text-sm">ステータス: {p.status} {p.transferDate ? `(${new Date(p.transferDate).toLocaleDateString()}振込)` : ''}</div>
              </div>
              <div className="flex flex-col items-end">
                <div>¥{p.amount.toLocaleString()}</div>
                {p.invoiceUrl && <a href={p.invoiceUrl} className="text-blue-600 text-xs underline">明細を見る</a>}
              </div>
            </li>
          ))}
          {payments.length === 0 && (
            <li className="text-sm">履歴がありません</li>
          )}
        </ul>
      </section>
      <section>
        <h2 className="font-semibold mb-2">銀行口座情報</h2>
        <form onSubmit={saveAccount} className="space-y-2">
          <div>
            <label className="block text-sm mb-1">銀行名</label>
            <input name="bankName" value={account.bankName} onChange={handleChange} className="border p-1 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm mb-1">支店名</label>
            <input name="branchName" value={account.branchName} onChange={handleChange} className="border p-1 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm mb-1">種別</label>
            <select name="accountType" value={account.accountType} onChange={handleChange} className="border p-1 rounded">
              <option value="普通">普通</option>
              <option value="当座">当座</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">口座番号</label>
            <input name="accountNumber" value={account.accountNumber} onChange={handleChange} className="border p-1 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm mb-1">名義(カナ)</label>
            <input name="accountHolder" value={account.accountHolder} onChange={handleChange} className="border p-1 rounded w-full" />
          </div>
          <button type="submit" className="px-3 py-1 border rounded bg-blue-600 text-white">保存する</button>
        </form>
        <p className="text-xs mt-2">支払予定はイベント終了後○営業日以内です</p>
      </section>
    </main>
  )
}
