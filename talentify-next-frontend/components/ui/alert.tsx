import React from 'react'
import { cn } from '@/lib/utils'

type AlertVariant = 'default' | 'destructive'

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant
  className?: string
}

export function Alert({ className, variant = 'default', ...props }: AlertProps) {
  const base = 'border rounded p-4 text-sm'
  const variants: Record<AlertVariant, string> = {
    default: 'bg-gray-50 text-gray-700',
    destructive: 'bg-red-50 text-red-700 border-red-300',
  }

  return (
    <div role="alert" className={cn(base, variants[variant], className)} {...props} />
  )
}

interface SubProps extends React.HTMLAttributes<HTMLElement> {
  className?: string
}

export function AlertTitle({ className, ...props }: SubProps) {
  return <h3 className={cn('font-semibold mb-1', className)} {...props} />
}

export function AlertDescription({ className, ...props }: SubProps) {
  return <div className={cn('text-sm', className)} {...props} />
}
