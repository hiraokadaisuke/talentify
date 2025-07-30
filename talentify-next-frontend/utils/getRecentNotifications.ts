'use client'
import type { Notification } from '@/types/ui'
import { getNotifications } from './notifications'

export async function getRecentNotifications(): Promise<Notification[]> {
  return (await getNotifications(5)) as unknown as Notification[]
}
