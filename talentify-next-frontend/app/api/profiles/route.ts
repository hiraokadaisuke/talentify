export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { data: stores } = await supabase.from('stores').select('*')
  const { data: talents } = await supabase.from('talents').select('*')
  const { data: companies } = await supabase.from('companies').select('*')

  return NextResponse.json({ stores, talents, companies })
}
