'use client'

export const MESSAGES_CHANGED_EVENT = 'talentify:messages-changed'

export async function getUnreadMessageCount(): Promise<number> {
  const res = await fetch('/api/messages/unread-count')
  if (!res.ok) {
    throw new Error(`failed to fetch unread messages count: ${res.status}`)
  }

  const data = await res.json()
  return typeof data.count === 'number' ? data.count : 0
}
