import { createClient } from '@/lib/supabase/server'
import EditClient from '../EditClient'

export const dynamic = 'auto'

export default async function Page({ params }: { params: { code: string } }) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return <main className="p-4 lg:mx-auto lg:mt-8 lg:max-w-2xl lg:rounded-2xl lg:border lg:border-slate-200 lg:bg-white lg:p-8 lg:text-center lg:text-slate-600 lg:shadow-[0_8px_24px_rgba(15,23,42,.05)]">ログインしてください</main>
  }

  const { data, error } = await supabase
    .from('talents')
    .select('*')
    .eq('id', params.code)
    .maybeSingle()

  if (error || !data) {
    return <main className="p-4 lg:mx-auto lg:mt-8 lg:max-w-2xl lg:rounded-2xl lg:border lg:border-slate-200 lg:bg-white lg:p-8 lg:text-center lg:text-slate-600 lg:shadow-[0_8px_24px_rgba(15,23,42,.05)]">このプロフィールは存在しません</main>
  }

  return <EditClient code={params.code} />
}
