import { NextRequest, NextResponse } from 'next/server'
import { findIdempotentResponse, saveIdempotentResponse } from '@/lib/repositories/notification-idempotency'

export function getIdempotencyContext(req: NextRequest, userId: string) {
  const key = req.headers.get('idempotency-key')?.trim()
  if (!key) {
    return null
  }

  return {
    key,
    endpoint: `${req.method}:${req.nextUrl.pathname}`,
    userId,
  }
}

export async function getIdempotentResponse(req: NextRequest, userId: string): Promise<NextResponse | null> {
  const ctx = getIdempotencyContext(req, userId)
  if (!ctx) {
    return null
  }

  const snapshot = await findIdempotentResponse(ctx)
  if (!snapshot) {
    return null
  }

  return NextResponse.json(snapshot.body, { status: snapshot.status })
}

export async function persistIdempotentResponse(req: NextRequest, userId: string, res: NextResponse) {
  const ctx = getIdempotencyContext(req, userId)
  if (!ctx) {
    return
  }

  const cloned = res.clone()
  let body: unknown

  try {
    body = await cloned.json()
  } catch {
    body = null
  }

  await saveIdempotentResponse({
    ...ctx,
    snapshot: {
      status: res.status,
      body,
    },
  })
}
