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
