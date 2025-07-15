import React from 'react'
import { cn } from '@/lib/utils'

// 共通の props
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div className={cn('rounded-xl border bg-white p-4 shadow', className)} {...props} />
  )
}

export function CardHeader({ className, ...props }: CardProps) {
  return (
    <div className={cn('mb-2 font-semibold text-lg', className)} {...props} />
  )
}

export function CardTitle({ className, ...props }: CardProps) {
  return (
    <h3 className={cn('text-xl font-bold tracking-tight', className)} {...props} />
  )
}

export function CardContent({ className, ...props }: CardProps) {
  return (
    <div className={cn('mb-2', className)} {...props} />
  )
}

export function CardFooter({ className, ...props }: CardProps) {
  return (
    <div className={cn('mt-2', className)} {...props} />
  )
}
