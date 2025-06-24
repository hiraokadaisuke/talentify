import React from 'react';
import { cn } from '@/lib/utils';

export function Alert({ className, variant = 'default', ...props }) {
  const base = 'border rounded p-4 text-sm';
  const variants = {
    default: 'bg-gray-50 text-gray-700',
    destructive: 'bg-red-50 text-red-700 border-red-300',
  };
  return <div role="alert" className={cn(base, variants[variant], className)} {...props} />;
}

export function AlertTitle({ className, ...props }) {
  return <h3 className={cn('font-semibold mb-1', className)} {...props} />;
}

export function AlertDescription({ className, ...props }) {
  return <div className={cn('text-sm', className)} {...props} />;
}
