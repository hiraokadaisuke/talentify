import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { error: 'signed_upload_diagnostic' },
    { status: 501 },
  )
}
