import React from 'react'
import { cn } from '@/lib/utils'

export function Dialog({ open, onClose, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded p-4 w-full max-w-md" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

export function DialogHeader({ className, ...props }) {
  return <div className={cn('mb-2 font-semibold', className)} {...props} />
}

export function DialogFooter({ className, ...props }) {
  return <div className={cn('mt-4 flex justify-end space-x-2', className)} {...props} />
}
