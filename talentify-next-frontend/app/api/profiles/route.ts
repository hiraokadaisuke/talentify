import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: stores, error: storesError } = await supabase.from('stores').select('*')
  const { data: talents, error: talentsError } = await supabase.from('talents').select('*')

  if (storesError || talentsError) {
    return NextResponse.json({ error: 'Failed to load profiles' }, { status: 500 })
  }

  return NextResponse.json({ stores: stores ?? [], talents: talents ?? [] })
}
