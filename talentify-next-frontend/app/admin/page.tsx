import { redirect } from 'next/navigation'
import AdminConsole from './AdminConsole'
import { getAdminContext } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const admin = await getAdminContext()

  if (!admin.user) {
    redirect('/login?redirectedFrom=/admin')
  }

  if (!admin.isAdmin) {
    return (
      <main className="min-h-[70vh] bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">管理者権限がありません</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            この画面はTalentify運営者として登録されたアカウントのみ利用できます。
          </p>
        </div>
      </main>
    )
  }

  return <AdminConsole />
}
