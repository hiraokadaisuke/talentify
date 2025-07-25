import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditClient from './EditClient'

export const dynamic = 'force-dynamic'

export default async function Page({ searchParams }: { searchParams: { code?: string } }) {
  const supabase = await createClient()
  const code = searchParams.code || null

  // If code provided, fetch that talent; otherwise fetch logged-in user
  if (code) {
    const { data, error } = await supabase
      .from('talents')
      .select('*')
      .eq('id', code)
      .maybeSingle()

    if (error || !data) {
      notFound()
    }
  }

  return <EditClient code={code} />
}
