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
        'flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,.05)] sm:p-5',
        className
      )}
      {...props}
    >
      <CardHeader className='mb-0 flex items-center gap-2 p-0'>
        {icon}
        <CardTitle className='text-base font-bold text-slate-950'>{title}</CardTitle>
      </CardHeader>

      {description && <CardContent className='mt-1.5 p-0 text-sm text-slate-600'>{description}</CardContent>}

      {children && <CardContent className='mt-3 flex-1 p-0'>{children}</CardContent>}

      {ctaHref && ctaLabel && (
        <CardFooter className='mt-4 p-0'>
          <Link href={ctaHref} className='ml-auto'>
            <Button size='sm' variant={ctaVariant} className={cn('gap-1.5 rounded-xl font-bold', ctaVariant === 'default' ? 'bg-[#FF5A1F] text-white hover:bg-[#E94F18]' : 'border-slate-200 text-slate-700 hover:bg-slate-50')}>
              {ctaLabel}
              <ArrowRight className='h-4 w-4' />
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  )
}
