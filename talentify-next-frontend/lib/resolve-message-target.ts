import { getPrismaClient } from '@/lib/prisma'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isUuid(value: string): boolean {
  return UUID_RE.test(value)
}

async function resolveFromRoleTables(id: string): Promise<string | null> {
  const prisma = getPrismaClient()

  const [talent, store, company] = await Promise.all([
    prisma.talents.findFirst({
      where: {
        OR: [{ id }, { user_id: id }],
      },
      select: { user_id: true },
    }),
    prisma.stores.findFirst({
      where: {
        OR: [{ id }, { user_id: id }],
      },
      select: { user_id: true },
    }),
    prisma.companies.findFirst({
      where: {
        OR: [{ id }, { user_id: id }],
      },
      select: { user_id: true },
    }),
  ])

  return talent?.user_id ?? store?.user_id ?? company?.user_id ?? null
}

/**
 * Resolves a message target id into canonical auth user id.
 * Accepts user_id directly, or profile ids such as talents.id/stores.id/companies.id.
 */
export async function resolveMessageTargetUserId(rawId: string): Promise<string | null> {
  const id = rawId.trim()
  if (!isUuid(id)) return null

  const resolvedByRole = await resolveFromRoleTables(id)
  if (resolvedByRole) return resolvedByRole

  // Fallback: treat UUID as user_id directly so legacy links continue to work.
  return id
}
