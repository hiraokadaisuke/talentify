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
    <div className={cn('space-y-4 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center shadow-[0_8px_24px_rgba(15,23,42,.04)]', className)} {...props}>
      {illustration && <div className="flex justify-center">{illustration}</div>}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {actionHref && actionLabel && (
        <Link href={actionHref}>
          <Button className="rounded-xl bg-[#FF5A1F] font-bold text-white hover:bg-[#E94F18]">{actionLabel}</Button>
        </Link>
      )}
    </div>
  )
}
