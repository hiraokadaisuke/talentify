import React from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }) {
  return <div className={cn('rounded-xl border bg-white p-4 shadow', className)} {...props} />;
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('mb-2 font-semibold text-lg', className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn('mb-2', className)} {...props} />;
}

export function CardFooter({ className, ...props }) {
  return <div className={cn('mt-2', className)} {...props} />;
}
