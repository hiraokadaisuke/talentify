import type { NotificationType } from './notifications'

export type { NotificationType }

export type TaskType = 'respond_offer' | 'update_profile' | 'check_message'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  body: string
  data?: Record<string, any>
  created_at: string
  is_read: boolean
}

export interface Task {
  id: string
  type: TaskType
  title: string
  due_date?: string
  completed: boolean
}
