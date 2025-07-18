import React from 'react'
import Link from 'next/link'
import { Button } from './button'
import { cn } from '@/lib/utils'

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  illustration?: React.ReactNode
  title: string
  description?: string
  actionHref?: string
  actionLabel?: string
}

export function EmptyState({
  illustration,
  title,
  description,
  actionHref,
  actionLabel,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div className={cn('text-center space-y-4 py-10', className)} {...props}>
      {illustration && <div className="flex justify-center">{illustration}</div>}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {actionHref && actionLabel && (
        <Link href={actionHref}>
          <Button>{actionLabel}</Button>
        </Link>
      )}
    </div>
  )
}
