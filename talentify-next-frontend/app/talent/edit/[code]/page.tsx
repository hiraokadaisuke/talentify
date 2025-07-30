import { createClient } from '@/lib/supabase/server'
import EditClient from '../EditClient'

export const dynamic = 'auto'

export default async function Page({ params }: { params: { code: string } }) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return <main className="p-4">ログインしてください</main>
  }

  const { data, error } = await supabase
    .from('talents')
    .select('*')
    .eq('id', params.code)
    .maybeSingle()

  if (error || !data) {
    return <main className="p-4">このプロフィールは存在しません</main>
  }

  return <EditClient code={params.code} />
}
