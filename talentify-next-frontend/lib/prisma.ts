import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is required to initialize Prisma Client')
  }

  const adapter = new PrismaPg(
    new Pool({
      connectionString,
      // Vercel functions are short-lived and scale horizontally. Keep each
      // function instance to a single DB connection and release idle sessions
      // quickly so Supavisor session-mode pools are not exhausted.
      max: 1,
      idleTimeoutMillis: 1_000,
      connectionTimeoutMillis: 5_000,
      allowExitOnIdle: true,
    })
  )

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export function getPrismaClient() {
  if (!global.prisma) {
    global.prisma = createPrismaClient()
  }
  return global.prisma
}
