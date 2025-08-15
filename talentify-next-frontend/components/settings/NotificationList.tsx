import { NotificationRow } from '@/utils/notifications'
import { formatJaDateTimeWithWeekday } from '@/utils/formatJaDateTimeWithWeekday'

interface Props {
  items: NotificationRow[]
  onItemClick?: (n: NotificationRow) => void
  onToggleRead?: (n: NotificationRow) => void
}

export function NotificationList({ items, onItemClick, onToggleRead }: Props) {
  return (
    <ul className="space-y-2">
      {items.map((n) => (
        <li
          key={n.id}
          className={`relative p-3 border rounded hover:bg-gray-50 cursor-pointer group`}
          onClick={() => onItemClick?.(n)}
        >
          {!n.is_read && <span className="absolute left-2 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-500" />}
          <div className="flex justify-between items-center pl-4">
            <div>
              <p className="font-medium">{n.title}</p>
              <p className="text-sm text-muted-foreground line-clamp-1">{n.body || '—'}</p>
            </div>
            <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
              {formatJaDateTimeWithWeekday(n.created_at)}
            </span>
          </div>
          {onToggleRead && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleRead(n)
              }}
              className="absolute right-3 top-3 text-xs text-blue-600 opacity-0 group-hover:opacity-100"
            >
              {n.is_read ? '未読にする' : '既読にする'}
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}
