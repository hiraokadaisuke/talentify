"use client"

import React from 'react'
import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-2 rounded-2xl border p-4 shadow-md', className)}>
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
    </div>
  )
}

export function ListSkeleton({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <ul className={cn('space-y-2', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="rounded-2xl border p-4 shadow-md">
          <Skeleton className="h-4 w-full" />
        </li>
      ))}
    </ul>
  )
}

export function TableSkeleton({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid grid-cols-3 gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  )
}

