import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const offers = await (prisma as any).offers.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
    })

    console.log('[Prisma Check] offers:', offers)

    return NextResponse.json({ ok: true, count: offers.length, offers })
  } catch (error) {
    console.error('[Prisma Check] failed', error)
    return NextResponse.json(
      { ok: false, message: 'Prisma query failed. Check DATABASE_URL and schema introspection.' },
      { status: 500 }
    )
  }
}
