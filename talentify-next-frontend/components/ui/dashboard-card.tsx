import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './card'
import { Button } from './button'
import { cn } from '@/lib/utils'

export interface DashboardCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  icon?: React.ReactNode
  ctaHref?: string
  ctaLabel?: string
  ctaVariant?: 'default' | 'outline' | 'secondary'
}

export function DashboardCard({
  title,
  description,
  icon,
  ctaHref,
  ctaLabel,
  ctaVariant = 'outline',
  className,
  children,
  ...props
}: DashboardCardProps) {
  return (
    <Card
      className={cn(
        'flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60',
        className
      )}
      {...props}
    >
      <CardHeader className='mb-0 flex items-center gap-2 p-0'>
        {icon}
        <CardTitle className='text-base font-semibold text-slate-900'>{title}</CardTitle>
      </CardHeader>

      {description && (
        <CardContent className='mt-2 p-0 text-sm text-slate-600'>
          {description}
        </CardContent>
      )}

      {children && <CardContent className='mt-4 flex-1 p-0'>{children}</CardContent>}

      {ctaHref && ctaLabel && (
        <CardFooter className='mt-5 p-0'>
          <Link href={ctaHref} className='ml-auto'>
            <Button size='sm' variant={ctaVariant} className='gap-1.5'>
              {ctaLabel}
              <ArrowRight className='h-4 w-4' />
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  )
}
