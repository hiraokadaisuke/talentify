export type NotificationType =
  | 'message'
  | 'offer'
  | 'offer_accepted'
  | 'schedule_fixed'
  | 'contract_uploaded'
  | 'contract_checked'
  | 'invoice_submitted'
  | 'payment_completed'
  | 'schedule'
  | 'system'

export type TaskType = 'respond_offer' | 'update_profile' | 'check_message'

export interface Notification {
  id: string
  offer_id?: string
  type: NotificationType
  title: string
  body: string
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
