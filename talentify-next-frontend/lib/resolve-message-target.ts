import { getPrismaClient } from '@/lib/prisma'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isUuid(value: string): boolean {
  return UUID_RE.test(value)
}

async function resolveFromRoleTables(id: string): Promise<string | null> {
  const prisma = getPrismaClient()

  const [talent, store] = await Promise.all([
    prisma.talents.findFirst({
      where: { OR: [{ id }, { user_id: id }] },
      select: { user_id: true },
    }),
    prisma.stores.findFirst({
      where: { OR: [{ id }, { user_id: id }] },
      select: { user_id: true },
    }),
  ])

  return talent?.user_id ?? store?.user_id ?? null
}

export async function resolveMessageTargetUserId(rawId: string): Promise<string | null> {
  const id = rawId.trim()
  if (!isUuid(id)) return null

  const resolvedByRole = await resolveFromRoleTables(id)
  if (resolvedByRole) return resolvedByRole

  return id
}
