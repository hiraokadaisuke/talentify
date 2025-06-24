import React from 'react'
import { cn } from '@/lib/utils'

export function AlertDialog({ open, onCancel, onConfirm, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onCancel}>
      <div className="bg-white rounded p-4 w-full max-w-md" onClick={e => e.stopPropagation()}>
        {children}
        <div className="mt-4 flex justify-end space-x-2">
          <button className="px-3 py-1 border rounded" onClick={onCancel}>キャンセル</button>
          <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={onConfirm}>確認</button>
        </div>
      </div>
    </div>
  )
}

export function AlertDialogHeader({ className, ...props }) {
  return <div className={cn('mb-2 font-semibold', className)} {...props} />
}
