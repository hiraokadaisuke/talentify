import { getPrismaClient } from '@/lib/prisma'
import type { NotificationType } from '@/types/notifications'

type CountUnreadNotificationsParams = {
  userId: string
  type?: NotificationType
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
