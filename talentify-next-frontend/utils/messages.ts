'use client'

export async function getUnreadMessageCount(): Promise<number> {
  try {
    const res = await fetch('/api/messages/unread-count')
    if (!res.ok) return 0
    const data = await res.json()
    return data.count ?? 0
  } catch (e) {
    console.error('failed to fetch unread messages count', e)
    return 0
  }
}
