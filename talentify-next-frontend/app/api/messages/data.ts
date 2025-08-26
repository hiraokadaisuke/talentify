export type ThreadType = 'direct' | 'offer'

export interface Thread {
  id: string
  type: ThreadType
  participants: string[]
  offerId?: string
  lastMessageAt?: string
}

export interface Message {
  id: string
  threadId: string
  senderUserId: string
  body: string
  createdAt: string
  readBy: string[]
}

// Basic in-memory storage for threads and messages used for dummy APIs.
export const threads: Thread[] = [
  {
    id: 't1',
    type: 'direct',
    participants: ['u1', 'u2'],
    lastMessageAt: '2024-05-02T11:00:00Z',
  },
  {
    id: 't2',
    type: 'offer',
    participants: ['u1', 'u3'],
    offerId: 'o1',
    lastMessageAt: '2024-05-03T12:00:00Z',
  },
]

export const messages: Message[] = [
  {
    id: 'm1',
    threadId: 't1',
    senderUserId: 'u1',
    body: 'Hey there',
    createdAt: '2024-05-01T10:00:00Z',
    readBy: ['u1'],
  },
  {
    id: 'm2',
    threadId: 't1',
    senderUserId: 'u2',
    body: 'Hello! 👋',
    createdAt: '2024-05-02T11:00:00Z',
    readBy: [],
  },
  {
    id: 'm3',
    threadId: 't2',
    senderUserId: 'u3',
    body: 'Offer details',
    createdAt: '2024-05-03T12:00:00Z',
    readBy: ['u3', 'u1'],
  },
]

let messageCounter = messages.length
let threadCounter = threads.length

export function nextMessageId() {
  messageCounter += 1
  return `m${messageCounter}`
}

export function nextThreadId() {
  threadCounter += 1
  return `t${threadCounter}`
}
