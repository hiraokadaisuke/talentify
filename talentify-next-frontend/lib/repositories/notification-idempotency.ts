import { Prisma } from '@prisma/client'
import { getPrismaClient } from '@/lib/prisma'

const DEFAULT_TTL_MINUTES = 10

type IdempotentSnapshot = {
  status: number
  body: unknown
}

type FindInput = {
  key: string
  userId: string
  endpoint: string
}

type SaveInput = FindInput & {
  snapshot: IdempotentSnapshot
  ttlMinutes?: number
}

type IdempotencyRow = {
  response_snapshot: Prisma.JsonValue
}

export async function findIdempotentResponse({ key, userId, endpoint }: FindInput): Promise<IdempotentSnapshot | null> {
  const prisma = getPrismaClient()

  const rows = await prisma.$queryRaw<IdempotencyRow[]>`
    SELECT response_snapshot
    FROM public.notification_idempotency_keys
    WHERE key = ${key}
      AND user_id = ${userId}::uuid
      AND endpoint = ${endpoint}
      AND expires_at > NOW()
    LIMIT 1
  `

  const snapshot = rows[0]?.response_snapshot
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
    return null
  }

  const status = (snapshot as Record<string, unknown>).status
  const body = (snapshot as Record<string, unknown>).body
  if (typeof status !== 'number') {
    return null
  }

  return {
    status,
    body,
  }
}

export async function saveIdempotentResponse({
  key,
  userId,
  endpoint,
  snapshot,
  ttlMinutes = DEFAULT_TTL_MINUTES,
}: SaveInput): Promise<void> {
  const prisma = getPrismaClient()

  await prisma.$executeRaw`
    INSERT INTO public.notification_idempotency_keys (
      key,
      user_id,
      endpoint,
      response_snapshot,
      created_at,
      expires_at
    )
    VALUES (
      ${key},
      ${userId}::uuid,
      ${endpoint},
      ${JSON.stringify(snapshot)}::jsonb,
      NOW(),
      NOW() + (${ttlMinutes} * INTERVAL '1 minute')
    )
    ON CONFLICT (key, user_id, endpoint)
    DO UPDATE SET
      response_snapshot = EXCLUDED.response_snapshot,
      created_at = NOW(),
      expires_at = EXCLUDED.expires_at
  `
}
