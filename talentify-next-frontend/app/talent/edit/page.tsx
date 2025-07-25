import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditClient from './EditClient'

export const dynamic = 'force-dynamic'

export default async function Page({ searchParams }: { searchParams: { code?: string } }) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return <main className="p-4">ログインしてください</main>
  }

  const code = searchParams.code ?? session.user.id

  if (searchParams.code && searchParams.code !== session.user.id) {
    redirect(`/talent/edit/${searchParams.code}`)
  }

  if (code) {
    const { data, error } = await supabase
      .from('talents')
      .select('*')
      .eq('id', code)
      .maybeSingle()

    if (error || !data) {
      return <main className="p-4">このプロフィールは存在しません</main>
    }
  }

  return <EditClient code={code} />
}
