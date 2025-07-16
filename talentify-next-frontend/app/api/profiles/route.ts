import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {

  const { data: stores } = await supabase.from('stores').select('*')
  const { data: talents } = await supabase.from('talents').select('*')
  const { data: companies } = await supabase.from('companies').select('*')

  return NextResponse.json({ stores, talents, companies })
}
