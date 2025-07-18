import React from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './card'
import { Button } from './button'
import { cn } from '@/lib/utils'

export interface DashboardCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  icon?: React.ReactNode
  ctaHref?: string
  ctaLabel?: string
}

export function DashboardCard({
  title,
  description,
  icon,
  ctaHref,
  ctaLabel,
  className,
  children,
  ...props
}: DashboardCardProps) {
  const content = (
    <Card className={cn('flex flex-col gap-2', className)} {...props}>
      <CardHeader className="flex items-center gap-2">
        {icon}
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      {description && <CardContent className="text-sm text-muted-foreground">{description}</CardContent>}
      {children && <CardContent>{children}</CardContent>}
      {ctaHref && ctaLabel && (
        <CardFooter>
          <Link href={ctaHref} className="ml-auto">
            <Button size="sm">{ctaLabel}</Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  )

  return content
}
