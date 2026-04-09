import type { notification_type } from '@prisma/client'
import { getPrismaClient } from '@/lib/prisma'

type CountUnreadNotificationsParams = {
  userId: string
  type?: notification_type
}

export async function countUnreadNotificationsByUser({
  userId,
  type,
}: CountUnreadNotificationsParams): Promise<number> {
  const prisma = getPrismaClient()

  const count = await prisma.notifications.count({
    where: {
      user_id: userId,
      is_read: false,
      ...(type ? { type } : {}),
    },
  })

  return count
}
